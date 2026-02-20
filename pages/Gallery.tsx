import React, { useState } from 'react';
import { Play, Image as ImageIcon, Loader2, X } from 'lucide-react';
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
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-sm ${
                activeCategory === cat.value
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
            {filtered.map(project => (
              <div
                key={project.id}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => setLightboxItem(project)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={project.videoThumbnail || project.imageUrl || 'https://placehold.co/600x600/cccccc/666666?text=No+Image'}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/600x600/cccccc/666666?text=No+Image';
                    }}
                  />
                </div>
                {project.videoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 rounded-full p-4 group-hover:bg-brand-accent/80 transition-colors">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-xs uppercase tracking-wider text-brand-accent mb-2">{project.category}</p>
                    <h3 className="text-xl font-bold">{project.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxItem && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <button
            onClick={() => setLightboxItem(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div
            className="max-w-4xl w-full"
            onClick={e => e.stopPropagation()}
          >
            {lightboxItem.videoUrl ? (
              <video
                src={lightboxItem.videoUrl}
                poster={lightboxItem.videoThumbnail || lightboxItem.imageUrl || ''}
                controls
                autoPlay
                className="w-full rounded-2xl max-h-[80vh]"
              />
            ) : (
              <img
                src={lightboxItem.imageUrl || ''}
                alt={lightboxItem.title}
                className="w-full rounded-2xl max-h-[80vh] object-contain"
              />
            )}
            <div className="mt-4 text-center">
              <p className="text-xs uppercase tracking-widest text-brand-accent font-bold mb-1">{lightboxItem.category}</p>
              <h2 className="text-2xl font-bold text-white">{lightboxItem.title}</h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
