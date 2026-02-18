
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, Phone } from 'lucide-react';
import { PageRoute } from '../types';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: PageRoute.HOME },
    { name: 'Services', path: PageRoute.SERVICES },
    { name: 'Gallery', path: PageRoute.GALLERY },
    { name: 'Studio', path: PageRoute.STUDIO },
    { name: 'Community', path: PageRoute.COMMUNITY },
    { name: 'About', path: PageRoute.ABOUT },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
      scrolled || isOpen ? 'py-3' : 'py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className={`relative rounded-2xl transition-all duration-500 border border-white/10 overflow-hidden ${
          scrolled || isOpen 
            ? 'bg-brand-dark/90 backdrop-blur-xl shadow-2xl' 
            : 'bg-transparent'
        }`}>
          <div className="px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center text-white font-serif font-black text-xl shadow-lg group-hover:rotate-12 transition-transform">
                  C
                </div>
                <div className="hidden sm:block">
                  <span className="text-white font-serif font-bold text-lg block leading-none">Creative Landscaping Solutions</span>
                  <span className="text-brand-accent text-[10px] font-bold uppercase tracking-[0.2em]">Honest Roots</span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`
                      px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200
                      hover:text-brand-accent
                      ${isActive(link.path) ? 'text-brand-accent bg-white/5' : 'text-gray-200'}
                    `}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center gap-4">
                <a href="tel:8163372654" className="text-white/70 hover:text-brand-accent flex items-center gap-2 text-xs font-bold transition-colors">
                  <Phone size={14} className="text-brand-accent" /> (816) 337-2654
                </a>
                <Link
                  to={PageRoute.QUOTE}
                  className="bg-brand-accent hover:bg-white hover:text-brand-dark text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
                >
                  Get Quote <ArrowRight size={14} />
                </Link>
              </div>

              {/* Mobile Menu Toggle */}
              <div className="lg:hidden flex items-center">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 rounded-xl transition-colors focus:outline-none text-white hover:bg-white/10"
                >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}>
            <div className="px-4 pt-2 pb-8 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-4 rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${
                    isActive(link.path)
                      ? 'bg-white/5 text-brand-accent'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 mt-4 space-y-4">
                 <Link
                  to={PageRoute.QUOTE}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-brand-accent text-white px-6 py-4 rounded-2xl font-bold uppercase tracking-widest shadow-xl"
                >
                  Start Your Project <ArrowRight size={18} />
                </Link>
                <a href="tel:8163372654" className="flex items-center justify-center gap-2 w-full py-4 text-white/50 text-xs font-bold uppercase">
                   <Phone size={14} /> Call (816) 337-2654
                </a>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
