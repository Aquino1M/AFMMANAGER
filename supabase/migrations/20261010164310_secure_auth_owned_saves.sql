-- Associate future cloud saves with Supabase Auth. Existing rows stay intact
-- and unclaimed until their owner imports a local copy after signing in.
ALTER TABLE public.afm_saves
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_afm_saves_user_slot
    ON public.afm_saves (user_id, slot);

ALTER TABLE public.afm_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.afm_users ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE policy_row RECORD;
BEGIN
    FOR policy_row IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename IN ('afm_users', 'afm_saves')
    LOOP
        EXECUTE format('DROP POLICY %I ON %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
    END LOOP;
END $$;

CREATE POLICY afm_saves_select_own ON public.afm_saves
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY afm_saves_insert_own ON public.afm_saves
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY afm_saves_update_own ON public.afm_saves
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY afm_saves_delete_own ON public.afm_saves
    FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

REVOKE ALL ON TABLE public.afm_users FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.afm_saves FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.afm_saves TO authenticated;
GRANT ALL ON TABLE public.afm_saves TO service_role;

-- The app now authenticates through auth.users; discard exposed legacy passwords.
ALTER TABLE public.afm_users DROP COLUMN IF EXISTS password;
REVOKE EXECUTE ON FUNCTION public.set_current_timestamp_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_current_timestamp_updated_at() TO authenticated;
