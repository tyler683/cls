import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebaseConfig'; // Ensure this path matches your repo
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Share2, Edit3, Check, X } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  location: string;
}

const Gallery = ({ isAdmin = false }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const q = query(collection(db, "projects"));
      const querySnapshot = await getDocs(q);
      const projectData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectData);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const handleShare = async (project: Project) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out this CLS Project: ${project.name}`,
          text: project.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    }
  };

  const saveEdit = async (project: Project) => {
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, {
      name: project.name,
      description: project.description
    });
    setEditingId(null);
  };

  if (loading) return <div className="p-10 text-center">Loading CLS Portfolio...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-4xl font-bold mb-8 text-slate-800">Our Projects</h2>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {projects.map((project) => (
          <motion.div 
            key={project.id}
            layout
            className="break-inside-avoid bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100"
          >
            <div className="relative group">
              <img 
                src={project.images[0]} 
                alt={project.name}
                className="w-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => handleShare(project)}
                  className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm hover:bg-white"
                >
                  <Share2 size={18} className="text-slate-700" />
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => setEditingId(project.id)}
                    className="p-2 bg-green-500 rounded-full shadow-sm hover:bg-green-600"
                  >
                    <Edit3 size={18} className="text-white" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-5">
              {editingId === project.id ? (
                <div className="space-y-3">
                  <input 
                    className="w-full p-2 border rounded"
                    value={project.name}
                    onChange={(e) => {
                      const newProjects = projects.map(p => p.id === project.id ? {...p, name: e.target.value} : p);
                      setProjects(newProjects);
                    }}
                  />
                  <textarea 
                    className="w-full p-2 border rounded"
                    value={project.description}
                    onChange={(e) => {
                      const newProjects = projects.map(p => p.id === project.id ? {...p, description: e.target.value} : p);
                      setProjects(newProjects);
                    }}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(project)} className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1"><Check size={14}/> Save</button>
                    <button onClick={() => setEditingId(null)} className="bg-slate-200 px-3 py-1 rounded flex items-center gap-1"><X size={14}/> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-slate-900">{project.name}</h3>
                  <p className="text-slate-600 mt-2 text-sm leading-relaxed">{project.description}</p>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-1 rounded">
                      {project.category}
                    </span>
                    <span className="text-xs text-slate-400">{project.location}</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
