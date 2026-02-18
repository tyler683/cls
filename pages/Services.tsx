
import React, { useState } from 'react';
import { Shovel, Truck, Hammer, Waves, X, Mountain, Sparkles, Send, Loader2, Leaf, AlertCircle, ArrowRight, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { ServiceItem, DesignVisionResponse } from '../types';
import EditableImage from '../components/EditableImage';
import { generateDesignVision } from '../services/geminiService';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';

const Services: React.FC = () => {
  // Services State
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [filter, setFilter] = useState('All');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Quote Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: 'maintenance',
    details: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // AI Assistant State
  const [visionPrompt, setVisionPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [visionResult, setVisionResult] = useState<DesignVisionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const services: ServiceItem[] = [
    {
      id: '1',
      title: 'Demolition & Hauling',
      category: 'Site Prep',
      description: 'Efficient removal of old structures and debris to prepare your site for something new.',
      longDescription: 'Before new projects can begin, the old must be cleared away. We provide professional light demolition and hauling services to prepare your property. From removing old sheds and decks to clearing brush and breaking up concrete, we handle the heavy lifting. We leave your site clean, safe, and ready for the next phase of development, ensuring all materials are disposed of responsibly.',
      icon: <Truck className="w-8 h-8 text-white" />,
      imageUrl: 'https://res.cloudinary.com/clsllc/image/upload/v1764902471/20180424_185402_iqlxwx.jpg'
    },
    {
      id: '2',
      title: 'Hardscaping',
      category: 'Hardscaping',
      description: 'Custom patios, walkways, and retaining walls built with craftsmanship and durability in mind.',
      longDescription: 'We specialize in creating functional and elegant outdoor living spaces. Our hardscaping services include the professional installation of paver patios, natural stone walkways, and structural retaining walls. We use high-quality materials that complement your home\'s architecture and are built to withstand the elements, creating a lasting foundation for your outdoor memories.',
      icon: <Shovel className="w-8 h-8 text-white" />,
      imageUrl: 'https://res.cloudinary.com/clsllc/image/upload/v1764901140/20250409_163720_dwlgsb.jpg'
    },
    {
      id: '3',
      title: 'Grading & Drainage',
      category: 'Site Prep',
      description: 'Expert site grading and water management solutions to protect your property and foundation.',
      longDescription: 'Proper water management is essential for a healthy landscape and a safe home. We specialize in correcting slopes, leveling ground, and implementing comprehensive drainage systems like French drains, catch basins, and swales. We ensure your land is properly shaped to direct water away from your foundation, keeping your property dry and protected during storms.',
      icon: <Mountain className="w-8 h-8 text-white" />,
      imageUrl: 'https://res.cloudinary.com/clsllc/image/upload/v1764903775/drainage_cbr5gs.jpg'
    },
    {
      id: '4',
      title: 'Decks & Fences',
      category: 'Structures',
      description: 'High-quality decks and privacy fences using premium composite materials or traditional wood.',
      longDescription: 'Enhance your outdoor living experience with a custom-built deck or fence. We specialize in high-end composite decking that offers the look of wood without the maintenance, as well as traditional cedar craftsmanship. Whether you need a private sanctuary or a spacious area for entertaining, we build structures that are both beautiful and durable.',
      icon: <Hammer className="w-8 h-8 text-white" />,
      imageUrl: 'https://res.cloudinary.com/clsllc/image/upload/v1764901691/Gray-Composite-Decking2-1024x766_lfckp3.jpg'
    },
    {
      id: '5',
      title: 'Pools & Water Features',
      category: 'Water Features',
      description: 'Transform your backyard with custom in-ground pools, spas, and soothing water features.',
      longDescription: 'A water feature serves as the ultimate centerpiece for any backyard. We design and manage the installation of custom in-ground pools and relaxing spas tailored to your specific needs. Beyond pools, we create tranquil pondless waterfalls and bubbling fountains that add visual interest and soothing soundscapes to your outdoor retreat.',
      icon: <Waves className="w-8 h-8 text-white" />,
      imageUrl: 'https://res.cloudinary.com/clsllc/image/upload/v1764902053/20250821_153825_hamrxj.jpg'
    }
  ];

  const categories = [
    { id: 'All', label: 'All Services' },
    { id: 'Hardscaping', label: 'Hardscaping' },
    { id: 'Structures', label: 'Decks & Fences' },
    { id: 'Water Features', label: 'Pools & Water' },
    { id: 'Site Prep', label: 'Site Preparation' },
  ];

  const faqs = [
    {
      question: "What is your typical project timeline?",
      answer: "Timelines vary depending on scope, but most hardscaping projects (patios/retaining walls) take between 5-10 business days. Custom deck or pool surrounds may take longer depending on permitting and material availability."
    },
    {
      question: "Do you handle the permitting process?",
      answer: "Yes! We manage the entire permitting process with your local Kansas City municipality to ensure all structural work (like decks or high retaining walls) is fully compliant with local codes."
    },
    {
      question: "Why is grading and drainage so important in KC?",
      answer: "Kansas City features heavy clay soil which expands when wet. Proper grading ensures that water moves away from your foundation, preventing basement flooding and structural issues over time."
    },
    {
      question: "What kind of maintenance is required for your hardscaping?",
      answer: "We build with longevity in mind. Our paver systems are designed to be low-maintenance, requiring only occasional sweeping and potentially resealing every 3-5 years to maintain that 'new' look."
    }
  ];

  const filteredServices = filter === 'All' 
    ? services 
    : services.filter(s => s.category === filter);

  // --- Handlers ---

  const handleOpenModal = (service: ServiceItem) => {
    setSelectedService(service);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setSelectedService(null);
    document.body.style.overflow = 'unset';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateVision = async () => {
    if (!visionPrompt.trim()) return;
    
    setIsThinking(true);
    setError(null);
    setVisionResult(null);

    try {
      const result = await generateDesignVision(visionPrompt);
      setVisionResult(result);
    } catch (err) {
      setError("We couldn't generate a vision right now. Please try again or skip to the formal quote.");
    } finally {
      setIsThinking(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `[Quote] ${formData.serviceType.toUpperCase()} - ${formData.name}`;
    let body = `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nService Interest: ${formData.serviceType}\n\nProject Details:\n${formData.details}\n\n`;
    if (visionResult) {
      body += `--- AI Design Vision ---\nConcept: ${visionResult.conceptName}\nMood: ${visionResult.mood}\nMaintenance: ${visionResult.maintenanceLevel}\nFeatures: ${visionResult.features.join(', ')}\nPlants: ${visionResult.plantPalette.join(', ')}\n`;
    }
    window.location.href = `mailto:tyler@creativelandscapingsolutions.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setFormSubmitted(true);
  };

  const scrollToQuote = () => {
    document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-brand-cream min-h-screen">
      <SEO title="Missouri Landscaping Services & Quote" description="Kansas City's premier landscaping services: grading, demolition, pools, decks, and hardscaping." />
      
      <PageHero
        title="Our Services"
        subtitle="Where expert craftsmanship meets nature's canvas."
        contentKey="services_hero"
        bgImage="https://res.cloudinary.com/clsllc/image/upload/v1765012931/Y19jcm9wLGFyXzQ6Mw_w7fwlp.jpg"
      >
        <button
          onClick={scrollToQuote}
          className="bg-brand-accent hover:bg-brand-dark text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
        >
          Request a Quote <ArrowRight size={20} />
        </button>
      </PageHero>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-sm ${
                filter === cat.id
                  ? 'bg-brand-green text-white shadow-xl scale-105'
                  : 'bg-white text-gray-500 hover:bg-brand-green/10 border border-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col h-full border border-gray-100">
              <div className="relative h-64 overflow-hidden shrink-0">
                <EditableImage contentKey={`service_${service.id}`} defaultSrc={service.imageUrl} alt={service.title} className="w-full h-full" />
                <div className="absolute top-4 right-4 bg-brand-accent p-3 rounded-2xl shadow-xl transform transition-transform group-hover:scale-110">
                    {service.icon}
                </div>
              </div>
              <div className="p-10 flex flex-col flex-grow">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-2">
                    {service.category}
                </span>
                <h3 className="text-2xl font-serif font-bold text-brand-dark mb-4">{service.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">{service.description}</p>
                <button 
                  onClick={() => handleOpenModal(service)}
                  className="mt-auto self-start text-brand-green font-bold text-xs uppercase tracking-widest hover:text-brand-dark transition-colors flex items-center gap-2 group/btn"
                >
                  Learn More <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-32">
           <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-accent/10 text-brand-accent rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                 <HelpCircle size={14} /> Knowledge Base
              </div>
              <h2 className="text-4xl font-serif font-bold text-brand-dark">Frequently Asked Questions</h2>
           </div>
           
           <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                   <button 
                    onClick={() => toggleFaq(i)}
                    className="w-full px-8 py-6 flex justify-between items-center text-left"
                   >
                     <span className="font-bold text-brand-dark">{faq.question}</span>
                     {openFaq === i ? <ChevronUp className="text-brand-accent" /> : <ChevronDown className="text-gray-400" />}
                   </button>
                   <div className={`transition-all duration-300 overflow-hidden ${openFaq === i ? 'max-h-96' : 'max-h-0'}`}>
                      <div className="px-8 pb-8 text-gray-500 text-sm leading-relaxed">
                        {faq.answer}
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
        
        {/* --- QUOTE SECTION START --- */}
        <div id="quote" className="scroll-mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-brand-dark mb-4">Start Your Transformation</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Ready to redefine your exterior? Use our AI to conceptualize your space or jump straight to a consultation request.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-brand-dark rounded-[3rem] shadow-3xl overflow-hidden mb-12 text-white border border-white/5">
            <div className="p-10 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="text-brand-accent" />
                <h2 className="text-2xl font-bold font-serif">AI Design Assistant</h2>
              </div>
              <p className="text-white/60 text-sm mb-8 leading-relaxed max-w-xl">
                Describe your dream space (e.g., "A modern limestone patio with ornamental grasses and warm lighting") and our AI will build a concept palette for you.
              </p>
              
              <div className="flex gap-3 flex-col sm:flex-row">
                <input
                  type="text"
                  value={visionPrompt}
                  onChange={(e) => setVisionPrompt(e.target.value)}
                  placeholder="Describe your ideal yard..."
                  className="flex-1 px-6 py-4 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-accent/20 transition-all font-medium"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateVision()}
                />
                <button
                  onClick={handleGenerateVision}
                  disabled={isThinking || !visionPrompt}
                  className="px-10 py-4 bg-brand-accent text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 hover:bg-brand-light shadow-xl shadow-brand-accent/20 disabled:opacity-50"
                >
                  {isThinking ? <Loader2 className="animate-spin" /> : 'Dream It'}
                </button>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-500/10 text-red-400 rounded-2xl flex items-center gap-3 border border-red-500/20 text-xs font-bold">
                  <AlertCircle size={18} /> {error}
                </div>
              )}
            </div>

            {visionResult && (
              <div className="bg-white text-brand-dark p-10 md:p-12 animate-in fade-in slide-in-from-top-6 duration-700">
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-3xl font-serif font-bold text-brand-green">{visionResult.conceptName}</h3>
                  <span className="px-4 py-1.5 bg-brand-cream text-brand-dark text-[10px] font-bold uppercase tracking-widest rounded-full border border-brand-green/10">
                    {visionResult.maintenanceLevel} Maintenance
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h4 className="font-bold text-[10px] uppercase text-gray-400 tracking-[0.2em] mb-3">Atmosphere</h4>
                    <p className="mb-6 italic text-xl text-gray-700 leading-relaxed font-serif">"{visionResult.mood}"</p>
                    
                    <h4 className="font-bold text-[10px] uppercase text-gray-400 tracking-[0.2em] mb-3">Key Elements</h4>
                    <ul className="grid grid-cols-1 gap-2">
                      {visionResult.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-600">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-[10px] uppercase text-gray-400 tracking-[0.2em] mb-3">Plant Palette</h4>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {visionResult.plantPalette.map((plant, i) => (
                        <span key={i} className="bg-brand-cream text-brand-dark px-4 py-2 rounded-xl text-xs font-bold border border-brand-green/5">
                          {plant}
                        </span>
                      ))}
                    </div>
                    <div className="p-6 bg-brand-green/5 rounded-2xl border border-brand-green/10">
                      <p className="text-xs text-gray-500 font-medium">
                        <strong>Insight:</strong> This vision is tailored for KC climate conditions and will be attached to your formal request below.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="max-w-4xl mx-auto">
            {formSubmitted ? (
               <div className="bg-white p-16 rounded-[3rem] shadow-3xl text-center animate-in fade-in zoom-in-95 border border-gray-100">
                <div className="w-24 h-24 bg-brand-cream rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Leaf className="text-brand-green w-12 h-12" />
                </div>
                <h2 className="text-4xl font-serif font-bold text-brand-dark mb-6 tracking-tight">Email Client Ready</h2>
                <p className="text-gray-500 mb-10 text-lg leading-relaxed">
                  We've pre-filled the project details in your email app. <br/>
                  <strong>Please hit "Send"</strong> to finalize your consultation request to Tyler.
                </p>
                <button 
                  onClick={() => setFormSubmitted(false)}
                  className="px-10 py-4 bg-gray-50 text-gray-400 hover:text-brand-dark font-bold rounded-2xl transition-all uppercase tracking-widest text-xs"
                >
                  Start Another Request
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] shadow-3xl p-10 md:p-16 border border-gray-100">
                <h2 className="text-3xl font-serif font-bold text-brand-dark mb-10">Project Details</h2>
                <form onSubmit={handleFormSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green outline-none transition-all font-medium" placeholder="Ex: Tyler Dennison" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green outline-none transition-all font-medium" placeholder="Ex: tyler@creativelandscapingsolutions.com" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Phone Number</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green outline-none transition-all font-medium" placeholder="Ex: (816) 337-2654" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Project Classification</label>
                      <select name="serviceType" value={formData.serviceType} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green outline-none transition-all font-bold text-xs uppercase tracking-widest cursor-pointer">
                        <option value="maintenance">Regular Maintenance</option>
                        <option value="design">Master Landscape Design</option>
                        <option value="hardscape">Hardscaping & Stonework</option>
                        <option value="softscape">Native Planting</option>
                        <option value="other">Consultation Only</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Brief Property Summary</label>
                    <textarea name="details" rows={5} value={formData.details} onChange={handleInputChange} className="w-full px-6 py-5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green outline-none transition-all font-medium resize-none" placeholder="Share your property's current state and your long-term goals..." />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-6 bg-brand-green text-white font-bold rounded-2xl hover:bg-brand-dark transition-all flex items-center justify-center gap-3 shadow-2xl shadow-brand-green/20 active:scale-[0.98]"
                    >
                      Initialize Consultation <Send size={20} />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
        {/* --- QUOTE SECTION END --- */}

      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-md transition-opacity" onClick={handleCloseModal}></div>
          <div className="bg-white rounded-[2.5rem] shadow-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-300">
            <button 
              onClick={handleCloseModal}
              className="absolute top-6 right-6 bg-brand-cream/80 hover:bg-white text-brand-dark p-2 rounded-xl transition-all z-20 shadow-sm"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-1/2 h-80 md:h-auto relative">
                 <EditableImage contentKey={`service_${selectedService.id}`} defaultSrc={selectedService.imageUrl} alt={selectedService.title} className="w-full h-full" />
                 <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent md:hidden"></div>
              </div>
              <div className="md:w-1/2 p-12 md:p-16 overflow-y-auto">
                <div className="mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent block mb-3">
                    {selectedService.category}
                  </span>
                  <h2 className="text-4xl font-serif font-bold text-brand-dark leading-tight">{selectedService.title}</h2>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-500 leading-relaxed mb-10 text-lg">
                    {selectedService.longDescription || selectedService.description}
                  </p>
                  
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-brand-green uppercase tracking-[0.2em]">Our Commitment</h4>
                    <div className="grid grid-cols-1 gap-3">
                       {["Certified Hardscape Pros", "Missouri-Native Experts", "Owner-Led Supervision"].map((t, i) => (
                         <div key={i} className="flex items-center gap-3 bg-brand-cream p-4 rounded-xl border border-brand-green/5">
                            <CheckCircle2 size={16} className="text-brand-accent" />
                            <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">{t}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="mt-12">
                   <a 
                     href="#quote" 
                     className="w-full py-5 bg-brand-dark text-white font-bold rounded-2xl hover:bg-brand-accent transition-all flex items-center justify-center gap-3 shadow-xl"
                     onClick={(e) => {
                       e.preventDefault();
                       handleCloseModal();
                       setTimeout(() => scrollToQuote(), 300);
                     }}
                   >
                     Book Initial Consult <ArrowRight size={18} />
                   </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple internal check circle component for modal
const CheckCircle2 = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default Services;
