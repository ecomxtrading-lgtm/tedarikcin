import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LayoutDashboard,
  Package,
  FileText,
  Settings,
  LogOut,
  Plus,
  Bell,
  Search,
  Menu,
  X,
  Clock,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AddProductModal, { ProductFormData } from "@/components/dashboard/AddProductModal";
import PendingOffers, { Offer } from "@/components/dashboard/PendingOffers";
import OfferViewModal from "@/components/dashboard/OfferViewModal";
import { supabase } from "@/lib/supabaseClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

type MenuSection = "dashboard" | "offers" | "pending-offers" | "ready-offers" | "accepted-offers" | "rejected-offers" | "settings";

interface Notification {
  id: string;
  customer_id: string;
  offer_id: string | null;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

// Storage bucket
const STORAGE_BUCKET = "product-images";
// Klasör prefix'leri
const PRODUCT_IMAGES_PREFIX = "product-images";

const Dashboard = () => {
  const normalizePhone = (val: string) => {
    // Sadece rakamları al
    const digits = val.replace(/\D/g, "");
    // +90 veya 90 ile başlıyorsa kaldır
    if (digits.startsWith("90")) return digits.slice(2);
    // Başında 0 varsa kaldır
    if (digits.startsWith("0")) return digits.slice(1);
    return digits;
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<MenuSection>("dashboard");
  const [isOffersExpanded, setIsOffersExpanded] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [pendingOffers, setPendingOffers] = useState<Offer[]>([]);
  const [userInfo, setUserInfo] = useState<{
    id?: string;
    email?: string;
    name?: string;
    phone?: string;
    createdAt?: string;
  } | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSubmittingProducts, setIsSubmittingProducts] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showProfileReminder, setShowProfileReminder] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();

  // OAuth callback handler
  useEffect(() => {
    const handleOAuthCallback = async () => {
      // URL hash'inden OAuth callback parametrelerini kontrol et
      const hash = window.location.hash;
      if (!hash || hash.length <= 1) {
        return; // Hash yoksa veya sadece # varsa işlem yapma
      }

      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const error = hashParams.get("error");
      const errorDescription = hashParams.get("error_description");

      // Eğer hata varsa
      if (error) {
        toast.error(`OAuth hatası: ${errorDescription || error}`, {
          position: "top-center",
          className: "border border-destructive",
        });
        // Hash'i temizle ve login sayfasına yönlendir
        const cleanPath = window.location.pathname + (window.location.search || "");
        window.history.replaceState(null, "", cleanPath);
        navigate("/login");
        return;
      }

      // Eğer token'lar varsa, session'ı ayarla
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          toast.error("Oturum kurulamadı. Lütfen tekrar deneyin.", {
            position: "top-center",
            className: "border border-destructive",
          });
          navigate("/login");
          return;
        }

        // Hash'i temizle - sadece pathname ve search varsa onları koru
        const cleanPath = window.location.pathname + (window.location.search || "");
        window.history.replaceState(null, "", cleanPath);
        toast.success("Giriş başarılı!", {
          position: "top-center",
          className: "border border-destructive/60",
        });
      }
    };

    // Kısa bir gecikme ekle ki SPAHandler önce URL'i düzeltsin
    const timer = setTimeout(() => {
      void handleOAuthCallback();
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      setIsUserLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setUserInfo(null);
        setIsUserLoading(false);
        return;
      }

      const user = data.user;
      const phoneMeta = user.phone || user.user_metadata?.phone || "";
      const fullName = user.user_metadata?.name || user.user_metadata?.full_name || "";

      setUserInfo({
        id: user.id,
        email: user.email ?? "",
        name: fullName || "Bilinmiyor",
        phone: phoneMeta,
        createdAt: user.created_at,
      });

      setFormName(fullName);
      setFormPhone(phoneMeta);

      // Customer kaydı Supabase trigger ile otomatik oluşturuluyor

      setIsUserLoading(false);

      if (!phoneMeta) {
        setShowProfileReminder(true);
      }

      // Kullanıcı yüklenince teklifleri çek (yeni model: customer_id = auth.uid)
      void fetchOffers(user.id);
      // Bildirimleri çek
      void fetchNotifications(user.id);
    };

    void fetchUser();
  }, []);

  // Real-time bildirim subscription
  useEffect(() => {
    if (!userInfo?.id) return;

    const channel = supabase
      .channel(`notifications:${userInfo.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `customer_id=eq.${userInfo.id}`,
        },
        () => {
          // Yeni bildirim geldiğinde listeyi güncelle
          void fetchNotifications(userInfo.id);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `customer_id=eq.${userInfo.id}`,
        },
        () => {
          // Bildirim güncellendiğinde listeyi güncelle
          void fetchNotifications(userInfo.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userInfo?.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("remember_me");
    toast.success("Çıkış yapıldı.");
    navigate("/");
  };

  const handleSaveProfile = async () => {
    if (!userInfo?.id) return;
    if (!formName.trim() || !formPhone.trim()) {
      toast.error("Ad ve telefon boş olamaz.");
      return;
    }

    // Telefon numarasını normalize et
    const normalizedPhone = normalizePhone(formPhone);
    if (!normalizedPhone || normalizedPhone.length !== 10) {
      toast.error("Telefon numarası 10 haneli olmalıdır.");
      return;
    }

    setIsSavingProfile(true);
    try {
      // 1) Auth metadata'yı güncelle
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: formName, phone: normalizedPhone },
      });
      if (authError) throw authError;

      // 2) Customers tablosunu güncelle
      const { error: customerError } = await supabase
        .from("customers")
        .update({
          name: formName.trim(),
          phone: normalizedPhone,
          email: userInfo.email || null,
        })
        .eq("id", userInfo.id);

            if (customerError) {
              throw customerError;
            }

      toast.success("Bilgileriniz güncellendi.");

      setUserInfo({
        ...userInfo,
        name: formName,
        phone: normalizedPhone,
      });

      setFormPhone(normalizedPhone);

      setIsEditingProfile(false);
      setShowProfileReminder(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilgiler güncellenemedi.";
      toast.error(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const isProfileDirty =
    userInfo &&
    (formName !== (userInfo.name || "") || formPhone !== (userInfo.phone || ""));

  const handleToggleEdit = () => {
    if (!userInfo) return;
    if (isEditingProfile) {
      setFormName(userInfo.name || "");
      setFormPhone(userInfo.phone || "");
      setIsEditingProfile(false);
    } else {
      setFormName(userInfo.name || "");
      setFormPhone(userInfo.phone || "");
      setIsEditingProfile(true);
    }
  };

  const handleAddProductClick = () => {
    const hasPhone = !!userInfo?.phone;
    if (!hasPhone) {
      setActiveSection("settings");
      setShowProfileReminder(true);
      return;
    }
    setIsAddProductModalOpen(true);
  };

  const handleSectionChange = (section: MenuSection) => {
    setActiveSection(section);
    if (section === "pending-offers" || section === "ready-offers") {
      setIsOffersExpanded(true);
    }
    setIsSidebarOpen(false);
  };

  const handleAddProducts = (products: ProductFormData[]) => {
    void submitProducts(products);
  };

  const uploadImagesForProduct = async (
    customerId: string,
    offerId: string,
    productId: string,
    product: ProductFormData
  ) => {
    const sanitizeFileName = (name: string) => {
      return name
        .normalize("NFKD")
        .replace(/[^\w.-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
    };

    const uploads: Promise<void>[] = [];

    // Dosya yükleme (bucket: product-images)
    product.imageFiles.forEach((file, idx) => {
      const safeName = sanitizeFileName(file.name);

      // Önerilen path: product-images/{customer_id}/{product_id}/...
      // offerId'yi path'e koymak zorunlu değil ama istersen ekleyebilirsin.
      const path = `${PRODUCT_IMAGES_PREFIX}/${customerId}/${productId}/${Date.now()}-${idx}-${safeName}`;

      const p = supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file)
        .then(({ error }) => {
          if (error) throw error;

          // DB'ye kayıt: yeni model
          return supabase.from("product_images").insert({
            customer_id: customerId,
            product_id: productId,
            url: path,
            sort_order: idx,
            source_type: "upload",
          });
        })
        .then(({ error }) => {
          if (error) throw error;
        });

      uploads.push(p);
    });

    // URL ekleme (external veya zaten hazır url)
    product.imageUrls.forEach((url, idx) => {
      const p = supabase.from("product_images").insert({
        customer_id: customerId,
        product_id: productId,
        url,
        sort_order: product.imageFiles.length + idx,
        source_type: "url",
      });

      uploads.push(
        Promise.resolve(p).then(({ error }) => {
          if (error) throw error;
        })
      );
    });

    await Promise.all(uploads);
  };

  const submitProducts = async (products: ProductFormData[]) => {
    if (!userInfo?.id) {
      toast.error("Oturum bulunamadı. Lütfen yeniden giriş yapın.");
      return;
    }
    if (isSubmittingProducts) return;

    setIsSubmittingProducts(true);

    try {
      // Yeni modelde müşteri ekranı: customer_id = auth.uid()
      const customerId = userInfo.id;

      // Customer kaydı Supabase trigger ile otomatik oluşturuluyor

      // 1) Offer oluştur (yeni sütunlar: customer_id, created_by)
      const { data: offerData, error: offerError } = await supabase
        .from("offers")
        .insert({
          customer_id: customerId,
          created_by: customerId, // müşteri kendisi oluşturdu
          owner_name: formName || userInfo.name,
          owner_email: userInfo.email,
          owner_phone: formPhone || userInfo.phone,
          title: "Yeni Teklif",
          status: "draft", // Veritabanı default değeri ile uyumlu
          currency: "Usd", // Veritabanı default değeri ile uyumlu
        })
        .select()
        .single();

      if (offerError || !offerData) {
        throw offerError || new Error("Teklif oluşturulamadı");
      }

      // 2) Products ekle
      for (const product of products) {
        const { data: productData, error: productError } = await supabase
          .from("products")
          .insert({
            offer_id: offerData.id,
            customer_id: customerId,
            name: product.productName,
            explanation: product.description,
            count: product.quantity,
            service_type: product.serviceType,
            currency: "Usd", // Veritabanı default değeri ile uyumlu
            // Diğer opsiyonel alanlar modalda yoksa null kalabilir (DB nullable)
          })
          .select()
          .single();

        if (productError || !productData) {
          throw productError || new Error("Ürün kaydedilemedi");
        }

        // 3) Görselleri ekle (storage + product_images)
        await uploadImagesForProduct(customerId, offerData.id, productData.id, product);
      }

      toast.success("Teklif ve ürünler kaydedildi.");
      setIsAddProductModalOpen(false);
      setIsOffersExpanded(true);
      setActiveSection("pending-offers");
      await fetchOffers(customerId);
      // Teklif oluşturulduktan sonra bildirimleri yenile
      await fetchNotifications(customerId);
    } catch (err) {
      let message = err instanceof Error ? err.message : "Kayıt sırasında hata oluştu.";
      
      // Bucket hatası için özel mesaj
      if (message.includes("Bucket not found") || message.includes("bucket")) {
        message = `Storage bucket "${STORAGE_BUCKET}" bulunamadı. Lütfen Supabase Storage'da "${STORAGE_BUCKET}" adında bir bucket oluşturun ve public yapın.`;
      }
      
      toast.error(message);
    } finally {
      setIsSubmittingProducts(false);
    }
  };

  const fetchOffers = async (customerId: string) => {
    const { data, error } = await supabase
      .from("offers")
      .select(
        `
        id,
        status,
        created_at,
        products (
          id,
          name,
          explanation,
          count,
          service_type,
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
          unit_price,
          currency,
          "pick-up_fee",
          extra_notes,
          product_images (url, sort_order)
        )
      `
      )
      // Yeni model: customer_id ile filtre
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(`Teklifler alınamadı: ${error.message || "Bilinmeyen hata"}`);
      return;
    }

    const mapped: Offer[] =
      data?.map((offer: any) => {
        // Pick-up fee sadece ilk ürün için (teklif başına bir kez)
        const firstProduct = offer.products?.[0];
        const pickUpFee = firstProduct?.["pick-up_fee"] || null;

        return {
        id: offer.id,
          status: offer.status || "draft",
        createdAt: offer.created_at ? new Date(offer.created_at) : new Date(),
          pickUpFee: pickUpFee,
        products:
          offer.products?.map((p: any) => {
            // Debug: product_package kontrolü
            console.log("🔍 DB Product Package:", {
              name: p.name,
              product_package: p.product_package,
              product_packageType: typeof p.product_package,
            });
            
            return {
              id: p.id,
              name: p.name || "",
              explanation: p.explanation || "",
              count: p.count || 0,
            serviceType: p.service_type || "",
              productWidth: p.product_width,
              productLength: p.product_length,
              productHeight: p.product_height,
              productWeight: p.product_weight,
              productPackage: p.product_package || null,
              boxWidth: p.box_width,
              boxLength: p.box_length,
              boxHeight: p.box_height,
              boxWeight: p.box_weight,
              boxVolumetricWeight: p.box_volumetric_weight,
              boxUnits: p.box_units,
              boxCount: p.box_count,
              unitPrice: p.unit_price,
              currency: p.currency,
              pickUpFee: p["pick-up_fee"] || null,
              extraNotes: p.extra_notes || null,
            imageUrls: (p.product_images || [])
              .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
              .map((img: any) => img.url),
            };
          }) || [],
        };
      }) || [];

    // Görsel yollarını signed URL'e çevir
    const resolved: Offer[] = [];
    for (const offer of mapped) {
      const resolvedProducts = [];
      for (const product of offer.products) {
        const resolvedUrls: string[] = [];
        for (const url of product.imageUrls || []) {
          if (url.startsWith("http")) {
            resolvedUrls.push(url);
          } else {
            const { data: signed, error: signedError } = await supabase.storage
              .from(STORAGE_BUCKET)
              .createSignedUrl(url, 60 * 60 * 24 * 7); // 7 gün

            if (!signedError && signed?.signedUrl) {
              resolvedUrls.push(signed.signedUrl);
            }
          }
        }
        resolvedProducts.push({ ...product, imageUrls: resolvedUrls } as any);
      }
      resolved.push({ ...offer, products: resolvedProducts });
    }

    setPendingOffers(resolved);
  };

  // Bildirimleri çek
  const fetchNotifications = async (customerId: string) => {
    if (!customerId) return;

    // Önce auth durumunu kontrol et
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      toast.error(`Bildirimler yüklenemedi: ${error.message}`);
      return;
    }

    setNotifications(data || []);
  };

  // Bildirimi okundu olarak işaretle
  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId);

    if (error) {
      toast.error("Bildirim güncellenemedi.");
      return;
    }

    // Local state'i güncelle
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
      )
    );
  };

  // Okunmamış bildirim sayısı
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleViewProducts = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsViewModalOpen(true);
  };

  const menuItems = [
    { id: "dashboard" as MenuSection, icon: LayoutDashboard, label: "Dashboard" },
    {
      id: "offers" as MenuSection,
      icon: FileText,
      label: "Tekliflerim",
      hasSubmenu: true,
      submenu: [
        { id: "pending-offers" as MenuSection, icon: Clock, label: "Bekleyen Teklifler" },
        { id: "ready-offers" as MenuSection, icon: CheckCircle2, label: "Hazır Teklifler" },
        { id: "accepted-offers" as MenuSection, icon: Package, label: "İşleme Alınan" },
        { id: "rejected-offers" as MenuSection, icon: X, label: "Reddedilen Teklifler" },
      ],
    },
    { id: "settings" as MenuSection, icon: Settings, label: "Ayarlar" },
  ];

  const renderMenuItems = (isMobile: boolean = false) => (
    <nav className="flex-1 p-4 space-y-1">
      {menuItems.map((item) => (
        <div key={item.id}>
          <button
            onClick={() => {
              if (item.hasSubmenu) {
                setIsOffersExpanded(!isOffersExpanded);
              } else {
                handleSectionChange(item.id);
              }
            }}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeSection === item.id || (item.hasSubmenu && (activeSection === "pending-offers" || activeSection === "ready-offers" || activeSection === "accepted-offers" || activeSection === "rejected-offers"))
                ? "text-brand-lime"
                : "text-white hover:text-brand-lime"
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </div>
            {item.hasSubmenu &&
              (isOffersExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              ))}
          </button>

          {/* Submenu */}
          {item.hasSubmenu && isOffersExpanded && item.submenu && (
            <div className="ml-4 mt-1 space-y-1">
              {item.submenu.map((subItem) => {
                let count = 0;
                const normalizedStatus = (status: string) => status?.toLowerCase().trim();
                
                if (subItem.id === "pending-offers") {
                  count = pendingOffers.filter((o) => {
                    const status = normalizedStatus(o.status);
                    return status !== "hazır" && status !== "iletim alındı" && status !== "reddedildi";
                  }).length;
                } else if (subItem.id === "ready-offers") {
                  count = pendingOffers.filter((o) => normalizedStatus(o.status) === "hazır").length;
                } else if (subItem.id === "accepted-offers") {
                  count = pendingOffers.filter((o) => normalizedStatus(o.status) === "iletim alındı").length;
                } else if (subItem.id === "rejected-offers") {
                  count = pendingOffers.filter((o) => normalizedStatus(o.status) === "reddedildi").length;
                }
                
                return (
                  <button
                    key={subItem.id}
                    onClick={() => handleSectionChange(subItem.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 whitespace-nowrap ${
                      activeSection === subItem.id
                        ? "text-brand-lime bg-brand-lime/10"
                        : "text-white hover:text-brand-lime"
                    }`}
                  >
                    <subItem.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm truncate">{subItem.label}</span>
                    {count > 0 && (
                      <span className="ml-auto bg-brand-lime text-brand-dark text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </nav>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "pending-offers":
        return (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                  Bekleyen Teklifler
                </h1>
                <p className="text-muted-foreground">
                  Onay bekleyen tekliflerinizi buradan takip edebilirsiniz.
                </p>
              </div>
              <Button
                onClick={handleAddProductClick}
                className="bg-brand-lime hover:bg-brand-lime-hover text-brand-dark gap-2"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Yeni Teklif</span>
              </Button>
            </div>
            <PendingOffers 
              offers={pendingOffers.filter((o) => {
                const status = o.status?.toLowerCase().trim();
                return status !== "hazır" && status !== "iletim alındı" && status !== "reddedildi";
              })} 
              onViewProducts={handleViewProducts} 
            />
          </>
        );

      case "ready-offers":
        return (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                  Hazır Teklifler
                </h1>
                <p className="text-muted-foreground">
                  Hazır olan tekliflerinizi buradan görüntüleyebilirsiniz.
                </p>
              </div>
            </div>
            <PendingOffers 
              offers={pendingOffers.filter((o) => o.status?.toLowerCase().trim() === "hazır")} 
              onViewProducts={handleViewProducts} 
            />
          </>
        );

      case "accepted-offers":
        return (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                  İşleme Alınan Teklifler
                </h1>
                <p className="text-muted-foreground">
                  İşleme alınan tekliflerinizi buradan görüntüleyebilirsiniz.
                </p>
              </div>
            </div>
            <PendingOffers 
              offers={pendingOffers.filter((o) => o.status?.toLowerCase().trim() === "iletim alındı")} 
              onViewProducts={handleViewProducts} 
            />
          </>
        );

      case "rejected-offers":
        return (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                  Reddedilen Teklifler
                </h1>
                <p className="text-muted-foreground">
                  Reddedilen tekliflerinizi buradan görüntüleyebilirsiniz.
                </p>
              </div>
            </div>
            <PendingOffers 
              offers={pendingOffers.filter((o) => o.status?.toLowerCase().trim() === "reddedildi")} 
              onViewProducts={handleViewProducts} 
            />
          </>
        );

      case "dashboard":
      default:
        return (
          <>
            {/* Welcome */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                Hoş Geldiniz! 👋
              </h1>
              <p className="text-muted-foreground">Dashboard&apos;unuzdan tüm işlemlerinizi takip edebilirsiniz.</p>
            </div>

            {/* Empty State */}
            <div className="bg-popover rounded-2xl border border-border p-8 md:p-12 text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-brand-lime/20 flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-brand-lime" />
              </div>
              <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-2">
                Henüz Ürün Eklemediniz
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                İlk ürününüzü ekleyerek teklif almaya başlayın. Çin&apos;den dünyaya, biz sizin için köprü olalım.
              </p>
              <Button
                onClick={handleAddProductClick}
                className="bg-brand-lime hover:bg-brand-lime-hover text-brand-dark group"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                İlk Ürününü Ekle
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[
                { label: "Aktif Siparişler", value: "0", color: "brand-orange" },
                { label: "Bekleyen Teklifler", value: String(pendingOffers.length), color: "brand-lime" },
                { label: "Tamamlanan", value: "0", color: "brand-olive" },
              ].map((stat) => (
                <div key={stat.label} className="bg-popover rounded-2xl border border-border p-6">
                  <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-heading font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>
          </>
        );

      case "settings":
        return (
          <>
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                Ayarlar
              </h1>
              <p className="text-muted-foreground">
                Hesap ayarlarınızı ve kullanıcı bilgilerinizi buradan yönetebilirsiniz.
              </p>
            </div>
            <div className="bg-popover rounded-2xl border border-border p-6 md:p-8 space-y-6">
              {isUserLoading ? (
                <p className="text-muted-foreground">Bilgiler yükleniyor...</p>
              ) : !userInfo ? (
                <p className="text-muted-foreground">Kullanıcı bilgisi alınamadı.</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Ad / İsim</Label>
                      <Input
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        disabled={!isEditingProfile}
                        placeholder="Adınız"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">E-posta</Label>
                      <Input value={userInfo.email} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Kullanıcı ID</Label>
                      <Input value={userInfo.id} disabled className="font-mono" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Telefon Numarası</Label>
                      <Input
                        value={formPhone}
                        onChange={(e) => {
                          const normalized = normalizePhone(e.target.value);
                          setFormPhone(normalized);
                        }}
                        disabled={!isEditingProfile}
                        placeholder="5xx xxx xx xx"
                        maxLength={10}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm text-muted-foreground">Oluşturulma</Label>
                      <Input
                        value={userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleString() : "Bilinmiyor"}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={handleToggleEdit} disabled={isSavingProfile}>
                      {isEditingProfile ? "Düzenlemeyi Kapat" : "Bilgileri Güncelle"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile || !isProfileDirty || !isEditingProfile}
                    >
                      {isSavingProfile ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-brand-dark border-r border-brand-charcoal/30">
        {/* Logo */}
        <div className="p-6 border-b border-brand-charcoal/30">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand-lime flex items-center justify-center">
              <span className="text-brand-dark font-heading font-bold text-xl">CS</span>
            </div>
            <span className="text-white font-heading font-semibold text-lg">ChinaSource</span>
          </Link>
        </div>

        {/* Navigation */}
        {renderMenuItems()}

        {/* Logout */}
        <div className="p-4 border-t border-brand-charcoal/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:text-destructive hover:bg-destructive/20 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-brand-dark border-r border-brand-charcoal/30 animate-slide-in-right">
            {/* Close Button */}
            <div className="flex justify-end p-4">
              <button onClick={() => setIsSidebarOpen(false)} className="text-white p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Logo */}
            <div className="px-6 pb-6 border-b border-brand-charcoal/30">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-brand-lime flex items-center justify-center">
                  <span className="text-brand-dark font-heading font-bold text-xl">CS</span>
                </div>
                <span className="text-white font-heading font-semibold text-lg">ChinaSource</span>
              </Link>
            </div>

            {/* Navigation */}
            {renderMenuItems(true)}

            {/* Logout */}
            <div className="p-4 border-t border-brand-charcoal/30 absolute bottom-0 left-0 right-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:text-destructive hover:bg-destructive/20 transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Çıkış Yap</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-popover border-b border-border h-16 flex items-center justify-between px-4 lg:px-8">
          {/* Mobile Menu Button */}
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-foreground p-2">
            <Menu className="w-6 h-6" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Ara..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-muted/50 border border-border focus:border-brand-lime focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <DropdownMenu 
              open={isNotificationOpen} 
              onOpenChange={(open) => {
                setIsNotificationOpen(open);
                // Dropdown açıldığında bildirimleri yenile
                if (open && userInfo?.id) {
                  void fetchNotifications(userInfo.id);
                }
              }}
            >
              <DropdownMenuTrigger asChild>
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span 
                      className="absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-background" 
                      style={{ backgroundColor: '#C6DF20' }}
                    />
                  )}
            </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 md:w-96">
                <div className="p-2 border-b border-border">
                  <h3 className="font-semibold text-sm">Bildirimler</h3>
                  {unreadCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {unreadCount} okunmamış bildirim
                    </p>
                  )}
                </div>
                <ScrollArea className="h-[400px]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      Henüz bildirim yok
                    </div>
                  ) : (
                    <div className="p-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                            notification.is_read
                              ? "bg-muted/30 hover:bg-muted/50"
                              : "bg-brand-lime/10 hover:bg-brand-lime/20 border border-brand-lime/20"
                          }`}
                          onClick={() => {
                            if (!notification.is_read) {
                              void markAsRead(notification.id);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {notification.is_read ? (
                                <Circle className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-brand-lime" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-sm text-foreground">
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(notification.created_at).toLocaleDateString("tr-TR", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center hover:ring-2 hover:ring-brand-lime transition-all"
              onClick={() => setActiveSection("settings")}
              aria-label="Kullanıcı bilgileri (Ayarlar)"
            >
              <span className="text-brand-lime font-heading font-bold">U</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8">{renderContent()}</main>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSubmit={handleAddProducts}
      />

      {/* Profile Reminder Modal */}
      {showProfileReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-popover border border-border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-xl font-heading font-bold text-foreground">Eksik bilgi</h3>
            <p className="text-muted-foreground">
              Lütfen profilinizde telefon bilgisi ekleyin. Profiliniz tamamlanmadan ürün ekleyemezsiniz.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowProfileReminder(false)}>
                Kapat
              </Button>
              <Button
                onClick={() => {
                  setActiveSection("settings");
                  setShowProfileReminder(false);
                }}
              >
                Profilim
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Products Modal - Status "hazır" değilse eski modal */}
      {selectedOffer && selectedOffer.status?.toLowerCase() !== "hazır" && (
        <AddProductModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedOffer(null);
          }}
          onSubmit={() => {}}
          readOnly={true}
          initialProducts={selectedOffer.products.map((p: any) => ({
            serviceType: p.serviceType || "",
            productName: p.name || p.productName || "",
            description: p.explanation || p.description || "",
            quantity: p.count || p.quantity || 0,
            imageUrls: p.imageUrls || [],
            imageFiles: [],
          }))}
        />
      )}

      {/* View Offer Modal - Status "hazır" ise yeni detaylı modal */}
      {selectedOffer && selectedOffer.status?.toLowerCase() === "hazır" && (
        <OfferViewModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedOffer(null);
          }}
          offer={selectedOffer}
        />
      )}
    </div>
  );
};

export default Dashboard;
