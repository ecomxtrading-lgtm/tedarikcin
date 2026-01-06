-- Admin Policy Çakışmasını Düzelt
-- Mevcut policy'ler JWT role kontrolü yapıyor, biz email kontrolü yapıyoruz
-- Bu dosya her iki kontrolü de destekleyecek şekilde düzenler

-- ÖNEMLİ: Bu dosyayı çalıştırmadan önce test_admin_function.sql dosyasını çalıştırın
-- ve is_admin_user() fonksiyonunun çalıştığından emin olun

-- ADIM 1: is_admin_user() fonksiyonunu güncelle (daha güvenilir hale getir)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  jwt_role text;
  user_id uuid;
BEGIN
  -- auth.uid() kontrolü
  user_id := auth.uid();
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Önce JWT'deki role'ü kontrol et (daha hızlı)
  jwt_role := auth.jwt() ->> 'role';
  IF jwt_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- JWT'de role yoksa email kontrolü yap
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;
  
  -- Email null ise false döndür
  IF user_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Admin email'leri kontrol et (case-insensitive)
  RETURN LOWER(user_email) IN (
    'huralomer@gmail.com'
    -- Yeni admin email'leri eklemek için buraya ekleyin:
    -- 'admin2@example.com',
    -- 'admin3@example.com'
  );
END;
$$;

-- ADIM 2: Mevcut admin policy'lerinin çalıştığını doğrula
-- Policy'ler zaten var, sadece fonksiyonu güncelledik
-- Policy'leri yeniden oluşturmaya gerek yok

-- ADIM 3: Test sorgusu - Policy'lerin çalışıp çalışmadığını kontrol et
SELECT 
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression,
  'Policy aktif' as status
FROM pg_policies
WHERE tablename = 'offers'
  AND policyname LIKE 'Admins can%'
ORDER BY policyname;

-- ADIM 4: Fonksiyon testi
SELECT 
  'is_admin_user() fonksiyonu test ediliyor...' as test_info,
  is_admin_user() as result;
