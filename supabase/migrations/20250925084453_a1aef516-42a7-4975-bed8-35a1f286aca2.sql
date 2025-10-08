-- Fix the function security issue by setting search_path
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    -- Generate 4-character alphanumeric code
    code := upper(
      chr(ascii('A') + floor(random() * 26)::integer) ||
      chr(ascii('A') + floor(random() * 26)::integer) ||
      chr(ascii('0') + floor(random() * 10)::integer) ||
      chr(ascii('0') + floor(random() * 10)::integer)
    );
    
    -- Check if code already exists
    SELECT COUNT(*) INTO exists_count 
    FROM public.matches 
    WHERE room_code = code AND status != 'finished';
    
    IF exists_count = 0 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;