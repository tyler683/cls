import React, { useState } from 'react';
import { Play, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useGallery } from '../context/GalleryContext';
import { GalleryItem } from '../types';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';

type Category = 'all' | GalleryItem['category'];

const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'All Projects', value: 'all' },
  { label: 'Hardscape', value: 'hardscape' },
  { label: 'Decks', value: 'decks' },
  { label: 'Pools', value: 'pools' },
  { label: 'Demolition', value: 'demolition' },
];

const HERO_IMAGE = 'https://res.cloudinary.com/clsllc/image/upload/v1765012931/Y19jcm9wLGFyXzQ6Mw_w7fwlp.jpg';

const Gallery: React.FC = () => {
  const { projects, isLoading } = useGallery();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const filtered = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <div className="bg-brand-cream min-h-screen">
      <SEO
        title="Project Gallery | Creative Landscaping Solutions KC"
        description="Browse our portfolio of hardscape, deck, pool, and demolition projects across Kansas City. See the quality craftsmanship of Creative Landscaping Solutions."
        keywords="Kansas City landscaping gallery, hardscape portfolio KC, deck projects Missouri, pool landscaping Kansas City, CLS project photos"
      />
      <PageHero
        title="Our Work"
        subtitle="Real projects. Real craftsmanship. Kansas City proud."
        contentKey="gallery_hero_static"
        bgImage={HERO_IMAGE}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-5 py-2.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all shadow-sm ${
                activeCategory === cat.value
                  ? 'bg-brand-green text-white shadow-md'
                  : 'bg-white text-brand-dark border border-gray-200 hover:border-brand-green hover:text-brand-green'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <ImageIcon className="w-16 h-16 mb-4 opacity-40" />
            <p className="text-lg font-medium">No projects in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(item => (
              <div
                key={item.id}
                className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
                onClick={() => setLightboxItem(item)}
              >
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  {item.videoUrl ? (
                    <>
                      <img
                        src={item.videoThumbnail || item.imageUrl || ''}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 text-brand-green ml-1" />
                        </div>
                      </div>
                    </>
                  ) : item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-brand-green/90 text-white text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-sm">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-brand-dark text-lg">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-brand-dark hover:bg-white transition-all shadow-md text-xl font-bold"
              onClick={() => setLightboxItem(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="aspect-video bg-black flex items-center justify-center">
              {lightboxItem.videoUrl ? (
                <video
                  src={lightboxItem.videoUrl}
                  poster={lightboxItem.videoThumbnail || lightboxItem.imageUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : lightboxItem.imageUrl ? (
                <img
                  src={lightboxItem.imageUrl}
                  alt={lightboxItem.title}
                  className="w-full h-full object-contain"
                />
              ) : null}
            </div>
            <div className="p-6">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">{lightboxItem.category}</span>
              <h2 className="text-2xl font-serif font-bold text-brand-dark mt-1">{lightboxItem.title}</h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
