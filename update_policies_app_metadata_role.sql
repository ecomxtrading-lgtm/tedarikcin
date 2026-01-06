-- Policy'leri app_metadata.role kontrolü yapacak şekilde güncelle
-- Bu dosya mevcut policy'leri günceller, yeni policy oluşturmaz

-- ADIM 1: offers tablosu policy'lerini güncelle

-- offers_insert_admin_or_customer policy'sini güncelle
DROP POLICY IF EXISTS "offers_insert_admin_or_customer" ON offers;
CREATE POLICY "offers_insert_admin_or_customer"
ON offers
FOR INSERT
TO authenticated
WITH CHECK (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') 
  OR (customer_id = auth.uid())
);

-- offers_select_admin_or_customer policy'sini güncelle
DROP POLICY IF EXISTS "offers_select_admin_or_customer" ON offers;
CREATE POLICY "offers_select_admin_or_customer"
ON offers
FOR SELECT
TO authenticated
USING (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') 
  OR (customer_id = auth.uid())
);

-- offers_update_admin_or_customer policy'sini güncelle
DROP POLICY IF EXISTS "offers_update_admin_or_customer" ON offers;
CREATE POLICY "offers_update_admin_or_customer"
ON offers
FOR UPDATE
TO authenticated
USING (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') 
  OR (customer_id = auth.uid())
)
WITH CHECK (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') 
  OR (customer_id = auth.uid())
);

-- ADIM 2: products tablosu policy'lerini güncelle

-- products_insert_admin_or_customer policy'sini güncelle
DROP POLICY IF EXISTS "products_insert_admin_or_customer" ON products;
CREATE POLICY "products_insert_admin_or_customer"
ON products
FOR INSERT
TO authenticated
WITH CHECK (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') 
  OR (customer_id = auth.uid())
);

-- products_select_admin_or_customer policy'sini güncelle
DROP POLICY IF EXISTS "products_select_admin_or_customer" ON products;
CREATE POLICY "products_select_admin_or_customer"
ON products
FOR SELECT
TO authenticated
USING (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') 
  OR (customer_id = auth.uid())
);

-- products_update_admin_or_customer policy'sini güncelle
DROP POLICY IF EXISTS "products_update_admin_or_customer" ON products;
CREATE POLICY "products_update_admin_or_customer"
ON products
FOR UPDATE
TO authenticated
USING (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') 
  OR (customer_id = auth.uid())
)
WITH CHECK (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') 
  OR (customer_id = auth.uid())
);

-- ADIM 3: Güncelleme sonucunu kontrol et
SELECT 
  tablename,
  policyname,
  cmd as command,
  'Policy güncellendi' as status
FROM pg_policies
WHERE tablename IN ('offers', 'products')
  AND policyname LIKE '%admin_or_customer%'
ORDER BY tablename, cmd;
