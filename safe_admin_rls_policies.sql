-- GÜVENLİ Admin RLS Policies - Mevcut Policy'leri Bozmadan Ekleme
-- Bu SQL kodunu çalıştırmadan önce check_existing_rls_policies.sql dosyasını çalıştırın

-- ADIM 1: is_admin_user fonksiyonunu oluştur (eğer yoksa)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  -- auth.users tablosundan email'i al
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Admin email'leri kontrol et (buraya admin email'lerinizi ekleyin)
  RETURN user_email IN (
    'huralomer@gmail.com'
    -- Yeni admin email'leri eklemek için buraya ekleyin:
    -- 'admin2@example.com',
    -- 'admin3@example.com'
  );
END;
$$;

-- ADIM 2: Sadece admin policy'lerini ekle (mevcut policy'leri silmeden)
-- Eğer policy zaten varsa hata vermez (IF NOT EXISTS benzeri davranış)

-- Admin'ler tüm teklifleri görebilir (SELECT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'offers' 
    AND policyname = 'Admins can view all offers'
  ) THEN
    CREATE POLICY "Admins can view all offers"
    ON offers
    FOR SELECT
    TO authenticated
    USING (is_admin_user());
  END IF;
END $$;

-- Admin'ler teklif oluşturabilir (INSERT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'offers' 
    AND policyname = 'Admins can create offers'
  ) THEN
    CREATE POLICY "Admins can create offers"
    ON offers
    FOR INSERT
    TO authenticated
    WITH CHECK (is_admin_user());
  END IF;
END $$;

-- Admin'ler teklif güncelleyebilir (UPDATE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'offers' 
    AND policyname = 'Admins can update offers'
  ) THEN
    CREATE POLICY "Admins can update offers"
    ON offers
    FOR UPDATE
    TO authenticated
    USING (is_admin_user())
    WITH CHECK (is_admin_user());
  END IF;
END $$;

-- NOT: DELETE policy'si opsiyonel, şimdilik eklemiyoruz
-- Gerekirse aşağıdaki kodu kullanabilirsiniz:

-- Admin'ler teklif silebilir (DELETE) - OPSİYONEL
-- DO $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_policies 
--     WHERE tablename = 'offers' 
--     AND policyname = 'Admins can delete offers'
--   ) THEN
--     CREATE POLICY "Admins can delete offers"
--     ON offers
--     FOR DELETE
--     TO authenticated
--     USING (is_admin_user());
--   END IF;
-- END $$;

-- ADIM 3: Policy'lerin başarıyla oluşturulduğunu kontrol et
SELECT 
  policyname,
  cmd as command,
  'Policy başarıyla oluşturuldu' as status
FROM pg_policies
WHERE tablename = 'offers'
  AND policyname LIKE 'Admins can%'
ORDER BY policyname;
