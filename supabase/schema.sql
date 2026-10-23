-- ========================================================
-- AFM MANAGER 2027 - SUPABASE DATABASE SCHEMA OFICIAL & ATUALIZADO
-- Compatibilidade: PostgreSQL 15+ / Supabase Cloud
-- URL do Projeto: https://yulsnzvgxtwbazqvetpe.supabase.co
-- ========================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. FUNÇÃO AUXILIAR PARA ATUALIZAÇÃO AUTOMÁTICA DE TIMESTAMP
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABELA DE USUÁRIOS DO AFM MANAGER
CREATE TABLE IF NOT EXISTS public.afm_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL DEFAULT '123456',
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'player',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Garantir coluna password se já tiver sido removida anteriormente
ALTER TABLE public.afm_users ADD COLUMN IF NOT EXISTS password TEXT NOT NULL DEFAULT '123456';
ALTER TABLE public.afm_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'player';

-- Índice para login instantâneo case-insensitive
CREATE INDEX IF NOT EXISTS idx_afm_users_username_lower ON public.afm_users (lower(username));

-- 4. TABELA DE SAVES / CARREIRAS POR SLOT (1, 2, 3)
CREATE TABLE IF NOT EXISTS public.afm_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    slot INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 3),
    club TEXT NOT NULL,
    manager TEXT NOT NULL,
    season INTEGER NOT NULL DEFAULT 2026,
    round INTEGER NOT NULL DEFAULT 0,
    balance BIGINT NOT NULL DEFAULT 0,
    stadium_capacity INTEGER NOT NULL DEFAULT 18000,
    stadium_ring INTEGER NOT NULL DEFAULT 1,
    stadium_sectors_count INTEGER NOT NULL DEFAULT 0,
    manager_money BIGINT NOT NULL DEFAULT 57000,
    division TEXT NOT NULL DEFAULT 'Série A',
    save_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_afm_saves_username_slot UNIQUE (username, slot)
);

-- Adicionar colunas se tabela já existir em migrações anteriores
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='afm_saves' AND column_name='stadium_capacity') THEN
        ALTER TABLE public.afm_saves ADD COLUMN stadium_capacity INTEGER NOT NULL DEFAULT 18000;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='afm_saves' AND column_name='stadium_ring') THEN
        ALTER TABLE public.afm_saves ADD COLUMN stadium_ring INTEGER NOT NULL DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='afm_saves' AND column_name='stadium_sectors_count') THEN
        ALTER TABLE public.afm_saves ADD COLUMN stadium_sectors_count INTEGER NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='afm_saves' AND column_name='manager_money') THEN
        ALTER TABLE public.afm_saves ADD COLUMN manager_money BIGINT NOT NULL DEFAULT 57000;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='afm_saves' AND column_name='division') THEN
        ALTER TABLE public.afm_saves ADD COLUMN division TEXT NOT NULL DEFAULT 'Série A';
    END IF;
    -- Se user_id existir e for NOT NULL, remover a restrição NOT NULL para permitir saves do cliente web
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'afm_saves' AND column_name = 'user_id' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.afm_saves ALTER COLUMN user_id DROP NOT NULL;
    END IF;
    -- Garantir restrição única (username, slot) caso tabela já existisse
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_afm_saves_username_slot'
    ) THEN
        ALTER TABLE public.afm_saves ADD CONSTRAINT uq_afm_saves_username_slot UNIQUE (username, slot);
    END IF;
END $$;

-- Índices otimizados para busca de saves
CREATE INDEX IF NOT EXISTS idx_afm_saves_username ON public.afm_saves (lower(username));
CREATE INDEX IF NOT EXISTS idx_afm_saves_slot ON public.afm_saves (username, slot);
CREATE INDEX IF NOT EXISTS idx_afm_saves_updated_at ON public.afm_saves (updated_at DESC);

-- Triggers para atualização automática de timestamp
DROP TRIGGER IF EXISTS trg_afm_users_updated_at ON public.afm_users;
CREATE TRIGGER trg_afm_users_updated_at
    BEFORE UPDATE ON public.afm_users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trg_afm_saves_updated_at ON public.afm_saves;
CREATE TRIGGER trg_afm_saves_updated_at
    BEFORE UPDATE ON public.afm_saves
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 5. HABILITAR ROW LEVEL SECURITY (RLS) COM POLÍTICAS PÚBLICAS / ANÔNIMAS
ALTER TABLE public.afm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.afm_saves ENABLE ROW LEVEL SECURITY;

-- Limpar quaisquer políticas antigas restritivas
DO $$
DECLARE existing_policy RECORD;
BEGIN
    FOR existing_policy IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename IN ('afm_users', 'afm_saves')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', existing_policy.policyname, existing_policy.schemaname, existing_policy.tablename);
    END LOOP;
END $$;

-- Criar políticas públicas completas (permitindo acesso via chave pública anon/publishable)
CREATE POLICY "Public full access to afm_users"
    ON public.afm_users
    FOR ALL
    TO anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public full access to afm_saves"
    ON public.afm_saves
    FOR ALL
    TO anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);

-- 6. CONCEDER PERMISSÕES COMPLETAS AO CLIENTE WEB (ANON, AUTHENTICATED E SERVICE_ROLE)
GRANT ALL ON TABLE public.afm_users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.afm_saves TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_current_timestamp_updated_at() TO anon, authenticated, service_role;

-- 7. USUÁRIOS PADRÃO INICIAIS (IDEMPOTENTE)
INSERT INTO public.afm_users (username, password, name, role)
VALUES 
    ('admin', 'admin', 'Administrador AFM', 'admin'),
    ('aquino', 'viralgen123', 'Aquino', 'player')
ON CONFLICT (username) DO UPDATE 
SET 
    password = EXCLUDED.password,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = timezone('utc'::text, now());
