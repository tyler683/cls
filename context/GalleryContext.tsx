import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useRef } from 'react';
import { GalleryItem } from '../types';
import { IS_FIREBASE_CONFIGURED } from '../firebaseConfig';
import { subscribeToGallery, addGalleryItemToDb, updateGalleryItemInDb, deleteGalleryItemFromDb, uploadMedia, blobUrlToBase64 } from '../services/firebase';
import { diagnostics } from '../services/diagnostics';

interface ExtendedGalleryItem extends GalleryItem {
  isPending?: boolean;
  uploadProgress?: number;
  error?: string;
}

interface GalleryContextType {
  projects: ExtendedGalleryItem[];
  addProject: (item: GalleryItem) => Promise<void>;
  addProjects: (items: GalleryItem[], onProgress?: (progress: number) => void) => Promise<void>;
  updateProject: (item: GalleryItem) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  importGallery: (items: GalleryItem[]) => void;
  resetGallery: () => void;
  seedCloudData: () => Promise<void>;
  isLoading: boolean;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

const DEFAULT_PROJECTS: GalleryItem[] = [
  {
    id: 'project-new-1',
    category: 'hardscape',
    title: 'Modern Stone Patio',
    imageUrl: 'https://res.cloudinary.com/clsllc/image/upload/v1765419813/Gemini_Generated_Image_e3lqo0e3lqo0e3lq_mq0dnz.png'
  },
  {
    id: 'project-new-2',
    category: 'pools',
    title: 'Luxury Backyard Retreat',
    imageUrl: 'https://res.cloudinary.com/clsllc/image/upload/v1764997675/Stonehenge2007_07_30_fstn2v.jpg'
  },
  {
    id: 'project-new-3',
    category: 'hardscape',
    title: 'Custom Retaining Wall',
    imageUrl: 'https://res.cloudinary.com/clsllc/image/upload/v1765012931/Y19jcm9wLGFyXzQ6Mw_w7fwlp.jpg'
  },
  {
    id: 'project-new-4',
    category: 'decks',
    title: 'Premium Cedar Deck',
    imageUrl: 'https://res.cloudinary.com/clsllc/image/upload/v1765009374/Screenshot_20220503-164338_Photos_dqy3pf.jpg'
  }
];

export const GalleryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [remoteProjects, setRemoteProjects] = useState<GalleryItem[]>([]);
  const [pendingProjects, setPendingProjects] = useState<ExtendedGalleryItem[]>([]);
  const [isConnected, setIsConnected] = useState(IS_FIREBASE_CONFIGURED);
  const [isLoading, setIsLoading] = useState(true);

  // Combine remote and pending projects for the UI
  const projects = useMemo(() => {
    const remoteIds = new Set(remoteProjects.map(p => p.id));
    const filteredPending = pendingProjects.filter(p => !remoteIds.has(p.id));
    return [...filteredPending, ...remoteProjects];
  }, [pendingProjects, remoteProjects]);

  useEffect(() => {
    if (isConnected) {
      const unsubscribe = subscribeToGallery(
        (items) => {
          setRemoteProjects(items.sort((a, b) => (b.id || '').localeCompare(a.id || '')));
          setIsLoading(false);
          
          // Clean up pending items that have successfully synced
          const remoteIds = new Set(items.map(p => p.id));
          setPendingProjects(prev => prev.filter(p => !remoteIds.has(p.id)));
        },
        (error) => {
           diagnostics.log('error', "Gallery sync failed", error.message);
           if (error.code === 'permission-denied') setIsConnected(false);
           setIsLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      const saved = localStorage.getItem('cls_gallery_projects');
      setRemoteProjects(saved ? JSON.parse(saved) : DEFAULT_PROJECTS);
      setIsLoading(false);
    }
  }, [isConnected]);

  const addProjects = async (items: GalleryItem[], onProgress?: (p: number) => void) => {
    const newPendingItems = items.map(item => ({ 
      ...item, 
      isPending: true, 
      uploadProgress: 0 
    }));
    setPendingProjects(prev => [...newPendingItems, ...prev]);

    if (isConnected) {
      diagnostics.log('info', `Queueing ${items.length} projects for cloud sync...`);
      
      const totalSteps = items.length;
      let currentStep = 0;

      for (const item of items) {
        currentStep++;
        try {
          let finalUrl = item.imageUrl;
          let finalThumbnail = item.videoThumbnail;

          if (finalUrl && (finalUrl.startsWith('data:') || finalUrl.startsWith('blob:'))) {
             finalUrl = await uploadMedia(finalUrl, item.videoUrl ? 'videos' : 'gallery', (p) => {
                const baseProgress = ((currentStep - 1) / totalSteps) * 100;
                const itemProgress = (p / totalSteps);
                onProgress?.(baseProgress + itemProgress);
                
                setPendingProjects(prev => prev.map(pItem => 
                  pItem.id === item.id ? { ...pItem, uploadProgress: p } : pItem
                ));
             });
          }

          if (finalThumbnail && (finalThumbnail.startsWith('data:') || finalThumbnail.startsWith('blob:'))) {
             finalThumbnail = await uploadMedia(finalThumbnail, 'uploads');
          }

          const savedItem: GalleryItem = {
            ...item,
            imageUrl: finalUrl,
            ...(finalThumbnail !== undefined && { videoThumbnail: finalThumbnail }),
          };
          await addGalleryItemToDb(savedItem);
          diagnostics.log('success', `Project ${item.title} synced to cloud.`);
          
        } catch (e: any) {
          diagnostics.log('error', `Failed to upload project: ${item.title}`, e.message);
          setPendingProjects(prev => prev.map(pItem => 
            pItem.id === item.id ? { ...pItem, error: e.message || "Upload failed", isPending: false } : pItem
          ));
        }
      }
      
      onProgress?.(100);
    } else {
      const processed = await Promise.all(items.map(async i => {
        if (i.imageUrl?.startsWith('blob:')) {
          try {
            i.imageUrl = await blobUrlToBase64(i.imageUrl);
          } catch(err) { console.error("Blob conversion failed", err); }
        }
        return i;
      }));
      
      setRemoteProjects(prev => [...processed, ...prev]);
      setPendingProjects(prev => prev.filter(p => !items.find(i => i.id === p.id)));
      
      const saved = localStorage.getItem('cls_gallery_projects');
      const existing = saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
      localStorage.setItem('cls_gallery_projects', JSON.stringify([...processed, ...existing]));
    }
  };

  const addProject = (item: GalleryItem) => addProjects([item]);

  const updateProject = async (item: GalleryItem) => {
    if (isConnected) {
      try {
        await updateGalleryItemInDb(item);
        diagnostics.log('success', `Updated project ${item.id}`);
      } catch (e) {
        diagnostics.log('error', `Failed to update project ${item.id}`);
        console.error(e);
      }
    } else {
      setRemoteProjects(prev => {
        const next = prev.map(p => p.id === item.id ? item : p);
        localStorage.setItem('cls_gallery_projects', JSON.stringify(next));
        return next;
      });
    }
  };

  const deleteProject = async (id: string) => {
    const isPendingError = pendingProjects.find(p => p.id === id && p.error);
    if (isPendingError) {
      setPendingProjects(prev => prev.filter(p => p.id !== id));
      return;
    }

    if (isConnected) {
      try {
        await deleteGalleryItemFromDb(id);
        diagnostics.log('success', `Deleted project ${id} from database`);
      } catch (e) {
        diagnostics.log('error', `Failed to delete project ${id}`);
        console.error(e);
      }
    } else {
      setRemoteProjects(prev => {
        const next = prev.filter(p => p.id !== id);
        localStorage.setItem('cls_gallery_projects', JSON.stringify(next));
        return next;
      });
    }
  };

  const importGallery = (newItems: GalleryItem[]) => {
    if (isConnected) newItems.forEach(i => addGalleryItemToDb(i));
    else setRemoteProjects(prev => [...newItems, ...prev]);
  };

  const resetGallery = () => {
    if (!isConnected) {
      setRemoteProjects(DEFAULT_PROJECTS);
      localStorage.removeItem('cls_gallery_projects');
    } else {
       alert("Manual delete required in live mode.");
    }
  };
  
  const seedCloudData = async () => isConnected && addProjects(DEFAULT_PROJECTS);

  return (
    <GalleryContext.Provider value={{ projects, addProject, addProjects, updateProject, deleteProject, importGallery, resetGallery, seedCloudData, isLoading }}>
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) throw new Error('useGallery missing Provider');
  return context;
};