import React, { useState, useRef, useEffect } from 'react';
import { ProductImage } from './OptimizedImage';

/**
 * MagnifyImage - Amazon/Apple style image magnification on hover
 * Features:
 * - Magnifying glass effect on hover
 * - Smooth zoom transitions
 * - High-resolution zoom image loading
 * - Touch support for mobile devices
 * - Customizable zoom level and lens size
 */
const MagnifyImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  zoomLevel = 2.5,
  lensSize = 150,
  zoomWindowSize = 300,
  showZoomWindow = true,
  showLens = true,
  fadeSpeed = 300,
  borderRadius = 8,
  ...props
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomImageLoaded, setZoomImageLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  
  const imageRef = useRef(null);
  const lensRef = useRef(null);
  const zoomWindowRef = useRef(null);
  const containerRef = useRef(null);

  // Generate high-resolution zoom image URL
  const getZoomImageSrc = (originalSrc) => {
    if (!originalSrc) return '';
    
    // For Unsplash images, request higher resolution
    if (originalSrc.includes('unsplash.com')) {
      const url = new URL(originalSrc);
      // Request 4K resolution for zoom
      url.searchParams.set('w', '3840');
      url.searchParams.set('h', '3840');
      url.searchParams.set('q', '95');
      url.searchParams.set('fm', 'webp');
      return url.toString();
    }
    
    // For other images, try to get higher resolution
    return originalSrc;
  };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle mouse/touch movement
  const handleMove = (e) => {
    if (!imageRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let x, y;

    if (e.touches && e.touches[0]) {
      // Touch event
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
      setIsTouch(true);
    } else {
      // Mouse event
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      setIsTouch(false);
    }

    // Ensure coordinates are within image bounds
    const boundedX = Math.max(0, Math.min(x, rect.width));
    const boundedY = Math.max(0, Math.min(y, rect.height));

    setMousePosition({ x: boundedX, y: boundedY });
  };

  // Handle mouse/touch start
  const handleStart = (e) => {
    if (isMobile && e.type === 'touchstart') {
      e.preventDefault(); // Prevent scrolling on touch
      setIsTouch(true);
    }
    setIsHovering(true);
  };

  // Handle mouse/touch end
  const handleEnd = () => {
    setIsHovering(false);
    setIsTouch(false);
  };

  // Handle touch move with throttling
  const handleTouchMove = (e) => {
    e.preventDefault(); // Prevent scrolling
    handleMove(e);
  };

  // Calculate lens position
  const getLensPosition = () => {
    const lensHalfSize = lensSize / 2;
    return {
      left: mousePosition.x - lensHalfSize,
      top: mousePosition.y - lensHalfSize,
    };
  };

  // Calculate zoom window background position
  const getZoomBackgroundPosition = () => {
    if (!imageRef.current || !containerRef.current) return '0% 0%';

    const rect = containerRef.current.getBoundingClientRect();
    const xPercent = (mousePosition.x / rect.width) * 100;
    const yPercent = (mousePosition.y / rect.height) * 100;

    return `${xPercent}% ${yPercent}%`;
  };

  // Preload zoom image
  useEffect(() => {
    if (src && isHovering && !zoomImageLoaded) {
      const zoomImg = new Image();
      zoomImg.onload = () => setZoomImageLoaded(true);
      zoomImg.src = getZoomImageSrc(src);
    }
  }, [src, isHovering, zoomImageLoaded]);

  const lensPosition = getLensPosition();
  const zoomBackgroundPosition = getZoomBackgroundPosition();

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${isHovering && !isMobile ? 'cursor-crosshair' : 'cursor-pointer'} ${className}`}
      style={{ borderRadius: `${borderRadius}px` }}
      onMouseMove={!isMobile ? handleMove : undefined}
      onMouseEnter={!isMobile ? handleStart : undefined}
      onMouseLeave={!isMobile ? handleEnd : undefined}
      onTouchStart={isMobile ? handleStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleEnd : undefined}
      {...props}
    >
      {/* Main Image */}
      <ProductImage
        ref={imageRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-cover transition-opacity duration-300"
        onLoad={() => setImageLoaded(true)}
        style={{
          opacity: imageLoaded ? 1 : 0,
        }}
      />

      {/* Magnifying Lens */}
      {showLens && isHovering && imageLoaded && (
        <div
          ref={lensRef}
          className="absolute pointer-events-none border-2 border-white shadow-lg"
          style={{
            width: `${lensSize}px`,
            height: `${lensSize}px`,
            left: `${lensPosition.left}px`,
            top: `${lensPosition.top}px`,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(1px)',
            transition: `opacity ${fadeSpeed}ms ease-in-out`,
            opacity: isHovering ? 1 : 0,
            zIndex: 10,
          }}
        />
      )}

      {/* Zoom Window */}
      {showZoomWindow && isHovering && imageLoaded && zoomImageLoaded && !isMobile && (
        <div
          ref={zoomWindowRef}
          className="absolute pointer-events-none border border-gray-300 shadow-2xl bg-white"
          style={{
            width: `${zoomWindowSize}px`,
            height: `${zoomWindowSize}px`,
            right: `-${zoomWindowSize + 20}px`,
            top: '0',
            borderRadius: `${borderRadius}px`,
            backgroundImage: `url(${getZoomImageSrc(src)})`,
            backgroundSize: `${zoomLevel * 100}%`,
            backgroundPosition: zoomBackgroundPosition,
            backgroundRepeat: 'no-repeat',
            transition: `opacity ${fadeSpeed}ms ease-in-out`,
            opacity: isHovering ? 1 : 0,
            zIndex: 20,
          }}
        >
          {/* Loading indicator for zoom window */}
          {!zoomImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Zoom Overlay */}
      {isMobile && isHovering && imageLoaded && zoomImageLoaded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={handleEnd}
          onTouchEnd={handleEnd}
        >
          <div
            className="relative bg-white rounded-lg shadow-2xl max-w-[90vw] max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full h-full"
              style={{
                width: `${Math.min(zoomWindowSize * 1.5, window.innerWidth * 0.9)}px`,
                height: `${Math.min(zoomWindowSize * 1.5, window.innerHeight * 0.9)}px`,
                backgroundImage: `url(${getZoomImageSrc(src)})`,
                backgroundSize: `${zoomLevel * 100}%`,
                backgroundPosition: zoomBackgroundPosition,
                backgroundRepeat: 'no-repeat',
              }}
            />
            <button
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg"
              onClick={handleEnd}
              onTouchEnd={handleEnd}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Touch Hint */}
      {isMobile && !isHovering && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Tap to zoom
        </div>
      )}
    </div>
  );
};

// Preset component for product images with magnification
export const MagnifyProductImage = ({ src, alt, className = '', ...props }) => (
  <MagnifyImage
    src={src}
    alt={alt}
    className={`aspect-square object-cover ${className}`}
    zoomLevel={3}
    lensSize={120}
    zoomWindowSize={400}
    showZoomWindow={true}
    showLens={true}
    borderRadius={8}
    {...props}
  />
);

// Preset component for gallery images with larger zoom
export const MagnifyGalleryImage = ({ src, alt, className = '', ...props }) => (
  <MagnifyImage
    src={src}
    alt={alt}
    className={`w-full h-full object-cover ${className}`}
    zoomLevel={4}
    lensSize={150}
    zoomWindowSize={500}
    showZoomWindow={true}
    showLens={true}
    borderRadius={12}
    {...props}
  />
);

// Preset component for hero images with subtle zoom
export const MagnifyHeroImage = ({ src, alt, className = '', ...props }) => (
  <MagnifyImage
    src={src}
    alt={alt}
    className={`aspect-video object-cover ${className}`}
    zoomLevel={2}
    lensSize={200}
    zoomWindowSize={350}
    showZoomWindow={true}
    showLens={false} // No lens for hero images
    borderRadius={16}
    {...props}
  />
);

export default MagnifyImage;
