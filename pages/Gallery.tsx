import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, Play } from 'lucide-react';
import { useGallery } from '../context/GalleryContext';
import { GalleryItem } from '../types';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'All', label: 'All Projects' },
  { id: 'hardscape', label: 'Hardscaping' },
  { id: 'decks', label: 'Decks & Fences' },
  { id: 'pools', label: 'Pools & Water' },
  { id: 'demolition', label: 'Demolition' },
];

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x600/cccccc/666666?text=No+Image';

const Gallery: React.FC = () => {
  const { projects, isLoading } = useGallery();
  const [filter, setFilter] = useState('All');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const filtered = useMemo(
    () => filter === 'All' ? projects : projects.filter(p => p.category === filter),
    [projects, filter]
  );

  const openLightbox = (item: GalleryItem) => {
    setLightboxItem(item);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxItem(null);
    document.body.style.overflow = 'unset';
  };

  // Restore body scroll if component unmounts while lightbox is open
  useEffect(() => {
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="bg-brand-cream min-h-screen">
      <SEO
        title="Project Gallery — Kansas City Landscaping"
        description="Browse our portfolio of custom patios, retaining walls, decks, pools, and more across the Kansas City metro."
      />

      <PageHero
        title="Our Work"
        subtitle="A portfolio of projects we're proud to stand behind."
        contentKey="gallery_hero"
        bgImage="https://res.cloudinary.com/clsllc/image/upload/v1765009374/Screenshot_20220503-164338_Photos_dqy3pf.jpg"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-sm ${
                filter === cat.id
                  ? 'bg-brand-green text-white shadow-xl scale-105'
                  : 'bg-white text-gray-500 hover:bg-brand-green/10 border border-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 text-gray-400">
            <p className="text-lg font-medium">No projects found in this category.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group relative aspect-square overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer bg-gray-100"
                  onClick={() => openLightbox(item)}
                >
                  <img
                    src={item.videoThumbnail || item.imageUrl?.trim() || PLACEHOLDER_IMAGE}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                  />
                  {item.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/80 rounded-full flex items-center justify-center shadow-xl">
                        <Play size={24} className="text-brand-dark ml-1" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      <p className="text-[10px] uppercase tracking-wider text-brand-accent mb-1">{item.category}</p>
                      <h4 className="text-lg font-bold">{item.title}</h4>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Lightbox */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-md" />
          <div
            className="relative z-10 w-full max-w-4xl bg-white rounded-[2.5rem] overflow-hidden shadow-3xl animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 bg-brand-cream/80 hover:bg-white text-brand-dark p-2 rounded-xl transition-all z-20 shadow-sm"
            >
              <X size={24} />
            </button>
            <div className="aspect-video bg-gray-900 overflow-hidden">
              {lightboxItem.videoUrl ? (
                <video
                  src={lightboxItem.videoUrl}
                  poster={lightboxItem.videoThumbnail}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={lightboxItem.imageUrl?.trim() || PLACEHOLDER_IMAGE}
                  alt={lightboxItem.title}
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                />
              )}
            </div>
            <div className="p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent mb-2">
                {lightboxItem.category}
              </p>
              <h2 className="text-3xl font-serif font-bold text-brand-dark">{lightboxItem.title}</h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
