-- Admin kullanıcıların JWT'sine otomatik olarak role: 'admin' ekle
-- Bu trigger, admin email'li kullanıcıların JWT'sine role ekler

-- ADIM 1: Admin email'li kullanıcıların JWT metadata'sına role ekleyen fonksiyon
CREATE OR REPLACE FUNCTION set_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Admin email'leri
  IF NEW.email IN ('huralomer@gmail.com') THEN
    -- JWT'ye role ekle (app_metadata kullanarak)
    NEW.raw_app_meta_data := COALESCE(NEW.raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ADIM 2: Trigger oluştur (auth.users tablosunda INSERT ve UPDATE için)
DROP TRIGGER IF EXISTS set_admin_role_trigger ON auth.users;

CREATE TRIGGER set_admin_role_trigger
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION set_admin_role();

-- ADIM 3: Mevcut admin kullanıcıların metadata'sını güncelle
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email IN ('huralomer@gmail.com')
  AND (raw_app_meta_data->>'role' IS NULL OR raw_app_meta_data->>'role' != 'admin');

-- ADIM 4: Güncelleme sonucunu kontrol et
SELECT 
  id,
  email,
  raw_app_meta_data->>'role' as role,
  'Admin role eklendi' as status
FROM auth.users
WHERE email IN ('huralomer@gmail.com');
