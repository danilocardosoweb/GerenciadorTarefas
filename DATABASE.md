# 🏭 Guia de Configuração - Banco de Dados TecnoPerfil

Siga estas instruções no **SQL Editor** do Supabase para configurar o ambiente.

## 1. Estrutura de Tabelas (Esquema Industrial)

```sql
-- TABELA: SETORES
CREATE TABLE sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TABELA: USUÁRIOS
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

-- TABELA: TAREFAS / OPs
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
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
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by TEXT
);

-- TABELA: WORKFLOW (ETAPAS PLANEJADAS)
CREATE TABLE task_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,           -- Nome da Etapa
  description TEXT,              -- Instruções Técnicas
  responsible_group_id TEXT,     -- Grupo Responsável (PCP, Produção, etc)
  responsible_user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'Pendente',
  order_index INTEGER NOT NULL,  -- Sequência da Linha de Produção
  deadline DATE,                 -- Prazo específico da etapa
  completed_at TIMESTAMPTZ,
  completed_by TEXT              -- Nome do operador que concluiu
);

-- TABELA: ANEXOS
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TABELA: HISTÓRICO DE AUDITORIA
CREATE TABLE task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  user_name TEXT,
  action TEXT NOT NULL,
  details TEXT,
  type TEXT DEFAULT 'manual',
  timestamp TIMESTAMPTZ DEFAULT now()
);
```

## 2. Configuração Inicial (Primeiro Acesso)

```sql
-- 1. Criar o setor mestre
INSERT INTO sectors (name, initials) VALUES ('PCP - Planejamento', 'PCP');

-- 2. Criar o usuário administrador padrão
-- Email: admin@tecnoperfil.com.br
-- Senha: tecnoperfil2025
INSERT INTO users (name, email, password, sector_id, active)
SELECT 
  'Administrador TecnoPerfil', 
  'admin@tecnoperfil.com.br', 
  'tecnoperfil2025', 
  id, 
  true 
FROM sectors WHERE initials = 'PCP' LIMIT 1;
```

## 3. Notas de Segurança
- Certifique-se de habilitar **CORS** no painel do Supabase para o domínio da sua aplicação.
- As tabelas possuem `ON DELETE CASCADE` para garantir que ao excluir uma OP, todos os seus registros de histórico e anexos sejam removidos automaticamente.
