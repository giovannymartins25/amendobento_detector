#  Documentação do Banco de Dados - Supabase

Este documento contém a arquitetura, schemas, DDL SQL, instruções de configuração e integrações do banco de dados relacional hospedado no **Supabase** para o sistema **Amendobento Detector**.


##  Estrutura de Tabelas & Schemas SQL

Execute os scripts SQL abaixo no **SQL Editor** do painel do Supabase para criar ou atualizar a estrutura completa do banco de dados.

```sql
-- 1. Tabela de Usuários / Operadores e Administradores (com campo de senha)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'operator',
    shift TEXT,
    avatar TEXT,
    password TEXT DEFAULT '123',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Garantir adição da coluna password em tabelas existentes
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT DEFAULT '123';

-- 2. Tabela de Fornos
CREATE TABLE IF NOT EXISTS public.ovens (
    id INT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    is_visible_on_board BOOLEAN DEFAULT false,
    installed_at TEXT,
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Sessões de Torra (Roast Sessions)
CREATE TABLE IF NOT EXISTS public.roast_sessions (
    id TEXT PRIMARY KEY,
    oven_id INT NOT NULL REFERENCES public.ovens(id) ON DELETE CASCADE,
    operator_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    operator_name TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'idle',
    target_quantity_kg NUMERIC(10, 2),
    notes TEXT,
    final_stage TEXT,
    timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Análises de Inteligência (Imagens / IA)
CREATE TABLE IF NOT EXISTS public.analyses (
    id TEXT PRIMARY KEY,
    roast_session_id TEXT REFERENCES public.roast_sessions(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    time_in_roast_seconds INT NOT NULL,
    stage TEXT NOT NULL,
    confidence NUMERIC(5, 2) NOT NULL,
    detected_objects JSONB DEFAULT '[]'::jsonb,
    image_url TEXT NOT NULL,
    oven_id INT NOT NULL REFERENCES public.ovens(id) ON DELETE CASCADE,
    operator_name TEXT NOT NULL,
    human_feedback TEXT,
    corrected_stage TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Alertas Preditivos
CREATE TABLE IF NOT EXISTS public.predictive_alerts (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    oven_id INT NOT NULL REFERENCES public.ovens(id) ON DELETE CASCADE,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de Desempenho para Consultas Rápidas
CREATE INDEX IF NOT EXISTS idx_roast_sessions_oven_id ON public.roast_sessions(oven_id);
CREATE INDEX IF NOT EXISTS idx_roast_sessions_start_time ON public.roast_sessions(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_session_id ON public.analyses(roast_session_id);
CREATE INDEX IF NOT EXISTS idx_analyses_timestamp ON public.analyses(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON public.predictive_alerts(timestamp DESC);
```

---

##  Carga Inicial de Dados (Seed Data com Senhas de Admin)

```sql
-- Inserir Usuários e Administradores Iniciais com Senhas
INSERT INTO public.users (id, name, role, shift, password) VALUES
('op-1', 'João Silva', 'operator', 'Turno A (Manhã)', '123'),
('op-2', 'Carlos Souza', 'operator', 'Turno B (Tarde)', '123'),
('op-3', 'Mariana Oliveira', 'operator', 'Turno C (Noite)', '123'),
('admin-1', 'Fábio ADM', 'admin', 'Geral / Supervisão', '123')
ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password;

-- Inserir Fornos Iniciais
INSERT INTO public.ovens (id, name, status, is_visible_on_board, installed_at, notes) VALUES
(1, 'Forno 1', 'active', false, '2025-01-15', 'Linha Principal'),
(2, 'Forno 2', 'active', false, '2025-02-01', 'Linha Secundária'),
(3, 'Forno 3', 'active', false, '2025-03-01', 'Linha 3')
ON CONFLICT (id) DO NOTHING;
```

---

##  Operações de Exclusão no Banco de Dados

Para deletar imagens/análises diretamente via SQL ou aplicação:

```sql
-- Deletar uma análise/imagem específica por ID
DELETE FROM public.analyses WHERE id = 'ID_DA_ANALISE';

-- Deletar uma sessão de torra inteira (deleta análises em cascata)
DELETE FROM public.roast_sessions WHERE id = 'ID_DA_SESSAO';
```

---

##  Políticas de Segurança (Row Level Security - RLS)

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ovens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roast_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_alerts ENABLE ROW LEVEL SECURITY;

-- Permitir leitura e escrita anônima/autenticada
CREATE POLICY "Permitir Acesso Leitura Todos Users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Permitir Escrita Users" ON public.users FOR ALL USING (true);

CREATE POLICY "Permitir Acesso Leitura Todos Ovens" ON public.ovens FOR SELECT USING (true);
CREATE POLICY "Permitir Escrita Ovens" ON public.ovens FOR ALL USING (true);

CREATE POLICY "Permitir Acesso Leitura Todos Sessions" ON public.roast_sessions FOR SELECT USING (true);
CREATE POLICY "Permitir Escrita Sessions" ON public.roast_sessions FOR ALL USING (true);

CREATE POLICY "Permitir Acesso Leitura Todos Analyses" ON public.analyses FOR SELECT USING (true);
CREATE POLICY "Permitir Escrita e Exclusao Analyses" ON public.analyses FOR ALL USING (true);

CREATE POLICY "Permitir Acesso Leitura Todos Alerts" ON public.predictive_alerts FOR SELECT USING (true);
CREATE POLICY "Permitir Escrita Alerts" ON public.predictive_alerts FOR ALL USING (true);
```

---

##  Mapeamento TypeScript <-> PostgreSQL

| Entidade TypeScript | Tabela Supabase SQL | Chaves / Tipos Relevantes |
| :--- | :--- | :--- |
| `User` | `public.users` | `id` (text), `name` (text), `role` ('operator' \| 'admin'), `password` (text) |
| `OvenConfig` | `public.ovens` | `id` (int), `name` (text), `status` ('active' \| 'inactive') |
| `RoastSession` | `public.roast_sessions` | `id` (text), `oven_id` (int), `duration_seconds` (int), `timeline` (jsonb) |
| `AnalysisResult` | `public.analyses` | `id` (text), `roast_session_id` (text), `detected_objects` (jsonb) |
| `PredictiveAlert` | `public.predictive_alerts` | `id` (text), `severity` (text), `read` (boolean) |

---

##  Arquivos de Integração no Projeto

- [`src/services/supabaseClient.ts`](file:///c:/Users/micro/Desktop/amendobento_detector/src/services/supabaseClient.ts): Cliente Supabase configurado com `createClient`.
- [`src/services/supabaseService.ts`](file:///c:/Users/micro/Desktop/amendobento_detector/src/services/supabaseService.ts): Autenticação de Admin, salvamento e exclusão de análises no Supabase.
- [`src/services/storageService.ts`](file:///c:/Users/micro/Desktop/amendobento_detector/src/services/storageService.ts): Gestão unificada LocalStorage + Supabase.