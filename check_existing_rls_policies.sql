-- Mevcut RLS Policy'lerini Kontrol Et
-- Bu SQL kodunu önce çalıştırın ve sonuçları kontrol edin

-- 1. Offers tablosundaki mevcut policy'leri listele
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'offers'
ORDER BY policyname;

-- 2. Mevcut policy'lerin detaylarını göster
SELECT 
  p.policyname,
  p.cmd as command,
  p.roles,
  p.qual as using_expression,
  p.with_check as with_check_expression
FROM pg_policies p
WHERE p.tablename = 'offers'
ORDER BY p.policyname;

-- 3. is_admin_user fonksiyonunun var olup olmadığını kontrol et
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'is_admin_user';
