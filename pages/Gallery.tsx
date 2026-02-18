
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Upload, Plus, Loader2, Video, Play, X, ArrowRight, Video as VideoIcon, Image as ImageIcon, Lock, Unlock, Check, Filter, Trash2, Edit2, Sparkles, AlertTriangle } from 'lucide-react';
import { useGallery } from '../context/GalleryContext';
import { GalleryItem } from '../types';
import { ImagePickerModal } from '../components/ImagePickerModal';
// Corrected imports from firebase service
import { generateVideoThumbnail, uploadImage, uploadMedia } from '../services/firebase';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';

const Gallery: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'hardscape' | 'demolition' | 'decks' | 'pools'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  
  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  // Inline Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const { projects, addProjects, updateProject, deleteProject, isLoading } = useGallery();
  const navigate = useNavigate();

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const getCategoryTitle = (cat: string, index: number) => {
    const titles: Record<string, string[]> = {
      hardscape: ["Custom Stone Patio", "Retaining Wall Build", "Modern Paver Walkway", "Natural Stone Steps", "Outdoor Living Space"],
      demolition: ["Site Preparation", "Structure Removal", "Concrete Demolition", "Debris Clearing", "Excavation Project"],
      decks: ["Premium Cedar Deck", "Composite Decking Install", "Privacy Fence Build", "Custom Pergola", "Pool Deck Construction"],
      pools: ["Backyard Oasis", "Inground Pool Install", "Water Feature Design", "Luxury Spa Retreat", "Pool Surround Build"],
      all: ["Professional Landscaping", "Creative Exterior Solution", "Site Transformation", "Custom Installation"]
    };
    
    const pool = titles[cat] || titles.all;
    return pool[index % pool.length];
  };

  const filteredProjects = useMemo(() => {
    if (filter === 'all') return projects;
    return projects.filter(p => p.category === filter);
  }, [projects, filter]);

  const filters = [
    { id: 'all', label: 'All Projects', icon: <Filter size={14} /> },
    { id: 'hardscape', label: 'Hardscaping' },
    { id: 'demolition', label: 'Demolition' },
    { id: 'decks', label: 'Decks & Fences' },
    { id: 'pools', label: 'Pools & Water' },
  ];

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
        setIsAdmin(true);
        setShowAdminLogin(false);
        setAdminPassword('');
    } else {
        alert("Incorrect Password");
    }
  };

  const handleStartEdit = (e: React.MouseEvent, project: GalleryItem) => {
    if (!isAdmin) return;
    e.stopPropagation();
    setEditingId(project.id);
    setTempTitle(project.title);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const project = projects.find(p => p.id === editingId);
    if (project && tempTitle.trim() !== "" && tempTitle !== project.title) {
        await updateProject({ ...project, title: tempTitle });
    }
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this project?")) {
      deleteProject(id);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return null;
  };

  const handleImagesSelected = async (urls: string[]) => {
    setIsUploading(true);
    setUploadProgress(0);
    const targetCategory = filter === 'all' ? 'hardscape' : filter;
    
    try {
      const newProjects: GalleryItem[] = urls.map((url, index) => ({
          id: `user-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
          category: targetCategory, 
          imageUrl: url,
          title: getCategoryTitle(targetCategory, index)
      }));
      await addProjects(newProjects, (progress) => {
        setUploadProgress(progress);
      });
    } catch (error) {
      console.error("Selection failed", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <SEO 
        title="Project Portfolio | Creative Landscaping Solutions" 
        description="Explore our transformation gallery. View custom patios, retaining walls, and outdoor living spaces designed for Kansas City homeowners."
      />
      
      <PageHero
        title="Project Portfolio"
        subtitle="Craftsmanship and quality in every detail."
        contentKey="gallery_hero"
        bgImage="https://res.cloudinary.com/clsllc/image/upload/v1764997675/Stonehenge2007_07_30_fstn2v.jpg"
      >
        <button
          onClick={() => navigate('/services#quote')}
          className="bg-brand-accent hover:bg-brand-dark text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300"
        >
          Request Your Transformation <ArrowRight size={20} />
        </button>
      </PageHero>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative">
        
        {/* Admin Access Portal */}
        <div className="absolute top-0 right-4 z-40 flex items-center gap-2">
            {showAdminLogin && !isAdmin && (
                <form onSubmit={handleAdminLogin} className="flex items-center gap-1 bg-white shadow-2xl p-1 rounded-full border border-gray-100 animate-in slide-in-from-right-2">
                    <input 
                        type="password" 
                        placeholder="Admin Key" 
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="px-3 py-1.5 rounded-full text-xs outline-none w-28 bg-gray-50 font-bold"
                        autoFocus
                    />
                    <button type="submit" className="bg-brand-green text-white p-1.5 rounded-full hover:bg-brand-dark transition-colors"><Check size={14} /></button>
                </form>
            )}
            <button 
                onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(!showAdminLogin)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border shadow-sm ${isAdmin ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-gray-400 border-gray-100 hover:text-brand-green'}`}
            >
                {isAdmin ? <Unlock size={14} /> : <Lock size={14} />}
                <span className="text-[10px] font-bold uppercase tracking-widest">{isAdmin ? 'Admin Live' : 'Owner Access'}</span>
            </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 sm:mb-16 gap-6 border-b border-gray-50 pb-10">
           <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`group flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-tight transition-all duration-300 transform active:scale-95 ${
                  filter === f.id
                    ? 'bg-brand-green text-white shadow-xl scale-105'
                    : 'bg-brand-cream text-brand-dark/60 border border-brand-green/10 hover:bg-white hover:border-brand-green/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isAdmin && (
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
                {isUploading && (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest mb-1">Queueing {Math.round(uploadProgress)}%</span>
                    <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-brand-green h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
                <button 
                  onClick={() => setIsModalOpen(true)}
                  disabled={isUploading}
                  className="px-6 py-3 bg-brand-accent text-white font-bold rounded-xl hover:bg-amber-600 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  Add Project
                </button>
            </div>
          )}
        </div>

        {/* Project Grid */}
        {!isLoading && filteredProjects.length > 0 && (
          <div 
            key={filter} 
            className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out"
          >
            {filteredProjects.map((project: any, index: number) => (
              <div 
                key={project.id} 
                className={`group relative overflow-hidden rounded-[1.5rem] shadow-sm cursor-pointer aspect-square sm:aspect-video bg-gray-100 border border-gray-100 transition-all hover:shadow-2xl hover:-translate-y-2 ${project.isPending ? 'opacity-90' : ''}`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Pending / Error Overlays */}
                {project.error ? (
                  <div className="absolute inset-0 z-20 bg-red-500/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 text-center">
                    <AlertTriangle size={32} className="mb-2" />
                    <p className="text-sm font-bold">Upload Failed</p>
                    <p className="text-[10px] mt-1 opacity-80">{project.error}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                      className="mt-4 px-4 py-1.5 bg-white text-red-600 text-[10px] font-bold uppercase rounded-full"
                    >
                      Dismiss
                    </button>
                  </div>
                ) : project.isPending ? (
                  <div className="absolute inset-0 z-20 bg-black/30 backdrop-blur-[1px] flex flex-col items-center justify-center text-white p-4 text-center">
                    <div className="relative">
                       <Loader2 size={32} className="animate-spin mb-3" />
                       <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{Math.round(project.uploadProgress || 0)}</div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Syncing to Cloud...</p>
                  </div>
                ) : null}

                {/* Admin Actions */}
                {isAdmin && !project.isPending && !project.error && (
                  <div className="absolute top-4 right-4 z-30 flex gap-2 scale-0 group-hover:scale-100 transition-all">
                     <button 
                        onClick={(e) => handleStartEdit(e, project)}
                        className="bg-white/90 text-brand-green p-2 rounded-full shadow-lg hover:bg-brand-green hover:text-white transition-all"
                        title="Edit Title"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, project.id)}
                        className="bg-white/90 text-red-500 p-2 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all"
                        title="Delete Project"
                      >
                        <Trash2 size={18} />
                      </button>
                  </div>
                )}

                {project.videoUrl ? (
                  <div className="w-full h-full relative bg-black flex items-center justify-center" onClick={() => !project.isPending && !project.error && setActiveVideoId(project.id)}>
                    {activeVideoId === project.id ? (
                      getEmbedUrl(project.videoUrl) ? (
                        <iframe 
                          src={getEmbedUrl(project.videoUrl)!} 
                          title={project.title}
                          className="w-full h-full pointer-events-auto" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <video src={project.videoUrl} controls autoPlay className="w-full h-full object-contain" />
                      )
                    ) : (
                      <>
                        {project.videoThumbnail ? (
                            <img src={project.videoThumbnail} alt={project.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-60 transition-all duration-500" />
                        ) : (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                <VideoIcon className="text-gray-700 w-16 h-16" />
                            </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-brand-accent/90 rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                <Play size={32} className="ml-1" />
                            </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <img 
                      src={project.imageUrl || 'https://res.cloudinary.com/clsllc/image/upload/v1764901140/20250409_163720_dwlgsb.jpg'} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Visual Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-all duration-500 flex items-end p-4 sm:p-8 ${project.isPending ? 'opacity-60' : 'opacity-0 group-hover:opacity-100'}`}>
                      <div className={`transform transition-transform duration-500 w-full ${project.isPending ? 'translate-y-0' : 'translate-y-4 group-hover:translate-y-0'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-brand-accent font-bold uppercase tracking-[0.2em] text-[8px] sm:text-[10px]">
                            {filters.find(f => f.id === project.category)?.label || project.category}
                          </p>
                          {project.isPending && <Sparkles size={10} className="text-brand-accent animate-pulse" />}
                        </div>
                        
                        {editingId === project.id ? (
                           <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                             <input 
                                ref={editInputRef}
                                type="text"
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                onBlur={handleSaveEdit}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                                className="bg-white/20 border border-white/30 text-white rounded px-2 py-1 text-sm sm:text-2xl font-serif font-bold outline-none w-full backdrop-blur-sm"
                             />
                           </div>
                        ) : (
                          <div className="flex items-center gap-2 group/title" onClick={(e) => !project.isPending && !project.error && handleStartEdit(e, project)}>
                            <h3 className="text-white font-serif font-bold text-sm sm:text-2xl drop-shadow-lg leading-tight flex-grow">
                                {project.title}
                            </h3>
                            {isAdmin && !project.isPending && !project.error && <Edit2 size={16} className="text-white opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ImagePickerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        allowMultiple={true}
        onImagesSelected={handleImagesSelected}
        onImageSelected={(url) => handleImagesSelected([url])}
      />
    </div>
  );
};

export default Gallery;
