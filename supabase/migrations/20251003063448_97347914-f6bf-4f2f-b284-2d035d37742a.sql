-- Update admin_logs to track all user logins, not just admin actions
-- Add a trigger to log when users sign in

CREATE OR REPLACE FUNCTION public.log_user_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the login event
  INSERT INTO public.admin_logs (admin_id, action, details)
  VALUES (
    NEW.id,
    'user_login',
    jsonb_build_object(
      'email', NEW.email,
      'last_sign_in_at', NEW.last_sign_in_at
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for login tracking
-- This trigger fires when last_sign_in_at is updated
CREATE TRIGGER on_user_login
AFTER UPDATE OF last_sign_in_at ON auth.users
FOR EACH ROW
WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
EXECUTE FUNCTION public.log_user_login();