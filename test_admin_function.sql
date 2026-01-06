-- is_admin_user() fonksiyonunu test et
-- Bu SQL kodunu Supabase SQL Editor'de çalıştırın

-- 1. Fonksiyonun var olup olmadığını kontrol et
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'is_admin_user';

-- 2. Fonksiyonun tanımını göster
SELECT 
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'is_admin_user';

-- 3. Şu anki kullanıcının admin olup olmadığını test et
-- (Bu sorguyu authenticated bir kullanıcı olarak çalıştırmanız gerekiyor)
SELECT 
  auth.uid() as current_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as current_user_email,
  is_admin_user() as is_admin;

-- 4. JWT'deki role claim'ini kontrol et
SELECT 
  auth.uid() as user_id,
  auth.jwt() ->> 'role' as jwt_role,
  auth.jwt() ->> 'email' as jwt_email,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as db_email;

-- 5. Admin email listesini kontrol et (fonksiyon içindeki)
-- Bu sorgu fonksiyonun içindeki email'leri gösteremez, ama test için:
SELECT 
  'huralomer@gmail.com' as expected_admin_email,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as current_user_email,
  CASE 
    WHEN (SELECT email FROM auth.users WHERE id = auth.uid()) = 'huralomer@gmail.com' 
    THEN 'Email eşleşiyor' 
    ELSE 'Email eşleşmiyor' 
  END as email_match;
