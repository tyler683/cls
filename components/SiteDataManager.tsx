import React, { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, Save, Check, AlertCircle, X, Database, Sparkles, Loader2 } from 'lucide-react';
import { useGallery } from '../context/GalleryContext';
import { useContent } from '../context/ContentContext';
import { useCommunity } from '../context/CommunityContext';
import { IS_FIREBASE_CONFIGURED } from '../firebaseConfig';

interface SiteDataManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SiteDataManager: React.FC<SiteDataManagerProps> = ({ isOpen, onClose }) => {
  const { projects, importGallery, resetGallery, seedCloudData: seedGallery } = useGallery();
  const { images, importContent, resetContent } = useContent();
  const { posts, importPosts, resetPosts, seedCloudData: seedCommunity } = useCommunity();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleBackup = () => {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        gallery: projects,
        content: images,
        community: posts
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `creative-landscaping-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Data file downloaded successfully!' });
    } catch (error) {
      console.error("Backup failed", error);
      setMessage({ type: 'error', text: 'Failed to create backup file.' });
    }
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        let count = 0;

        if (json.gallery && Array.isArray(json.gallery)) {
          importGallery(json.gallery);
          count++;
        }
        
        if (json.content && typeof json.content === 'object') {
          importContent(json.content);
          count++;
        }

        if (json.community && Array.isArray(json.community)) {
          importPosts(json.community);
          count++;
        }
        
        if (count > 0) {
          setMessage({ type: 'success', text: 'Data merged successfully! No existing data was deleted.' });
        } else {
           setMessage({ type: 'error', text: 'No recognizable data found in file.' });
        }
      } catch (error) {
        console.error("Restore failed", error);
        setMessage({ type: 'error', text: 'Invalid data file.' });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    if (window.confirm('Are you sure? This will delete all your uploads, gallery items, and community posts. This cannot be undone unless you have a backup.')) {
      resetGallery();
      resetContent();
      resetPosts();
      setMessage({ type: 'success', text: 'Site reset to factory defaults.' });
    }
  };

  const handleSeedCloud = async () => {
    if (!IS_FIREBASE_CONFIGURED) {
       setMessage({ type: 'error', text: 'Cannot seed in demo mode. Connect Firebase first.' });
       return;
    }
    
    if (window.confirm('This will upload the default demo content (photos, posts) to your live database. Continue?')) {
        setIsSeeding(true);
        try {
            await Promise.all([
                seedGallery(),
                seedCommunity()
            ]);
            setMessage({ type: 'success', text: 'Success! Your cloud database is now populated with demo content.' });
        } catch (e) {
            console.error(e);
            setMessage({ type: 'error', text: 'Error seeding data. Check console.' });
        } finally {
            setIsSeeding(false);
        }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-brand-cream">
          <div className="flex items-center gap-2">
            <Database className="text-brand-green" size={20} />
            <h3 className="text-lg font-serif font-bold text-brand-dark">Manage Site Data</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-600">
            Export your posts and projects to a file to share them or save a backup. 
            Importing a file will <strong>add</strong> to your existing data (it won't delete anything).
          </p>

          <div className="grid grid-cols-1 gap-4">
            {/* Seed Button (Only shows if live and potentially empty, but safe to show always) */}
            {IS_FIREBASE_CONFIGURED && (
                <button 
                onClick={handleSeedCloud}
                disabled={isSeeding}
                className="flex items-center justify-between p-4 border border-purple-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group relative overflow-hidden"
                >
                <div className="flex items-center gap-3 relative z-10">
                    <div className="bg-purple-100 text-purple-600 p-2 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    {isSeeding ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                    </div>
                    <div className="text-left">
                    <span className="block font-bold text-gray-800">Seed Demo Data</span>
                    <span className="text-xs text-gray-500">Populate empty DB with sample content</span>
                    </div>
                </div>
                </button>
            )}

            <button 
              onClick={handleBackup}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-brand-green hover:bg-brand-green/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Download size={20} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-gray-800">Export / Backup</span>
                  <span className="text-xs text-gray-500">Download .json file</span>
                </div>
              </div>
              <Save size={16} className="text-gray-400" />
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-brand-green hover:bg-brand-green/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-100 text-green-600 p-2 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <Upload size={20} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-gray-800">Import & Merge</span>
                  <span className="text-xs text-gray-500">Add data from .json file</span>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleRestore} 
                accept=".json" 
                className="hidden" 
              />
            </button>

            <button 
              onClick={handleReset}
              className="flex items-center justify-between p-4 border border-red-100 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-100 text-red-600 p-2 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <RotateCcw size={20} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-gray-800">Reset All</span>
                  <span className="text-xs text-gray-500">Clear all customizations</span>
                </div>
              </div>
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};