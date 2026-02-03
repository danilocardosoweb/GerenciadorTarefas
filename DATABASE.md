
# 🏭 Guia de Configuração - Banco de Dados TecnoPerfil

Para colocar o sistema em produção, siga exatamente os passos abaixo no seu painel do **Supabase**.

## 1. Criação das Tabelas
Vá em **SQL Editor** > **New Query** e cole o script abaixo. Este script cria toda a estrutura industrial necessária.

```sql
-- 1. SETORES
CREATE TABLE sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. USUÁRIOS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  sector_id UUID REFERENCES sectors(id),
  avatar TEXT,
  active BOOLEAN DEFAULT true,
  is_online BOOLEAN DEFAULT false,
  last_access TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TAREFAS / OPs
CREATE TABLE tasks (
  id TEXT PRIMARY KEY, -- Ex: T-1001
  type TEXT NOT NULL,
  requesting_sector TEXT NOT NULL,
  responsible_sector TEXT NOT NULL,
  priority TEXT NOT NULL,
  description TEXT,
  product_profile TEXT,
  op_number TEXT,
  quantity NUMERIC,
  open_date TIMESTAMPTZ DEFAULT now(),
  deadline DATE,
  responsible_id UUID REFERENCES users(id),
  executor_group_id TEXT,
  requestor_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'Aberto',
  visibility TEXT DEFAULT 'Global',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. WORKFLOW (ETAPAS)
CREATE TABLE task_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  responsible_group_id TEXT,
  responsible_user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'Pendente',
  order_index INTEGER NOT NULL,
  completed_at TIMESTAMPTZ,
  completed_by TEXT
);

-- 5. ANEXOS
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. HISTÓRICO / AUDITORIA
CREATE TABLE task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  user_name TEXT,
  action TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);
```

## 2. Inserção do Usuário Mestre (Admin)
Após criar as tabelas, execute este comando para conseguir logar pela primeira vez:

```sql
-- Primeiro, criamos o setor PCP
INSERT INTO sectors (name, initials) VALUES ('PCP - Planejamento', 'PCP');

-- Agora criamos o usuário admin (Substitua a senha se desejar)
-- O email deve ser exatamente: admin@tecnoperfil.com.br
-- A senha inicial será: tecnoperfil2025
INSERT INTO users (name, email, password, sector_id, active)
SELECT 
  'Administrador TecnoPerfil', 
  'admin@tecnoperfil.com.br', 
  'tecnoperfil2025', 
  id, 
  true 
FROM sectors WHERE initials = 'PCP' LIMIT 1;
```

## 3. Configuração de CORS (Essencial para Produção)
Para evitar o erro de login que você teve anteriormente:
1. Vá em **Settings** > **API**.
2. Procure por **CORS Config**.
3. Em **Allowed Origins**, adicione o domínio da sua Vercel (ex: `tecnoperfil-app.vercel.app`) ou coloque `*` para testes (não recomendado para produção definitiva).

## 4. Variáveis de Ambiente
Na Vercel, configure:
- `process.env.API_KEY`: Sua chave do Gemini.
- As chaves do Supabase já estão embutidas no `supabaseClient.ts` com o token fornecido.
