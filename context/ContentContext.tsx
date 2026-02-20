import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { IS_FIREBASE_CONFIGURED } from '../firebaseConfig';
import { subscribeToContent, updateContentImageInDb, uploadImage, blobUrlToBase64 } from '../services/firebase';

interface ContentContextType {
  images: Record<string, string>;
  updateImage: (key: string, url: string) => Promise<void>;
  getImage: (key: string, defaultUrl: string) => string;
  importContent: (data: Record<string, string>) => void;
  resetContent: () => void;
  isLoading: boolean;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dbImages, setDbImages] = useState<Record<string, string>>({});
  const [localOverrides, setLocalOverrides] = useState<Record<string, string>>({});
  const [isConnected, setIsConnected] = useState(IS_FIREBASE_CONFIGURED);
  const [isLoading, setIsLoading] = useState(true);

  // Merge DB images with local overrides (local takes precedence for optimistic UI)
  const images = useMemo(() => ({ ...dbImages, ...localOverrides }), [dbImages, localOverrides]);

  const loadDemoData = () => {
      try {
        const saved = localStorage.getItem('cls_content_images');
        if (saved) {
          setDbImages(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load content images from storage", e);
      } finally {
        setIsLoading(false);
      }
  };

  // Initialize: Connect to Firebase OR Local Storage
  useEffect(() => {
    if (isConnected) {
      // Live Mode - Listen to global content changes
      const unsubscribe = subscribeToContent(
        (liveImages) => {
          setDbImages(liveImages);
          setIsLoading(false);
        },
        (error) => {
           if (error.code === 'permission-denied') {
             console.warn("Content falling back to local storage due to permission error.");
             setIsConnected(false);
           }
           setIsLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      // Demo Mode (Local Storage)
      loadDemoData();
    }
  }, [isConnected]);

  // Save to localStorage (Only needed for Demo Mode or Fallback)
  useEffect(() => {
    if (!isConnected) {
      try {
        localStorage.setItem('cls_content_images', JSON.stringify(dbImages));
      } catch (e) {
        console.error("Failed to save content images to storage", e);
      }
    }
  }, [dbImages, isConnected]);

  const updateImage = async (key: string, url: string) => {
    if (isConnected) {
      // 1. Optimistic Update: Set local override immediately
      setLocalOverrides(prev => ({ ...prev, [key]: url }));
      try {
        let finalUrl = url;
        
        // 2. If it's a raw Data URI or Blob URL, upload to Firebase Storage first
        if (url.startsWith('data:') || url.startsWith('blob:')) {
           finalUrl = await uploadImage(url);
        }
        
        // 3. Save the permanent Storage URL to Firestore
        await updateContentImageInDb(key, finalUrl);

        // 4. Update dbImages locally immediately to prevent flicker
        setDbImages(prev => ({ ...prev, [key]: finalUrl }));

        // 5. Success - Remove local override. 
        setLocalOverrides(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });

      } catch (e) {
        console.error("Update content failed", e);
        // Fallback to local
        setDbImages(prev => ({ ...prev, [key]: url }));
        throw e;
      }
    } else {
      // Demo Mode: Ensure we store persistence-friendly base64
      let persistentUrl = url;
      if (url.startsWith('blob:')) {
        try {
          persistentUrl = await blobUrlToBase64(url);
        } catch(e) { console.warn("Blob conversion failed", e); }
      }

      setDbImages(prev => ({ ...prev, [key]: persistentUrl }));
    }
  };

  const getImage = (key: string, defaultUrl: string) => {
    return images[key] || defaultUrl;
  };

  const importContent = (data: Record<string, string>) => {
    // Merge into local state immediately regardless of connection for UI responsiveness
    setDbImages(prev => ({ ...prev, ...data }));

    if (isConnected) {
      // Sync each key to the database
      Object.entries(data).forEach(([key, url]) => {
        updateContentImageInDb(key, url);
      });
    }
  };

  const resetContent = () => {
    if (!isConnected) {
      setDbImages({});
    } else {
       alert("Cannot reset global content from here in Live mode.");
    }
  };

  return (
    <ContentContext.Provider value={{ images, updateImage, getImage, importContent, resetContent, isLoading }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent must be used within a ContentProvider');
  return context;
};