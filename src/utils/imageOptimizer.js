/**
 * Client-side Image Optimization Utilities
 * Handles image compression, format conversion, and resizing without server resources
 */

/**
 * Compress and optimize an image file on the client side
 * @param {File} file - The image file to optimize
 * @param {Object} options - Optimization options
 * @returns {Promise<File>} - Optimized image file
 */
export const optimizeImage = async (file, options = {}) => {
  const {
    maxWidth = 3840,      // 4K width
    maxHeight = 2160,     // 4K height
    quality = 0.9,        // High quality for 4K
    format = 'webp',      // Prefer WebP format
    fallbackFormat = 'jpeg', // Fallback format
    maintainAspectRatio = true,
    enableRetina = true
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate optimal dimensions
        let { width, height } = calculateOptimalDimensions(
          img.width, 
          img.height, 
          maxWidth, 
          maxHeight, 
          maintainAspectRatio,
          enableRetina
        );

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        const tryFormat = (formatToTry, qualityToUse) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const optimizedFile = new File(
                  [blob], 
                  `${file.name.split('.')[0]}.${formatToTry === 'image/webp' ? 'webp' : 'jpg'}`,
                  { type: formatToTry }
                );
                resolve(optimizedFile);
              } else if (formatToTry === 'image/webp') {
                // WebP failed, try JPEG
                tryFormat(`image/${fallbackFormat}`, qualityToUse);
              } else {
                reject(new Error('Failed to optimize image'));
              }
            },
            formatToTry,
            qualityToUse
          );
        };

        // Check if WebP is supported
        if (format === 'webp' && supportsWebP()) {
          tryFormat('image/webp', quality);
        } else {
          tryFormat(`image/${fallbackFormat}`, quality);
        }

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calculate optimal dimensions for 4K displays
 */
const calculateOptimalDimensions = (
  originalWidth, 
  originalHeight, 
  maxWidth, 
  maxHeight, 
  maintainAspectRatio,
  enableRetina
) => {
  let width = originalWidth;
  let height = originalHeight;

  // Apply device pixel ratio for retina displays
  const devicePixelRatio = enableRetina ? (window.devicePixelRatio || 1) : 1;
  
  if (maintainAspectRatio) {
    const aspectRatio = originalWidth / originalHeight;
    
    // Scale down if larger than max dimensions
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
  } else {
    width = Math.min(width, maxWidth);
    height = Math.min(height, maxHeight);
  }

  // Apply device pixel ratio but cap at reasonable limits
  if (devicePixelRatio > 1) {
    width = Math.min(width * Math.min(devicePixelRatio, 2), maxWidth);
    height = Math.min(height * Math.min(devicePixelRatio, 2), maxHeight);
  }

  return {
    width: Math.round(width),
    height: Math.round(height)
  };
};

/**
 * Check if WebP format is supported
 */
const supportsWebP = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

/**
 * Generate responsive image sizes for different breakpoints
 * @param {string} baseUrl - Base image URL
 * @param {Object} options - Size options
 * @returns {Object} - Object with different sized URLs
 */
export const generateResponsiveSizes = (baseUrl, options = {}) => {
  const {
    sizes = [320, 640, 768, 1024, 1280, 1920, 2560, 3840], // Include 4K
    quality = 90,
    format = 'webp'
  } = options;

  const responsiveSizes = {};

  sizes.forEach(size => {
    responsiveSizes[`w${size}`] = optimizeUrlForSize(baseUrl, {
      width: size,
      quality,
      format
    });
  });

  return responsiveSizes;
};

/**
 * Optimize URL for specific size (works with common CDNs)
 */
const optimizeUrlForSize = (url, { width, height, quality, format }) => {
  if (!url) return url;

  // Handle Unsplash URLs
  if (url.includes('unsplash.com')) {
    const urlObj = new URL(url);
    urlObj.searchParams.set('w', width.toString());
    if (height) urlObj.searchParams.set('h', height.toString());
    urlObj.searchParams.set('q', quality.toString());
    if (format === 'webp' && supportsWebP()) {
      urlObj.searchParams.set('fm', 'webp');
    }
    urlObj.searchParams.set('auto', 'format,compress');
    return urlObj.toString();
  }

  // Handle Cloudinary URLs
  if (url.includes('cloudinary.com')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      const transformations = [`w_${width}`, `q_${quality}`];
      if (height) transformations.push(`h_${height}`);
      if (format === 'webp' && supportsWebP()) {
        transformations.push('f_webp');
      }
      transformations.push('c_fill');
      
      return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
    }
  }

  return url;
};

/**
 * Create a progressive loading placeholder
 * @param {string} imageUrl - Original image URL
 * @returns {string} - Low quality placeholder URL
 */
export const createProgressivePlaceholder = (imageUrl) => {
  if (!imageUrl) return '';

  // Create a very small, low quality version for progressive loading
  if (imageUrl.includes('unsplash.com')) {
    const url = new URL(imageUrl);
    url.searchParams.set('w', '20');
    url.searchParams.set('h', '20');
    url.searchParams.set('q', '10');
    url.searchParams.set('blur', '5');
    return url.toString();
  }

  return imageUrl;
};

/**
 * Preload critical images for better performance
 * @param {Array} imageUrls - Array of image URLs to preload
 * @param {Object} options - Preload options
 */
export const preloadImages = (imageUrls, options = {}) => {
  const { priority = false, sizes = '100vw' } = options;

  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = priority ? 'preload' : 'prefetch';
    link.as = 'image';
    link.href = url;
    if (sizes) link.sizes = sizes;
    
    // Add to head
    document.head.appendChild(link);
  });
};

/**
 * Get optimal image format based on browser support
 */
export const getOptimalFormat = () => {
  if (supportsWebP()) return 'webp';
  return 'jpeg';
};

/**
 * Calculate image file size reduction
 * @param {File} originalFile - Original file
 * @param {File} optimizedFile - Optimized file
 * @returns {Object} - Size reduction stats
 */
export const calculateSizeReduction = (originalFile, optimizedFile) => {
  const originalSize = originalFile.size;
  const optimizedSize = optimizedFile.size;
  const reduction = originalSize - optimizedSize;
  const reductionPercentage = Math.round((reduction / originalSize) * 100);

  return {
    originalSize,
    optimizedSize,
    reduction,
    reductionPercentage,
    compressionRatio: Math.round((optimizedSize / originalSize) * 100) / 100
  };
};

export default {
  optimizeImage,
  generateResponsiveSizes,
  createProgressivePlaceholder,
  preloadImages,
  getOptimalFormat,
  calculateSizeReduction
};
