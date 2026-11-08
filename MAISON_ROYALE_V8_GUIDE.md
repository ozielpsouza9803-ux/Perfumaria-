# IA GESTORA MAISON ROYALE V8.2 - MANUAL FINAL DE OPERAÇÃO

Este documento consolida a arquitetura operacional da Versão 8.2, focada em **integridade transacional**, **segurança RLS** e **idempotência concorrente**.

## 1. Destaques da Implementação V8.2

- **JWT Forwarding**: O servidor agora utiliza o token original do usuário para todas as consultas ao Supabase. Isso garante que as políticas de RLS (Row-Level Security) sejam aplicadas corretamente em tempo de execução.
- **RPC Atômica (`execute_gestora_operation_v8_2`)**: Toda alteração administrativa (Cadastro, Estoque, Preço) ocorre dentro de uma única transação SQL. Se houver falha, o banco reverte automaticamente todas as mudanças, incluindo o log de auditoria.
- **Idempotência de Conteúdo**: A chave de idempotência agora é vinculada ao hash do conteúdo (`actionType` + `payload`). Se você tentar repetir a mesma ação com a mesma chave, o sistema retornará o resultado original sem re-executar.
- **Imutabilidade Blindada**: Revogação de privilégios de escrita direta para usuários (`authenticated`/`anon`) em tabelas de auditoria e movimentos. Escrita permitida apenas via RPC.

## 2. Diagnóstico Técnico (SQL Editor)

Execute estas consultas para validar a infraestrutura:

```sql
-- 1. Validar RPC V8.2 (Deve retornar 'f' para is_aggregate)
SELECT routine_name, routine_type, security_type 
FROM information_schema.routines 
WHERE routine_name = 'execute_gestora_operation_v8_2';

-- 2. Validar Imutabilidade (Devem existir 2 triggers)
SELECT event_object_table, trigger_name, action_statement 
FROM information_schema.triggers 
WHERE trigger_name IN ('tr_immutable_audit', 'tr_immutable_movements');

-- 3. Validar Proteção de Escrita (Deve retornar privilégios negados/vazio para roles da API)
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name IN ('audit_logs', 'inventory_movements') 
AND privilege_type IN ('INSERT', 'UPDATE', 'DELETE');
```

## 3. Guia de Testes de Estresse

### Caso A: Concorrência de Estoque
1.  Inicie uma atualização de estoque para o perfume "Noir Oracle".
2.  Dispare imediatamente uma segunda requisição idêntica enquanto a primeira ainda processa (em menos de 1 segundo).
3.  **Resultado Esperado**: O sistema retornará `409 Conflict` ("Operação em processamento") para a segunda requisição, protegendo o saldo contra duplicidade.

### Caso B: Violação de RLS
1.  Tente acessar a rota `/api/admin-ai` com um token de usuário que possua o perfil `CONSULTOR` (ou sem perfil administrativo).
2.  **Resultado Esperado**: Erro `401 Unauthorized` ou `403 Forbidden`, com log no servidor indicando bloqueio de RBAC.

### Caso C: Rollback de Erro de SKU
1.  Tente cadastrar um produto com um SKU que já existe.
2.  **Resultado Esperado**: A transação falhará. O banco reverterá a criação do produto e NÃO gravará nada em `inventory_movements` ou `audit_logs` para essa operação específica (integridade total).

## 4. Variáveis de Ambiente (Secrets)

Certifique-se de que estas chaves estão configuradas no painel **Settings > Secrets**:

- `GEMINI_API_KEY`: Chave para o modelo Gemini 3.8 Flash.
- `SESSION_SECRET`: Chave persistente para tokens de fallback (opcional, recomendado para estabilidade).
- `MASTER_AUTHORIZATION_KEY`: Chave mestra de acesso direto.

---
**Status**: Implementação Concluída e Auditada.
