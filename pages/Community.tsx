import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, MessageCircle, X, ImagePlus, Play } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { Post, Comment } from '../types';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';

const REACTIONS = ['❤️', '🔥', '👏', '🌿', '💎'];
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400/cccccc/666666?text=No+Image';

const Community: React.FC = () => {
  const { posts, userReactions, addPost, addComment, toggleReaction, isLive } = useCommunity();

  // New post state
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke blob URL when component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Comment state
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setMediaFile(file);
    setIsVideo(file.type.startsWith('video/'));
  };

  const clearMedia = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setMediaFile(null);
    setIsVideo(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    setSubmitProgress(0);
    try {
      const post: Post = {
        id: crypto.randomUUID(),
        author: author.trim() || 'Anonymous Client',
        date: new Date().toLocaleDateString(),
        content: content.trim(),
        reactions: {},
        comments: [],
        ...(mediaFile && !isVideo && { imageUrl: preview || undefined }),
        ...(mediaFile && isVideo && { videoUrl: preview || undefined }),
      };
      await addPost(post, setSubmitProgress);
      setContent('');
      setAuthor('');
      clearMedia();
    } finally {
      setIsSubmitting(false);
      setSubmitProgress(0);
    }
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;
    const comment: Comment = {
      id: crypto.randomUUID(),
      author: commentAuthor.trim() || 'Anonymous',
      date: new Date().toLocaleDateString(),
      content: commentText.trim(),
    };
    addComment(postId, comment);
    setCommentText('');
    setCommentAuthor('');
    setOpenComments(null);
  };

  return (
    <div className="bg-brand-cream min-h-screen">
      <SEO
        title="Community Board — CLS Kansas City"
        description="See the latest transformations from CLS clients across the Kansas City metro. Share your own project and connect with the community."
      />

      <PageHero
        title="Community"
        subtitle="Share your transformation. Inspire your neighbors."
        contentKey="community_hero"
        bgImage="https://res.cloudinary.com/clsllc/image/upload/v1765419813/Gemini_Generated_Image_e3lqo0e3lqo0e3lq_mq0dnz.png"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {/* New Post Form */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 mb-12">
          <h2 className="text-2xl font-serif font-bold text-brand-dark mb-6">Share Your CLS Transformation</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full px-5 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green outline-none transition-all text-sm font-medium"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="How does your new yard look? Share your experience..."
              rows={4}
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green outline-none transition-all text-sm font-medium resize-none"
            />

            {/* Media Preview */}
            {preview && (
              <div className="relative rounded-2xl overflow-hidden group">
                {isVideo ? (
                  <video src={preview} className="w-full max-h-64 object-cover rounded-2xl" muted />
                ) : (
                  <img src={preview} alt="preview" className="w-full max-h-64 object-cover rounded-2xl" />
                )}
                <button
                  type="button"
                  onClick={clearMedia}
                  className="absolute top-3 right-3 bg-white/80 hover:bg-white p-1.5 rounded-xl shadow text-brand-dark"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-2">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="community-upload"
                />
                <label
                  htmlFor="community-upload"
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-brand-green cursor-pointer transition-colors"
                >
                  <ImagePlus size={16} /> Add Photo/Video
                </label>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="flex items-center gap-2 px-7 py-3 bg-brand-green text-white font-bold rounded-2xl hover:bg-brand-dark transition-all shadow-lg disabled:opacity-50 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {submitProgress > 0 ? `${Math.round(submitProgress)}%` : 'Posting...'}
                  </>
                ) : (
                  <><Send size={16} /> Post</>
                )}
              </button>
            </div>
          </form>
          {!isLive && (
            <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">
              Demo mode — posts are saved locally
            </p>
          )}
        </div>

        {/* Feed */}
        <div className="space-y-8">
          <AnimatePresence>
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-[2.5rem] shadow-md border border-gray-100 overflow-hidden"
              >
                {/* Post Media */}
                {post.videoUrl ? (
                  <div className="relative aspect-video bg-gray-900">
                    <video
                      src={post.videoUrl}
                      poster={post.videoThumbnail}
                      controls
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                        <Play size={20} className="text-brand-dark ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt={`${post.author}'s post`}
                    className="w-full max-h-96 object-cover"
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                  />
                ) : null}

                <div className="p-8">
                  {/* Author */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold text-brand-dark">{post.author}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">{post.date}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">{post.content}</p>

                  {/* Reactions */}
                  <div className="flex flex-wrap items-center gap-2 pb-5 border-b border-gray-100">
                    {REACTIONS.map((emoji) => {
                      const count = post.reactions?.[emoji] || 0;
                      const isActive = userReactions[post.id] === emoji;
                      return (
                        <button
                          key={emoji}
                          onClick={() => toggleReaction(post.id, emoji)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
                            isActive
                              ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20 scale-105'
                              : 'bg-gray-50 text-gray-500 hover:bg-brand-cream border border-transparent'
                          }`}
                        >
                          {emoji} {count > 0 && <span>{count}</span>}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setOpenComments(openComments === post.id ? null : post.id)}
                      className="ml-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-green font-bold uppercase tracking-widest transition-colors"
                    >
                      <MessageCircle size={14} /> {post.comments?.length || 0} Comment{(post.comments?.length || 0) !== 1 ? 's' : ''}
                    </button>
                  </div>

                  {/* Comments */}
                  <AnimatePresence>
                    {openComments === post.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-5 space-y-4">
                          {post.comments?.map((c) => (
                            <div key={c.id} className="bg-brand-cream rounded-2xl p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm text-brand-dark">{c.author}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{c.date}</span>
                              </div>
                              <p className="text-sm text-gray-600">{c.content}</p>
                            </div>
                          ))}
                          <div className="flex gap-2 pt-2">
                            <input
                              type="text"
                              value={commentAuthor}
                              onChange={(e) => setCommentAuthor(e.target.value)}
                              placeholder="Your name"
                              className="w-28 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50 text-xs outline-none focus:border-brand-green"
                            />
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                              placeholder="Add a comment..."
                              className="flex-1 px-4 py-2 rounded-xl border border-gray-100 bg-gray-50 text-sm outline-none focus:border-brand-green"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              className="px-4 py-2 bg-brand-green text-white rounded-xl text-xs font-bold hover:bg-brand-dark transition-all"
                            >
                              <Send size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {posts.length === 0 && (
            <div className="text-center py-24 text-gray-400">
              <p className="text-lg font-medium">No posts yet — be the first to share!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
