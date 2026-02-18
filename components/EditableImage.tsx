import React, { useState, useEffect } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { ImagePickerModal } from './ImagePickerModal';
import { uploadMedia } from '../services/firebase';

interface EditableImageProps {
  contentKey: string;
  defaultSrc: string;
  alt: string;
  className?: string;
  isBackground?: boolean;
  editButtonClassName?: string;
  children?: React.ReactNode;
  readOnly?: boolean;
  emptyLabel?: string;
}

const EditableImage: React.FC<EditableImageProps> = ({ 
  contentKey, 
  defaultSrc, 
  alt, 
  className = "", 
  isBackground = false,
  editButtonClassName = "",
  children,
  readOnly = true,
  emptyLabel = "Upload Photo"
}) => {
  const { getImage, updateImage } = useContent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const rawSrc = getImage(contentKey, defaultSrc);
  const preferredSrc = (rawSrc && typeof rawSrc === 'string' && rawSrc.trim() !== "") ? rawSrc : defaultSrc;
  
  const [currentSrc, setCurrentSrc] = useState(preferredSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(preferredSrc);
    setHasError(false);
  }, [preferredSrc]);

  const isPlaceholder = !currentSrc || currentSrc.trim() === "" || currentSrc.includes('placehold.co') || currentSrc.includes('Upload');

  const handleImageError = () => {
    if (!hasError && currentSrc && !isPlaceholder) {
      setHasError(true);
    }
  };

  const handleImageSelected = async (url: string) => {
    setIsUploading(true);
    setUploadProgress(0);
    setHasError(false);
    
    try {
      const permanentUrl = await uploadMedia(url, 'uploads', (progress) => {
        setUploadProgress(progress);
      });
      await updateImage(contentKey, permanentUrl);
    } catch (error) {
      console.error("Failed to save image:", error);
      alert("Upload failed. Please check your connection.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const containerBaseClass = className.includes('absolute') || className.includes('fixed') ? '' : 'relative';

  return (
    <>
      <div className={`${containerBaseClass} ${className} group overflow-hidden`}>
        {isBackground ? (
          <>
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0 bg-brand-dark">
              {currentSrc && !hasError && !isPlaceholder && (
                <img 
                  src={currentSrc} 
                  alt={alt}
                  onError={handleImageError}
                  className={`w-full h-full object-cover transition-opacity duration-700 ${isUploading ? 'blur-sm opacity-50' : 'opacity-100'}`}
                />
              )}
              
              {hasError && (
                <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-0">
                   <div className="text-center text-gray-500 p-4">
                     <ImageOff size={32} className="mx-auto mb-2 opacity-50" />
                     <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Background Unavailable</p>
                   </div>
                </div>
              )}
            </div>
            
            {/* Content Layer - Always Rendered */}
            <div className="relative z-10 w-full h-full">
              {children}
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 relative overflow-hidden">
            {!isPlaceholder && !hasError ? (
               <img 
                 src={currentSrc} 
                 alt={alt} 
                 onError={handleImageError}
                 className={`w-full h-full object-cover transition-all ${isUploading ? 'opacity-50 blur-sm' : ''}`} 
               />
            ) : (
              hasError && (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-200">
                   <ImageOff size={32} className="mb-2" />
                   <span className="text-[10px] font-bold uppercase tracking-wider">Load Error</span>
                </div>
              )
            )}
            
            {children && (
              <div className="absolute inset-0 z-10">
                {children}
              </div>
            )}
          </div>
        )}

        {/* Upload Progress Overlay */}
        {isUploading && (
           <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
              <div className="bg-white/90 p-4 rounded-2xl shadow-2xl flex flex-col items-center min-w-[120px]">
                <Loader2 size={24} className="text-brand-green animate-spin mb-2" />
                <span className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-2">
                  {Math.round(uploadProgress)}%
                </span>
                <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                   <div 
                      className="bg-brand-green h-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                </div>
              </div>
           </div>
        )}
      </div>

      <ImagePickerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImageSelected={handleImageSelected}
      />
    </>
  );
};

export default EditableImage;