
import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Loader2, Info, Check, AlertCircle, Upload, ArrowRight, Save, Wand2, RefreshCw, Layers, Video, Play, CheckCircle2, ShieldAlert, Key, HelpCircle, ExternalLink, Columns } from 'lucide-react';
import { generateLandscapeImage, generateLandscapeVideo } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { ImagePickerModal } from '../components/ImagePickerModal';
import SEO from '../components/SEO';

const ANIMATION_STEPS = [
  "Analyzing terrain topography...",
  "Laying virtual paver foundation...",
  "Planting native Missouri perennials...",
  "Adjusting golden hour lighting...",
  "Finalizing cinematic walkthrough...",
  "Exporting 4K visualization..."
];

const STYLE_OPTIONS = ['Modern', 'Rustic', 'Oasis', 'Traditional'] as const;

const DesignStudio: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('modern');
  const [error, setError] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [isBridgeBlocked, setIsBridgeBlocked] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkKeyStatus = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
        // Running inside the AI Studio preview frame — check bridge key selection.
        try {
          const selected = await aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } catch (e) {
          // Bridge is present but threw — signal it's blocked.
          setIsBridgeBlocked(true);
        }
      }
      // If window.aistudio is simply not available we are in a regular browser.
      // Image generation uses VITE_GEMINI_API_KEY directly and needs no bridge.
    };
    checkKeyStatus();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isAnimating) {
      interval = setInterval(() => {
        setAnimationStep(prev => (prev + 1) % ANIMATION_STEPS.length);
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isAnimating]);

  const handleSelectKey = async () => {
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.openSelectKey === 'function') {
        await aistudio.openSelectKey();
        setHasKey(true); 
        setError(null);
      } else {
        setIsBridgeBlocked(true);
        setError("AI Studio bridge blocked. Please use a standard browser window.");
      }
    } catch (e) {
      setIsBridgeBlocked(true);
    }
  };

  const handleGenerateImage = async () => {
    if (!selectedImage) return;
    setIsGenerating(true);
    setError(null);
    setGeneratedVideo(null);
    setGeneratedImage(null);
    try {
      const result = await generateLandscapeImage(selectedImage, `${style} landscape style. ${prompt}`);
      setGeneratedImage(result);
    } catch (err: any) {
      setError(err.message || "Visualization failed. Please check your Gemini API status.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnimateVision = async () => {
    if (!generatedImage) return;
    
    if (hasKey === false) {
      await handleSelectKey();
      if (hasKey === false) return;
    }

    setIsAnimating(true);
    setError(null);
    setAnimationStep(0);
    
    try {
      const videoUrl = await generateLandscapeVideo(generatedImage, prompt || `${style} professional landscape`);
      setGeneratedVideo(videoUrl);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        setError("Invalid API Key or Billing Disabled.");
      } else {
        setError("Video rendering failed. Ensure your API key has high-tier access.");
      }
    } finally {
      setIsAnimating(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream pb-20">
      <SEO title="AI Landscape Design Visualizer" description="Visualize professional hardscaping and design transformations for your yard in seconds using advanced AI." />
      
      <PageHero
        title="AI Design Studio"
        subtitle="Watch our AI transform your yard into a cinematic masterpiece."
        contentKey="studio_hero"
        bgImage="https://res.cloudinary.com/clsllc/image/upload/v1765419813/Gemini_Generated_Image_e3lqo0e3lqo0e3lq_mq0dnz.png"
      />

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        {isBridgeBlocked && (
           <div className="mb-12 p-6 bg-brand-dark/95 backdrop-blur-xl text-white rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-6 border-b-4 border-brand-accent animate-in fade-in slide-in-from-top-4">
              <div className="bg-brand-accent/20 p-4 rounded-2xl text-brand-accent">
                <ShieldAlert size={32} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-serif font-bold mb-1">Service Bridge Connection</h3>
                <p className="text-sm text-brand-cream/70">To use high-quality video generation, please ensure you are not in a restricted frame.</p>
              </div>
              <button 
                onClick={() => window.open(window.location.href, '_blank')}
                className="px-6 py-3 bg-white text-brand-dark rounded-xl font-bold flex items-center gap-2 hover:bg-brand-accent hover:text-white transition-all whitespace-nowrap"
              >
                Open in New Tab <ExternalLink size={18} />
              </button>
           </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Panel */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 sticky top-32">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Wand2 className="text-brand-accent" />
                  <h3 className="font-serif font-bold text-2xl">Studio Controls</h3>
                </div>
                <button 
                  onClick={handleSelectKey}
                  className={`p-2 rounded-lg transition-all group ${hasKey === false ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500 hover:bg-brand-green/10'}`}
                  title="Manage API Key"
                >
                  <Key size={18} className="group-hover:rotate-12 transition-transform" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">1. Current State (Upload)</label>
                  <button onClick={() => setIsPickerOpen(true)} className="w-full aspect-video border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center hover:bg-brand-cream transition-all relative overflow-hidden group">
                     {selectedImage ? (
                       <>
                        <img src={selectedImage} className="absolute inset-0 w-full h-full object-cover" alt="Selected" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs uppercase">Change Photo</div>
                       </>
                     ) : (
                       <>
                        <Upload className="text-gray-300 mb-2 group-hover:text-brand-green" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Yard Photo</span>
                       </>
                     )}
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">2. Choose Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {STYLE_OPTIONS.map(s => (
                      <button key={s} onClick={() => setStyle(s.toLowerCase())} className={`px-4 py-3 rounded-xl font-bold border-2 text-xs transition-all ${style === s.toLowerCase() ? 'bg-brand-green border-brand-green text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-brand-green/20'}`}>{s}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">3. Describe Vision</label>
                  <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl min-h-[100px] text-xs outline-none focus:ring-2 focus:ring-brand-green/10 transition-all" placeholder="e.g. 'Add a custom paver fire pit with limestone accents...'" />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-[10px] flex flex-col gap-2 border border-red-100">
                    <div className="flex items-center gap-2 font-bold uppercase"><ShieldAlert size={14} /> System Alert</div>
                    <p className="font-medium">{error}</p>
                    <div className="mt-1 p-2 bg-white/50 rounded-lg">
                      <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-dark font-bold hover:underline">
                        <ExternalLink size={12} /> View Billing Requirements
                      </a>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleGenerateImage}
                  disabled={!selectedImage || isGenerating || isAnimating}
                  className="w-full py-5 bg-brand-accent text-white rounded-2xl font-bold shadow-xl hover:bg-brand-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  {isGenerating ? 'Rendering Concept...' : 'Transform Yard'}
                </button>
              </div>
            </div>
          </div>

          {/* Result Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[3rem] p-4 shadow-3xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col relative group/display">
              
              {/* Animation Overlay */}
              {isAnimating && (
                <div className="absolute inset-0 z-50 bg-brand-dark/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-12">
                   <div className="w-24 h-24 bg-brand-accent/20 rounded-full flex items-center justify-center mb-8">
                      <Video size={48} className="text-brand-accent animate-bounce" />
                   </div>
                   <h3 className="text-3xl font-serif font-bold text-white mb-4">Rendering 4K Walkthrough</h3>
                   <div className="w-full max-w-sm space-y-4">
                      {ANIMATION_STEPS.map((step, i) => (
                        <div key={i} className={`flex items-center gap-4 transition-all duration-700 ${i === animationStep ? 'opacity-100 translate-x-2' : 'opacity-20'}`}>
                          <div className={`w-2 h-2 rounded-full ${i === animationStep ? 'bg-brand-accent shadow-[0_0_10px_rgba(188,108,70,0.8)]' : 'bg-white'}`}></div>
                          <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">{step}</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {/* Generated Content Rendering */}
              {generatedVideo ? (
                <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-1000">
                   <div className="relative flex-1 rounded-[2.5rem] overflow-hidden bg-black shadow-inner">
                      <video src={generatedVideo} className="w-full h-full object-cover" controls autoPlay loop />
                      <div className="absolute top-6 left-6 flex gap-2">
                        <span className="bg-brand-accent text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">4K Cinematic</span>
                        <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">VEO AI Rendering</span>
                      </div>
                   </div>
                   <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="text-center md:text-left">
                        <h4 className="text-3xl font-serif font-bold mb-1">Dream Walkthrough</h4>
                        <p className="text-gray-500 text-sm">Professional rendering complete. Available for review.</p>
                      </div>
                      <button onClick={() => navigate('/services#quote')} className="px-10 py-5 bg-brand-green text-white rounded-2xl font-bold shadow-xl flex items-center gap-3 hover:bg-brand-light transition-all active:scale-95">Book This Build <ArrowRight /></button>
                   </div>
                </div>
              ) : generatedImage ? (
                <div className="flex-1 flex flex-col animate-in fade-in duration-700 h-full">
                  <div className="relative flex-1 rounded-[2.5rem] overflow-hidden bg-gray-100 group">
                    <img src={showOriginal ? selectedImage! : generatedImage} className="w-full h-full object-cover transition-opacity duration-500" alt="Vision" />
                    
                    {/* Before/After Toggle */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-brand-dark/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-2xl">
                       <button 
                        onClick={() => setShowOriginal(true)} 
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${showOriginal ? 'bg-white text-brand-dark' : 'text-white/50 hover:text-white'}`}
                       >
                         Before
                       </button>
                       <button 
                        onClick={() => setShowOriginal(false)} 
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${!showOriginal ? 'bg-brand-accent text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                       >
                         After
                       </button>
                    </div>

                    <div className="absolute top-6 right-6">
                       <span className="bg-brand-dark/40 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] border border-white/10">
                          {style} Transformation
                       </span>
                    </div>
                  </div>
                  <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                      <button 
                        onClick={handleAnimateVision} 
                        className="px-8 py-5 bg-brand-accent text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 hover:bg-brand-dark transition-all"
                      >
                        <Video size={20} /> Animate Vision
                      </button>
                      <button 
                        onClick={() => { setGeneratedImage(null); setShowOriginal(false); }} 
                        className="px-8 py-5 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={18} /> New Design
                      </button>
                    </div>
                    <button onClick={() => navigate('/services#quote')} className="text-brand-green font-bold hover:text-brand-dark transition-colors flex items-center gap-2 group">
                       Consult with Tyler <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 animate-in fade-in duration-1000">
                  <div className="w-24 h-24 bg-brand-cream rounded-[2rem] flex items-center justify-center mb-8 shadow-inner">
                    <ImageIcon size={40} className="text-brand-accent/30" />
                  </div>
                  <h3 className="text-4xl font-serif font-bold text-brand-dark mb-4 tracking-tight">Visualize Your Oasis</h3>
                  <p className="max-w-md text-gray-500 text-sm leading-relaxed mb-8">Upload a photo of your existing yard and let our AI architect render a professional transformation using Missouri-native plants and premium stonework.</p>
                  
                  <div className="grid grid-cols-2 gap-4 max-w-sm w-full">
                     <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <CheckCircle2 size={16} className="text-brand-green mb-2 mx-auto" />
                        <span className="text-[9px] font-bold uppercase text-gray-400">Native Species</span>
                     </div>
                     <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <CheckCircle2 size={16} className="text-brand-green mb-2 mx-auto" />
                        <span className="text-[9px] font-bold uppercase text-gray-400">Hardscape Depth</span>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ImagePickerModal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} onImageSelected={setSelectedImage} />
    </div>
  );
};

export default DesignStudio;
