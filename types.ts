import React from 'react';

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  longDescription?: string;
  icon: React.ReactNode;
  imageUrl: string;
}

export interface GalleryItem {
  id: string;
  category: 'hardscape' | 'demolition' | 'decks' | 'pools';
  imageUrl?: string;
  videoUrl?: string;
  videoThumbnail?: string; 
  title: string;
}

export interface DesignVisionResponse {
  conceptName: string;
  mood: string;
  plantPalette: string[];
  features: string[];
  maintenanceLevel: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Comment {
  id: string;
  author: string;
  date: string;
  content: string;
}

export interface Post {
  id: string;
  author: string;
  date: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  reactions: Record<string, number>;
  comments: Comment[];
}

export enum PageRoute {
  HOME = '/',
  SERVICES = '/services',
  GALLERY = '/gallery',
  ABOUT = '/about',
  QUOTE = '/quote',
  STUDIO = '/design-studio',
  COMMUNITY = '/community'
}