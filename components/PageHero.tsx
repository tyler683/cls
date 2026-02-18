import React from 'react';
import { Link } from 'react-router-dom';
import { Shovel, Image as ImageIcon, Sparkles, Users, Info, Home as HomeIcon } from 'lucide-react';
import EditableImage from './EditableImage';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  bgImage: string;
  contentKey: string;
  children?: React.ReactNode;
}

const PageHero: React.FC<PageHeroProps> = ({ title, subtitle, bgImage, contentKey, children }) => {
  return (
    <section className="relative h-[50vh] sm:h-[60vh] min-h-[400px] sm:min-h-[500px] flex flex-col justify-end text-white overflow-hidden">
        <EditableImage
          contentKey={contentKey}
          defaultSrc={bgImage}
          alt={title}
          isBackground={true}
          className="absolute inset-0 z-0 bg-cover bg-center"
          editButtonClassName="top-24 right-4"
        >
           {/* Global Dark Overlay for Text Readability - pointer-events-none is CRITICAL */}
           <div className="absolute inset-0 bg-black/40 transition-opacity duration-500 pointer-events-none"></div>

           {/* Header Darkened Area with Modern Buttons - pointer-events-none is CRITICAL */}
           <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-black/90 via-black/40 to-transparent z-10 pointer-events-none"></div>

           {/* Hero Navigation - Optimized for Mobile */}
           <div className="absolute top-24 sm:top-32 inset-x-0 z-20 flex justify-center animate-in slide-in-from-top-8 duration-1000">
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-4 px-2 sm:px-4 w-full max-w-5xl pointer-events-auto">
                 <Link to="/" className="group flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold uppercase tracking-wider text-[9px] sm:text-sm hover:bg-white hover:text-brand-dark hover:border-white transition-all shadow-lg">
                    <HomeIcon size={12} className="text-brand-accent group-hover:text-brand-dark transition-colors sm:w-[16px]" /> Home
                 </Link>
                 <Link to="/services" className="group flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold uppercase tracking-wider text-[9px] sm:text-sm hover:bg-white hover:text-brand-dark hover:border-white transition-all shadow-lg">
                    <Shovel size={12} className="text-brand-accent group-hover:text-brand-dark transition-colors sm:w-[16px]" /> Services
                 </Link>
                 <Link to="/gallery" className="group flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold uppercase tracking-wider text-[9px] sm:text-sm hover:bg-white hover:text-brand-dark hover:border-white transition-all shadow-lg">
                    <ImageIcon size={12} className="text-brand-accent group-hover:text-brand-dark transition-colors sm:w-[16px]" /> Gallery
                 </Link>
                 <Link to="/design-studio" className="group flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold uppercase tracking-wider text-[9px] sm:text-sm hover:bg-white hover:text-brand-dark hover:border-white transition-all shadow-lg">
                    <Sparkles size={12} className="text-brand-accent group-hover:text-brand-dark transition-colors sm:w-[16px]" /> AI Studio
                 </Link>
                 <Link to="/community" className="group flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold uppercase tracking-wider text-[9px] sm:text-sm hover:bg-white hover:text-brand-dark hover:border-white transition-all shadow-lg">
                    <Users size={12} className="text-brand-accent group-hover:text-brand-dark transition-colors sm:w-[16px]" /> Community
                 </Link>
                 <Link to="/about" className="group flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold uppercase tracking-wider text-[9px] sm:text-sm hover:bg-white hover:text-brand-dark hover:border-white transition-all shadow-lg">
                    <Info size={12} className="text-brand-accent group-hover:text-brand-dark transition-colors sm:w-[16px]" /> About
                 </Link>
              </div>
           </div>

           {/* Page Title Content - Adjusted padding to avoid button overlap */}
           <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-10 pt-40 sm:pt-48 px-4 pointer-events-none">
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif font-bold text-white drop-shadow-2xl mb-2 sm:mb-4">{title}</h1>
              {subtitle && <p className="text-sm sm:text-xl md:text-2xl text-white/95 font-medium max-w-2xl drop-shadow-lg mx-auto leading-tight">{subtitle}</p>}
           </div>

           {/* Optional Children (e.g. Action Buttons) */}
           {children && (
             <div className="absolute bottom-6 sm:bottom-12 inset-x-0 z-20 flex justify-center pointer-events-auto scale-90 sm:scale-100">
                {children}
             </div>
           )}
        </EditableImage>
      </section>
  );
};

export default PageHero;