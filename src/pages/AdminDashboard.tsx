import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Eye, Hash, Calendar, Package, Save, Image, Loader2, RefreshCw, Upload, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { isAdminEmail } from "@/lib/isAdmin";

type ProductDetail = {
  id: string;
  name: string;
  explanation: string;
  count: number;
  imageUrls: string[];
  product_width: number | null;
  product_length: number | null;
  product_height: number | null;
  product_weight: number | null;
  product_package: string | null;
  box_width: number | null;
  box_length: number | null;
  box_height: number | null;
  box_weight: number | null;
  box_volumetric_weight: number | null;
  box_units: number | null;
  box_count: number | null;
  extra_notes: string | null;
  unit_price: number | null;
  currency: string | null;
  "pick-up_fee": number | null;
};

type AdminOffer = {
  id: string;
  ownerId?: string;
  status: string;
  createdAt: Date;
  ownerName?: string | null;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  products: ProductDetail[];
};

type Customer = {
  userId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  createdAt?: Date | null;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<AdminOffer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<{ [productId: string]: boolean }>({});
  const [updatingOffer, setUpdatingOffer] = useState<{ [offerId: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<"offers" | "customers">("offers");

  // Admin UI state: filters / searches / status drafts
  const [offerFilter, setOfferFilter] = useState<"all" | "gelen" | "bekleyen" | "gonderilen" | "tamamlanan">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [offerSearch, setOfferSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  // Temporary status selection per offer (not yet saved)
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});
  const [statusSaving, setStatusSaving] = useState<Record<string, boolean>>({});

  // Create offer dialog state
  const [isCreateOfferOpen, setIsCreateOfferOpen] = useState(false);
  const [createOfferCustomer, setCreateOfferCustomer] = useState<Customer | null>(null);
  const [customerProductsCache, setCustomerProductsCache] = useState<Record<string, any[]>>({});
  const [newOfferProducts, setNewOfferProducts] = useState<Array<any>>([]);
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  // Yeni ürün oluşturma için state'ler
  const [productImageFiles, setProductImageFiles] = useState<Record<number, File[]>>({});
  const [productImageUrls, setProductImageUrls] = useState<Record<number, string[]>>({});
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const toggleExpand = (offerId: string) => {
    const next = new Set(expanded);
    if (next.has(offerId)) next.delete(offerId);
    else next.add(offerId);
    setExpanded(next);
  };

  const fetchOffers = async () => {
    const { data, error } = await supabase
      .from("offers")
      .select(
        `
        id,
        customer_id,
        owner_name,
        owner_email,
        owner_phone,
        status,
        created_at,
        products (
          id,
          name,
          explanation,
          count,
          product_width,
          product_length,
          product_height,
          product_weight,
          product_package,
          box_width,
          box_length,
          box_height,
          box_weight,
          box_volumetric_weight,
          box_units,
          box_count,
          extra_notes,
          unit_price,
          currency,
          "pick-up_fee"
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Teklifler alınamadı.");
      return;
    }

    const customerIds = Array.from(
      new Set((data || []).map((o: any) => o.customer_id).filter(Boolean))
    );

    let customerMap: Record<string, { name?: string | null; email?: string | null; phone?: string | null }> =
      {};
    if (customerIds.length > 0) {
      const { data: customersData } = await supabase
        .from("customers")
        .select("id, name, email, phone")
        .in("id", customerIds);
      customerMap = (customersData || []).reduce((acc: any, c: any) => {
        acc[c.id] = { name: c.name, email: c.email, phone: c.phone };
        return acc;
      }, {});
    }

    const mapped: AdminOffer[] =
      data?.map((offer: any) => {
        const customer = customerMap[offer.customer_id] || {};
        return {
          id: offer.id,
          ownerId: offer.customer_id,
          status: offer.status || "draft",
          createdAt: offer.created_at ? new Date(offer.created_at) : new Date(),
          ownerName: offer.owner_name || customer.name || null,
          ownerEmail: offer.owner_email || customer.email || null,
          ownerPhone: offer.owner_phone || customer.phone || null,
          products:
            offer.products?.map((p: any) => ({
              id: p.id,
              name: p.name || "",
              explanation: p.explanation || "",
              count: p.count || 0,
              imageUrls: (p.product_images || [])
                .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((img: any) => img.url),
              product_width: p.product_width,
              product_length: p.product_length,
              product_height: p.product_height,
              product_weight: p.product_weight,
              product_package: p.product_package,
              box_width: p.box_width,
              box_length: p.box_length,
              box_height: p.box_height,
              box_weight: p.box_weight,
              box_volumetric_weight: p.box_volumetric_weight,
              box_units: p.box_units,
              box_count: p.box_count,
              extra_notes: p.extra_notes,
              unit_price: p.unit_price,
              currency: p.currency || "TRY",
              "pick-up_fee": p["pick-up_fee"],
            })) || [],
        };
      }) || [];

    // Product images'ı ayrı sorguda al
    const productIds = (data || []).flatMap(o => o.products?.map((p: any) => p.id) || []);
    const productImagesMap: Record<string, any[]> = {};
    if (productIds.length > 0) {
      const { data: imagesData } = await supabase
        .from("product_images")
        .select("product_id, url, sort_order")
        .in("product_id", productIds);
      (imagesData || []).forEach((img: any) => {
        if (!productImagesMap[img.product_id]) productImagesMap[img.product_id] = [];
        productImagesMap[img.product_id].push(img);
      });
    }

    // Görseller için imzalı URL üret
    const resolvedOffers: AdminOffer[] = [];
    for (const offer of mapped) {
      const resolvedProducts: ProductDetail[] = [];
      for (const product of offer.products) {
        const images = (productImagesMap[product.id] || [])
          .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
        
        const resolvedUrls: string[] = [];
        for (const img of images) {
          const url = img.url;
          if (url.startsWith("http")) {
            resolvedUrls.push(url);
          } else {
            const { data: signed, error: signedError } = await supabase.storage
              .from("product-images")
              .createSignedUrl(url, 60 * 60 * 24 * 7); // 7 gün
            if (!signedError && signed?.signedUrl) {
              resolvedUrls.push(signed.signedUrl);
            }
          }
        }
        resolvedProducts.push({ ...product, imageUrls: resolvedUrls });
      }
      resolvedOffers.push({ ...offer, products: resolvedProducts });
    }

    setOffers(resolvedOffers);
  };

  useEffect(() => {
    const guard = async () => {
      const { data } = await supabase.auth.getUser();
      const userEmail = data?.user?.email;
      if (!data?.user) {
        navigate("/login");
        return;
      }
      
      // Debug: Admin kontrolü öncesi bilgi
      if (import.meta.env.MODE === "production") {
        console.log("🔍 Admin kontrolü:", {
          userEmail,
          adminCheckResult: isAdminEmail(userEmail),
        });
      }
      
      if (!isAdminEmail(userEmail)) {
        if (import.meta.env.MODE === "production") {
          console.warn("⚠️ Admin değil, dashboard'a yönlendiriliyor");
        }
        navigate("/dashboard");
        return;
      }
      
      if (import.meta.env.MODE === "production") {
        console.log("✅ Admin doğrulandı, veriler yükleniyor...");
      }
      
      await fetchOffers();
      await fetchCustomers();
    };
    void guard();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "customers") {
      void fetchCustomers();
    }
  }, [activeTab]);

  const parseNum = (val: string) => {
    if (val === "" || val === null || val === undefined) return null;
    const num = Number(val);
    return Number.isFinite(num) ? num : null;
  };

  const updateProductField = (
    offerId: string,
    productId: string,
    field: keyof ProductDetail,
    value: any
  ) => {
    setOffers((prev) =>
      prev.map((offer) =>
        offer.id !== offerId
          ? offer
          : {
              ...offer,
              products: offer.products.map((p) =>
                p.id !== productId ? p : { ...p, [field]: value }
              ),
            }
      )
    );
  };

  // Filtered offers according to filter & search
  const filteredOffers = offers.filter((o) => {
    // filter by statusFilter (yeni dropdown filtre)
    if (statusFilter !== "all") {
      const offerStatus = (o.status || "").toLowerCase().trim();
      const filterStatus = statusFilter.toLowerCase().trim();
      if (offerStatus !== filterStatus) return false;
    }

    // filter by offerFilter (eski sidebar filtre)
    const s = (o.status || "").toLowerCase();
    if (offerFilter === "bekleyen" && !s.includes("bekle")) return false;
    if (offerFilter === "gonderilen" && !s.includes("gonder")) return false;
    if (offerFilter === "tamamlanan" && !s.includes("tamam")) return false;
    // else "gelen" or "all" -> show all

    // search by owner name or email
    if (offerSearch.trim() !== "") {
      const q = offerSearch.trim().toLowerCase();
      const name = (o.ownerName || "").toLowerCase();
      const email = (o.ownerEmail || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    }

    return true;
  });

  // Tüm mevcut status değerlerini topla (dinamik)
  const allStatuses = Array.from(
    new Set(offers.map((o) => o.status || "draft").filter(Boolean))
  ).sort();

  const handleStatusSelect = (offerId: string, value: string) => {
    setStatusDrafts((d) => ({ ...d, [offerId]: value }));
  };

  const handleSaveOfferStatus = async (offerId: string) => {
    const newStatus = statusDrafts[offerId];
    if (!newStatus) return;
    setStatusSaving((s) => ({ ...s, [offerId]: true }));
    try {
      const { error } = await supabase.from("offers").update({ status: newStatus }).eq("id", offerId);
      if (error) throw error;
      toast.success("Teklif durumu güncellendi.");
      // refresh
      await fetchOffers();
      setStatusDrafts((d) => {
        const next = { ...d };
        delete next[offerId];
        return next;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Durum güncellenemedi.";
      toast.error(message);
    } finally {
      setStatusSaving((s) => ({ ...s, [offerId]: false }));
    }
  };

  // Customers & create-offer helpers
  const openCreateOfferForCustomer = async (c: Customer) => {
    setCreateOfferCustomer(c);
    setIsCreateOfferOpen(true);
    // show one blank product row by default (yeni ürün modu)
    setNewOfferProducts([{ 
      productId: undefined, 
      isNewProduct: true,
      count: 250,
      name: "",
      explanation: "",
    }]);
    // Görsel state'lerini temizle
    setProductImageFiles({});
    setProductImageUrls({});

    // always fetch latest products for this customer (refresh)
    try {
      // fetch all columns for products including their images
      const { data, error } = await supabase
        .from("products")
        .select(`*, product_images ( url, sort_order )`)
        .eq("customer_id", c.userId);
      if (error) {
        console.error("Müşteri ürünleri yüklenirken hata:", error);
        toast.error("Müşteri ürünleri yüklenemedi.");
        setCustomerProductsCache((m) => ({ ...m, [c.userId]: [] }));
        return;
      }

      // resolve image URLs (sign storage urls when necessary)
      const resolved: any[] = [];
      for (const prod of (data || [])) {
        const imgs = (prod.product_images || []) as any[];
        const resolvedUrls: string[] = [];
        for (const img of imgs.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))) {
          const url = img?.url;
          if (!url) continue;
          if (String(url).startsWith("http")) {
            resolvedUrls.push(url);
          } else {
            try {
              const { data: signed, error: signedError } = await supabase.storage
                .from("product-images")
                .createSignedUrl(url, 60 * 60 * 24 * 7);
              if (!signedError && signed?.signedUrl) resolvedUrls.push(signed.signedUrl);
            } catch (err) {
              console.error("Signed url alırken hata:", err);
            }
          }
        }
        resolved.push({ ...prod, imageUrls: resolvedUrls });
      }

      setCustomerProductsCache((m) => ({ ...m, [c.userId]: resolved || [] }));
    } catch (err) {
      console.error("Müşteri ürünleri yüklenirken beklenmeyen hata:", err);
      toast.error("Müşteri ürünleri yüklenemedi.");
      setCustomerProductsCache((m) => ({ ...m, [c.userId]: [] }));
    }
  };

  const addBlankNewProduct = () => {
    try {
      setNewOfferProducts((p) => [...p, { 
        productId: undefined, 
        isNewProduct: true,
        count: 250,
        name: "",
        explanation: "",
      }]);
      // Yeni ürün için boş görsel dizileri oluştur
      const newIndex = newOfferProducts.length;
      setProductImageFiles((prev) => ({ ...prev, [newIndex]: [] }));
      setProductImageUrls((prev) => ({ ...prev, [newIndex]: [] }));
    } catch (err) {
      toast.error("Yeni ürün eklenemedi.");
    }
  };

  // show/hide product details per product-row
  const [productDetailsVisible, setProductDetailsVisible] = useState<Record<number, boolean>>({});
  const toggleProductDetails = (index: number) => {
    setProductDetailsVisible((p) => ({ ...p, [index]: !p[index] }));
  };

  const selectExistingProductForNewOffer = (index: number, productId: string) => {
    const products = customerProductsCache[createOfferCustomer?.userId || ""] || [];
    const prod = products.find((x: any) => x.id === productId) || null;
    if (!prod) return;
    
    setNewOfferProducts((prev) =>
      prev.map((p, i) => 
        i === index 
          ? { 
              ...prod, 
              productId: productId, 
              isNewProduct: false,
              count: p.count || prod?.count || 250,
              // Mevcut ürün bilgilerini koru, eksik olanları ürün verisinden al
              name: prod?.name || "",
              explanation: prod?.explanation || "",
              // Görselleri de ekle
              imageUrls: prod?.imageUrls || [],
              product_images: prod?.product_images || [],
            } 
          : p
      )
    );
    // Mevcut ürün seçildiğinde görsel state'lerini temizle (çünkü ürünün kendi görselleri var)
    setProductImageFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });
    setProductImageUrls((prev) => {
      const newUrls = { ...prev };
      delete newUrls[index];
      return newUrls;
    });
  };

  const updateNewOfferProductField = (index: number, field: string, value: any) => {
    setNewOfferProducts((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const fetchAndPopulateProductDetails = async (index: number, productId?: string) => {
    if (!productId) {
      toast.error("Lütfen önce bir ürün seçin.");
      return;
    }

    // try using cached product first
    const cached = (customerProductsCache[createOfferCustomer?.userId || ""] || []).find((x: any) => x.id === productId);
    if (cached) {
      setNewOfferProducts((prev) => prev.map((p, i) => (i === index ? { ...p, ...cached } : p)));
      setProductDetailsVisible((d) => ({ ...d, [index]: true }));
      toast.success("Ürün bilgileri yüklendi (önbellekten).");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .select(`*, product_images ( url, sort_order )`)
        .eq("id", productId)
        .single();
      if (error || !data) {
        throw error || new Error("Ürün bulunamadı.");
      }

      // resolve images
      const imgs = (data.product_images || []) as any[];
      const resolvedUrls: string[] = [];
      for (const img of imgs.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))) {
        const url = img?.url;
        if (!url) continue;
        if (String(url).startsWith("http")) {
          resolvedUrls.push(url);
        } else {
          try {
              const { data: signed, error: signedError } = await supabase.storage
                .from("files")
                .createSignedUrl(url, 60 * 60 * 24 * 7);
            if (!signedError && signed?.signedUrl) resolvedUrls.push(signed.signedUrl);
          } catch (err) {
            console.error("Signed url alırken hata:", err);
          }
        }
      }

      const merged = { ...data, imageUrls: resolvedUrls };
      // update row and cache
      setNewOfferProducts((prev) => prev.map((p, i) => (i === index ? { ...p, ...merged } : p)));
      setCustomerProductsCache((m) => ({ ...m, [createOfferCustomer?.userId || ""]: [...(m[createOfferCustomer?.userId || ""] || []), merged] }));
      setProductDetailsVisible((d) => ({ ...d, [index]: true }));
      toast.success("Ürün bilgileri yüklendi.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ürün bilgileri alınamadı.";
      toast.error(message);
    }
  };

  const removeNewOfferProduct = (index: number) => {
    setNewOfferProducts((p) => p.filter((_, i) => i !== index));
  };

  const submitNewOfferForCustomer = async () => {
    if (!createOfferCustomer) return;
    if (newOfferProducts.length === 0) {
      toast.error("Lütfen en az bir ürün ekleyin.");
      return;
    }

    // Yeni ürünler için validasyon
    const newProducts = newOfferProducts.filter((p) => !p.productId || p.isNewProduct);
    for (const p of newProducts) {
      if (!p.name || p.name.trim() === "") {
        toast.error("Lütfen tüm yeni ürünler için ürün adı girin.");
        return;
      }
    }

    setIsCreatingOffer(true);
    try {
      // Önce teklifi oluştur
      const { data: offerData, error: offerError } = await supabase
        .from("offers")
        .insert({
          customer_id: createOfferCustomer.userId,
          created_by: createOfferCustomer.userId,
          owner_name: createOfferCustomer.name,
          owner_email: createOfferCustomer.email,
          owner_phone: createOfferCustomer.phone,
          title: "Yeni Teklif",
          status: "hazır",
          currency: "Usd",
        })
        .select()
        .single();

      if (offerError || !offerData) throw offerError || new Error("Teklif oluşturulamadı");

      // Her ürün için işlem yap
      for (let idx = 0; idx < newOfferProducts.length; idx++) {
        const p = newOfferProducts[idx];
        
        if (!p.productId || p.isNewProduct) {
          // YENİ ÜRÜN: products tablosuna ekle
          const productData: any = {
            customer_id: createOfferCustomer.userId,
            offer_id: offerData.id,
            name: p.name || "",
            explanation: p.explanation || "",
            count: p.count || 250,
            product_width: p.product_width ? parseFloat(String(p.product_width)) : null,
            product_length: p.product_length ? parseFloat(String(p.product_length)) : null,
            product_height: p.product_height ? parseFloat(String(p.product_height)) : null,
            product_weight: p.product_weight ? parseFloat(String(p.product_weight)) : null,
            product_package: p.product_package || null,
            box_width: p.box_width ? parseFloat(String(p.box_width)) : null,
            box_length: p.box_length ? parseFloat(String(p.box_length)) : null,
            box_height: p.box_height ? parseFloat(String(p.box_height)) : null,
            box_weight: p.box_weight ? parseFloat(String(p.box_weight)) : null,
            box_volumetric_weight: p.box_volumetric_weight ? parseFloat(String(p.box_volumetric_weight)) : null,
            box_units: p.box_units ? Number(p.box_units) : null,
            box_count: p.box_count ? Number(p.box_count) : null,
            extra_notes: p.extra_notes || null,
            unit_price: p.unit_price ? parseFloat(String(p.unit_price)) : null,
            currency: "Usd",
            "pick-up_fee": null,
          };

          const { data: newProduct, error: insertErr } = await supabase
            .from("products")
            .insert(productData)
            .select()
            .single();

          if (insertErr || !newProduct) throw insertErr || new Error("Ürün oluşturulamadı");

          // Görselleri yükle (yeni ürün için)
          const imageFiles = productImageFiles[idx] || [];
          if (imageFiles.length > 0) {
            for (let imgIdx = 0; imgIdx < imageFiles.length; imgIdx++) {
              const file = imageFiles[imgIdx];
              const fileExt = file.name.split(".").pop();
              const fileName = `${newProduct.id}_${imgIdx}_${Date.now()}.${fileExt}`;
              const filePath = `${createOfferCustomer.userId}/${fileName}`;

              const { error: uploadErr } = await supabase.storage
                .from("product-images")
                .upload(filePath, file);

              if (uploadErr) {
                console.error("Görsel yüklenirken hata:", uploadErr);
                continue;
              }

              // product_images tablosuna ekle
              await supabase.from("product_images").insert({
                product_id: newProduct.id,
                url: filePath,
                sort_order: imgIdx,
              });
            }
          }
        } else {
          // MEVCUT ÜRÜN: Sadece offer_id'yi güncelle
          const updateBody: any = {
            offer_id: offerData.id,
            count: p.count || 250,
            product_width: p.product_width ? parseFloat(String(p.product_width)) : null,
            product_length: p.product_length ? parseFloat(String(p.product_length)) : null,
            product_height: p.product_height ? parseFloat(String(p.product_height)) : null,
            product_weight: p.product_weight ? parseFloat(String(p.product_weight)) : null,
            product_package: p.product_package || null,
            box_width: p.box_width ? parseFloat(String(p.box_width)) : null,
            box_length: p.box_length ? parseFloat(String(p.box_length)) : null,
            box_height: p.box_height ? parseFloat(String(p.box_height)) : null,
            box_weight: p.box_weight ? parseFloat(String(p.box_weight)) : null,
            box_volumetric_weight: p.box_volumetric_weight ? parseFloat(String(p.box_volumetric_weight)) : null,
            box_units: p.box_units ? Number(p.box_units) : null,
            box_count: p.box_count ? Number(p.box_count) : null,
            extra_notes: p.extra_notes || null,
            unit_price: p.unit_price ? parseFloat(String(p.unit_price)) : null,
          };

          const { error: prodErr } = await supabase
            .from("products")
            .update(updateBody)
            .eq("id", p.productId);
          
          if (prodErr) throw prodErr;
        }
      }

      toast.success("Yeni teklif oluşturuldu ve ürünler eklendi.");
      setIsCreateOfferOpen(false);
      setNewOfferProducts([]);
      setProductImageFiles({});
      setProductImageUrls({});
      await fetchOffers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Teklif oluşturulamadı.";
      toast.error(message);
    } finally {
      setIsCreatingOffer(false);
    }
  };

  const handleSaveProduct = async (offerId: string, product: ProductDetail) => {
    setSaving((s) => ({ ...s, [product.id]: true }));
    try {
      const { error } = await supabase
        .from("products")
        .update({
          product_width: parseNum(String(product.product_width ?? "")),
          product_length: parseNum(String(product.product_length ?? "")),
          product_height: parseNum(String(product.product_height ?? "")),
          product_weight: parseNum(String(product.product_weight ?? "")),
          product_package: product.product_package,
          box_width: parseNum(String(product.box_width ?? "")),
          box_length: parseNum(String(product.box_length ?? "")),
          box_height: parseNum(String(product.box_height ?? "")),
          box_weight: parseNum(String(product.box_weight ?? "")),
          box_volumetric_weight: parseNum(String(product.box_volumetric_weight ?? "")),
          box_units: parseNum(String(product.box_units ?? "")),
          box_count: parseNum(String(product.box_count ?? "")),
          extra_notes: product.extra_notes,
          unit_price: parseNum(String(product.unit_price ?? "")),
          currency: product.currency || "Usd",
        })
        .eq("id", product.id);

      if (error) throw error;

      toast.success("Ürün bilgileri güncellendi.");
      // refresh offer
      void fetchOffers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Güncelleme başarısız.";
      toast.error(message);
    } finally {
      setSaving((s) => ({ ...s, [product.id]: false }));
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, email, phone, created_at")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Müşteriler alınırken hata:", error);
        toast.error(`Müşteriler alınamadı: ${error.message}`);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log("Müşteri bulunamadı");
        setCustomers([]);
        return;
      }
      
      const mapped: Customer[] = data.map((c: any) => ({
        userId: c.id,
        name: c.name || null,
        email: c.email || null,
        phone: c.phone || null,
        createdAt: c.created_at ? new Date(c.created_at) : null,
      }));
      
      setCustomers(mapped);
      console.log(`${mapped.length} müşteri yüklendi`);
    } catch (err) {
      console.error("Müşteriler alınırken beklenmeyen hata:", err);
      toast.error("Müşteriler alınırken bir hata oluştu.");
    }
  };

  const handleUpdateStatus = async (offerId: string, status: string) => {
    setUpdatingOffer((s) => ({ ...s, [offerId]: true }));
    try {
      const { error } = await supabase.from("offers").update({ status }).eq("id", offerId);
      if (error) throw error;
      toast.success("Teklif durumu güncellendi.");
      void fetchOffers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Durum güncellenemedi.";
      toast.error(message);
    } finally {
      setUpdatingOffer((s) => ({ ...s, [offerId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-brand-dark text-white flex-col border-r border-brand-charcoal/30">
        <div className="p-6 border-b border-brand-charcoal/30">
          <div className="text-xl font-heading font-bold">Admin Panel</div>
          <p className="text-sm text-white/70">Yönetim</p>
        </div>
        <nav className="p-4 space-y-2">
          <div className="text-sm font-semibold text-white/90 px-2">Teklifler</div>
          <div className="space-y-2 px-1">
            <button
              onClick={() => { setActiveTab("offers"); setOfferFilter("all"); }}
              className={`block w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "offers" && offerFilter === "all" ? "bg-white/10 text-white" : "text-black hover:text-white hover:bg-white/10"
              }`}
            >
              Gelen Teklifler
            </button>

            <button
              onClick={() => { setActiveTab("offers"); setOfferFilter("bekleyen"); }}
              className={`block w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "offers" && offerFilter === "bekleyen" ? "bg-white/10 text-white" : "text-black hover:text-white hover:bg-white/10"
              }`}
            >
              Bekleyen Teklifler
            </button>

            <button
              onClick={() => { setActiveTab("offers"); setOfferFilter("gonderilen"); }}
              className={`block w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "offers" && offerFilter === "gonderilen" ? "bg-white/10 text-white" : "text-black hover:text-white hover:bg-white/10"
              }`}
            >
              Gönderilen Teklifler
            </button>

            <button
              onClick={() => { setActiveTab("offers"); setOfferFilter("tamamlanan"); }}
              className={`block w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "offers" && offerFilter === "tamamlanan" ? "bg-white/10 text-white" : "text-black hover:text-white hover:bg-white/10"
              }`}
            >
              Tamamlanan Teklifler
            </button>
          </div>

          <div className="mt-4">
            <button
              onClick={() => setActiveTab("customers")}
              className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "customers" ? "bg-white/10 text-white" : "text-black hover:text-white hover:bg-white/10"
              }`}
            >
              Müşteriler
            </button>
            <Link
              to="/dashboard"
              className="block px-4 py-3 rounded-lg text-black hover:text-white hover:bg-white/10 mt-2 transition-colors"
            >
              Kullanıcı Dashboard
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1">
        <div className="container mx-auto px-4 py-10 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-heading font-bold">Admin Dashboard</h1>
            <Link to="/dashboard" className="text-sm text-brand-primary hover:text-brand-cta">
              Kullanıcı Dashboard&apos;u
            </Link>
          </div>

          {activeTab === "offers" ? (
            <div className="space-y-4">
              {/* Search & filter */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-2 w-full md:w-1/2">
                  <Input
                    placeholder="İsim veya e-posta ile ara..."
                    value={offerSearch}
                    onChange={(e) => setOfferSearch(e.target.value)}
                  />
                  <Button size="sm" variant="outline" onClick={() => { setOfferSearch(""); void fetchOffers(); }}>
                    Yenile
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  {/* Status Filtre Dropdown */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="status-filter" className="text-sm text-muted-foreground whitespace-nowrap">
                      Status:
                    </Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger id="status-filter" className="w-[180px]">
                        <SelectValue placeholder="Tümü" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tümü</SelectItem>
                        {allStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Eski sidebar filtre gösterimi */}
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">Kategori: </div>
                    <div className="text-sm">
                      <span className="font-semibold">{offerFilter === "all" ? "Gelen" : offerFilter === "bekleyen" ? "Bekleyen" : offerFilter === "gonderilen" ? "Gönderilen" : "Tamamlanan"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {filteredOffers.map((offer) => (
                <Card key={offer.id} className="border border-border shadow-sm">
                  <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 text-brand-lime">
                        <Hash className="w-5 h-5" />
                        <span className="font-heading font-bold text-lg">Teklif #{offer.id.slice(0, 8)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {offer.createdAt.toLocaleDateString("tr-TR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center md:gap-4 text-muted-foreground">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Package className="w-4 h-4" />
                          <span className="text-sm">{offer.products.length} ürün</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div className="font-semibold">{offer.ownerName || "-"}</div>
                          <div className="text-xs">{offer.ownerEmail || "-"}</div>
                        </div>
                      </div>
                      <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                        {statusDrafts[offer.id] ?? offer.status ?? "Beklemede"}
                      </div>
                    </CardTitle>
                    <Button
                      variant={expanded.has(offer.id) ? "secondary" : "outline"}
                      className="gap-2"
                      onClick={() => toggleExpand(offer.id)}
                    >
                      <Eye className="w-4 h-4" />
                      Ürünleri Gör
                    </Button>
                    {/* Status select + save */}
                    <div className="flex items-center gap-2">
                      <div className="w-44">
                        <Select
                          value={statusDrafts[offer.id] ?? offer.status}
                          onValueChange={(val: string) => handleStatusSelect(offer.id, val)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hazırlanıyor">Hazırlanıyor</SelectItem>
                            <SelectItem value="hazır">Hazır</SelectItem>
                            <SelectItem value="iptal edildi">İptal Edildi</SelectItem>
                            <SelectItem value="beklemede">Beklemede</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        size="sm"
                        disabled={(statusDrafts[offer.id] ?? offer.status) === offer.status || !!statusSaving[offer.id]}
                        onClick={() => handleSaveOfferStatus(offer.id)}
                      >
                        {statusSaving[offer.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Kaydet
                      </Button>
                    </div>
                  </CardHeader>

                  {expanded.has(offer.id) && (
                    <CardContent className="space-y-6">
                      <div className="grid sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <p className="font-semibold text-foreground">Kullanıcı Adı</p>
                          <p>{offer.ownerName || "-"}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">E-posta</p>
                          <p>{offer.ownerEmail || "-"}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Telefon</p>
                          <p>{offer.ownerPhone || "-"}</p>
                        </div>
                      </div>
                      {/* Special message when status is preparing */}
                    { (statusDrafts[offer.id] ?? offer.status)?.toLowerCase().trim() === "teklif hazırlanıyor" && (
                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                          Uzmanlarımız şu an sizin için en iyi seçenekleri araştırıyor. Sizin için en uygun
                          teklifler 3 iş günü içinde hazırlanacaktır. Bu süreçte iletişim WhatsApp veya mail
                          yoluyla bize ulaşabilirsiniz.
                        </div>
                      )}
                      {/* Products UI (unchanged layout) */}
              {offer.products.map((product) => (
                        <div key={product.id} className="border border-border rounded-xl p-4 space-y-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                              <p className="font-heading font-semibold text-lg">{product.name || "Ürün"}</p>
                              <p className="text-muted-foreground text-sm">{product.explanation}</p>
                            </div>
                            <Button
                              size="sm"
                              disabled={!!saving[product.id]}
                              onClick={() => handleSaveProduct(offer.id, product)}
                              className="gap-2"
                            >
                              <Save className="w-4 h-4" />
                              {saving[product.id] ? "Kaydediliyor..." : "Kaydet"}
                            </Button>
                          </div>

                          {/* Images */}
                          {product.imageUrls?.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                              {product.imageUrls.map((url, idx) => (
                                <div key={idx} className="relative aspect-square border border-border rounded-lg overflow-hidden bg-muted">
                                  <img
                                    src={url}
                                    alt={`Ürün görseli ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.35em' fill='%23999' font-size='12'%3EGörsel Yok%3C/text%3E%3C/svg%3E";
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <Label>Ürün En</Label>
                              <Input
                                value={product.product_width ?? ""}
                                onChange={(e) =>
                                  updateProductField(offer.id, product.id, "product_width", e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Ürün Boy</Label>
                              <Input
                                value={product.product_length ?? ""}
                                onChange={(e) =>
                                  updateProductField(offer.id, product.id, "product_length", e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Ürün Yükseklik</Label>
                              <Input
                                value={product.product_height ?? ""}
                                onChange={(e) =>
                                  updateProductField(offer.id, product.id, "product_height", e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Ürün Ağırlık</Label>
                              <Input
                                value={product.product_weight ?? ""}
                                onChange={(e) =>
                                  updateProductField(offer.id, product.id, "product_weight", e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Ürün Paket</Label>
                              <Input
                                value={product.product_package ?? ""}
                                onChange={(e) =>
                                  updateProductField(offer.id, product.id, "product_package", e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Ürün Adedi</Label>
                              <Input
                                value={product.count ?? ""}
                                onChange={(e) =>
                                  updateProductField(offer.id, product.id, "count", Number(e.target.value) || 0)
                                }
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <Label>Kutu En</Label>
                              <Input
                                value={product.box_width ?? ""}
                                onChange={(e) =>
                                  updateProductField(offer.id, product.id, "box_width", e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Kutu Boy</Label>
                              <Input
                                value={product.box_length ?? ""}
                                onChange={(e) =>
                                  updateProductField(offer.id, product.id, "box_length", e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Kutu Yükseklik</Label>
                              <Input
                                value={product.box_height ?? ""}
                                onChange={(e) =>
                                  updateProductField(offer.id, product.id, "box_height", e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Kutu Ağırlık</Label>
                              <Input
                                value={product.box_weight ?? ""}
                                onChange={(e) =>
                                  updateProductField(offer.id, product.id, "box_weight", e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Hacimsel Ağırlık</Label>
                              <Input
                                value={product.box_volumetric_weight ?? ""}
                                onChange={(e) =>
                                  updateProductField(
                                    offer.id,
                                    product.id,
                                    "box_volumetric_weight",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Kutudaki Ürün Adedi</Label>
                              <Input
                                value={product.box_units ?? ""}
                                onChange={(e) =>
                                  updateProductField(offer.id, product.id, "box_units", e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Kutu Sayısı</Label>
                              <Input
                                value={product.box_count ?? ""}
                                onChange={(e) =>
                                  updateProductField(offer.id, product.id, "box_count", e.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label>Ürün Fiyatı</Label>
                              <Input
                                value={product.unit_price ?? ""}
                                onChange={(e) =>
                                  updateProductField(offer.id, product.id, "unit_price", e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Ek Açıklama</Label>
                              <Textarea
                                value={product.extra_notes ?? ""}
                                onChange={(e) =>
                                  updateProductField(offer.id, product.id, "extra_notes", e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div>
              {customers.length === 0 ? (
                <Card className="border border-border shadow-sm">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground text-lg">Henüz müşteri bulunmuyor.</p>
                    <p className="text-muted-foreground text-sm mt-2">
                      Müşteriler kayıt oldukça burada görünecektir.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-2 w-full md:w-1/2">
                      <Input
                        placeholder="İsim veya e-posta ile ara..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                      />
                      <Button size="sm" variant="outline" onClick={() => { setCustomerSearch(""); void fetchCustomers(); }}>
                        Yenile
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">Toplam {customers.length} müşteri</div>
                  </div>

                  <div className="space-y-3 pt-8">
                    {customers
                      .filter((c) => {
                        if (!customerSearch) return true;
                        const q = customerSearch.toLowerCase();
                        return (c.name || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q);
                      })
                      .map((c) => (
                        <Card key={c.userId} className="border border-border shadow-sm w-full pt-6">
                          <CardContent className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                            <div className="flex-1 min-w-0">
                              <div className="text-lg font-heading text-foreground truncate">{c.name || "İsimsiz"}</div>
                            </div>
                            <div className="flex-1 min-w-0 text-sm text-muted-foreground truncate">{c.email || "-"}</div>
                            <div className="flex-1 min-w-0 text-sm text-muted-foreground truncate">{c.phone || "-"}</div>
                            <div className="text-xs text-muted-foreground">{c.createdAt ? c.createdAt.toLocaleDateString("tr-TR") : ""}</div>
                            <div>
                              <Button size="sm" variant="outline" onClick={() => openCreateOfferForCustomer(c)}>
                                <Plus className="w-4 h-4" /> Yeni Teklif
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Create offer dialog - YENİ TASARIM */}
      <Dialog open={isCreateOfferOpen} onOpenChange={setIsCreateOfferOpen}>
        {createOfferCustomer ? (
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-heading font-bold">
                Yeni Teklif Oluştur
              </DialogTitle>
              <div className="text-sm text-muted-foreground mt-1">
                Müşteri: <span className="font-semibold text-foreground">{createOfferCustomer?.name}</span> ({createOfferCustomer?.email})
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
              <div className="space-y-6 py-4">
                {newOfferProducts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Henüz ürün eklenmedi. Aşağıdaki "Ürün Ekle" butonuna tıklayarak başlayın.</p>
                  </div>
                )}

                {newOfferProducts.map((p, idx) => (
                  <Card key={idx} className="border border-border shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-heading">
                          Ürün {idx + 1}
                        </CardTitle>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeNewOfferProduct(idx)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Ürün Seçimi veya Yeni Ürün */}
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Mevcut Ürün Seç (Opsiyonel)</Label>
                            <Select
                              value={p.productId || "new"}
                              onValueChange={(val) => {
                                if (val === "new") {
                                  // Yeni ürün modu
                                  setNewOfferProducts((prev) =>
                                    prev.map((prod, i) =>
                                      i === idx
                                        ? { ...prod, productId: undefined, isNewProduct: true }
                                        : prod
                                    )
                                  );
                                } else {
                                  // Mevcut ürün seçildi
                                  selectExistingProductForNewOffer(idx, val);
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Ürün seçin veya yeni oluşturun" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">+ Yeni Ürün Oluştur</SelectItem>
                                {((customerProductsCache[createOfferCustomer?.userId || ""] || []) as any[]).length === 0 ? (
                                  <SelectItem value="__none" disabled>Mevcut ürün bulunamadı</SelectItem>
                                ) : (
                                  (customerProductsCache[createOfferCustomer?.userId || ""] || []).map((prod: any) => (
                                    <SelectItem key={prod.id} value={prod.id}>
                                      {prod.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Yeni Ürün Bilgileri (Eğer mevcut ürün seçilmediyse) */}
                        {(!p.productId || p.isNewProduct) && (
                          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Ürün Adı *</Label>
                                <Input
                                  value={p.name || ""}
                                  onChange={(e) => updateNewOfferProductField(idx, "name", e.target.value)}
                                  placeholder="Ürün adını girin"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Ürün Açıklaması</Label>
                                <Input
                                  value={p.explanation || ""}
                                  onChange={(e) => updateNewOfferProductField(idx, "explanation", e.target.value)}
                                  placeholder="Ürün açıklaması"
                                />
                              </div>
                            </div>

                            {/* Görsel Yükleme */}
                            <div className="space-y-2">
                              <Label>Ürün Görselleri</Label>
                              <div className="flex flex-wrap gap-2">
                                {/* Mevcut görseller */}
                                {(productImageUrls[idx] || []).map((url, imgIdx) => (
                                  <div key={imgIdx} className="relative group">
                                    <div className="w-20 h-20 rounded-lg border border-border overflow-hidden bg-muted">
                                      <img
                                        src={url}
                                        alt={`Görsel ${imgIdx + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        setProductImageUrls((prev) => ({
                                          ...prev,
                                          [idx]: (prev[idx] || []).filter((_, i) => i !== imgIdx),
                                        }));
                                      }}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                                {/* Dosya yükleme butonu */}
                                {(productImageUrls[idx] || []).length < 5 && (
                                  <label className="cursor-pointer">
                                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:border-brand-lime transition-colors bg-muted/50">
                                      <Upload className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <input
                                      type="file"
                                      ref={(el) => {
                                        if (el) fileInputRefs.current[idx] = el;
                                      }}
                                      className="hidden"
                                      accept="image/*"
                                      multiple
                                      onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        if (files.length > 0) {
                                          const currentUrls = productImageUrls[idx] || [];
                                          const newUrls = files.map((file) => URL.createObjectURL(file));
                                          setProductImageUrls((prev) => ({
                                            ...prev,
                                            [idx]: [...currentUrls, ...newUrls].slice(0, 5),
                                          }));
                                          setProductImageFiles((prev) => ({
                                            ...prev,
                                            [idx]: [...(prev[idx] || []), ...files].slice(0, 5),
                                          }));
                                        }
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Mevcut Ürün Bilgileri (Eğer seçildiyse) */}
                        {p.productId && !p.isNewProduct && (
                          <div className="p-4 bg-brand-lime/10 rounded-lg border border-brand-lime/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="w-4 h-4 text-brand-lime" />
                              <span className="font-semibold text-sm">Mevcut Ürün: {p.name || "Bilinmiyor"}</span>
                            </div>
                            {p.explanation && (
                              <p className="text-xs text-muted-foreground">{p.explanation}</p>
                            )}
                            {((p.imageUrls || p.product_images || []) as any[]).length > 0 && (
                              <div className="grid grid-cols-4 gap-2 mt-3">
                                {(p.imageUrls || []).length > 0 
                                  ? (p.imageUrls as string[]).slice(0, 4).map((url: string, i: number) => (
                                      <div key={i} className="aspect-square rounded-md border border-border overflow-hidden bg-muted">
                                        <img
                                          src={url}
                                          alt={`${p.name} ${i + 1}`}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.35em' fill='%23999' font-size='12'%3EGörsel Yok%3C/text%3E%3C/svg%3E";
                                          }}
                                        />
                                      </div>
                                    ))
                                  : ((p.product_images || []) as any[]).slice(0, 4).map((img: any, i: number) => {
                                      const url = img?.url || img;
                                      return (
                                        <div key={i} className="aspect-square rounded-md border border-border overflow-hidden bg-muted">
                                          <img
                                            src={url}
                                            alt={`${p.name} ${i + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.35em' fill='%23999' font-size='12'%3EGörsel Yok%3C/text%3E%3C/svg%3E";
                                            }}
                                          />
                                        </div>
                                      );
                                    })
                                }
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Ürün Ölçüleri ve Bilgileri - Görseldeki gibi */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm border-b border-border pb-2">Ürün Bilgileri</h4>
                        
                        {/* Satır 1: Ürün En, Boy, Yükseklik */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Ürün En (cm)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={p.product_width ?? ""}
                              onChange={(e) => updateNewOfferProductField(idx, "product_width", e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Ürün Boy (cm)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={p.product_length ?? ""}
                              onChange={(e) => updateNewOfferProductField(idx, "product_length", e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Ürün Yükseklik (cm)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={p.product_height ?? ""}
                              onChange={(e) => updateNewOfferProductField(idx, "product_height", e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {/* Satır 2: Ürün Ağırlık, Paket, Adedi */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Ürün Ağırlık (kg)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={p.product_weight ?? ""}
                              onChange={(e) => updateNewOfferProductField(idx, "product_weight", e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Ürün Paket</Label>
                            <Input
                              value={p.product_package ?? ""}
                              onChange={(e) => updateNewOfferProductField(idx, "product_package", e.target.value)}
                              placeholder="Paket tipi"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Ürün Adedi</Label>
                            <Input
                              type="number"
                              value={p.count ?? 250}
                              onChange={(e) => updateNewOfferProductField(idx, "count", Number(e.target.value) || 0)}
                              placeholder="250"
                            />
                          </div>
                        </div>

                        {/* Satır 3: Kutu En, Boy, Yükseklik */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Kutu En (cm)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={p.box_width ?? ""}
                              onChange={(e) => updateNewOfferProductField(idx, "box_width", e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Kutu Boy (cm)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={p.box_length ?? ""}
                              onChange={(e) => updateNewOfferProductField(idx, "box_length", e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Kutu Yükseklik (cm)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={p.box_height ?? ""}
                              onChange={(e) => updateNewOfferProductField(idx, "box_height", e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {/* Satır 4: Kutu Ağırlık, Hacimsel Ağırlık, Kutudaki Ürün Adedi */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Kutu Ağırlık (kg)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={p.box_weight ?? ""}
                              onChange={(e) => updateNewOfferProductField(idx, "box_weight", e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Hacimsel Ağırlık (kg)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={p.box_volumetric_weight ?? ""}
                              onChange={(e) => updateNewOfferProductField(idx, "box_volumetric_weight", e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Kutudaki Ürün Adedi</Label>
                            <Input
                              type="number"
                              value={p.box_units ?? ""}
                              onChange={(e) => updateNewOfferProductField(idx, "box_units", Number(e.target.value) || null)}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {/* Satır 5: Kutu Sayısı, Ürün Fiyatı */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Kutu Sayısı</Label>
                            <Input
                              type="number"
                              value={p.box_count ?? ""}
                              onChange={(e) => updateNewOfferProductField(idx, "box_count", Number(e.target.value) || null)}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Ürün Fiyatı</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={p.unit_price ?? ""}
                              onChange={(e) => updateNewOfferProductField(idx, "unit_price", e.target.value)}
                              placeholder="0.00"
                              className="w-full"
                            />
                          </div>
                        </div>

                        {/* Satır 6: Ek Açıklama */}
                        <div className="space-y-2">
                          <Label>Ek Açıklama</Label>
                          <Textarea
                            value={p.extra_notes ?? ""}
                            onChange={(e) => updateNewOfferProductField(idx, "extra_notes", e.target.value)}
                            placeholder="Ek açıklama girin..."
                            rows={3}
                            className="resize-y"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Ürün Ekle Butonu */}
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={addBlankNewProduct}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ürün Ekle
                  </Button>
                </div>
              </div>
            </ScrollArea>

            {/* Footer Butonları */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setIsCreateOfferOpen(false)}>
                İptal
              </Button>
              <Button
                onClick={() => submitNewOfferForCustomer()}
                disabled={isCreatingOffer || newOfferProducts.length === 0}
                className="gap-2"
              >
                {isCreatingOffer ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Teklif Oluştur
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        ) : (
          <DialogContent>
            <div className="p-6 text-center">Yükleniyor...</div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
