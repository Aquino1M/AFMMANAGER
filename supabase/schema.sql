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

-- 3. Perfil legado sem credenciais. A autenticação fica em auth.users.
CREATE TABLE IF NOT EXISTS public.afm_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'player',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índice para login instantâneo case-insensitive
CREATE INDEX IF NOT EXISTS idx_afm_users_username_lower ON public.afm_users (lower(username));

-- 4. TABELA DE SAVES / CARREIRAS POR SLOT (1, 2, 3)
CREATE TABLE IF NOT EXISTS public.afm_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

ALTER TABLE public.afm_saves
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS uq_afm_saves_user_slot ON public.afm_saves (user_id, slot);

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

-- 5. RLS: somente o dono autenticado acessa os próprios saves.
ALTER TABLE public.afm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.afm_saves ENABLE ROW LEVEL SECURITY;

-- Remova qualquer política antiga nesses dados: permissões permissivas são combinadas por OR.
DO $$
DECLARE existing_policy RECORD;
BEGIN
    FOR existing_policy IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename IN ('afm_users', 'afm_saves')
    LOOP
        EXECUTE format('DROP POLICY %I ON %I.%I', existing_policy.policyname, existing_policy.schemaname, existing_policy.tablename);
    END LOOP;
END $$;
CREATE POLICY afm_saves_select_own ON public.afm_saves
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY afm_saves_insert_own ON public.afm_saves
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY afm_saves_update_own ON public.afm_saves
    FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY afm_saves_delete_own ON public.afm_saves
    FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

REVOKE ALL ON TABLE public.afm_users FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.afm_saves FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.afm_saves TO authenticated;
GRANT ALL ON TABLE public.afm_saves TO service_role;
ALTER TABLE public.afm_users DROP COLUMN IF EXISTS password;
REVOKE EXECUTE ON FUNCTION public.set_current_timestamp_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_current_timestamp_updated_at() TO authenticated;
