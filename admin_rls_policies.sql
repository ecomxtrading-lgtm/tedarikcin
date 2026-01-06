-- Admin RLS Policies for offers table
-- Bu SQL kodunu Supabase SQL Editor'de çalıştırın

-- Önce admin email kontrolü için SECURITY DEFINER fonksiyonu oluşturun
-- Bu fonksiyon auth.users tablosuna erişebilir
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

-- Mevcut admin policy'lerini kaldır (eğer varsa)
DROP POLICY IF EXISTS "Admins can view all offers" ON offers;
DROP POLICY IF EXISTS "Admins can create offers" ON offers;
DROP POLICY IF EXISTS "Admins can update offers" ON offers;
DROP POLICY IF EXISTS "Admins can delete offers" ON offers;

-- 1. Admin'ler tüm teklifleri görebilir
CREATE POLICY "Admins can view all offers"
ON offers
FOR SELECT
TO authenticated
USING (is_admin_user());

-- 2. Admin'ler teklif oluşturabilir
CREATE POLICY "Admins can create offers"
ON offers
FOR INSERT
TO authenticated
WITH CHECK (is_admin_user());

-- 3. Admin'ler teklif güncelleyebilir
CREATE POLICY "Admins can update offers"
ON offers
FOR UPDATE
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- 4. Admin'ler teklif silebilir (opsiyonel - gerekirse açın)
-- CREATE POLICY "Admins can delete offers"
-- ON offers
-- FOR DELETE
-- TO authenticated
-- USING (is_admin_user());
