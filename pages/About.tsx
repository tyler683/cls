
import React from 'react';
import { Mail, Phone } from 'lucide-react';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';

const HERO_IMAGE = "https://res.cloudinary.com/clsllc/image/upload/v1764902253/20250810_120347_wmjcap.jpg";
const STORY_IMAGE = "https://res.cloudinary.com/clsllc/image/upload/v1771189604/skidsteergirls_i2iqdl.jpg";
const TYLER_IMAGE = "https://res.cloudinary.com/clsllc/image/upload/v1766382368/Tyler_Dennison_pnrgof_uinic3.jpg";
const MATTHEW_IMAGE = "https://res.cloudinary.com/clsllc/image/upload/v1771148778/IMG_0372_npkda9.jpg";

const About: React.FC = () => {
  return (
    <div className="bg-brand-cream min-h-screen">
      <SEO 
        title="About Our Family | Kansas City Outdoor Contractor" 
        description="Discover the story of Creative Landscaping Solutions, a family-owned landscaping business in Kansas City. Meet Tyler Dennison and Matthew Brown, and learn about our commitment to hard work and local Missouri roots."
        keywords="Kansas City landscapers, family owned landscaping KC, local landscaping experts, Creative Landscaping Solutions story, Tyler Dennison, Matthew Brown, professional landscaping Missouri, KC outdoor living history, Missouri yard contractors"
      />
      <PageHero
        title="About Us"
        subtitle="Family Owned, KC Proud. Building relationships one project at a time."
        contentKey="about_hero_static"
        bgImage={HERO_IMAGE}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* About Section */}
        <section className="py-20">
          <div className="flex flex-col lg:flex-row gap-16 items-center mb-20">
            <div className="lg:w-1/2">
               <h2 className="text-brand-accent font-bold uppercase tracking-wider mb-2">Our Roots</h2>
               <h1 className="text-4xl font-serif font-bold text-brand-dark mb-6">Our Family Story</h1>
               <p className="text-gray-600 mb-6 leading-relaxed">
                 Creative Landscaping Solutions LLC is a small, family-owned business based right here in Kansas City, MO. With over 10 years of experience, we have established ourselves in the industry through a solid foundation in home management and property care.
               </p>
               <p className="text-gray-600 leading-relaxed mb-8">
                 We specialize in providing efficient and high-quality services tailored to the unique needs of our clients. Our commitment is to deliver exceptional craftsmanship while ensuring affordability, making professional landscaping accessible to homeowners across our community.
               </p>
            </div>
            
            <div className="lg:w-1/2 w-full">
              <div className="relative z-10 w-full aspect-square md:aspect-video lg:aspect-[4/3] shadow-2xl rounded-3xl overflow-hidden bg-white border border-gray-100 group">
                <img 
                  src={STORY_IMAGE} 
                  alt="Our Family Story" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Leadership Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-brand-dark">Meet The Leadership</h2>
              <div className="w-16 h-1 bg-brand-accent mx-auto mt-4"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Tyler Dennison */}
              <div className="bg-white p-8 rounded-3xl shadow-lg flex flex-col items-center text-center border-t-4 border-brand-green group">
                <div className="relative w-44 h-44 bg-gray-100 rounded-full mb-6 overflow-hidden shadow-inner border-4 border-white group-hover:border-brand-green/20 transition-all">
                  <img 
                    src={TYLER_IMAGE} 
                    alt="Tyler Dennison" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold text-brand-dark">Tyler Dennison</h3>
                <p className="text-brand-accent text-sm font-bold uppercase tracking-widest mb-6">Owner</p>
                
                <div className="space-y-3 w-full">
                  <a href="mailto:tyler@creativelandscapingsolutions.com" className="flex items-center justify-center gap-2 text-gray-600 hover:text-brand-green text-sm p-3 rounded-2xl bg-gray-50 hover:bg-brand-cream transition-all border border-transparent hover:border-brand-green/10">
                    <Mail size={16} className="text-brand-accent" /> tyler@creativelandscapingsolutions.com
                  </a>
                  <a href="tel:8163372654" className="flex items-center justify-center gap-2 text-gray-600 hover:text-brand-green text-sm p-3 rounded-2xl bg-gray-50 hover:bg-brand-cream transition-all border border-transparent hover:border-brand-green/10">
                    <Phone size={16} className="text-brand-accent" /> (816) 337-2654
                  </a>
                </div>
              </div>

              {/* Matthew Brown */}
              <div className="bg-white p-8 rounded-3xl shadow-lg flex flex-col items-center text-center border-t-4 border-brand-green group">
                <div className="relative w-44 h-44 bg-gray-100 rounded-full mb-6 overflow-hidden shadow-inner border-4 border-white group-hover:border-brand-green/20 transition-all">
                  <img 
                    src={MATTHEW_IMAGE} 
                    alt="Matthew Brown" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold text-brand-dark">Matthew Brown</h3>
                <p className="text-brand-accent text-sm font-bold uppercase tracking-widest mb-6">Partner</p>
                
                <div className="space-y-3 w-full">
                  <a href="mailto:mattbrown9311@gmail.com" className="flex items-center justify-center gap-2 text-gray-600 hover:text-brand-green text-sm p-3 rounded-2xl bg-gray-50 hover:bg-brand-cream transition-all border border-transparent hover:border-brand-green/10">
                    <Mail size={16} className="text-brand-accent" /> mattbrown9311@gmail.com
                  </a>
                  <a href="tel:8164474427" className="flex items-center justify-center gap-2 text-gray-600 hover:text-brand-green text-sm p-3 rounded-2xl bg-gray-50 hover:bg-brand-cream transition-all border border-transparent hover:border-brand-green/10">
                    <Phone size={16} className="text-brand-accent" /> (816) 447-4427
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Served Areas Section */}
      <section className="h-80 w-full bg-brand-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-4">
           <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2 drop-shadow-lg">Proudly Serving Kansas City</h2>
           <p className="text-xl text-brand-accent font-medium drop-shadow-md">And Surrounding Missouri Areas</p>
           <div className="w-16 h-1 bg-white mt-6 rounded-full"></div>
        </div>
      </section>
    </div>
  );
};

export default About;
