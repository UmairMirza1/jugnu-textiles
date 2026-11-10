export interface Size { size: string; retail: number; wholesale: number }
export interface Pattern { type: 'solid' | 'stripe' | 'check' | 'floral' | 'dots' | 'geometric'; colors: string[] }
export interface Product {
  id: string; name: string; nameUr: string; category: string; fabric: string; threadCount: number; finish: string;
  description: string; pattern: Pattern; sizes: Size[]; moq: number; badge: string | null; imageUrl: string | null;
  inStock: boolean; active: boolean; sortOrder: number;
}
export interface Category { id: string; en: string; ur: string }
export interface SiteInfo { name: string; whatsapp: string; phone: string; email: string; address: string; categories: Category[] }
export interface CartLine { productId: string; size: string; qty: number }
export interface Inquiry {
  id: number; reference: string; type: string; status: string; name: string; phone: string; email: string; city: string;
  businessName: string; customerType: string; message: string; estimatedTotal: number; adminNotes: string; createdAt: string;
  items: { productId: string; name: string; size: string; qty: number; unitPrice: number; priceType: string; lineTotal: number }[];
}
