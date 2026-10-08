-- ========================================================
-- AFM MANAGER 2027 - SUPABASE DATABASE SCHEMA (CORRIGIDO)
-- Projeto: https://yulsnzvgxtwbazqvetpe.supabase.co
-- ========================================================

-- 1. LIMPAR TABELAS ANTIGAS PARA EVITAR CONFLITO DE COLUNAS
DROP TABLE IF EXISTS public.afm_saves CASCADE;
DROP TABLE IF EXISTS public.afm_users CASCADE;

-- 2. TABELA DE USUÁRIOS DO AFM MANAGER
CREATE TABLE public.afm_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'player',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índice case-insensitive para busca instantânea de login
CREATE INDEX idx_afm_users_username_lower ON public.afm_users (lower(username));

-- 3. TABELA DE SAVES / CARREIRAS POR SLOT (1, 2, 3)
CREATE TABLE public.afm_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    slot INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 3),
    club TEXT NOT NULL,
    manager TEXT NOT NULL,
    season INTEGER NOT NULL DEFAULT 2026,
    round INTEGER NOT NULL DEFAULT 0,
    balance BIGINT NOT NULL DEFAULT 0,
    save_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_afm_saves_username_slot UNIQUE (username, slot)
);

-- Índices para busca ultrarrápida de saves
CREATE INDEX idx_afm_saves_username ON public.afm_saves (lower(username));
CREATE INDEX idx_afm_saves_slot ON public.afm_saves (username, slot);

-- 4. HABILITAR ROW LEVEL SECURITY (RLS) COM POLÍTICAS PÚBLICAS/ANÔNIMAS
-- Permite que o jogo no navegador acesse usando a chave pública (anon/publishable)
ALTER TABLE public.afm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.afm_saves ENABLE ROW LEVEL SECURITY;

-- Políticas para afm_users
DROP POLICY IF EXISTS "Public full access to afm_users" ON public.afm_users;
CREATE POLICY "Public full access to afm_users"
ON public.afm_users
FOR ALL
USING (true)
WITH CHECK (true);

-- Políticas para afm_saves
DROP POLICY IF EXISTS "Public full access to afm_saves" ON public.afm_saves;
CREATE POLICY "Public full access to afm_saves"
ON public.afm_saves
FOR ALL
USING (true)
WITH CHECK (true);

-- 5. CONCEDER PERMISSÕES COMPLETAS AO PAPEL ANON E AUTHENTICATED
GRANT ALL ON TABLE public.afm_users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.afm_saves TO anon, authenticated, service_role;

-- 6. CARGA INICIAL DE USUÁRIOS PADRÃO
INSERT INTO public.afm_users (username, password, name, role)
VALUES 
    ('admin', 'admin', 'Administrador AFM', 'admin'),
    ('aquino', 'viralgen123', 'Aquino', 'player');
