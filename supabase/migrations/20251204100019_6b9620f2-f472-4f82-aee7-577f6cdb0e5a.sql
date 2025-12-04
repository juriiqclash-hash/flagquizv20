-- Enum für Code-Typen
CREATE TYPE public.code_type AS ENUM (
  'premium_time',
  'ultimate_time', 
  'xp',
  'badge',
  'chat_style',
  'admin_time',
  'double_xp',
  'profile_frame'
);

-- Tabelle für Einlösecodes
CREATE TABLE public.redemption_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  code_type code_type NOT NULL,
  value jsonb NOT NULL,
  max_uses integer,
  current_uses integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Tabelle für eingelöste Codes
CREATE TABLE public.code_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code_id uuid NOT NULL REFERENCES public.redemption_codes(id) ON DELETE CASCADE,
  redeemed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, code_id)
);

-- Tabelle für Benutzer-Perks (zeitlich begrenzte Vorteile)
CREATE TABLE public.user_perks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  perk_type text NOT NULL,
  expires_at timestamptz NOT NULL,
  granted_at timestamptz DEFAULT now(),
  code_id uuid REFERENCES public.redemption_codes(id) ON DELETE SET NULL
);

-- Tabelle für benutzerdefinierte Badges
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id text NOT NULL,
  badge_name text NOT NULL,
  badge_emoji text,
  badge_color text,
  expires_at timestamptz,
  granted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- RLS aktivieren
ALTER TABLE public.redemption_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS für redemption_codes
CREATE POLICY "Admins can manage codes" ON public.redemption_codes
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can query active codes" ON public.redemption_codes
FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);

-- RLS für code_redemptions
CREATE POLICY "Users can view own redemptions" ON public.code_redemptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own redemptions" ON public.code_redemptions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all redemptions" ON public.code_redemptions
FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- RLS für user_perks
CREATE POLICY "Users can view own perks" ON public.user_perks
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own perks" ON public.user_perks
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage perks" ON public.user_perks
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS für user_badges
CREATE POLICY "Anyone can view badges" ON public.user_badges
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own badges" ON public.user_badges
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage badges" ON public.user_badges
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Funktion zum Code einlösen
CREATE OR REPLACE FUNCTION public.redeem_code(p_code text, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_record redemption_codes%ROWTYPE;
  v_result jsonb;
BEGIN
  -- Code suchen
  SELECT * INTO v_code_record FROM redemption_codes WHERE code = p_code;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code nicht gefunden');
  END IF;
  
  -- Prüfungen
  IF NOT v_code_record.is_active THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code ist deaktiviert');
  END IF;
  
  IF v_code_record.expires_at IS NOT NULL AND v_code_record.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code ist abgelaufen');
  END IF;
  
  IF v_code_record.max_uses IS NOT NULL AND v_code_record.current_uses >= v_code_record.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code wurde zu oft verwendet');
  END IF;
  
  -- Prüfen ob bereits eingelöst
  IF EXISTS (SELECT 1 FROM code_redemptions WHERE code_id = v_code_record.id AND user_id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Du hast diesen Code bereits eingelöst');
  END IF;
  
  -- Code einlösen
  INSERT INTO code_redemptions (user_id, code_id) VALUES (p_user_id, v_code_record.id);
  
  -- Verwendungszähler erhöhen
  UPDATE redemption_codes SET current_uses = current_uses + 1 WHERE id = v_code_record.id;
  
  -- Je nach Typ die Belohnung anwenden
  CASE v_code_record.code_type
    WHEN 'xp' THEN
      PERFORM add_xp(p_user_id, (v_code_record.value->>'xp_amount')::integer);
    WHEN 'premium_time', 'ultimate_time', 'chat_style', 'admin_time', 'double_xp' THEN
      INSERT INTO user_perks (user_id, perk_type, expires_at, code_id)
      VALUES (
        p_user_id,
        v_code_record.code_type::text,
        now() + ((v_code_record.value->>'duration_days')::integer || ' days')::interval,
        v_code_record.id
      );
    WHEN 'badge', 'profile_frame' THEN
      INSERT INTO user_badges (user_id, badge_id, badge_name, badge_emoji, badge_color, expires_at)
      VALUES (
        p_user_id,
        v_code_record.value->>'badge_id',
        v_code_record.value->>'badge_name',
        v_code_record.value->>'badge_emoji',
        v_code_record.value->>'badge_color',
        CASE WHEN v_code_record.value->>'duration_days' IS NOT NULL 
          THEN now() + ((v_code_record.value->>'duration_days')::integer || ' days')::interval
          ELSE NULL 
        END
      )
      ON CONFLICT (user_id, badge_id) DO UPDATE SET
        expires_at = EXCLUDED.expires_at,
        granted_at = now();
  END CASE;
  
  RETURN jsonb_build_object(
    'success', true, 
    'code_type', v_code_record.code_type,
    'value', v_code_record.value
  );
END;
$$;