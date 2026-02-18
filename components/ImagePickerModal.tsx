import React, { useState, useRef, useEffect } from 'react';
import { Upload, Link as LinkIcon, X, Check, Loader2, Cloud, AlertCircle, Layers, Video, Image as ImageIcon, AlertTriangle, Download, ArrowRight } from 'lucide-react';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected: (url: string) => void;
  allowMultiple?: boolean;
  onImagesSelected?: (urls: string[]) => void;
  allowVideo?: boolean;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Optimizes an image file for web viewing using high-performance canvas APIs.
 */
const compressImage = async (file: File, onProgress?: (step: string) => void): Promise<string> => {
  // Support for standard formats
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  
  if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
     throw new Error("Apple HEIC/HEIF photos detected. Please download as JPEG or take a screenshot to upload.");
  }

  onProgress?.("Reading file...");
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const dataUrl = e.target?.result as string;
        
        onProgress?.("Decoding image...");
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        img.onload = () => {
          onProgress?.("Optimizing...");
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_DIMENSION = 2048; // Sufficient for 4K viewing
          if (width > height) {
            if (width > MAX_DIMENSION) {
              height *= MAX_DIMENSION / width;
              width = MAX_DIMENSION;
            }
          } else {
            if (height > MAX_DIMENSION) {
              width *= MAX_DIMENSION / height;
              height = MAX_DIMENSION;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d', { alpha: false });
          if (!ctx) return reject(new Error("Canvas context failed"));
          
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          
          onProgress?.("Finalizing...");
          // WebP is significantly smaller with minimal loss
          canvas.toBlob((blob) => {
            if (blob) resolve(URL.createObjectURL(blob));
            else reject(new Error("Blob conversion failed"));
          }, 'image/webp', 0.82);
        };
        
        img.onerror = () => reject(new Error("Image decode failed"));
        img.src = dataUrl;
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
};

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({ 
  isOpen, 
  onClose, 
  onImageSelected,
  allowMultiple = false,
  onImagesSelected,
  allowVideo = false
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'upload' | 'bulk'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGooglePhoto, setIsGooglePhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setIsProcessing(false);
      setUrlInput('');
      setBulkInput('');
      setIsGooglePhoto(false);
      setActiveTab('upload');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      setErrorMsg(null);
      
      try {
        const files = Array.from(e.target.files) as File[];
        const results: string[] = [];
        let skippedCount = 0;

        for (const file of files) {
          if (file.size > MAX_FILE_SIZE_BYTES) {
            skippedCount++;
            continue;
          }

          try {
            if (file.type.startsWith('video/')) {
               if (!allowVideo) continue;
               results.push(URL.createObjectURL(file));
            } else {
               const blobUrl = await compressImage(file, setProcessingStep);
               results.push(blobUrl);
            }
          } catch (err: any) {
             console.error(err);
             setErrorMsg(err.message || "Failed to process one or more images.");
          }
        }

        if (skippedCount > 0) {
          setErrorMsg(`Skipped ${skippedCount} files exceeding 10MB.`);
        }

        if (results.length > 0) {
          if (allowMultiple && onImagesSelected) onImagesSelected(results);
          else onImageSelected(results[0]);
          handleClose();
        }
      } catch (error: any) {
        setErrorMsg(error.message || "Upload failed.");
      } finally {
        setIsProcessing(false);
        setProcessingStep('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    setIsGooglePhoto(val.includes('photos.google.com') || val.includes('photos.app.goo.gl'));
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGooglePhoto) return;
    if (urlInput.trim()) {
      onImageSelected(urlInput);
      handleClose();
    }
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const urls = bulkInput.split(/[\n,]+/).map(u => u.trim()).filter(u => u.length > 0);
    if (urls.length > 0) {
      if (allowMultiple && onImagesSelected) onImagesSelected(urls);
      else onImageSelected(urls[0]);
      handleClose();
    }
  };

  const handleClose = () => {
    setErrorMsg(null);
    setIsProcessing(false);
    onClose();
  };

  const acceptTypes = allowVideo 
    ? "image/*, video/*"
    : "image/*";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md md:max-w-xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-100 flex-shrink-0 bg-brand-cream">
          <h3 className="text-lg font-serif font-bold text-brand-dark">
            {allowVideo ? 'Select Media' : 'Select Image'}
          </h3>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-gray-100 overflow-x-auto">
          <button onClick={() => setActiveTab('upload')} className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider ${activeTab === 'upload' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-400'}`}>Device</button>
          <button onClick={() => setActiveTab('url')} className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider ${activeTab === 'url' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-400'}`}>URL</button>
          {allowMultiple && <button onClick={() => setActiveTab('bulk')} className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider ${activeTab === 'bulk' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-400'}`}>Bulk</button>}
        </div>

        <div className="flex-grow overflow-y-auto relative p-6">
          {isProcessing && (
             <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center text-center p-4">
                 <Loader2 className="w-10 h-10 text-brand-green animate-spin mb-4" />
                 <span className="text-sm font-bold text-brand-dark uppercase tracking-widest">{processingStep || 'Processing...'}</span>
                 <p className="text-xs text-gray-500 mt-2">Optimizing file for fast loading.</p>
             </div>
          )}
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-100 animate-in slide-in-from-top-1">
               <AlertCircle size={16} className="shrink-0" />
               <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={acceptTypes} multiple={allowMultiple} className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-12 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-brand-green hover:bg-brand-green/5 transition-all group"
              >
                <Upload className="w-12 h-12 text-gray-300 group-hover:text-brand-green mb-4 transition-colors" />
                <span className="font-bold text-gray-600 group-hover:text-brand-green">Tap to Select Files</span>
                <span className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Max 10MB per file</span>
              </button>
            </div>
          )}

          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="url"
                  value={urlInput}
                  onChange={handleUrlInput}
                  placeholder="https://..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
                  autoFocus
                />
              </div>
              
              {isGooglePhoto && (
                <div className="p-4 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 mb-2 font-bold uppercase"><AlertTriangle size={14} /> Google Photos Warning</div>
                  Google Photos links expire. Please <strong>Download</strong> the photo to your device first, then use <strong>Device Upload</strong>.
                </div>
              )}
              
              <button type="submit" disabled={!urlInput.trim() || isGooglePhoto} className="w-full py-3 bg-brand-green text-white rounded-lg font-bold hover:bg-brand-dark disabled:opacity-50">Use Link</button>
            </form>
          )}

          {activeTab === 'bulk' && (
             <form onSubmit={handleBulkSubmit} className="space-y-4">
               <textarea
                 value={bulkInput}
                 onChange={(e) => setBulkInput(e.target.value)}
                 placeholder={'https://...\nhttps://...'}
                 className="w-full px-4 py-3 rounded-lg border border-gray-300 min-h-[150px] font-mono text-xs"
               />
               <button type="submit" className="w-full py-3 bg-brand-green text-white rounded-lg font-bold">Import All</button>
             </form>
          )}
        </div>
      </div>
    </div>
  );
};