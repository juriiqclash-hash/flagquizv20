/*
  # Update XP and Level Calculation Function

  1. Changes
    - Replace existing calculate_level_from_xp function with new implementation
    - New function uses exact XP table provided by user (Level 1-100)
    - Each level requires specific XP amounts according to the table
    - Maximum level is 100

  2. XP Table Summary
    - Level 1: 4 XP total
    - Level 10: 310 XP total
    - Level 50: 11,515 XP total
    - Level 100: 61,631 XP total
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.calculate_level_from_xp(integer);

-- Create new function with exact XP table
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  xp_thresholds INTEGER[] := ARRAY[
    4, 12, 26, 46, 72, 105, 145, 192, 247, 310,
    380, 459, 547, 644, 751, 868, 994, 1131, 1278, 1427,
    1588, 1760, 1944, 2140, 2349, 2571, 2806, 3055, 3317, 3564,
    3839, 4127, 4428, 4743, 5072, 5415, 5772, 6143, 6529, 6883,
    7284, 7700, 8131, 8577, 9039, 9517, 10011, 10521, 11047, 11515,
    12072, 12645, 13234, 13840, 14463, 15103, 15760, 16434, 17126, 17713,
    18456, 19217, 19996, 20793, 21608, 22441, 23293, 24164, 25054, 25766,
    26696, 27646, 28616, 29606, 30617, 31649, 32702, 33776, 34871, 35713,
    36843, 37994, 39167, 40362, 41579, 42818, 44080, 45365, 46673, 47648,
    48981, 50338, 51719, 53124, 54553, 56007, 57486, 58990, 60519, 61631
  ];
  current_level INTEGER := 0;
BEGIN
  IF total_xp < 4 THEN
    RETURN 0;
  END IF;

  FOR i IN 1..100 LOOP
    IF total_xp >= xp_thresholds[i] THEN
      current_level := i;
    ELSE
      EXIT;
    END IF;
  END LOOP;

  RETURN current_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing add_xp function to use new level calculation
CREATE OR REPLACE FUNCTION public.add_xp(p_user_id UUID, p_xp_gained INTEGER)
RETURNS void AS $$
DECLARE
  current_xp INTEGER;
  new_xp INTEGER;
  new_level INTEGER;
BEGIN
  SELECT xp INTO current_xp
  FROM public.user_stats
  WHERE user_id = p_user_id;

  IF current_xp IS NULL THEN
    INSERT INTO public.user_stats (user_id, xp, level)
    VALUES (p_user_id, p_xp_gained, calculate_level_from_xp(p_xp_gained));
  ELSE
    new_xp := current_xp + p_xp_gained;
    new_level := calculate_level_from_xp(new_xp);

    UPDATE public.user_stats
    SET xp = new_xp,
        level = new_level,
        total_correct_answers = total_correct_answers + 1
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
