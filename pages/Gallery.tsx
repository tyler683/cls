import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebaseConfig'; 
import { collection, query, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { Share2, Edit3, Check, X, MapPin, Tag } from 'lucide-react';

// New Interface for Project-Based Organization
interface Project {
  id: string;
  name: string;
  description: string;
  category: 'Hardscaping' | 'Landscaping' | 'Lighting' | 'Maintenance';
  images: { url: string; caption: string }[];
  location: string;
  isPublic: boolean;
}

const ProjectGallery = ({ isAdmin = false }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState('All');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setProjects(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Project[]);
    };
    fetchProjects();
  }, []);

  const handleNativeShare = async (project: Project) => {
    if (navigator.share) {
      await navigator.share({
        title: `CLS Project: ${project.name}`,
        text: project.description,
        url: window.location.origin + `/gallery/${project.id}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {['All', 'Hardscaping', 'Landscaping', 'Lighting'].map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-2 rounded-full transition-all ${filter === cat ? 'bg-green-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div className="max-w-7xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        <AnimatePresence>
          {projects.filter(p => filter === 'All' || p.category === filter).map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="break-inside-avoid bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 group"
            >
              <div className="relative overflow-hidden">
                <img src={project.images[0].url} alt={project.name} className="w-full hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => handleNativeShare(project)} className="p-3 bg-white/80 backdrop-blur-md rounded-full text-slate-800 hover:bg-white"><Share2 size={20}/></button>
                  {isAdmin && <button onClick={() => setEditingId(project.id)} className="p-3 bg-green-500 rounded-full text-white"><Edit3 size={20}/></button>}
                </div>
              </div>

              <div className="p-6">
                {editingId === project.id ? (
                  <div className="space-y-4">
                    <input className="w-full p-2 border rounded" defaultValue={project.name} />
                    <textarea className="w-full p-2 border rounded" defaultValue={project.description} />
                    <button className="w-full bg-green-600 text-white py-2 rounded-xl" onClick={() => setEditingId(null)}>Save Changes</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-green-600 text-xs font-bold uppercase tracking-widest mb-2">
                      <Tag size={12}/> {project.category}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{project.name}</h3>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">{project.description}</p>
                    <div className="flex items-center text-slate-400 text-xs">
                      <MapPin size={12} className="mr-1"/> {project.location}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProjectGallery;
