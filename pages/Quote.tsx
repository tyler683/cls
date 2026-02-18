
import React, { useState } from 'react';
import { generateDesignVision } from '../services/geminiService';
import { DesignVisionResponse } from '../types';
import { Sparkles, Send, Loader2, Leaf, AlertCircle, Info, CheckCircle, Quote as QuoteIcon } from 'lucide-react';

const Quote: React.FC = () => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `[Quote] ${formData.serviceType.toUpperCase()} - ${formData.name}`;

    let body = `Name: ${formData.name}\n`;
    body += `Email: ${formData.email}\n`;
    body += `Phone: ${formData.phone}\n`;
    body += `Service Interest: ${formData.serviceType}\n\n`;
    body += `Project Details:\n${formData.details}\n\n`;

    if (visionResult) {
      body += `--- AI Design Vision ---\n`;
      body += `Concept: ${visionResult.conceptName}\n`;
      body += `Mood: ${visionResult.mood}\n`;
      body += `Maintenance: ${visionResult.maintenanceLevel}\n`;
      body += `Features: ${visionResult.features.join(', ')}\n`;
      body += `Plants: ${visionResult.plantPalette.join(', ')}\n`;
    }

    const recipientEmail = "tyler@creativelandscapingsolutions.com";
    window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setFormSubmitted(true);
    window.scrollTo(0, 0);
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

  if (formSubmitted) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-xl max-w-md text-center border-t-8 border-brand-green">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Leaf className="text-brand-green w-10 h-10" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-brand-dark mb-4">Email Drafted!</h2>
          <p className="text-gray-600 mb-8">
            We've opened your email app with the details pre-filled. <br/><br/>
            <strong>Click "Send" in your email app</strong> to get this over to Tyler for review.
          </p>
          <button onClick={() => setFormSubmitted(false)} className="text-brand-green font-bold hover:underline">Back to Form</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold text-brand-dark mb-4 tracking-tight">Request a Quote</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Tell us about your property and vision. Use our AI Assistant to explore creative ideas before submitting your request.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: AI Assistant & Inspiration */}
          <div className="lg:col-span-5 space-y-8">
             
             {/* AI Vision Card */}
             <div className="bg-brand-dark p-8 rounded-[2rem] shadow-xl text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="text-brand-accent" />
                  <h2 className="text-xl font-bold font-serif">AI Design Assistant</h2>
                </div>
                <p className="text-brand-cream/60 text-sm mb-6 leading-relaxed">Describe your dream space (e.g., "Zen garden with a small pond") and let our AI create a professional design palette for you.</p>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={visionPrompt}
                    onChange={(e) => setVisionPrompt(e.target.value)}
                    placeholder="Describe your space..."
                    className="w-full px-4 py-3 rounded-xl text-gray-900 focus:outline-none bg-brand-cream"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateVision()}
                  />
                  <button
                    onClick={handleGenerateVision}
                    disabled={isThinking || !visionPrompt}
                    className="w-full py-3 bg-brand-accent text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-brand-light transition-all disabled:opacity-50"
                  >
                    {isThinking ? <Loader2 className="animate-spin" /> : 'Explore Concepts'}
                  </button>
                </div>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-500/20 text-red-100 rounded-lg flex items-center gap-2 text-xs">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}
             </div>

             {/* Why Consult Card */}
             <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                   <QuoteIcon className="text-brand-green" />
                   <h2 className="text-xl font-serif font-bold text-brand-dark">Why Creative?</h2>
                </div>
                <ul className="space-y-4 text-sm text-gray-600">
                  <li className="flex gap-3">
                    <CheckCircle size={16} className="text-brand-accent shrink-0" />
                    <span><strong>KC Soil Experts:</strong> We know how to handle the heavy Missouri clay.</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle size={16} className="text-brand-accent shrink-0" />
                    <span><strong>Family Values:</strong> Hard work and honest roots in every project.</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle size={16} className="text-brand-accent shrink-0" />
                    <span><strong>Modern Visuals:</strong> AI and 3D design to see your yard before we dig.</span>
                  </li>
                </ul>
             </div>
          </div>

          {/* Right Column: Main Form & AI Results */}
          <div className="lg:col-span-7 space-y-8">
            
            {visionResult && (
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border-l-8 border-brand-accent animate-in fade-in slide-in-from-top-4">
                 <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-serif font-bold text-brand-green">{visionResult.conceptName}</h3>
                    <span className="px-3 py-1 bg-brand-cream text-brand-dark text-[10px] font-bold uppercase rounded-full border border-brand-green/10">
                      {visionResult.maintenanceLevel} Maintenance
                    </span>
                  </div>
                  <p className="italic text-gray-600 mb-6">"{visionResult.mood}"</p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <h4 className="font-bold uppercase text-brand-accent mb-2">Features</h4>
                      <ul className="space-y-1">
                        {visionResult.features.map((f, i) => <li key={i} className="flex items-center gap-2"> <CheckCircle size={10} className="text-brand-green"/> {f}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold uppercase text-brand-accent mb-2">Planting</h4>
                      <div className="flex flex-wrap gap-1">
                        {visionResult.plantPalette.map((p, i) => <span key={i} className="bg-gray-100 px-2 py-1 rounded-md">{p}</span>)}
                      </div>
                    </div>
                  </div>
                  <p className="mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Note: This AI vision will be included in your request below.</p>
              </div>
            )}

            <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-gray-100">
              <h2 className="text-2xl font-bold font-serif text-brand-dark mb-8">Consultation Request</h2>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Name</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-brand-green outline-none" placeholder="Tyler Dennison" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Email</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-brand-green outline-none" placeholder="tyler@creativelandscapingsolutions.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-brand-green outline-none" placeholder="(816) 337-2654" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Project Type</label>
                    <select name="serviceType" value={formData.serviceType} onChange={handleInputChange} className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-white outline-none">
                      <option value="maintenance">Maintenance</option>
                      <option value="hardscape">Hardscaping</option>
                      <option value="pool">Pool/Water</option>
                      <option value="siteprep">Site Prep/Grading</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Project Details</label>
                  <textarea name="details" rows={5} value={formData.details} onChange={handleInputChange} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-brand-green outline-none resize-none" placeholder="Tell us about your property and what you're looking to achieve..." />
                </div>

                <button type="submit" className="w-full py-5 bg-brand-green text-white font-bold rounded-2xl hover:bg-brand-dark transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-brand-green/20">
                  Send Formal Request <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quote;
