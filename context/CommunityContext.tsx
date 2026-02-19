import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Post, Comment } from '../types';
import { IS_FIREBASE_CONFIGURED } from '../firebaseConfig';
import { subscribeToPosts, addPostToDb, updatePostInDb, deletePostFromDb, uploadMedia, blobUrlToBase64 } from '../services/firebase';
import { diagnostics } from '../services/diagnostics';

interface CommunityContextType {
  posts: Post[];
  userReactions: Record<string, string>; // postId -> reactionEmoji
  addPost: (post: Post, onProgress?: (progress: number) => void) => Promise<void>;
  addComment: (postId: string, comment: Comment) => void;
  toggleReaction: (id: string, emoji: string) => void;
  deletePost: (id: string) => void;
  importPosts: (posts: any[]) => void;
  resetPosts: () => void;
  seedCloudData: () => Promise<void>;
  isLive: boolean;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

const DEFAULT_POSTS: Post[] = [
  {
    id: 'default-1',
    author: 'Tyler Dennison',
    date: '10/24/2023',
    content: 'Welcome to the new Creative Landscaping Solutions community board! 🌿\n\nWe built this space for our clients to share their backyard transformations, ask questions, and get inspired. Feel free to post photos of your latest projects!',
    imageUrl: 'https://res.cloudinary.com/clsllc/image/upload/v1766382368/Tyler_Dennison_pnrgof_uinic3.jpg',
    reactions: { '❤️': 12, '🎉': 5 },
    comments: [
      {
        id: 'c1',
        author: 'Sarah Jenkins',
        date: '10/25/2023',
        content: 'This is such a great idea, Tyler! Can\'t wait to see everyone\'s photos.'
      }
    ]
  }
];

export const CommunityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLive, setIsLive] = useState(IS_FIREBASE_CONFIGURED);
  const [userReactions, setUserReactions] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('cls_user_reactions');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  useEffect(() => {
    if (isLive) {
      diagnostics.log('info', 'Connecting to Live Community Feed...');
      const unsubscribe = subscribeToPosts(
        (livePosts) => {
          setPosts(livePosts.sort((a, b) => b.id.localeCompare(a.id)));
        },
        (error) => {
          diagnostics.log('error', 'Community subscription error', error);
          if (error.code === 'permission-denied') setIsLive(false);
        }
      );
      return () => unsubscribe();
    } else {
      const saved = localStorage.getItem('cls_community_posts');
      if (saved) {
        setPosts(JSON.parse(saved));
      } else {
        setPosts(DEFAULT_POSTS);
      }
    }
  }, [isLive]);

  const addPost = async (post: Post, onProgress?: (p: number) => void) => {
    if (isLive) {
      try {
        let finalImageUrl = post.imageUrl;
        let finalVideoUrl = post.videoUrl;
        let finalThumbnailUrl = post.videoThumbnail;

        // 1. Upload Image
        if (finalImageUrl && (finalImageUrl.startsWith('data:') || finalImageUrl.startsWith('blob:'))) {
          diagnostics.log('info', 'Uploading community image...');
          finalImageUrl = await uploadMedia(finalImageUrl, 'uploads', (p) => onProgress?.(p * 0.5));
        }

        // 2. Upload Video
        if (finalVideoUrl && (finalVideoUrl.startsWith('data:') || finalVideoUrl.startsWith('blob:'))) {
          diagnostics.log('info', 'Uploading community video...');
          finalVideoUrl = await uploadMedia(finalVideoUrl, 'videos', (p) => onProgress?.(50 + (p * 0.4)));
        }

        // 3. Upload Thumbnail
        if (finalThumbnailUrl && (finalThumbnailUrl.startsWith('data:') || finalThumbnailUrl.startsWith('blob:'))) {
          diagnostics.log('info', 'Uploading community thumbnail...');
          finalThumbnailUrl = await uploadMedia(finalThumbnailUrl, 'uploads', (p) => onProgress?.(90 + (p * 0.1)));
        }

        const cloudPost: Post = {
          ...post,
          imageUrl: finalImageUrl,
          ...(finalVideoUrl !== undefined && { videoUrl: finalVideoUrl }),
          ...(finalThumbnailUrl !== undefined && { videoThumbnail: finalThumbnailUrl }),
        };

        await addPostToDb(cloudPost);
        diagnostics.log('success', 'Post saved to Firestore');
        onProgress?.(100);
      } catch (e: any) {
        diagnostics.log('error', 'Failed to add cloud post', e.message);
        throw e;
      }
    } else {
      // Demo Mode
      let localPost = { ...post };
      if (localPost.imageUrl?.startsWith('blob:')) localPost.imageUrl = await blobUrlToBase64(localPost.imageUrl);
      setPosts(prev => [localPost, ...prev]);
    }
  };

  const addComment = (postId: string, comment: Comment) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const updatedComments = [...(post.comments || []), comment];
    if (isLive) {
      updatePostInDb({ ...post, comments: updatedComments });
    } else {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));
    }
  };

  const toggleReaction = (postId: string, emoji: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const currentReaction = userReactions[postId];
    const newReactions = { ...post.reactions };

    if (currentReaction) {
      newReactions[currentReaction] = Math.max(0, (newReactions[currentReaction] || 0) - 1);
      if (newReactions[currentReaction] === 0) delete newReactions[currentReaction];
    }

    if (currentReaction !== emoji) {
      newReactions[emoji] = (newReactions[emoji] || 0) + 1;
    }

    if (isLive) {
      updatePostInDb({ ...post, reactions: newReactions });
    } else {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, reactions: newReactions } : p));
    }

    setUserReactions(prev => {
      const next = { ...prev };
      if (currentReaction === emoji) delete next[postId];
      else next[postId] = emoji;
      localStorage.setItem('cls_user_reactions', JSON.stringify(next));
      return next;
    });
  };

  const deletePost = (id: string) => {
    if (isLive) deletePostFromDb(id);
    else setPosts(prev => prev.filter(p => p.id !== id));
  };

  const importPosts = (newPosts: Post[]) => {
    if (isLive) newPosts.forEach(p => addPostToDb(p));
    else setPosts(prev => [...newPosts, ...prev]);
  };

  const resetPosts = () => {
    if (!isLive) setPosts(DEFAULT_POSTS);
  };

  const seedCloudData = async () => {
    if (!isLive) return;
    for (const post of DEFAULT_POSTS) {
      await addPostToDb(post);
    }
  };

  return (
    <CommunityContext.Provider value={{ 
      posts, userReactions, addPost, addComment, 
      toggleReaction, deletePost, importPosts, 
      resetPosts, seedCloudData, isLive 
    }}>
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) throw new Error('useCommunity must be used within a CommunityProvider');
  return context;
};