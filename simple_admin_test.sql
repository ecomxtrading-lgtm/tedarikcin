-- Basit Admin Test - Gerçek kullanıcı ile test etmek için
-- Bu sorguyu authenticated bir kullanıcı olarak çalıştırın

-- ÖNEMLİ: Bu sorguyu çalıştırmak için:
-- 1. Supabase Dashboard'da bir kullanıcı olarak giriş yapın (huralomer@gmail.com)
-- 2. Veya uygulamadan giriş yapın ve browser console'da şunu çalıştırın:
--    supabase.rpc('test_admin', {})

-- Test için basit sorgu
SELECT 
  auth.uid() as user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as email,
  is_admin_user() as is_admin;
