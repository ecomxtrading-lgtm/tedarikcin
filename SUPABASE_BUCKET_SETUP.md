# Supabase Storage Bucket Kurulumu

## Sorun
"Bucket not found" hatası alıyorsanız, Supabase Storage'da `files` adında bir bucket oluşturmanız gerekiyor.

## Çözüm Adımları

1. **Supabase Dashboard'a gidin**
   - Projenizin dashboard'una giriş yapın

2. **Storage bölümüne gidin**
   - Sol menüden "Storage" sekmesine tıklayın

3. **Yeni bucket oluşturun**
   - "New bucket" veya "Create bucket" butonuna tıklayın
   - Bucket adı: `files` (tam olarak bu isim)
   - **Public bucket**: ✅ İşaretleyin (önemli!)
   - "Create bucket" butonuna tıklayın

4. **Bucket ayarlarını kontrol edin**
   - Oluşturduğunuz `files` bucket'ına tıklayın
   - "Policies" sekmesine gidin
   - Aşağıdaki RLS politikalarını ekleyin:

### RLS Politikaları (SQL Editor'de çalıştırın):

```sql
-- Storage bucket için RLS politikaları

-- 1. Authenticated kullanıcılar dosya yükleyebilir
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'files');

-- 2. Authenticated kullanıcılar dosya okuyabilir
CREATE POLICY "Authenticated users can read files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'files');

-- 3. Authenticated kullanıcılar kendi dosyalarını güncelleyebilir
CREATE POLICY "Authenticated users can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Authenticated kullanıcılar kendi dosyalarını silebilir
CREATE POLICY "Authenticated users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 5. Public erişim (eğer bucket public ise)
CREATE POLICY "Public can read files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'files');
```

## Notlar

- Bucket adı tam olarak `files` olmalı (büyük/küçük harf duyarlı)
- Bucket'ı public yapmak önemli, aksi halde görseller görünmeyebilir
- RLS politikalarını ekledikten sonra test edin

## Test

Bucket oluşturduktan ve politikaları ekledikten sonra:
1. Dashboard'a gidin
2. Yeni bir ürün ekleyin
3. Görsel yüklemeyi deneyin
4. Hata almamalısınız
