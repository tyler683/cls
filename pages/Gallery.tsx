import React, { useState, useEffect } from 'react';
import { useGallery } from '../context/GalleryContext';
import { GalleryItem } from '../types';
import { Search, Filter, Plus, Edit2, Trash2, X, Loader2, Upload, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { ImagePickerModal } from '../components/ImagePickerModal';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';

const Gallery: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject, uploadQueue, isLoading } = useGallery();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<GalleryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<GalleryItem | null>(null);

  const categories = ['all', 'hardscape', 'pools', 'decks', 'demolition'];

  const filteredProjects = projects.filter(project => {
    const matchesCategory = filter === 'all' || project.category === filter;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddProject = () => {
    setEditingProject({
      id: `project-${Date.now()}`,
      category: 'hardscape',
      title: 'New Project',
      imageUrl: ''
    });
    setIsImagePickerOpen(true);
  };

  const handleImageSelected = async (url: string) => {
    if (editingProject) {
      const updatedProject = { ...editingProject, imageUrl: url };
      if (projects.find(p => p.id === editingProject.id)) {
        await updateProject(updatedProject);
      } else {
        await addProject(updatedProject);
      }
      setEditingProject(null);
    }
    setIsImagePickerOpen(false);
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
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
        bgImage="https://res.cloudinary.com/clsllc/image/upload/v1764902471/20180424_185402_iqlxwx.jpg"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Upload Queue Status */}
        {uploadQueue.length > 0 && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-900">Uploading {uploadQueue.length} project{uploadQueue.length > 1 ? 's' : ''}...</p>
                <p className="text-xs text-blue-600 mt-1">Your projects are being saved to the cloud.</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${
                  filter === cat
                    ? 'bg-brand-green text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-brand-green animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/600x600/cccccc/666666?text=No+Image';
                    }}
                  />
                </div>
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

        {/* Project Detail Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>  
              <div className="relative">
                <img
                  src={selectedProject.imageUrl}
                  alt={selectedProject.title}
                  className="w-full h-96 object-cover"
                />
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8">
                <p className="text-sm uppercase tracking-wider text-brand-accent font-bold mb-2">{selectedProject.category}</p>
                <h2 className="text-3xl font-bold text-brand-dark mb-4">{selectedProject.title}</h2>
                <p className="text-gray-600 leading-relaxed">
                  This project showcases our expertise in {selectedProject.category} work. 
                  Every detail was carefully crafted to create a lasting outdoor space.
                </p>
              </div>
            </div>
          </div>
        )} 

        {/* Image Picker Modal */}
        <ImagePickerModal
          isOpen={isImagePickerOpen}
          onClose={() => {
            setIsImagePickerOpen(false);
            setEditingProject(null);
          }}
          onImageSelected={handleImageSelected}
        />
      </div>
    </div>
  );
};

export default Gallery;
