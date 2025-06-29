import React, { useState, useRef, useEffect } from 'react';
import { FiImage, FiAlertCircle } from 'react-icons/fi';

/**
 * OptimizedImage - High-performance image component with:
 * - Lazy loading
 * - WebP format support with fallback
 * - Progressive loading with blur effect
 * - Responsive image sizing
 * - Error handling with fallback
 * - Intersection Observer for better performance
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
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [imageSrc, setImageSrc] = useState(lazy ? null : src);
  const imgRef = useRef(null);
  const [isInView, setIsInView] = useState(!lazy);

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

  // Generate optimized image URL (for services like Cloudinary, Imgix, etc.)
  const getOptimizedSrc = (originalSrc) => {
    if (!originalSrc) return '';
    
    // If it's already optimized or a data URL, return as is
    if (originalSrc.includes('?') || originalSrc.startsWith('data:')) {
      return originalSrc;
    }

    // For demo purposes, we'll use Unsplash's transformation API
    if (originalSrc.includes('unsplash.com')) {
      const url = new URL(originalSrc);
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('q', quality.toString());
      if (props.width) url.searchParams.set('w', props.width.toString());
      if (props.height) url.searchParams.set('h', props.height.toString());
      return url.toString();
    }

    return originalSrc;
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
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className={`transition-all duration-300 ${
            isLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-105'
          } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
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

// Preset components for common use cases
export const ProductImage = ({ src, alt, className = '', ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    className={`aspect-square object-cover ${className}`}
    quality={85}
    lazy={true}
    blur={true}
    {...props}
  />
);

export const HeroImage = ({ src, alt, className = '', ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    className={`aspect-video object-cover ${className}`}
    quality={90}
    lazy={false}
    blur={false}
    {...props}
  />
);

export const ThumbnailImage = ({ src, alt, className = '', ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    className={`aspect-square object-cover ${className}`}
    quality={70}
    lazy={true}
    blur={true}
    {...props}
  />
);

export const AvatarImage = ({ src, alt, className = '', ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    className={`aspect-square object-cover rounded-full ${className}`}
    quality={80}
    lazy={true}
    blur={false}
    {...props}
  />
);

export default OptimizedImage;
