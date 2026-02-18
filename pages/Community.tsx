import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Video, MessageCircle, User, X, Sparkles, PartyPopper, Share2, Lock, Unlock, Trash2, Facebook, Twitter, Linkedin, Mail, Link as LinkIcon, Check, SmilePlus, Loader2, FileVideo, Play } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { ImagePickerModal } from '../components/ImagePickerModal';
import { Post, Comment } from '../types';
import { generateVideoThumbnail } from '../services/firebase';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';

const REACTIONS = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Haha' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🎉', label: 'Party' },
];

const Community: React.FC = () => {
  const { posts, userReactions, addPost, addComment, toggleReaction, deletePost, isLive } = useCommunity();
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  
  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  // Share Modal State
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Reaction Picker State
  const [activeReactionId, setActiveReactionId] = useState<string | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  
  // Comment Section State
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  
  // Form State
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Video State
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [justPosted, setJustPosted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Close reaction picker when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveReactionId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !selectedImage && !videoUrl && !videoFile) || isUploading) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let finalThumbnailUrl = '';
      let videoToUpload: any = videoFile;

      // Prepare local video for processing if needed
      if (videoFile) {
        try {
            const thumbBlob = await generateVideoThumbnail(videoFile);
            finalThumbnailUrl = URL.createObjectURL(thumbBlob);
        } catch (err) {
            console.warn("Could not generate thumbnail", err);
        }
      }

      const postTemplate: Post = {
        id: `post-${Date.now()}`,
        author: authorName || 'Mystery Gardener',
        content,
        date: new Date().toLocaleDateString(),
        imageUrl: selectedImage || undefined,
        videoUrl: videoFile ? URL.createObjectURL(videoFile) : (videoUrl || undefined),
        videoThumbnail: finalThumbnailUrl || undefined,
        reactions: {},
        comments: []
      };

      // Let context handle the heavy lifting of sequential uploads
      await addPost(postTemplate, (progress) => {
        setUploadProgress(progress);
      });
      
      setJustPosted(true);
      setTimeout(() => setJustPosted(false), 3000);

      // Reset form
      setAuthorName('');
      setContent('');
      setSelectedImage(null);
      setVideoUrl('');
      setVideoFile(null);
      setShowVideoInput(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error("Error creating post:", error);
      alert("Something went wrong while posting. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePostComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: commentAuthor || 'Guest',
      content: commentText,
      date: new Date().toLocaleDateString()
    };

    addComment(postId, newComment);
    setCommentText('');
    setCommentAuthor('');
  };

  const toggleComments = (postId: string) => {
    setOpenCommentsId(openCommentsId === postId ? null : postId);
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

  const openShareModal = (post: Post) => {
    setSharePost(post);
    setCopiedLink(false);
  };

  const handleReactionClick = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    setActiveReactionId(activeReactionId === postId ? null : postId);
  };

  const handleSocialShare = (platform: 'facebook' | 'twitter' | 'linkedin' | 'email') => {
    if (!sharePost) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this post by ${sharePost.author}: "${sharePost.content.substring(0, 100)}..."`);
    let shareUrl = '';
    switch (platform) {
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`; break;
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`; break;
      case 'linkedin': shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`; break;
      case 'email': shareUrl = `mailto:?subject=${encodeURIComponent(`Community Post by ${sharePost.author}`)}&body=${text}%0A%0ARead more at: ${url}`; break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setSharePost(null);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => {
        setCopiedLink(false);
        setSharePost(null);
    }, 1500);
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl('');
    }
  };

  return (
    <div className="bg-brand-cream min-h-screen relative overflow-hidden">
      <SEO 
        title="KC Landscaping Community Board" 
        description="Join our Kansas City landscaping community. Share yard transformation stories, view customer reviews, and connect with other local homeowners in MO."
      />
      <PageHero
        title="Community Board"
        subtitle="Get creative ideas, see projects from other clients, and share your vision."
        contentKey="community_hero"
        bgImage="https://res.cloudinary.com/clsllc/image/upload/v1765009374/Screenshot_20220503-164338_Photos_dqy3pf.jpg"
      />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        
        <div className="text-center mb-12 relative">
          <div className="absolute right-0 top-0 z-50 flex items-center gap-2">
            {showAdminLogin && !isAdmin && (
                <form onSubmit={handleAdminLogin} className="flex items-center gap-1 bg-white shadow-lg p-1 rounded-full border border-gray-200 animate-in slide-in-from-right-2">
                    <input 
                        type="password" 
                        placeholder="Password..." 
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="px-3 py-1 rounded-full text-sm outline-none w-32 bg-gray-50"
                        autoFocus
                    />
                    <button type="submit" className="bg-brand-green text-white p-1 rounded-full hover:bg-brand-dark"><Check size={14} /></button>
                    <button type="button" onClick={() => setShowAdminLogin(false)} className="text-gray-400 p-1 hover:text-red-500"><X size={14} /></button>
                </form>
            )}

            <button 
                onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(!showAdminLogin)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border shadow-sm ${isAdmin ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' : 'bg-white text-gray-500 border-gray-200 hover:text-brand-green hover:border-brand-green'}`}
            >
                {isAdmin ? <Unlock size={14} /> : <Lock size={14} />}
                <span className="text-xs font-bold uppercase">{isAdmin ? 'Admin' : 'Admin'}</span>
            </button>
          </div>

          <a href="https://www.facebook.com/profile.php?id=61584560035614" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-accent/10 text-brand-accent font-bold rounded-full text-sm uppercase tracking-wider mb-4 animate-bounce hover:bg-brand-accent hover:text-white transition-colors">
            <Sparkles size={16} /> Join the Family
          </a>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border-t-8 border-brand-accent transform transition-transform hover:scale-[1.01] duration-300 relative">
          {justPosted && (
            <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl animate-in fade-in duration-300">
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4"><Check size={32} /></div>
               <h3 className="text-2xl font-bold text-brand-dark">Posted!</h3>
               <p className="text-gray-500">Your post is live.</p>
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl">
               <Loader2 size={48} className="text-brand-green animate-spin mb-4" />
               <h3 className="text-xl font-bold text-brand-dark">Uploading to Cloud...</h3>
               {uploadProgress > 0 && (
                  <div className="w-48 bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
                     <div className="bg-brand-green h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
               )}
               <p className="text-gray-500 mt-2 font-bold">{Math.round(uploadProgress)}%</p>
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-brand-cream flex items-center justify-center text-2xl shadow-inner">👋</div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Create a Post</h3>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Share the vibe</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6 space-y-4">
              <input type="text" placeholder="Who's this rockstar? (Optional Name)" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="w-full px-5 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all font-medium text-gray-700 placeholder:text-gray-400" />
              <textarea placeholder="What's growing on? Share your story..." value={content} onChange={(e) => setContent(e.target.value)} className="w-full px-5 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 min-h-[120px] resize-none transition-all text-lg text-gray-700 placeholder:text-gray-400" />
            </div>

            {selectedImage && (
              <div className="relative mb-6 inline-block group">
                <img src={selectedImage} alt="Preview" className="h-40 rounded-xl object-cover shadow-md border-2 border-white transform rotate-2" />
                <button type="button" onClick={() => setSelectedImage(null)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors hover:scale-110"><X size={16} /></button>
              </div>
            )}

            {videoFile && (
               <div className="relative mb-6 inline-block group">
                 <div className="h-20 px-4 bg-gray-100 border-2 border-brand-green rounded-xl flex items-center gap-3">
                   <FileVideo className="text-brand-green" />
                   <div><p className="font-bold text-sm truncate max-w-[200px]">{videoFile.name}</p><p className="text-xs text-gray-500">Ready to upload</p></div>
                   <button type="button" onClick={() => setVideoFile(null)} className="ml-2 bg-gray-200 hover:bg-red-500 hover:text-white rounded-full p-1 transition-colors"><X size={14} /></button>
                 </div>
               </div>
            )}
            
            {showVideoInput && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Video Source</span>
                    <button type="button" onClick={() => { setShowVideoInput(false); setVideoFile(null); setVideoUrl(''); }}><X size={16} className="text-gray-400 hover:text-red-500" /></button>
                 </div>
                 <div className="flex flex-col gap-3">
                    <input type="url" placeholder="Paste YouTube/Vimeo Link" value={videoUrl} disabled={!!videoFile} onChange={(e) => setVideoUrl(e.target.value)} className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-brand-green disabled:bg-gray-100 disabled:text-gray-400" />
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase"><div className="h-px bg-gray-300 flex-1"></div> OR <div className="h-px bg-gray-300 flex-1"></div></div>
                    <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={handleVideoFileSelect} />
                    <button type="button" disabled={!!videoUrl} onClick={() => videoInputRef.current?.click()} className={`w-full py-2 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 font-bold text-sm ${videoUrl ? 'bg-gray-100 border-gray-200 text-gray-400' : 'bg-white border-gray-300 text-gray-600 hover:border-brand-green hover:text-brand-green'}`}>{videoFile ? <Check size={16} /> : <FileVideo size={16} />}{videoFile ? 'File Selected' : 'Upload Video File'}</button>
                 </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-100 gap-4">
              <div className="flex space-x-2 w-full sm:w-auto">
                <button type="button" onClick={() => setIsImagePickerOpen(true)} className="flex-1 sm:flex-none py-2 px-4 text-gray-600 hover:bg-brand-cream hover:text-brand-green rounded-lg transition-all flex items-center justify-center gap-2 font-bold text-sm border border-transparent hover:border-brand-green/20"><ImageIcon size={18} /> Add Photo</button>
                <button type="button" onClick={() => setShowVideoInput(!showVideoInput)} className={`flex-1 sm:flex-none py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 font-bold text-sm border ${showVideoInput ? 'bg-brand-cream text-brand-green border-brand-green/20' : 'text-gray-600 hover:bg-brand-cream hover:text-brand-green border-transparent hover:border-brand-green/20'}`}><Video size={18} /> Add Video</button>
              </div>
              <button type="submit" disabled={!content && !selectedImage && !videoUrl && !videoFile} className={`w-full sm:w-auto px-8 py-3 bg-brand-green text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-green/30 ${!content && !selectedImage && !videoUrl && !videoFile ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-brand-accent hover:shadow-brand-accent/30 hover:-translate-y-1'}`}>Share the Love <Send size={18} className="ml-1" /></button>
            </div>
          </form>
        </div>

        <div className="space-y-8">
          {posts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200"><div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-pulse">🌱</div><h3 className="text-2xl font-bold text-gray-800 mb-2">The lawn is clear!</h3><p className="text-gray-500">Be the first to plant a post here.</p></div>
          ) : (
            posts.map((post) => {
              const myReaction = userReactions[post.id];
              const totalReactions: number = (Object.values(post.reactions || {}) as number[]).reduce((a: number, b: number) => a + b, 0);
              const commentsCount: number = post.comments ? post.comments.length : 0;
              const isCommentsOpen = openCommentsId === post.id;
              const isVideoPlaying = playingVideoId === post.id;

              return (
                <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 relative group">
                  {isAdmin && <button onClick={() => deletePost(post.id)} className="absolute top-4 right-4 z-10 bg-white text-red-500 p-2 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-all border border-red-100"><Trash2 size={20} /></button>}
                  <div className="p-5 flex items-center gap-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-accent to-orange-400 rounded-full flex items-center justify-center text-white shadow-md"><User size={24} /></div>
                    <div><h3 className="font-bold text-brand-dark text-lg">{post.author}</h3><p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{post.date}</p></div>
                  </div>
                  <div className="p-6">
                    {post.content && <p className="text-gray-700 mb-6 whitespace-pre-wrap text-lg leading-relaxed">{post.content}</p>}
                    {post.imageUrl && <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-gray-100 group"><img src={post.imageUrl} alt="Post" className="w-full max-h-[600px] object-cover transition-transform duration-700 group-hover:scale-105" /></div>}
                    {post.videoUrl && (
                       <div className="mb-6 aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                         {isVideoPlaying ? (
                           getEmbedUrl(post.videoUrl) ? (
                             <iframe src={getEmbedUrl(post.videoUrl)!} title="Video" className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                           ) : (
                             <video src={post.videoUrl} controls autoPlay className="w-full h-full object-contain" />
                           )
                         ) : (
                            <div className="w-full h-full relative cursor-pointer group/video" onClick={() => setPlayingVideoId(post.id)}>
                                {post.videoThumbnail ? <img src={post.videoThumbnail} alt="Thumbnail" className="w-full h-full object-cover opacity-90 group-hover/video:opacity-70 transition-opacity" /> : <div className="w-full h-full bg-gray-900 flex items-center justify-center"><Video size={48} className="text-gray-600" /></div>}
                                <div className="absolute inset-0 flex items-center justify-center"><div className="w-20 h-20 bg-brand-accent/90 rounded-full flex items-center justify-center text-white shadow-2xl group-hover/video:scale-110 transition-transform"><Play size={40} className="ml-1" /></div></div>
                            </div>
                         )}
                       </div>
                    )}
                    {totalReactions > 0 && <div className="flex gap-1 mb-4">{Object.entries(post.reactions || {}).map(([emoji, count]) => <div key={emoji} className="bg-gray-50 px-2 py-1 rounded-full text-xs font-bold text-gray-600 flex items-center gap-1 border border-gray-100"><span>{emoji}</span><span>{count}</span></div>)}</div>}
                    <div className="flex items-center gap-4 mt-2 relative">
                      <div className="relative">
                         {activeReactionId === post.id && (
                            <div className="absolute bottom-full left-0 mb-3 bg-white shadow-xl rounded-full p-2 flex gap-2 border border-gray-100 animate-in slide-in-from-bottom-2 fade-in z-20" onClick={(e) => e.stopPropagation()}>
                               {REACTIONS.map((r) => <button key={r.emoji} onClick={() => { toggleReaction(post.id, r.emoji); setActiveReactionId(null); }} className={`w-9 h-9 flex items-center justify-center text-xl rounded-full hover:scale-125 transition-transform ${myReaction === r.emoji ? 'bg-brand-cream border border-brand-green/20' : 'hover:bg-gray-100'}`} title={r.label}>{r.emoji}</button>)}
                            </div>
                         )}
                         <button onClick={(e) => handleReactionClick(e, post.id)} className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all font-bold relative ${myReaction ? 'bg-brand-cream text-brand-dark border border-brand-green/20' : 'hover:bg-gray-100 text-gray-500'}`}>{myReaction ? <span className="text-xl">{myReaction}</span> : <SmilePlus size={20} className="group-hover:scale-110 transition-transform" />}<span>{myReaction ? 'Reacted' : 'React'}</span></button>
                      </div>
                      <button onClick={() => toggleComments(post.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all font-bold ${isCommentsOpen ? 'bg-gray-100 text-brand-dark' : 'hover:bg-gray-100 text-gray-500'}`}><MessageCircle size={20} /><span>{commentsCount > 0 ? `${commentsCount} Comments` : 'Comment'}</span></button>
                      <div className="flex-grow"></div>
                      <button onClick={() => openShareModal(post)} className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 text-gray-500 transition-all font-bold"><Share2 size={20} /><span className="hidden sm:inline">Share</span></button>
                    </div>

                    {isCommentsOpen && (
                      <div className="mt-6 pt-6 border-t border-gray-100 animate-in slide-in-from-top-2">
                        {post.comments && post.comments.length > 0 && (
                          <div className="space-y-4 mb-6">
                            {post.comments.map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-cream flex items-center justify-center text-xs font-bold text-brand-dark shrink-0">{comment.author.charAt(0).toUpperCase()}</div>
                                <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none flex-grow"><div className="flex justify-between items-baseline mb-1"><span className="font-bold text-sm text-gray-800">{comment.author}</span><span className="text-xs text-gray-400">{comment.date}</span></div><p className="text-sm text-gray-700">{comment.content}</p></div>
                              </div>
                            ))}
                          </div>
                        )}
                        <form onSubmit={(e) => handlePostComment(e, post.id)} className="flex flex-col gap-3">
                           <input type="text" placeholder="Name (Optional)" value={commentAuthor} onChange={(e) => setCommentAuthor(e.target.value)} className="w-full sm:w-1/3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-green" />
                           <div className="flex gap-2">
                             <input type="text" placeholder="Add a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="flex-grow px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/20" />
                             <button type="submit" disabled={!commentText.trim()} className={`p-3 rounded-xl flex items-center justify-center transition-colors ${commentText.trim() ? 'bg-brand-green text-white hover:bg-brand-accent' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}><Send size={18} /></button>
                           </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {sharePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSharePost(null)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-sm relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50"><h3 className="font-bold text-gray-800">Share Post</h3><button onClick={() => setSharePost(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button></div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-6 line-clamp-2 italic">"{sharePost.content}"</p>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <button onClick={() => handleSocialShare('facebook')} className="flex flex-col items-center gap-2 group"><div className="w-12 h-12 bg-[#1877F2]/10 text-[#1877F2] rounded-full flex items-center justify-center group-hover:bg-[#1877F2] group-hover:text-white transition-all"><Facebook size={24} /></div><span className="text-xs font-bold text-gray-600">Facebook</span></button>
                <button onClick={() => handleSocialShare('twitter')} className="flex flex-col items-center gap-2 group"><div className="w-12 h-12 bg-black/5 text-black rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all"><Twitter size={24} /></div><span className="text-xs font-bold text-gray-600">X</span></button>
                <button onClick={() => handleSocialShare('linkedin')} className="flex flex-col items-center gap-2 group"><div className="w-12 h-12 bg-[#0077b5]/10 text-[#0077b5] rounded-full flex items-center justify-center group-hover:bg-[#0077b5] group-hover:text-white transition-all"><Linkedin size={24} /></div><span className="text-xs font-bold text-gray-600">LinkedIn</span></button>
                <button onClick={() => handleSocialShare('email')} className="flex flex-col items-center gap-2 group"><div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center group-hover:bg-gray-600 group-hover:text-white transition-all"><Mail size={24} /></div><span className="text-xs font-bold text-gray-600">Email</span></button>
              </div>
              <button onClick={handleCopyLink} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-bold text-gray-700">{copiedLink ? <Check size={18} className="text-green-600" /> : <LinkIcon size={18} />}{copiedLink ? 'Link Copied!' : 'Copy Link'}</button>
            </div>
          </div>
        </div>
      )}

      <ImagePickerModal isOpen={isImagePickerOpen} onClose={() => setIsImagePickerOpen(false)} onImageSelected={(url) => setSelectedImage(url)} />
    </div>
  );
};

export default Community;