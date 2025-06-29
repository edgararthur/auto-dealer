import React, { useState, useRef, useEffect } from 'react';
import { FiImage, FiAlertCircle } from 'react-icons/fi';

/**
 * OptimizedImage - High-performance image component with:
 * - Lazy loading
 * - WebP format support with fallback
 * - Progressive loading with blur effect
 * - Responsive image sizing for 4K displays
 * - Error handling with fallback
 * - Intersection Observer for better performance
 * - Client-side image optimization
 * - Retina/High-DPI display support
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  sizes,
  priority = false,
  placeholder = null,
  fallbackSrc = null,
  onLoad,
  onError,
  lazy = true,
  quality = 80,
  blur = true,
  retina = true, // Enable retina support
  webp = true,   // Enable WebP format
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [imageSrc, setImageSrc] = useState(lazy ? null : src);
  const [supportsWebP, setSupportsWebP] = useState(false);
  const imgRef = useRef(null);
  const [isInView, setIsInView] = useState(!lazy);
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);

  // Detect WebP support and device pixel ratio
  useEffect(() => {
    // Detect WebP support
    const detectWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const dataURL = canvas.toDataURL('image/webp');
      setSupportsWebP(dataURL.indexOf('data:image/webp') === 0);
    };

    // Get device pixel ratio for retina displays
    const updateDevicePixelRatio = () => {
      setDevicePixelRatio(window.devicePixelRatio || 1);
    };

    detectWebPSupport();
    updateDevicePixelRatio();

    // Listen for device pixel ratio changes (e.g., when moving between monitors)
    const mediaQuery = window.matchMedia('(min-resolution: 2dppx)');
    const handleChange = () => updateDevicePixelRatio();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange); // Fallback for older browsers
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setImageSrc(src);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px' // Start loading 50px before entering viewport
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [lazy, src]);

  // Handle image load
  const handleLoad = (event) => {
    setIsLoaded(true);
    setIsError(false);
    if (onLoad) onLoad(event);
  };

  // Handle image error
  const handleError = (event) => {
    setIsError(true);
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setIsError(false);
    }
    if (onError) onError(event);
  };

  // Generate optimized image URL with 4K support and WebP format
  const getOptimizedSrc = (originalSrc) => {
    if (!originalSrc) return '';

    // If it's a data URL, return as is
    if (originalSrc.startsWith('data:')) {
      return originalSrc;
    }

    // Calculate optimal dimensions for retina displays
    const getOptimalDimensions = () => {
      let targetWidth = width;
      let targetHeight = height;

      // If no explicit dimensions, try to get from container
      if (!targetWidth && imgRef.current) {
        const rect = imgRef.current.getBoundingClientRect();
        targetWidth = rect.width;
        targetHeight = rect.height;
      }

      // Apply device pixel ratio for retina displays
      if (retina && devicePixelRatio > 1) {
        targetWidth = targetWidth ? Math.ceil(targetWidth * devicePixelRatio) : undefined;
        targetHeight = targetHeight ? Math.ceil(targetHeight * devicePixelRatio) : undefined;
      }

      // Cap at 4K resolution to avoid excessive bandwidth
      const MAX_4K_WIDTH = 3840;
      const MAX_4K_HEIGHT = 2160;

      if (targetWidth && targetWidth > MAX_4K_WIDTH) {
        const ratio = targetHeight ? targetHeight / targetWidth : 1;
        targetWidth = MAX_4K_WIDTH;
        targetHeight = Math.ceil(MAX_4K_WIDTH * ratio);
      }

      if (targetHeight && targetHeight > MAX_4K_HEIGHT) {
        const ratio = targetWidth ? targetWidth / targetHeight : 1;
        targetHeight = MAX_4K_HEIGHT;
        targetWidth = Math.ceil(MAX_4K_HEIGHT * ratio);
      }

      return { width: targetWidth, height: targetHeight };
    };

    const { width: optimalWidth, height: optimalHeight } = getOptimalDimensions();

    // Handle Unsplash images with advanced optimization
    if (originalSrc.includes('unsplash.com')) {
      const url = new URL(originalSrc);

      // Set format based on WebP support
      if (webp && supportsWebP) {
        url.searchParams.set('fm', 'webp');
      } else {
        url.searchParams.set('fm', 'jpg');
      }

      url.searchParams.set('auto', 'format,compress');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('q', quality.toString());

      if (optimalWidth) url.searchParams.set('w', optimalWidth.toString());
      if (optimalHeight) url.searchParams.set('h', optimalHeight.toString());

      // Add DPR parameter for Unsplash
      if (retina && devicePixelRatio > 1) {
        url.searchParams.set('dpr', Math.min(devicePixelRatio, 3).toString());
      }

      return url.toString();
    }

    // Handle other image services or CDNs
    if (originalSrc.includes('cloudinary.com')) {
      // Cloudinary optimization
      const parts = originalSrc.split('/upload/');
      if (parts.length === 2) {
        const transformations = [];

        if (webp && supportsWebP) transformations.push('f_webp');
        else transformations.push('f_auto');

        transformations.push(`q_${quality}`);

        if (optimalWidth) transformations.push(`w_${optimalWidth}`);
        if (optimalHeight) transformations.push(`h_${optimalHeight}`);

        transformations.push('c_fill');

        if (retina && devicePixelRatio > 1) {
          transformations.push(`dpr_${Math.min(devicePixelRatio, 3)}`);
        }

        return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
      }
    }

    // For other URLs, try to add query parameters if not already present
    if (!originalSrc.includes('?')) {
      const url = new URL(originalSrc);

      if (optimalWidth) url.searchParams.set('w', optimalWidth.toString());
      if (optimalHeight) url.searchParams.set('h', optimalHeight.toString());
      url.searchParams.set('q', quality.toString());

      if (webp && supportsWebP) {
        url.searchParams.set('format', 'webp');
      }

      return url.toString();
    }

    return originalSrc;
  };

  // Generate responsive srcset for different pixel densities
  const generateSrcSet = (originalSrc) => {
    if (!originalSrc || originalSrc.startsWith('data:') || !retina) {
      return undefined;
    }

    const densities = [1, 1.5, 2, 3]; // Support up to 3x density for ultra-high DPI
    const srcSetEntries = [];

    densities.forEach(density => {
      if (density <= (devicePixelRatio + 0.5)) { // Only generate up to slightly above current DPR
        const tempWidth = width ? Math.ceil(width * density) : undefined;
        const tempHeight = height ? Math.ceil(height * density) : undefined;

        // Create a temporary URL for this density
        let densityUrl = originalSrc;

        if (originalSrc.includes('unsplash.com')) {
          const url = new URL(originalSrc);
          if (webp && supportsWebP) url.searchParams.set('fm', 'webp');
          else url.searchParams.set('fm', 'jpg');

          url.searchParams.set('auto', 'format,compress');
          url.searchParams.set('fit', 'crop');
          url.searchParams.set('q', quality.toString());
          url.searchParams.set('dpr', density.toString());

          if (tempWidth) url.searchParams.set('w', tempWidth.toString());
          if (tempHeight) url.searchParams.set('h', tempHeight.toString());

          densityUrl = url.toString();
        }

        srcSetEntries.push(`${densityUrl} ${density}x`);
      }
    });

    return srcSetEntries.length > 1 ? srcSetEntries.join(', ') : undefined;
  };

  // Placeholder component
  const Placeholder = () => {
    if (placeholder) {
      return placeholder;
    }

    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <FiImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          {blur && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
          )}
        </div>
      </div>
    );
  };

  // Error state
  const ErrorState = () => (
    <div className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}>
      <div className="text-center">
        <FiAlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-xs text-gray-500">Failed to load image</p>
      </div>
    </div>
  );

  if (isError && (!fallbackSrc || imageSrc === fallbackSrc)) {
    return <ErrorState />;
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder/Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0">
          <Placeholder />
        </div>
      )}

      {/* Blur overlay while loading */}
      {!isLoaded && blur && imageSrc && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Actual image */}
      {imageSrc && isInView && (
        <img
          src={getOptimizedSrc(imageSrc)}
          srcSet={generateSrcSet(imageSrc)}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes || (width && height ? `${width}px` : '100vw')}
          className={`transition-all duration-300 ${
            isLoaded
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-105'
          } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          style={{
            // Ensure crisp rendering on high-DPI displays
            imageRendering: devicePixelRatio > 1 ? 'crisp-edges' : 'auto',
            // Optimize for quality on retina displays
            ...props.style
          }}
          {...props}
        />
      )}

      {/* Shimmer effect for better loading experience */}
      {!isLoaded && imageSrc && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      )}
    </div>
  );
};

// Skeleton component for loading states
export const ImageSkeleton = ({ className = '', width, height }) => (
  <div 
    className={`bg-gray-200 animate-pulse ${className}`}
    style={{ width, height }}
  >
    <div className="flex items-center justify-center h-full">
      <svg 
        className="w-8 h-8 text-gray-400" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path 
          fillRule="evenodd" 
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
          clipRule="evenodd" 
        />
      </svg>
    </div>
  </div>
);

// Preset components for common use cases with 4K optimization
export const ProductImage = ({ src, alt, className = '', ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    className={`aspect-square object-cover ${className}`}
    quality={90} // Higher quality for product images
    lazy={true}
    blur={true}
    retina={true}
    webp={true}
    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
    {...props}
  />
);

export const HeroImage = ({ src, alt, className = '', ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    className={`aspect-video object-cover ${className}`}
    quality={95} // Highest quality for hero images
    lazy={false}
    blur={false}
    retina={true}
    webp={true}
    sizes="100vw"
    {...props}
  />
);

export const ThumbnailImage = ({ src, alt, className = '', ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    className={`aspect-square object-cover ${className}`}
    quality={80} // Good quality for thumbnails
    lazy={true}
    blur={true}
    retina={true}
    webp={true}
    sizes="(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 15vw"
    {...props}
  />
);

export const AvatarImage = ({ src, alt, className = '', ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    className={`aspect-square object-cover rounded-full ${className}`}
    quality={85}
    lazy={true}
    blur={false}
    retina={true}
    webp={true}
    sizes="(max-width: 640px) 10vw, 5vw"
    {...props}
  />
);

// New preset for 4K product galleries
export const GalleryImage = ({ src, alt, className = '', ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    className={`aspect-square object-cover ${className}`}
    quality={95}
    lazy={true}
    blur={true}
    retina={true}
    webp={true}
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
    {...props}
  />
);

// New preset for high-resolution product details
export const DetailImage = ({ src, alt, className = '', ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    className={`object-contain ${className}`}
    quality={98} // Maximum quality for detail views
    lazy={false}
    blur={false}
    retina={true}
    webp={true}
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 50vw"
    {...props}
  />
);

export default OptimizedImage;
