-- ==============================================================================
-- MAISON ROYALE | IA GESTORA V8.2 - CORREÇÃO FINAL CIRÚRGICA
-- OBJETIVO: Idempotência Atômica, Validações Estritas e Integridade de Schema.
-- ==============================================================================

-- 1. PREPARAÇÃO DO SCHEMA E EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ 
BEGIN
    -- Garantir colunas na tabela products conforme schema mapeado no database.ts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'top_notes') THEN
        ALTER TABLE public.products ADD COLUMN top_notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'heart_notes') THEN
        ALTER TABLE public.products ADD COLUMN heart_notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'base_notes') THEN
        ALTER TABLE public.products ADD COLUMN base_notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'min_stock_alert') THEN
        ALTER TABLE public.products ADD COLUMN min_stock_alert INTEGER DEFAULT 5;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'description') THEN
        ALTER TABLE public.products ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'purchase_price') THEN
        ALTER TABLE public.products ADD COLUMN purchase_price NUMERIC(12,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'volume_ml') THEN
        ALTER TABLE public.products ADD COLUMN volume_ml INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'concentration') THEN
        ALTER TABLE public.products ADD COLUMN concentration TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'olfactory_family') THEN
        ALTER TABLE public.products ADD COLUMN olfactory_family TEXT;
    END IF;
END $$;

-- 2. TABELAS OPERACIONAIS

-- Chaves de Idempotência (Atômicas)
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_hash TEXT UNIQUE NOT NULL,
    admin_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    payload_hash TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PROCESSING', 'SUCCESS', 'ERROR')),
    response JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auditoria Imutável
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID,
    admin_name TEXT,
    admin_email TEXT,
    action TEXT NOT NULL,
    category TEXT NOT NULL,
    details TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Movimentações de Estoque
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES public.products(id),
    type TEXT NOT NULL CHECK (type IN ('ENTRADA', 'SAIDA', 'AJUSTE')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason TEXT,
    admin_id UUID,
    admin_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SEGURANÇA E POLÍTICAS RLS
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Revogação total de escrita direta para papéis da API
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.idempotency_keys FROM authenticated, anon, public;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.audit_logs FROM authenticated, anon, public;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.inventory_movements FROM authenticated, anon, public;

-- Políticas de Leitura
DROP POLICY IF EXISTS "Admins can view idempotency" ON public.idempotency_keys;
CREATE POLICY "Admins can view idempotency" ON public.idempotency_keys
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'GERENTE'))
    );

DROP POLICY IF EXISTS "Admins can view audit" ON public.audit_logs;
CREATE POLICY "Admins can view audit" ON public.audit_logs
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'GERENTE'))
    );

DROP POLICY IF EXISTS "Admins can view movements" ON public.inventory_movements;
CREATE POLICY "Admins can view movements" ON public.inventory_movements
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'GERENTE'))
    );

-- Triggers de Imutabilidade
CREATE OR REPLACE FUNCTION public.prevent_modification_final()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Operação negada: Históricos e auditorias administrativas são imutáveis.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_immutable_audit ON public.audit_logs;
CREATE TRIGGER tr_immutable_audit BEFORE UPDATE OR DELETE OR TRUNCATE ON public.audit_logs FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_modification_final();

DROP TRIGGER IF EXISTS tr_immutable_movements ON public.inventory_movements;
CREATE TRIGGER tr_immutable_movements BEFORE UPDATE OR DELETE OR TRUNCATE ON public.inventory_movements FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_modification_final();

-- 4. RPC CENTRALIZADA: execute_gestora_operation_v8_2

CREATE OR REPLACE FUNCTION public.execute_gestora_operation_v8_2(
    p_idempotency_key TEXT,
    p_action_type TEXT,
    p_payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, extensions, pg_temp
AS $$
DECLARE
    v_admin_id UUID := auth.uid();
    v_payload_hash TEXT := encode(digest(p_payload::text, 'sha256'), 'hex');
    v_existing_status TEXT;
    v_existing_admin UUID;
    v_existing_payload_hash TEXT;
    v_existing_action TEXT;
    v_existing_response JSONB;
    v_admin_role TEXT;
    v_admin_name TEXT;
    v_admin_email TEXT;
    v_result JSONB;
    v_row_count INTEGER;
    
    -- Variaveis de Negócio
    v_product_id TEXT;
    v_old_stock INTEGER;
    v_new_stock INTEGER;
    v_quantity INTEGER;
    v_move_type TEXT;
    v_sale_price NUMERIC;
BEGIN
    -- 1. Validação de Identidade e Autorização
    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'Não autorizado: Identidade não confirmada via Supabase Auth.';
    END IF;

    -- profiles.email e profiles.full_name são tratados de forma segura
    SELECT role, full_name INTO v_admin_role, v_admin_name FROM public.profiles WHERE id = v_admin_id;
    BEGIN
        SELECT email INTO v_admin_email FROM public.profiles WHERE id = v_admin_id;
    EXCEPTION WHEN OTHERS THEN
        v_admin_email := NULL;
    END;

    IF v_admin_role IS NULL OR v_admin_role NOT IN ('SUPER_ADMIN', 'GERENTE') THEN
        RAISE EXCEPTION 'Acesso Negado: Perfil administrativo necessário para esta operação.';
    END IF;

    -- 2. Mecanismo de Idempotência Atômica
    -- Tenta inserir o estado PROCESSING. Se a chave já existe, não faz nada (DO NOTHING)
    INSERT INTO public.idempotency_keys (key_hash, admin_id, action_type, payload_hash, status)
    VALUES (p_idempotency_key, v_admin_id, p_action_type, v_payload_hash, 'PROCESSING')
    ON CONFLICT (key_hash) DO NOTHING;
    
    GET DIAGNOSTICS v_row_count = ROW_COUNT;

    -- Lock de linha e obtenção do estado atual para garantir atomicidade em concorrência
    SELECT status, admin_id, payload_hash, action_type, response 
    INTO v_existing_status, v_existing_admin, v_existing_payload_hash, v_existing_action, v_existing_response
    FROM public.idempotency_keys
    WHERE key_hash = p_idempotency_key
    FOR UPDATE;

    -- Se não fomos nós que inserimos (v_row_count = 0)
    IF v_row_count = 0 THEN
        IF v_existing_status = 'SUCCESS' THEN
            -- Se a chave foi usada com sucesso para a mesma operação, retorna o cache
            IF v_existing_admin = v_admin_id AND v_existing_action = p_action_type AND v_existing_payload_hash = v_payload_hash THEN
                RETURN v_existing_response;
            ELSE
                RAISE EXCEPTION 'Erro de Idempotência: Esta chave já foi vinculada a outra operação ou payload.';
            END IF;
        ELSIF v_existing_status = 'PROCESSING' THEN
            -- Se outra transação ainda está rodando, o SELECT FOR UPDATE acima esperará ela terminar.
            -- Após o término, se o status mudar para SUCCESS, a linha acima será re-avaliada ou dará erro se re-executada.
            RAISE EXCEPTION 'Operação em processamento paralelo: Por favor, aguarde.';
        ELSE
            -- Se status for ERROR e chegamos aqui, permitimos tentar novamente re-utilizando a chave nesta transação
            UPDATE public.idempotency_keys 
            SET status = 'PROCESSING', admin_id = v_admin_id, action_type = p_action_type, payload_hash = v_payload_hash, updated_at = now()
            WHERE key_hash = p_idempotency_key;
        END IF;
    END IF;

    -- 3. Execução das Operações de Negócio
    CASE p_action_type
        WHEN 'CREATE_PRODUCT' THEN
            -- Validações Obrigatórias
            IF p_payload->>'name' IS NULL OR p_payload->>'sku' IS NULL OR p_payload->>'brandId' IS NULL THEN
                RAISE EXCEPTION 'Dados incompletos: nome, SKU e marca são campos obrigatórios.';
            END IF;

            v_sale_price := (p_payload->>'salePrice')::NUMERIC;
            IF v_sale_price IS NULL OR v_sale_price <= 0 THEN
                RAISE EXCEPTION 'Preço de venda inválido: Deve ser um valor positivo.';
            END IF;

            -- Verificação de SKU duplicado
            IF EXISTS (SELECT 1 FROM public.products WHERE sku = p_payload->>'sku') THEN
                RAISE EXCEPTION 'SKU Duplicado: O código % já pertence a outro produto.', p_payload->>'sku';
            END IF;

            -- Todas as colunas abaixo confirmadas via database.ts
            INSERT INTO public.products (
                id, sku, name, brand_id, olfactory_family, concentration, volume_ml,
                purchase_price, sale_price, stock_quantity, min_stock_alert,
                image, status, description, top_notes, heart_notes, base_notes
            ) VALUES (
                COALESCE(p_payload->>'id', 'prod_' || replace(gen_random_uuid()::text, '-', '')),
                p_payload->>'sku',
                p_payload->>'name',
                p_payload->>'brandId',
                p_payload->>'olfactoryFamily',
                p_payload->>'concentration',
                (p_payload->>'volumeMl')::INTEGER,
                COALESCE((p_payload->>'purchasePrice')::NUMERIC, 0),
                v_sale_price,
                COALESCE((p_payload->>'stockQuantity')::INTEGER, 0),
                COALESCE((p_payload->>'minStockAlert')::INTEGER, 5),
                COALESCE(p_payload->>'image', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'),
                'Ativo',
                p_payload->>'description',
                p_payload->>'topNotes',
                p_payload->>'heartNotes',
                p_payload->>'baseNotes'
            ) RETURNING id INTO v_product_id;

            v_result := jsonb_build_object('success', true, 'message', 'Produto ' || p_payload->>'name' || ' cadastrado com sucesso.', 'id', v_product_id);

        WHEN 'UPDATE_STOCK' THEN
            v_product_id := p_payload->>'productId';
            v_quantity := (p_payload->>'quantity')::INTEGER;
            v_move_type := p_payload->>'type';

            -- Validações de Quantidade
            IF v_product_id IS NULL OR v_quantity IS NULL OR v_move_type IS NULL THEN
                RAISE EXCEPTION 'Parâmetros insuficientes para atualização de estoque.';
            END IF;

            IF v_move_type IN ('ENTRADA', 'SAIDA') AND v_quantity <= 0 THEN
                RAISE EXCEPTION 'Quantidade inválida para %: Deve ser um número inteiro positivo.', v_move_type;
            END IF;

            IF v_move_type = 'AJUSTE' AND v_quantity < 0 THEN
                RAISE EXCEPTION 'Quantidade inválida para AJUSTE: Não pode ser negativa.';
            END IF;

            -- Bloqueio do produto para evitar race conditions de estoque
            SELECT stock_quantity INTO v_old_stock FROM public.products WHERE id = v_product_id FOR UPDATE;
            IF NOT FOUND THEN RAISE EXCEPTION 'Produto inexistente (ID: %).', v_product_id; END IF;

            IF v_move_type = 'ENTRADA' THEN
                v_new_stock := v_old_stock + v_quantity;
            ELSIF v_move_type = 'SAIDA' THEN
                v_new_stock := v_old_stock - v_quantity;
            ELSIF v_move_type = 'AJUSTE' THEN
                v_new_stock := v_quantity;
            ELSE
                RAISE EXCEPTION 'Tipo de movimentação não reconhecido: %.', v_move_type;
            END IF;

            IF v_new_stock < 0 THEN
                RAISE EXCEPTION 'Operação Negada: Saldo atual insuficiente para retirada (Disponível: %).', v_old_stock;
            END IF;

            -- Atualização do Saldo
            UPDATE public.products SET stock_quantity = v_new_stock, updated_at = now() WHERE id = v_product_id;

            -- Registro do Histórico (Imutável)
            INSERT INTO public.inventory_movements (product_id, type, quantity, previous_stock, new_stock, reason, admin_id, admin_name)
            VALUES (v_product_id, v_move_type, v_quantity, v_old_stock, v_new_stock, COALESCE(p_payload->>'reason', 'Ajuste via IA Gestora'), v_admin_id, v_admin_name);

            v_result := jsonb_build_object('success', true, 'message', 'Estoque atualizado com sucesso. Novo saldo: ' || v_new_stock, 'new_stock', v_new_stock);

        WHEN 'UPDATE_PRICE' THEN
            v_product_id := p_payload->>'productId';
            v_sale_price := (p_payload->>'newPrice')::NUMERIC;

            IF v_product_id IS NULL OR v_sale_price IS NULL OR v_sale_price <= 0 THEN
                RAISE EXCEPTION 'Valor de preço inválido: Deve ser positivo e numérico.';
            END IF;

            UPDATE public.products SET sale_price = v_sale_price, updated_at = now() WHERE id = v_product_id;
            IF NOT FOUND THEN RAISE EXCEPTION 'Produto não localizado para atualização de preço.'; END IF;

            v_result := jsonb_build_object('success', true, 'message', 'Preço ajustado para R$ ' || v_sale_price, 'new_price', v_sale_price);

        ELSE
            RAISE EXCEPTION 'Ação Administrativa não suportada: %', p_action_type;
    END CASE;

    -- 4. Registro Final de Auditoria e Conclusão de Idempotência (Tudo na mesma transação)
    INSERT INTO public.audit_logs (admin_id, admin_name, admin_email, action, category, details, payload)
    VALUES (v_admin_id, v_admin_name, v_admin_email, p_action_type, 'IA_GESTORA', v_result->>'message', p_payload);

    UPDATE public.idempotency_keys SET status = 'SUCCESS', response = v_result, updated_at = now() WHERE key_hash = p_idempotency_key;

    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    -- O ROLLBACK automático do Supabase RPC garante que se houver falha, 
    -- o registro em idempotency_keys (PROCESSING) também será revertido.
    RAISE;
END;
$$;

-- 5. PRIVILÉGIOS (Proteção Final)

REVOKE ALL ON FUNCTION public.execute_gestora_operation_v8_2(TEXT, TEXT, JSONB) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.execute_gestora_operation_v8_2(TEXT, TEXT, JSONB) TO authenticated;

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT ON public.inventory_movements TO authenticated;
GRANT SELECT ON public.idempotency_keys TO authenticated;

-- FIM DO SQL V8.2 DEFINITIVO
