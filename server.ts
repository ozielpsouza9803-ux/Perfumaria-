import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// 1. CONFIGURAÇÃO IA GESTORA (Gemini 3.8 Flash)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const supabaseUrl = 'https://elklmhiklhdnvmpgitoa.supabase.co';
const supabaseKey = 'sb_publishable_R0e8JVDwlJXwrvkAOIwDAQ_fqYc_5qE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createServer() {
  const app = express();
  app.use(express.json());

  const isProduction = process.env.NODE_ENV === 'production';

  // 2. CREDENCIAIS E SEGURANÇA DE SESSÃO
  const MASTER_KEY = process.env.MASTER_AUTHORIZATION_KEY || process.env.MASTER_KEY;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS;
  
  // Garantir que a sessão seja persistente se configurada, ou randômica por reinício
  const SESSION_SECRET =
    process.env.SESSION_SECRET ||
    MASTER_KEY ||
    ADMIN_PASSWORD ||
    crypto.randomBytes(32).toString('hex');

  if (!MASTER_KEY && !ADMIN_PASSWORD) {
    console.info('[SYSTEM] Aviso: MASTER_KEY não configurada. Operações de fallback limitadas.');
  }

  // Helpers de Token (Compatibilidade Retroativa)
  function signToken(payload: object, secret: string): string {
    const dataStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', secret).update(dataStr).digest('base64url');
    return `${dataStr}.${signature}`;
  }

  function verifyToken(token: string, secret: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 2) return null;
      const [dataStr, signature] = parts;
      const expectedSig = crypto.createHmac('sha256', secret).update(dataStr).digest('base64url');
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return null;
      const parsed = JSON.parse(Buffer.from(dataStr, 'base64url').toString('utf8'));
      if (parsed.exp && Date.now() > parsed.exp) return null;
      return parsed;
    } catch { return null; }
  }

  // 3. HELPER: Supabase Client Escopado ao Usuário (JWT Forwarding)
  async function getAuthenticatedContext(req: express.Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    
    // Validar identidade via Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    
    // Criar cliente dedicado para consultas RLS
    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    // Validar perfil administrativo (RBAC)
    const { data: profile } = await userClient
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', user.id)
      .single();
      
    if (!profile || !['SUPER_ADMIN', 'GERENTE'].includes(profile.role)) {
      return null;
    }
    
    return { user, profile, token, client: userClient };
  }

  // 4. ROTAS DE COMPATIBILIDADE E AUTENTICAÇÃO

  app.post('/api/verify-master-key', (req, res) => {
    const { key } = req.body;
    if (!MASTER_KEY) return res.status(503).json({ success: false, message: 'Serviço de chave mestre indisponível.' });
    if (key === MASTER_KEY) res.json({ success: true });
    else res.status(401).json({ success: false, message: 'Chave de autorização inválida.' });
  });

  app.post('/api/admin-verify-session', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.body.token || '');
    if (!token) return res.status(401).json({ valid: false });
    const payload = verifyToken(token, SESSION_SECRET);
    if (!payload) return res.status(401).json({ valid: false });
    return res.json({ valid: true, admin: payload });
  });

  app.post('/api/admin-auth-fallback', (_req, res) => {
    res.status(401).json({ success: false, message: 'Utilize Supabase Auth para acesso administrativo.' });
  });

  // 5. IA GESTORA V8.2 (CORE ROUTES)

  // ROTA: Análise e Sugestão (Context-Aware)
  app.post('/api/admin-ai', async (req, res) => {
    try {
      const auth = await getAuthenticatedContext(req);
      if (!auth) {
        return res.status(401).json({ success: false, reply: 'Acesso restrito. Identidade administrativa não confirmada.' });
      }

      const { message } = req.body;
      if (!message) return res.status(400).json({ success: false, reply: 'Mensagem vazia.' });

      // Busca de contexto respeitando RLS do usuário
      const [{ data: products }, { data: brands }] = await Promise.all([
        auth.client.from('products').select('id, name, sku, stock_quantity, sale_price, brands(name)').limit(40),
        auth.client.from('brands').select('id, name').order('name')
      ]);

      const systemInstruction = `Você é a "IA GESTORA" da Maison Royale, assistente executiva do administrador ${auth.profile.full_name}.
Seu tom é aristocrático, técnico e extremamente preciso. Você tem acesso direto ao inventário.

CONTEXTO REAL:
- Produtos em Destaque: ${JSON.stringify(products)}
- Marcas: ${JSON.stringify(brands)}

DIRETRIZES:
1. Responda perguntas sobre saldo, preços e disponibilidade.
2. Se solicitado um cadastro ou alteração, formate a ação no JSON de saída.
3. Operações permitidas:
   - "CREATE_PRODUCT": Payload com campos técnicos (sku, salePrice, volumeMl, etc.)
   - "UPDATE_STOCK": { productId, quantity, type ("ENTRADA"|"SAIDA"|"AJUSTE"), reason }
   - "UPDATE_PRICE": { productId, newPrice }
4. Responda SEMPRE em JSON:
{
  "reply": "Sua resposta sofisticada em português...",
  "action": { "type": "...", "payload": { ... } } ou null
}`;

      // Chamada Gemini 3.8 Flash com Timeout
      const aiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: message,
        config: { responseMimeType: 'application/json', systemInstruction },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI_TIMEOUT')), 9000)
      );

      const response = (await Promise.race([aiPromise, timeoutPromise])) as any;
      const result = JSON.parse(response.text);

      res.json({
        success: true,
        reply: result.reply,
        action: result.action,
      });
    } catch (err: any) {
      console.error('[IA_GEST] Error:', err);
      const isTimeout = err.message === 'AI_TIMEOUT';
      res.status(isTimeout ? 504 : 500).json({
        success: false,
        reply: isTimeout ? 'O ateliê digital está processando uma carga alta de dados. Tente novamente em instantes.' : 'Ocorreu uma falha na comunicação com a inteligência gestora.',
        error: err.message
      });
    }
  });

  // ROTA: Execução de Operações Administrativas (Atomic RPC)
  app.post('/api/admin-ai-execute', async (req, res) => {
    try {
      const auth = await getAuthenticatedContext(req);
      if (!auth) {
        return res.status(403).json({ success: false, message: 'Proibido: Credenciais administrativas inválidas ou expiradas.' });
      }

      const { actionType, payload, idempotencyKey: providedKey } = req.body;
      if (!actionType || !payload) {
        return res.status(400).json({ success: false, message: 'Parâmetros de execução inválidos.' });
      }

      // Hash canônico para garantir que a chave proteja o conteúdo exato
      const contentHash = crypto.createHash('sha256').update(JSON.stringify({ actionType, payload })).digest('hex');
      const finalIdempotencyKey = providedKey || `mr_v82_${auth.user.id.slice(0, 8)}_${contentHash.slice(0, 24)}`;

      // Chamada à RPC V8.2 (Execução no contexto do usuário autenticado)
      const { data, error } = await auth.client.rpc('execute_gestora_operation_v8_2', {
        p_idempotency_key: finalIdempotencyKey,
        p_action_type: actionType,
        p_payload: payload
      });

      if (error) {
        console.error('[RPC_EXEC] Business Failure:', error);
        const status = error.message.includes('Não autorizado') ? 401 :
                       error.message.includes('Acesso Negado') ? 403 :
                       error.message.includes('Conflito') || error.message.includes('processamento') ? 409 : 400;
        
        return res.status(status).json({
          success: false,
          message: error.message,
          hint: error.hint
        });
      }

      res.json(data);
    } catch (err: any) {
      console.error('[RPC_EXEC] Fatal Error:', err);
      res.status(500).json({
        success: false,
        message: 'Falha crítica ao orquestrar operação administrativa.',
        error: err.message
      });
    }
  });

  // 6. MIDDLEWARE DE PRODUÇÃO E DEV
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`[SERVER] Maison Royale V8.2 running on port ${PORT}`);
  });
}

createServer();
