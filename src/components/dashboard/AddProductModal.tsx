import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Upload, Link, Trash2, Package, X, Image, Check } from "lucide-react";
import { toast } from "sonner";

export interface ProductFormData {
  serviceType: string;
  productName: string;
  description: string;
  quantity: number;
  imageUrls: string[];
  imageFiles: File[];
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (products: ProductFormData[]) => void;
  readOnly?: boolean;
  initialProducts?: ProductFormData[];
}

const emptyProduct: ProductFormData = {
  serviceType: "",
  productName: "",
  description: "",
  quantity: 1,
  imageUrls: [],
  imageFiles: [],
};

const serviceOptions = [
  { value: "dropshipping", label: "Dropshipping" },
  { value: "amazon-fba", label: "Amazon FBA" },
  { value: "amazon-fbm", label: "Amazon FBM" },
  { value: "wholesale", label: "Toptan Sipariş" },
];

const MAX_IMAGES = 3;

const AddProductModal = ({
  isOpen,
  onClose,
  onSubmit,
  readOnly = false,
  initialProducts,
}: AddProductModalProps) => {
  const [products, setProducts] = useState<ProductFormData[]>(
    initialProducts || [{ ...emptyProduct, imageUrls: [], imageFiles: [] }]
  );
  const [newImageUrl, setNewImageUrl] = useState<{ [key: number]: string }>({});
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const getTotalImages = (product: ProductFormData) => {
    return product.imageFiles.length + product.imageUrls.length;
  };

  const handleProductChange = (
    index: number,
    field: keyof ProductFormData,
    value: string | number | string[] | File[]
  ) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const handleAddProduct = () => {
    setProducts([...products, { ...emptyProduct, imageUrls: [], imageFiles: [] }]);
  };

  const handleRemoveProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const handleFileChange = (index: number, files: FileList | null) => {
    if (!files) return;
    
    const product = products[index];
    const currentTotal = getTotalImages(product);
    const remainingSlots = MAX_IMAGES - currentTotal;
    
    if (remainingSlots <= 0) {
      toast.error(`En fazla ${MAX_IMAGES} görsel ekleyebilirsiniz`);
      return;
    }

    const filesToAdd = Array.from(files).slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      toast.warning(`Sadece ${remainingSlots} görsel eklendi (maksimum ${MAX_IMAGES})`);
    }

    const newFiles = [...product.imageFiles, ...filesToAdd];
    handleProductChange(index, "imageFiles", newFiles);
    
    // Reset the file input
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = "";
    }
  };

  const handleRemoveFile = (productIndex: number, fileIndex: number) => {
    const product = products[productIndex];
    const newFiles = product.imageFiles.filter((_, i) => i !== fileIndex);
    handleProductChange(productIndex, "imageFiles", newFiles);
  };

  const handleAddImageUrl = (productIndex: number) => {
    const url = newImageUrl[productIndex]?.trim();
    if (!url) return;

    const product = products[productIndex];
    const currentTotal = getTotalImages(product);
    
    if (currentTotal >= MAX_IMAGES) {
      toast.error(`En fazla ${MAX_IMAGES} görsel ekleyebilirsiniz`);
      return;
    }

    const newUrls = [...product.imageUrls, url];
    handleProductChange(productIndex, "imageUrls", newUrls);
    setNewImageUrl({ ...newImageUrl, [productIndex]: "" });
  };

  const handleRemoveImageUrl = (productIndex: number, urlIndex: number) => {
    const product = products[productIndex];
    const newUrls = product.imageUrls.filter((_, i) => i !== urlIndex);
    handleProductChange(productIndex, "imageUrls", newUrls);
  };

  const handleSubmit = () => {
    // Validate all products
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (!p.serviceType) {
        toast.error(`Ürün ${i + 1}: Hizmet türü seçiniz`);
        return;
      }
      if (!p.productName.trim()) {
        toast.error(`Ürün ${i + 1}: Ürün adı giriniz`);
        return;
      }
      if (p.quantity < 1) {
        toast.error(`Ürün ${i + 1}: Geçerli bir adet giriniz`);
        return;
      }
    }
    onSubmit(products);
    setProducts([{ ...emptyProduct, imageUrls: [], imageFiles: [] }]);
  };

  const handleClose = () => {
    if (!readOnly) {
      setProducts([{ ...emptyProduct, imageUrls: [], imageFiles: [] }]);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-popover">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-lime" />
            {readOnly ? "Teklif Ürünleri" : "Ürün Ekle"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {products.map((product, index) => (
            <div
              key={index}
              className="relative border border-border rounded-xl p-6 bg-muted/30"
            >
              {/* Product Number Badge */}
              <div className="absolute -top-3 left-4 bg-brand-lime text-brand-dark px-3 py-1 rounded-full text-sm font-semibold">
                Ürün {index + 1}
              </div>

              {/* Remove Button */}
              {!readOnly && products.length > 1 && (
                <button
                  onClick={() => handleRemoveProduct(index)}
                  className="absolute -top-3 right-4 bg-destructive text-white p-1.5 rounded-full hover:bg-destructive/80 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <div className="space-y-5 mt-3">
                {/* Service Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Hizmet Türü *</Label>
                  <RadioGroup
                    value={product.serviceType}
                    onValueChange={(value) =>
                      handleProductChange(index, "serviceType", value)
                    }
                    disabled={readOnly}
                    className="grid grid-cols-2 gap-3"
                  >
                    {serviceOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={option.value}
                          id={`${option.value}-${index}`}
                          className="border-brand-lime text-brand-lime"
                        />
                        <Label
                          htmlFor={`${option.value}-${index}`}
                          className="text-sm cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Product Name */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Ürün Adı / Keyword *</Label>
                  <Input
                    value={product.productName}
                    onChange={(e) =>
                      handleProductChange(index, "productName", e.target.value)
                    }
                    placeholder="Ürün adı veya anahtar kelime girin"
                    disabled={readOnly}
                    className="bg-background"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Ürün Açıklaması</Label>
                  <Textarea
                    value={product.description}
                    onChange={(e) =>
                      handleProductChange(index, "description", e.target.value)
                    }
                    placeholder="Ürün hammaddesi, istenilen özellikler, özel talepler..."
                    disabled={readOnly}
                    className="min-h-[120px] bg-background resize-none"
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Ürün Adedi *</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={product.quantity || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!/^\d*$/.test(val)) return;
                      const num = val === "" ? 0 : parseInt(val, 10);
                      handleProductChange(index, "quantity", num);
                    }}
                    disabled={readOnly}
                    className="bg-background w-32"
                  />
                </div>

                {/* Images Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">
                      Görseller ({getTotalImages(product)}/{MAX_IMAGES})
                    </Label>
                  </div>

                  {/* File Upload */}
                  {!readOnly && getTotalImages(product) < MAX_IMAGES && (
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-brand-lime hover:bg-brand-lime/5 transition-colors">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Görsel Yükle
                        </span>
                        <input
                          ref={(el) => (fileInputRefs.current[index] = el)}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleFileChange(index, e.target.files)}
                        />
                      </label>

                      {/* URL Input */}
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            value={newImageUrl[index] || ""}
                            onChange={(e) =>
                              setNewImageUrl({ ...newImageUrl, [index]: e.target.value })
                            }
                            placeholder="Resim linki yapıştırın"
                            className="pl-10 pr-20 bg-background"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddImageUrl(index);
                              }
                            }}
                          />
                          {/* Yeşil Tik ve Kırmızı Çarpı Butonları */}
                          {newImageUrl[index]?.trim() && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleAddImageUrl(index)}
                                className="p-1.5 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                                title="Resmi ekle"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setNewImageUrl({ ...newImageUrl, [index]: "" })}
                                className="p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                                title="URL'yi sil"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Image Previews */}
                  {(product.imageFiles.length > 0 || product.imageUrls.length > 0) && (
                    <div className="grid grid-cols-5 gap-2 mt-3">
                      {/* File previews */}
                      {product.imageFiles.map((file, fileIndex) => (
                        <div key={`file-${fileIndex}`} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${fileIndex + 1}`}
                            className="w-full aspect-square object-cover rounded-lg border border-border"
                          />
                          {!readOnly && (
                            <button
                              onClick={() => handleRemoveFile(index, fileIndex)}
                              className="absolute -top-2 -right-2 bg-destructive text-white p-1 rounded-full opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {/* URL previews */}
                      {product.imageUrls.map((url, urlIndex) => (
                        <div key={`url-${urlIndex}`} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${urlIndex + 1}`}
                            className="w-full aspect-square object-cover rounded-lg border border-border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.35em' fill='%23999' font-size='12'%3EHata%3C/text%3E%3C/svg%3E";
                            }}
                          />
                          {!readOnly && (
                            <button
                              onClick={() => handleRemoveImageUrl(index, urlIndex)}
                              className="absolute -top-2 -right-2 bg-destructive text-white p-1 rounded-full opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Empty slots */}
                      {Array.from({ length: MAX_IMAGES - getTotalImages(product) }).map((_, i) => (
                        <div
                          key={`empty-${i}`}
                          className="w-full aspect-square rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center"
                        >
                          <Image className="w-5 h-5 text-muted-foreground/30" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
        {!readOnly && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddProduct}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Başka Ürün Ekle
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-brand-lime hover:bg-brand-lime-hover text-brand-dark gap-2"
            >
              Teklif İste
            </Button>
          </div>
        )}

        {readOnly && (
          <div className="flex justify-end pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleClose}>
              Kapat
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;