import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiRotateCw, FiZoomIn, FiZoomOut, FiPlay, FiPause } from 'react-icons/fi';

const ProductView360 = ({ images, autoRotate = false, initialSpeed = 50 }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoRotate);
  const [speed, setSpeed] = useState(initialSpeed);
  const [zoom, setZoom] = useState(100);
  
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  
  // Handle auto-rotation animation
  useEffect(() => {
    if (isPlaying) {
      let lastTime = 0;
      const animate = (time) => {
        if (lastTime === 0) {
          lastTime = time;
          animationRef.current = requestAnimationFrame(animate);
          return;
        }
        
        const delta = time - lastTime;
        if (delta > (100 - speed) * 2) {
          lastTime = time;
          setCurrentFrame((prev) => (prev + 1) % images.length);
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isPlaying, images.length, speed]);

  // Handle mouse down event to start dragging
  const handleMouseDown = (e) => {
    if (isPlaying) {
      setIsPlaying(false);
    }
    
    setIsDragging(true);
    setStartX(e.clientX);
  };

  // Handle mouse move event to rotate the product
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    if (Math.abs(deltaX) >= 5) {
      const framesToMove = Math.floor(Math.abs(deltaX) / 5);
      if (framesToMove > 0) {
        const direction = deltaX > 0 ? 1 : -1;
        setCurrentFrame((prev) => {
          let newFrame = (prev + direction * framesToMove) % images.length;
          if (newFrame < 0) newFrame += images.length;
          return newFrame;
        });
        setStartX(e.clientX);
      }
    }
  };

  // Handle mouse up event to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle mouse leave event to stop dragging
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // Handle touch events for mobile devices
  const handleTouchStart = (e) => {
    if (isPlaying) {
      setIsPlaying(false);
    }
    
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - startX;
    if (Math.abs(deltaX) >= 5) {
      const framesToMove = Math.floor(Math.abs(deltaX) / 5);
      if (framesToMove > 0) {
        const direction = deltaX > 0 ? 1 : -1;
        setCurrentFrame((prev) => {
          let newFrame = (prev + direction * framesToMove) % images.length;
          if (newFrame < 0) newFrame += images.length;
          return newFrame;
        });
        setStartX(e.touches[0].clientX);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom in/out functions
  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  // Toggle auto-rotation
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className={`relative overflow-hidden rounded-lg bg-neutral-50 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ height: '400px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={images[currentFrame]} 
            alt={`Product view ${currentFrame + 1} of ${images.length}`}
            className="transition-transform duration-150"
            style={{ 
              transform: `scale(${zoom / 100})`,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
            draggable="false"
          />
        </div>

        {/* Frame counter */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {currentFrame + 1} / {images.length}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="flex items-center space-x-2">
          <button 
            onClick={togglePlay}
            className="p-2 rounded-full bg-neutral-200 hover:bg-neutral-300 transition-colors"
            title={isPlaying ? "Pause rotation" : "Auto-rotate"}
          >
            {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-neutral-500">Speed</span>
            <input
              type="range"
              min="10"
              max="90"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-24"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={zoomOut}
            className="p-2 rounded-full bg-neutral-200 hover:bg-neutral-300 transition-colors"
            disabled={zoom <= 50}
            title="Zoom out"
          >
            <FiZoomOut size={18} />
          </button>
          
          <span className="text-xs text-neutral-500">{zoom}%</span>
          
          <button 
            onClick={zoomIn}
            className="p-2 rounded-full bg-neutral-200 hover:bg-neutral-300 transition-colors"
            disabled={zoom >= 200}
            title="Zoom in"
          >
            <FiZoomIn size={18} />
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-2 p-2 bg-primary-50 text-primary-700 text-xs rounded text-center">
        <p className="flex items-center justify-center">
          <FiRotateCw className="mr-1" /> 
          Drag to rotate | Use controls to zoom and auto-rotate
        </p>
      </div>
    </div>
  );
};

ProductView360.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  autoRotate: PropTypes.bool,
  initialSpeed: PropTypes.number
};

export default ProductView360; 