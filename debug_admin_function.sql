-- is_admin_user() fonksiyonunu debug et
-- Bu SQL kodunu authenticated bir kullanıcı olarak çalıştırın
-- (Örneğin, Supabase Dashboard'da bir kullanıcı olarak giriş yapın)

-- 1. Şu anki kullanıcı bilgilerini göster
SELECT 
  auth.uid() as current_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as current_user_email,
  auth.jwt() ->> 'role' as jwt_role,
  auth.jwt() ->> 'email' as jwt_email;

-- 2. is_admin_user() fonksiyonunu test et
SELECT 
  'is_admin_user() test' as test_name,
  is_admin_user() as result,
  CASE 
    WHEN is_admin_user() = true THEN '✅ Admin olarak tanındı'
    WHEN is_admin_user() = false THEN '❌ Admin olarak tanınmadı'
    ELSE '⚠️ NULL döndü'
  END as status;

-- 3. Email kontrolünü manuel test et
SELECT 
  'Email kontrolü' as test_name,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as user_email,
  LOWER((SELECT email FROM auth.users WHERE id = auth.uid())) as lower_email,
  LOWER((SELECT email FROM auth.users WHERE id = auth.uid())) IN ('huralomer@gmail.com') as email_match;

-- 4. JWT role kontrolünü test et
SELECT 
  'JWT role kontrolü' as test_name,
  auth.jwt() ->> 'role' as jwt_role,
  (auth.jwt() ->> 'role') = 'admin' as role_match;
