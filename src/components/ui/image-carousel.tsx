'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: Array<{
    id: string;
    imageUrl: string;
    imageName?: string;
    isPrimary?: boolean;
    order?: number;
  }>;
  onRemoveImage?: (index: number) => void;
  onSetPrimary?: (index: number) => void;
  editable?: boolean;
  className?: string;
}

export function ImageCarousel({
  images,
  onRemoveImage,
  onSetPrimary,
  editable = false,
  className
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Set primary image as first if no primary is set
  useEffect(() => {
    if (images.length > 0 && !images.some(img => img.isPrimary)) {
      setCurrentIndex(0);
    } else if (images.length > 0) {
      const primaryIndex = images.findIndex(img => img.isPrimary);
      if (primaryIndex !== -1) {
        setCurrentIndex(primaryIndex);
      }
    }
  }, [images]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setTranslateX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (Math.abs(translateX) > 50) {
      if (translateX > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
    
    setTranslateX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setTranslateX(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (Math.abs(translateX) > 50) {
      if (translateX > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
    
    setTranslateX(0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setTranslateX(0);
  };

  if (images.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300", className)}>
        <div className="text-center text-gray-500">
          <p>No images uploaded</p>
          <p className="text-sm">Upload images to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative group", className)}>
      {/* Main Image Display */}
      <div
        ref={carouselRef}
        className="relative h-64 md:h-80 overflow-hidden rounded-lg bg-gray-100"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Current Image */}
        <div
          className="w-full h-full transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(${translateX}px)`,
          }}
        >
          <img
            src={images[currentIndex]?.imageUrl}
            alt={images[currentIndex]?.imageName || `Image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white text-gray-800"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white text-gray-800"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Primary Badge */}
        {images[currentIndex]?.isPrimary && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
            Primary
          </div>
        )}

        {/* Editable Controls */}
        {editable && (
          <div className="absolute bottom-2 left-2 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/80 hover:bg-white text-gray-800"
              onClick={() => onSetPrimary?.(currentIndex)}
              disabled={images[currentIndex]?.isPrimary}
            >
              Set Primary
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="bg-red-500/80 hover:bg-red-500 text-white"
              onClick={() => onRemoveImage?.(currentIndex)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Dots Navigation */}
      {images.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-200",
                index === currentIndex
                  ? "bg-primary scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                index === currentIndex
                  ? "border-primary scale-105"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <img
                src={image.imageUrl}
                alt={image.imageName || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
