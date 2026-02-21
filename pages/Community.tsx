import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db, auth } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Share2, MessageCircle, Heart, Send, ExternalLink } from 'lucide-react';

interface Post {
  id: string;
  user: string;
  content: string;
  imageUrl?: string;
  likes: number;
  timestamp: any;
}

const CommunityBoard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "community"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[]);
    });
  }, []);

  const handleShare = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CLS Community Inspiration',
          text: post.content,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // Fallback: Copy to clipboard for Facebook/Instagram desktop
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied! Paste it on Social Media to share.");
    }
  };

  const submitPost = async () => {
    if (!newPost.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await addDoc(collection(db, "community"), {
      user: auth.currentUser?.displayName || "Anonymous Client",
      content: newPost,
      likes: 0,
      timestamp: serverTimestamp(),
    });
    setNewPost("");
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="bg-white rounded-3xl p-6 shadow-xl mb-12 border border-green-50">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Share Your CLS Transformation</h2>
        <textarea 
          className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition-all"
          placeholder="How does your new yard look? Tag your project..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <button 
            onClick={submitPost}
            className="bg-green-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            <Send size={18}/> Post to Community
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {posts.map((post) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={post.id} 
            className="bg-white rounded-3xl p-8 shadow-md border border-slate-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-slate-900">{post.user}</h4>
                <p className="text-xs text-slate-400">Kansas City, MO</p>
              </div>
              <button onClick={() => handleShare(post)} className="text-slate-400 hover:text-green-600 transition-colors">
                <Share2 size={20}/>
              </button>
            </div>
            
            <p className="text-slate-700 leading-relaxed mb-6">{post.content}</p>
            
            <div className="flex items-center gap-6 pt-6 border-t border-slate-50">
              <button className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors">
                <Heart size={20}/> <span className="text-sm font-medium">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors">
                <MessageCircle size={20}/> <span className="text-sm font-medium">Discuss</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CommunityBoard;
