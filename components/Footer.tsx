
import React, { useState } from 'react';
import { Phone, Mail, MapPin, Database, Activity, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { SiteDataManager } from './SiteDataManager';
import EditableImage from './EditableImage';
import DebugPanel from './DebugPanel';

const Footer: React.FC = () => {
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  const socials = [
    { icon: <Facebook size={18} />, url: 'https://www.facebook.com/profile.php?id=61584560035614', label: 'Facebook' },
    { icon: <Instagram size={18} />, url: 'https://www.instagram.com/creativelandscapingsolutions/', label: 'Instagram' },
    { icon: <Linkedin size={18} />, url: '#', label: 'LinkedIn' },
    { icon: <Twitter size={18} />, url: '#', label: 'X' }
  ];

  return (
    <>
      <footer className="relative bg-brand-dark text-white pt-16 pb-8 border-t-8 border-brand-accent overflow-hidden">
        {/* Background Image with Overlay */}
        <EditableImage
          contentKey="footer_bg"
          defaultSrc="https://res.cloudinary.com/clsllc/image/upload/v1765003374/20240822_171155_nxri9k.jpg"
          alt="Footer Background"
          isBackground={true}
          className="absolute inset-0 z-0 bg-cover bg-center"
        >
          {/* Lighter overlay (50%) to allow the image to show through more */}
          <div className="absolute inset-0 bg-brand-dark/50 transition-colors"></div>
        </EditableImage>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-6">
              <h3 className="text-3xl font-serif font-bold text-white mb-4 drop-shadow-lg">Creative Landscaping Solutions</h3>
              <p className="text-white text-lg font-medium leading-relaxed max-w-xs drop-shadow-md">
                Transforming outdoor spaces into breathtaking sanctuaries. We bring nature and design together to create your perfect escape.
              </p>
              
              <div className="flex gap-3 pt-2">
                {socials.map((social, i) => (
                  <a 
                    key={i} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-brand-accent hover:scale-110 transition-all border border-white/10"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-2xl font-serif font-bold mb-6 text-brand-accent drop-shadow-lg">Contact Us</h4>
              <ul className="space-y-4 text-lg text-white drop-shadow-md">
                <li className="flex items-start space-x-3 group">
                  <Phone size={24} className="text-brand-accent mt-0.5" />
                  <span className="group-hover:text-brand-accent transition-colors font-medium">(816) 337-2654</span>
                </li>
                <li className="flex items-start space-x-3 group">
                  <Mail size={24} className="text-brand-accent mt-0.5" />
                  <span className="group-hover:text-brand-accent transition-colors font-medium">tyler@creativelandscapingsolutions.com</span>
                </li>
                <li className="flex items-start space-x-3 group">
                  <MapPin size={24} className="text-brand-accent mt-0.5" />
                  <span className="group-hover:text-brand-accent transition-colors font-medium">Kansas City, MO</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-2xl font-serif font-bold mb-6 text-brand-accent drop-shadow-lg">Business Hours</h4>
              <ul className="space-y-3 text-lg text-white drop-shadow-md font-medium">
                <li className="flex justify-between border-b border-white/30 pb-2">
                  <span>Monday - Friday</span>
                  <span>8:00 AM - 6:00 PM</span>
                </li>
                <li className="flex justify-between border-b border-white/30 pb-2">
                  <span>Saturday</span>
                  <span>9:00 AM - 2:00 PM</span>
                </li>
                <li className="flex justify-between pb-2">
                  <span>Sunday</span>
                  <span className="text-brand-accent font-bold">Closed</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/30 pt-8 text-center text-sm text-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 font-medium">
            <p className="drop-shadow">&copy; {new Date().getFullYear()} Creative Landscaping Solutions. All rights reserved.</p>
            <div className="flex space-x-6 items-center flex-wrap justify-center">
              <button 
                onClick={() => setIsDataManagerOpen(true)}
                className="hover:text-brand-accent flex items-center gap-1 transition-colors drop-shadow"
              >
                <Database size={14} /> Manage Site Data
              </button>
              <button 
                onClick={() => setIsDebugOpen(true)}
                className="hover:text-brand-accent flex items-center gap-1 transition-colors drop-shadow text-white/70"
              >
                <Activity size={14} /> System Status
              </button>
              <a href="#" className="hover:text-brand-accent drop-shadow">Privacy Policy</a>
              <a href="#" className="hover:text-brand-accent drop-shadow">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
      
      <SiteDataManager 
        isOpen={isDataManagerOpen} 
        onClose={() => setIsDataManagerOpen(false)} 
      />
      <DebugPanel 
        isOpen={isDebugOpen} 
        onClose={() => setIsDebugOpen(false)} 
      />
    </>
  );
};

export default Footer;
