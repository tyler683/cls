import React, { useState, useMemo } from 'react';
import { Play, Image as ImageIcon, Loader2, X, Plus, Trash2, Lock, Unlock, Check, AlertCircle, RefreshCw, Upload } from 'lucide-react';
import { useGallery } from '../context/GalleryContext';
import { GalleryItem } from '../types';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';
import { ImagePickerModal } from '../components/ImagePickerModal';

type Category = 'all' | GalleryItem['category'];

const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'All Projects', value: 'all' },
  { label: 'Hardscape', value: 'hardscape' },
  { label: 'Decks', value: 'decks' },
  { label: 'Pools', value: 'pools' },
  { label: 'Demolition', value: 'demolition' },
];

const UPLOAD_CATEGORIES: { label: string; value: GalleryItem['category'] }[] = [
  { label: 'Hardscape', value: 'hardscape' },
  { label: 'Decks', value: 'decks' },
  { label: 'Pools', value: 'pools' },
  { label: 'Demolition', value: 'demolition' },
];

const HERO_IMAGE = 'https://res.cloudinary.com/clsllc/image/upload/v1765012931/Y19jcm9wLGFyXzQ6Mw_w7fwlp.jpg';

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x600/cccccc/666666?text=No+Image';
const PLACEHOLDER_VIDEO = 'https://placehold.co/600x600/cccccc/666666?text=Video';
const LIGHTBOX_PLACEHOLDER = 'https://placehold.co/800x600/cccccc/666666?text=No+Image';

const Gallery: React.FC = () => {
  const { projects, isLoading, addProjects, deleteProject, uploadQueue, retryFailedProjects } = useGallery();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // Upload form state
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<GalleryItem['category']>('hardscape');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const filtered = useMemo(
    () => activeCategory === 'all' ? projects : projects.filter(p => p.category === activeCategory),
    [projects, activeCategory]
  );

  const failedUploads = uploadQueue.filter(p => p.uploadStatus === 'failed');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
      setAdminError('');
    } else {
      setAdminError('Incorrect password');
    }
  };

  const handleProjectClick = (project: GalleryItem) => {
    if (!isAdmin) setLightboxItem(project);
  };

  const handleImagesSelected = async (urls: string[]) => {
    if (urls.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const items: GalleryItem[] = urls.map((url, index) => ({
        id: `project-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        category: newCategory,
        title: newTitle.trim() || `New ${newCategory} project`,
        imageUrl: url,
      }));
      await addProjects(items, (progress) => setUploadProgress(progress));
      setNewTitle('');
    } catch (error) {
      console.error('Gallery upload failed:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-brand-cream min-h-screen">
      <SEO
        title="Project Gallery | Kansas City Landscaping Portfolio"
        description="Browse our portfolio of completed landscaping projects in Kansas City. View patios, retaining walls, pools, decks, and outdoor living spaces."
        keywords="Kansas City landscaping portfolio, KC outdoor projects, landscape gallery, hardscape projects KC, pool construction Missouri"
      />

      <PageHero
        title="Our Work"
        subtitle="Transforming Kansas City yards one project at a time."
        contentKey="gallery_hero"
        bgImage={HERO_IMAGE}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Admin Bar */}
        <div className="flex justify-end mb-6 relative">
          {showAdminLogin && !isAdmin && (
            <form onSubmit={handleAdminLogin} className="flex flex-col items-end gap-1 mr-2">
              <div className="flex items-center gap-1 bg-white shadow-lg p-1 rounded-full border border-gray-200 animate-in slide-in-from-right-2">
                <input
                  type="password"
                  placeholder="Password..."
                  value={adminPassword}
                  onChange={(e) => { setAdminPassword(e.target.value); setAdminError(''); }}
                  className="px-3 py-1 rounded-full text-sm outline-none w-32 bg-gray-50"
                  autoFocus
                />
                <button type="submit" className="bg-brand-green text-white p-1 rounded-full hover:bg-brand-dark"><Check size={14} /></button>
                <button type="button" onClick={() => { setShowAdminLogin(false); setAdminError(''); }} className="text-gray-400 p-1 hover:text-red-500"><X size={14} /></button>
              </div>
              {adminError && <span className="text-xs text-red-500 font-medium pr-1">{adminError}</span>}
            </form>
          )}
          <button
            onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(!showAdminLogin)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border shadow-sm ${isAdmin ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' : 'bg-white text-gray-500 border-gray-200 hover:text-brand-green hover:border-brand-green'}`}
          >
            {isAdmin ? <Unlock size={14} /> : <Lock size={14} />}
            <span className="text-xs font-bold uppercase">Admin</span>
          </button>
        </div>

        {/* Admin Upload Panel */}
        {isAdmin && (
          <div className="mb-10 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-green mb-4 flex items-center gap-2">
              <Upload size={16} /> Add Photos to Gallery
            </h3>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Project Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Custom Stone Patio"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-brand-green/20"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as GalleryItem['category'])}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-brand-green/20 bg-white"
                >
                  {UPLOAD_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setIsImagePickerOpen(true)}
                disabled={isUploading}
                className="flex items-center gap-2 px-5 py-2 bg-brand-green text-white rounded-lg font-bold text-sm hover:bg-brand-dark transition-all disabled:opacity-50 active:scale-95"
              >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {isUploading ? `Uploading ${Math.round(uploadProgress)}%` : 'Add Photo(s)'}
              </button>
            </div>

            {/* Failed uploads retry */}
            {failedUploads.length > 0 && (
              <div className="mt-4 flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <span className="text-sm text-red-700 flex-1">{failedUploads.length} upload(s) failed.</span>
                <button
                  onClick={() => retryFailedProjects()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                >
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            )}
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${
                activeCategory === cat.value
                  ? 'bg-brand-green text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-brand-green animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => handleProjectClick(project)}
              >
                <div className="aspect-square overflow-hidden relative">
                  {project.videoUrl ? (
                    <>
                      <img
                        src={project.videoThumbnail || project.imageUrl || PLACEHOLDER_VIDEO}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = PLACEHOLDER_VIDEO;
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-4">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={project.imageUrl || PLACEHOLDER_IMAGE}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-xs uppercase tracking-wider text-brand-accent mb-2">{project.category}</p>
                    <h3 className="text-xl font-bold">{project.title}</h3>
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                    className="absolute top-3 right-3 z-10 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                    title="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {lightboxItem && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxItem(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {lightboxItem.videoUrl ? (
                  <video
                    src={lightboxItem.videoUrl}
                    poster={lightboxItem.videoThumbnail || lightboxItem.imageUrl}
                    controls
                    className="w-full max-h-[60vh] rounded-t-3xl object-contain bg-black"
                  />
                ) : (
                  <img
                    src={lightboxItem.imageUrl || LIGHTBOX_PLACEHOLDER}
                    alt={lightboxItem.title}
                    className="w-full h-96 object-cover rounded-t-3xl"
                    onError={(e) => {
                      e.currentTarget.src = LIGHTBOX_PLACEHOLDER;
                    }}
                  />
                )}
                <button
                  onClick={() => setLightboxItem(null)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8">
                <p className="text-sm uppercase tracking-wider text-brand-accent font-bold mb-2">{lightboxItem.category}</p>
                <h2 className="text-3xl font-bold text-brand-dark mb-4">{lightboxItem.title}</h2>
                <p className="text-gray-600 leading-relaxed">
                  This project showcases our expertise in {lightboxItem.category} work.
                  Every detail was carefully crafted to create a lasting outdoor space.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Picker for admin uploads */}
      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onImageSelected={(url) => handleImagesSelected([url])}
        allowMultiple={true}
        onImagesSelected={handleImagesSelected}
      />
    </div>
  );
};

export default Gallery;
