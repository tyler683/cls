import React, { useState } from 'react';
import { db, storage } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { LayoutDashboard, ImagePlus, ShieldCheck, HardHat } from 'lucide-react';

const AdminPanel = () => {
  const [uploading, setUploading] = useState(false);
  const [projectData, setProjectData] = useState({
    name: '',
    category: 'Hardscaping',
    description: '',
    location: 'Kansas City, MO'
  });

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      // Logic to add a new project group to Firestore
      await addDoc(collection(db, "projects"), {
        ...projectData,
        images: [], // You can add a multi-file upload handler here
        createdAt: serverTimestamp(),
      });
      alert("Project created successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-4 mb-12">
          <div className="p-3 bg-green-500 rounded-2xl">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">CLS Owner Dashboard</h1>
            <p className="text-slate-400">Manage your portfolio and community presence</p>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Project Creator Form */}
          <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <HardHat className="text-green-400" /> New Project
            </h2>
            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <input 
                placeholder="Project Name" 
                className="w-full bg-slate-900 border-slate-700 rounded-xl p-3"
                onChange={e => setProjectData({...projectData, name: e.target.value})}
              />
              <select 
                className="w-full bg-slate-900 border-slate-700 rounded-xl p-3"
                onChange={e => setProjectData({...projectData, category: e.target.value})}
              >
                <option>Hardscaping</option>
                <option>Landscaping</option>
                <option>Lighting</option>
              </select>
              <textarea 
                placeholder="Description" 
                className="w-full bg-slate-900 border-slate-700 rounded-xl p-3 h-32"
                onChange={e => setProjectData({...projectData, description: e.target.value})}
              />
              <button 
                disabled={uploading}
                className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-xl font-bold transition-all"
              >
                {uploading ? "Creating..." : "Launch Project"}
              </button>
            </form>
          </div>

          {/* Quick Stats/Actions */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-green-600 to-teal-700 p-8 rounded-3xl shadow-lg">
              <h3 className="font-bold text-lg mb-2">Social Sync Active</h3>
              <p className="text-sm opacity-90">Your community posts are currently generating OpenGraph tags for Facebook and Instagram sharing.</p>
            </div>
            
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <ImagePlus className="text-blue-400" /> Gallery Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-2xl text-center">
                  <span className="block text-2xl font-bold">24</span>
                  <span className="text-xs text-slate-500 uppercase">Projects</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl text-center">
                  <span className="block text-2xl font-bold">142</span>
                  <span className="text-xs text-slate-500 uppercase">Photos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
