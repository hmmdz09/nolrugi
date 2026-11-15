import React, { useState } from 'react';
import { ProductCategory } from '../types';
import { Package } from 'lucide-react';

/**
 * Authentic, high-quality Indonesian F&B packaged product photo presets.
 * Direct Unsplash CDN images with optimized width, crop, and quality.
 */
export const PRODUCT_IMAGE_PRESETS: Record<string, string> = {
  // 1. Roti Sobek Cokelat Keju Organik
  'batch-001': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&h=400&q=80',
  // 2. Frozen Risol Mayo Pedas
  'batch-002': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&h=400&q=80',
  // 3. Sambal Roa Khas Manado Jar 150ml
  'batch-003': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&h=400&q=80',
  // 4. Kopi Susu Gula Aren Botol 250ml
  'batch-004': 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=400&h=400&q=80',
  // 5. Keripik Pisang Lumer Cokelat 200g
  'batch-005': 'https://images.unsplash.com/photo-1621996346565-e3d5d6281781?auto=format&fit=crop&w=400&h=400&q=80',
  // 6. Bumbu Rawon Spesial Pasta 200g
  'batch-006': 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=400&h=400&q=80',
  // 7. Keripik Singkong Balado Daun Jeruk 250g
  'batch-007': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&h=400&q=80',
  // 8. Nastar Nanas Wisman Toples 350g
  'batch-008': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&h=400&q=80',
};

/**
 * Fallback images by category for any newly added products.
 */
export const CATEGORY_IMAGE_DEFAULTS: Record<ProductCategory, string> = {
  'Roti & Kue': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&h=400&q=80',
  'Keripik & Camilan': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&h=400&q=80',
  'Frozen Food': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&h=400&q=80',
  'Minuman': 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=400&h=400&q=80',
  'Sambal & Bumbu': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&h=400&q=80',
};

/**
 * Resolves appropriate image URL for a given batch.
 */
export const getProductImageUrl = (batch: {
  id?: string;
  productName?: string;
  category?: ProductCategory;
  imageUrl?: string;
}): string => {
  if (batch.imageUrl && batch.imageUrl.trim() !== '') {
    return batch.imageUrl;
  }
  if (batch.id && PRODUCT_IMAGE_PRESETS[batch.id]) {
    return PRODUCT_IMAGE_PRESETS[batch.id];
  }

  // Name keyword heuristics
  const nameLower = (batch.productName || '').toLowerCase();
  if (nameLower.includes('roti') || nameLower.includes('kue') || nameLower.includes('nastar')) {
    return PRODUCT_IMAGE_PRESETS['batch-001'];
  }
  if (nameLower.includes('risol') || nameLower.includes('dimsum') || nameLower.includes('frozen')) {
    return PRODUCT_IMAGE_PRESETS['batch-002'];
  }
  if (nameLower.includes('sambal') || nameLower.includes('bumbu') || nameLower.includes('roa') || nameLower.includes('rawon')) {
    return PRODUCT_IMAGE_PRESETS['batch-003'];
  }
  if (nameLower.includes('kopi') || nameLower.includes('susu') || nameLower.includes('minum') || nameLower.includes('teh')) {
    return PRODUCT_IMAGE_PRESETS['batch-004'];
  }
  if (nameLower.includes('keripik') || nameLower.includes('singkong') || nameLower.includes('pisang') || nameLower.includes('tempe')) {
    return PRODUCT_IMAGE_PRESETS['batch-005'];
  }

  if (batch.category && CATEGORY_IMAGE_DEFAULTS[batch.category]) {
    return CATEGORY_IMAGE_DEFAULTS[batch.category];
  }

  return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&h=400&q=80';
};

/**
 * Reusable Product Thumbnail Component with graceful offline/error fallback.
 */
export const ProductThumbnail: React.FC<{
  batch: {
    id?: string;
    productName?: string;
    category?: ProductCategory;
    imageUrl?: string;
  };
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ batch, alt, className = '', size = 'md' }) => {
  const [hasError, setHasError] = useState(false);
  const src = getProductImageUrl(batch);

  const sizeClasses = {
    sm: 'w-9 h-9 rounded-xl',
    md: 'w-12 h-12 rounded-2xl',
    lg: 'w-16 h-16 rounded-2xl',
    xl: 'w-full h-36 rounded-2xl',
  }[size];

  if (hasError) {
    return (
      <div
        className={`bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center shrink-0 border border-white/80 shadow-sm ${sizeClasses} ${className}`}
        aria-hidden
      >
        <Package className="w-5 h-5 text-brand-600 opacity-80" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || batch.productName || 'Foto produk'}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`object-cover shrink-0 shadow-sm border border-white/90 bg-slate-100 ${sizeClasses} ${className}`}
    />
  );
};
