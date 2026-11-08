-- ==============================================================================
-- MAISON ROYALE | IA GESTORA V8.2 - CONSOLIDAÇÃO FINAL DEFINITIVA
-- OBJETIVO: Segurança Máxima, Idempotência Atômica e Integridade Transacional.
-- ==============================================================================

-- 1. PREPARAÇÃO DO SCHEMA E EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Garantir colunas na tabela products (respeitando tipos reais e schema confirmado)
DO $$ 
BEGIN
    -- Adicionar colunas se não existirem (usando tipos baseados no database.ts e schema real)
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

-- Chaves de Idempotência (Atômicas e Concorrentes)
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
CREATE INDEX IF NOT EXISTS idx_idempotency_key_hash ON public.idempotency_keys(key_hash);

-- Auditoria Imutável (Append-Only)
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

-- Movimentações de Estoque (Append-Only)
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

-- Políticas de Leitura (Somente ADM/GERENTE via profiles)
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

-- Bloqueio de Alteração/Exclusão (Triggers de Imutabilidade)
CREATE OR REPLACE FUNCTION public.prevent_immutable_violation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Violação de Imutabilidade: Registros administrativos não podem ser alterados ou removidos.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_immutable_audit ON public.audit_logs;
CREATE TRIGGER tr_immutable_audit BEFORE UPDATE OR DELETE OR TRUNCATE ON public.audit_logs FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_immutable_violation();

DROP TRIGGER IF EXISTS tr_immutable_movements ON public.inventory_movements;
CREATE TRIGGER tr_immutable_movements BEFORE UPDATE OR DELETE OR TRUNCATE ON public.inventory_movements FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_immutable_violation();

-- 4. RPC CENTRALIZADA: execute_gestora_operation_v8_2

CREATE OR REPLACE FUNCTION public.execute_gestora_operation_v8_2(
    p_idempotency_key TEXT,
    p_action_type TEXT,
    p_payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
    v_admin_id UUID;
    v_payload_hash TEXT;
    v_existing_status TEXT;
    v_existing_admin UUID;
    v_existing_payload_hash TEXT;
    v_existing_action TEXT;
    v_existing_response JSONB;
    v_admin_role TEXT;
    v_admin_name TEXT;
    v_admin_email TEXT;
    v_result JSONB;
    
    -- Variaveis de Negócio
    v_product_id TEXT;
    v_old_stock INTEGER;
    v_new_stock INTEGER;
    v_quantity INTEGER;
    v_move_type TEXT;
    v_sale_price NUMERIC;
BEGIN
    -- 1. Identidade Autenticada (Contexto Supabase Auth)
    v_admin_id := auth.uid();
    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'Não autorizado: Identidade não encontrada no contexto JWT.';
    END IF;

    -- 2. Validação de Perfil Administrativo
    SELECT role, full_name, email INTO v_admin_role, v_admin_name, v_admin_email
    FROM public.profiles
    WHERE id = v_admin_id;

    IF v_admin_role IS NULL OR v_admin_role NOT IN ('SUPER_ADMIN', 'GERENTE') THEN
        RAISE EXCEPTION 'Acesso Negado: Perfil administrativo (SUPER_ADMIN ou GERENTE) necessário.';
    END IF;

    -- 3. Idempotência Atômica (Prevenção de Duplicidade Concorrente)
    v_payload_hash := encode(digest(p_payload::text, 'sha256'), 'hex');

    -- Tentar reservar a chave (Atomic Insert)
    INSERT INTO public.idempotency_keys (key_hash, admin_id, action_type, payload_hash, status)
    VALUES (p_idempotency_key, v_admin_id, p_action_type, v_payload_hash, 'PROCESSING')
    ON CONFLICT (key_hash) DO NOTHING;

    -- Obter estado atual com lock de linha (Row-Level Lock)
    SELECT status, admin_id, payload_hash, action_type, response 
    INTO v_existing_status, v_existing_admin, v_existing_payload_hash, v_existing_action, v_existing_response
    FROM public.idempotency_keys
    WHERE key_hash = p_idempotency_key
    FOR UPDATE;

    IF FOUND THEN
        -- Caso 1: Operação já finalizada com sucesso
        IF v_existing_status = 'SUCCESS' THEN
            -- Garantir que os parâmetros originais conferem
            IF v_existing_admin = v_admin_id AND v_existing_action = p_action_type AND v_existing_payload_hash = v_payload_hash THEN
                RETURN v_existing_response;
            ELSE
                RAISE EXCEPTION 'Conflito de Idempotência: A chave fornecida já foi utilizada para uma operação diferente.';
            END IF;
        
        -- Caso 2: Operação em andamento (por outro processo ou timeout)
        ELSIF v_existing_status = 'PROCESSING' THEN
            -- Se foi inserido há muito tempo, pode ter travado (ex: erro fatal do DB)
            -- Como estamos em uma única transação Supabase RPC, se o processo travar, a transação reverte.
            -- Mas se chegamos aqui e o status é PROCESSING, significa que outra transação ainda não deu COMMIT ou ROLLBACK.
            RAISE EXCEPTION 'Operação em processamento: Por favor, aguarde o término da requisição anterior.';
        END IF;
        
        -- Caso 3: Status ERROR (Permitir tentativa se o payload for idêntico)
        IF v_existing_status = 'ERROR' AND v_existing_payload_hash = v_payload_hash THEN
            UPDATE public.idempotency_keys SET status = 'PROCESSING', updated_at = now() WHERE key_hash = p_idempotency_key;
        ELSIF v_existing_status = 'ERROR' THEN
            RAISE EXCEPTION 'Erro de Idempotência: Chave associada a um erro anterior com parâmetros divergentes.';
        END IF;
    END IF;

    -- 4. Execução Transacional das Operações de Negócio
    BEGIN
        CASE p_action_type
            WHEN 'CREATE_PRODUCT' THEN
                -- Validações de Produto
                IF p_payload->>'name' IS NULL OR p_payload->>'sku' IS NULL OR p_payload->>'brandId' IS NULL THEN
                    RAISE EXCEPTION 'Dados incompletos: nome, SKU e marca são obrigatórios.';
                END IF;

                -- Prevenção de SKU duplicado atômica
                IF EXISTS (SELECT 1 FROM public.products WHERE sku = p_payload->>'sku') THEN
                    RAISE EXCEPTION 'SKU já existente: O código % já está em uso.', p_payload->>'sku';
                END IF;

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
                    (p_payload->>'salePrice')::NUMERIC,
                    COALESCE((p_payload->>'stockQuantity')::INTEGER, 0),
                    COALESCE((p_payload->>'minStockAlert')::INTEGER, 5),
                    COALESCE(p_payload->>'image', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'),
                    'Ativo',
                    p_payload->>'description',
                    p_payload->>'topNotes',
                    p_payload->>'heartNotes',
                    p_payload->>'baseNotes'
                ) RETURNING id INTO v_product_id;

                v_result := jsonb_build_object('success', true, 'message', 'Produto ' || p_payload->>'name' || ' cadastrado.', 'id', v_product_id);

            WHEN 'UPDATE_STOCK' THEN
                v_product_id := p_payload->>'productId';
                v_quantity := (p_payload->>'quantity')::INTEGER;
                v_move_type := p_payload->>'type';

                IF v_product_id IS NULL OR v_quantity IS NULL OR v_move_type IS NULL OR v_quantity < 0 THEN
                    RAISE EXCEPTION 'Dados de estoque inválidos: Quantidade deve ser não negativa.';
                END IF;

                -- Lock do Produto para evitar race conditions no saldo
                SELECT stock_quantity INTO v_old_stock FROM public.products WHERE id = v_product_id FOR UPDATE;
                IF NOT FOUND THEN RAISE EXCEPTION 'Produto não encontrado (ID: %).', v_product_id; END IF;

                IF v_move_type = 'ENTRADA' THEN
                    v_new_stock := v_old_stock + v_quantity;
                ELSIF v_move_type = 'SAIDA' THEN
                    v_new_stock := v_old_stock - v_quantity;
                ELSIF v_move_type = 'AJUSTE' THEN
                    v_new_stock := v_quantity;
                ELSE
                    RAISE EXCEPTION 'Tipo de movimentação desconhecido: %', v_move_type;
                END IF;

                IF v_new_stock < 0 THEN
                    RAISE EXCEPTION 'Estoque Insuficiente: Saldo atual é %, impossível realizar saída de %.', v_old_stock, v_quantity;
                END IF;

                -- Atualização Atômica
                UPDATE public.products SET stock_quantity = v_new_stock, updated_at = now() WHERE id = v_product_id;

                -- Registro de Movimentação (Imutável)
                INSERT INTO public.inventory_movements (product_id, type, quantity, previous_stock, new_stock, reason, admin_id, admin_name)
                VALUES (v_product_id, v_move_type, v_quantity, v_old_stock, v_new_stock, p_payload->>'reason', v_admin_id, v_admin_name);

                v_result := jsonb_build_object('success', true, 'message', 'Estoque atualizado: ' || v_new_stock || ' unidades.', 'new_stock', v_new_stock);

            WHEN 'UPDATE_PRICE' THEN
                v_product_id := p_payload->>'productId';
                v_sale_price := (p_payload->>'newPrice')::NUMERIC;

                IF v_product_id IS NULL OR v_sale_price IS NULL OR v_sale_price <= 0 THEN
                    RAISE EXCEPTION 'ID do produto ou preço inválido. Preço deve ser positivo.';
                END IF;

                UPDATE public.products SET sale_price = v_sale_price, updated_at = now() WHERE id = v_product_id;
                IF NOT FOUND THEN RAISE EXCEPTION 'Produto não encontrado.'; END IF;

                v_result := jsonb_build_object('success', true, 'message', 'Preço atualizado: R$ ' || v_sale_price, 'new_price', v_sale_price);

            ELSE
                RAISE EXCEPTION 'Ação Administrativa Inválida: %', p_action_type;
        END CASE;

        -- 5. Registro de Auditoria (Atomicamente vinculado)
        INSERT INTO public.audit_logs (admin_id, admin_name, admin_email, action, category, details, payload)
        VALUES (v_admin_id, v_admin_name, v_admin_email, p_action_type, 'GESTORA_V8', v_result->>'message', p_payload);

        -- 6. Concluir Idempotência
        UPDATE public.idempotency_keys SET status = 'SUCCESS', response = v_result, updated_at = now() WHERE key_hash = p_idempotency_key;

    EXCEPTION WHEN OTHERS THEN
        -- Rollback interno da transação é automático no Postgres se o erro subir.
        -- Como o Supabase RPC roda tudo em uma única transação, o registro de idempotência em status 'ERROR'
        -- só seria persistido se capturássemos o erro e déssemos commit. 
        -- Mas preferimos o ROLLBACK TOTAL para permitir retentativa limpa se o erro for transiente.
        RAISE;
    END;

    RETURN v_result;
END;
$$;

-- 5. PRIVILÉGIOS (Proteção contra acesso não autorizado)

REVOKE ALL ON FUNCTION public.execute_gestora_operation_v8_2(TEXT, TEXT, JSONB) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.execute_gestora_operation_v8_2(TEXT, TEXT, JSONB) TO authenticated;

-- Leitura restrita para auditoria
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT ON public.inventory_movements TO authenticated;
GRANT SELECT ON public.idempotency_keys TO authenticated;

-- FIM DO SQL V8.2
