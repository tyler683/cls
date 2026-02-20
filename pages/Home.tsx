
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Briefcase,
  Gem,
  Palmtree,
  CheckCircle,
  Star,
  Quote,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  ExternalLink
} from 'lucide-react';
import SEO from '../components/SEO';

const LOCAL_PROJECTS = [
  { location: "Overland Park", task: "Custom Paver Patio" },
  { location: "Liberty", task: "Retaining Wall" },
  { location: "Lee's Summit", task: "Grading & Drainage" },
  { location: "Leawood", task: "Modern Pool" }
];

const TESTIMONIALS = [
  {
    name: "Sarah Jenkins",
    location: "Mission Hills, KS",
    text: "I was honestly dreading the construction mess, but Tyler's crew kept the site spotless every single evening. The natural flagstone work is beautiful—it looks like it has always been a part of the house.",
    rating: 5
  },
  {
    name: "Mark Thompson",
    location: "Brookside, MO",
    text: "Every time we got a heavy rain, our basement was a swamp. Matt came out, walked the property, and actually explained the grading issues instead of just trying to sell me a French drain. We've stayed dry through three big storms now.",
    rating: 5
  },
  {
    name: "The Hernandez Family",
    location: "Lee's Summit, MO",
    text: "Our backyard was a total mud pit after our pool installation. These guys came in, handled the retaining walls and sod in record time, and now my kids can actually play outside again. Worth every penny.",
    rating: 5
  }
];

const TIERS = [
  {
    title: "The Foundation",
    price: "Starting at $5k",
    icon: <Briefcase className="text-brand-green" />,
    features: ["Grading & Drainage Correction", "Small Paver Walkway", "Sod Installation"],
    accent: "bg-gray-50"
  },
  {
    title: "The Oasis",
    price: "Starting at $15k",
    icon: <Palmtree className="text-brand-accent" />,
    features: ["Custom Limestone Patio", "Retaining Wall Tiering", "Native Planting"],
    accent: "bg-brand-cream border-2 border-brand-accent/20",
    recommended: true
  },
  {
    title: "The Estate",
    price: "Starting at $45k",
    icon: <Gem className="text-brand-green" />,
    features: ["Outdoor Kitchen & Firepit", "Modern Pool Surround", "Structural Walls"],
    accent: "bg-brand-dark text-white"
  }
];

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    handle: '@creativelandscapingsolutions',
    icon: <Instagram />,
    url: 'https://www.instagram.com/creativelandscapingsolutions/',
    color: 'hover:bg-[#E4405F]'
  },
  {
    name: 'Facebook',
    handle: 'Creative Landscaping Solutions',
    icon: <Facebook />,
    url: 'https://www.facebook.com/profile.php?id=61584560035614',
    color: 'hover:bg-[#1877F2]'
  },
  {
    name: 'LinkedIn',
    handle: 'Creative Landscaping Solutions',
    icon: <Linkedin />,
    url: '#',
    color: 'hover:bg-[#0077B5]'
  },
  {
    name: 'X (Twitter)',
    handle: '@CreativeLSCKC',
    icon: <Twitter />,
    url: '#',
    color: 'hover:bg-black'
  }
];

const Home: React.FC = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream">
      <SEO 
        title="Premier Kansas City Landscaping & Hardscaping" 
        description="Creative Landscaping Solutions offers expert landscaping, custom patios, and site preparation in Kansas City."
      />
      
      {/* High-Resilience Hero Section */}
      <section className="relative h-[85vh] min-h-[550px] flex flex-col justify-center text-white overflow-hidden w-full bg-brand-dark">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://res.cloudinary.com/clsllc/image/upload/v1765419813/Gemini_Generated_Image_e3lqo0e3lqo0e3lq_mq0dnz.png" 
            alt="Premium Backyard Landscape" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-brand-dark/20 to-brand-dark z-10"></div>
        </div>

        <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 max-w-6xl mx-auto h-full">
          <div className="flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 animate-in fade-in slide-in-from-top-4 duration-700">
            <ShieldCheck size={16} className="text-brand-accent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Fully Licensed & Insured Missouri Contractor</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif font-extrabold text-white mb-6 tracking-tighter leading-tight drop-shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-1000">
            Hard Work. <br/><span className="text-brand-accent italic">Honest Roots.</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl font-medium text-brand-cream/90 max-w-3xl mx-auto italic mb-10 leading-relaxed drop-shadow-lg">
            Transforming the Heartland with family values, <br className="hidden md:block"/> high-tech design, and master-level stone work.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link 
              to="/quote" 
              className="bg-brand-accent hover:bg-white hover:text-brand-dark text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transition-all flex items-center gap-3 active:scale-95 group"
            >
              Start Your Transformation <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/design-studio" 
              className="bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-brand-dark px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-3"
            >
              <span className="flex items-center gap-2"><Sparkles size={18} className="text-brand-accent" /> AI Design Lab</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Scroller */}
      <section className="bg-brand-dark py-4 overflow-hidden border-y border-white/5 w-full">
        <div className="flex whitespace-nowrap animate-scroll">
          {[...LOCAL_PROJECTS, ...LOCAL_PROJECTS, ...LOCAL_PROJECTS].map((p, i) => (
            <div key={i} className="flex items-center gap-6 mx-12 text-white/70 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(188,108,70,0.8)]"></div>
              <span className="font-bold text-[10px] uppercase tracking-widest">
                <span className="text-brand-accent">{p.location}:</span> {p.task}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Service Tiers */}
      <section className="py-24 bg-white w-full px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-brand-accent font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Master Build Options</h2>
             <h3 className="text-4xl font-serif font-bold text-brand-dark">Choose Your Level of Luxury</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {TIERS.map((tier, i) => (
              <div key={i} className={`relative p-8 rounded-[2.5rem] border transition-all hover:shadow-xl ${tier.accent}`}>
                <div className="mb-6 p-4 bg-white/10 rounded-2xl w-fit">
                  {tier.icon}
                </div>
                <h4 className="text-2xl font-serif font-bold mb-2">{tier.title}</h4>
                <p className={`text-3xl font-bold mb-8 text-brand-accent`}>{tier.price}</p>
                <ul className="space-y-4 mb-10">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-medium">
                      <CheckCircle size={16} className="text-brand-accent shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/quote" className="w-full py-4 rounded-xl bg-brand-dark text-white font-bold text-center block hover:bg-brand-accent transition-colors shadow-lg">
                  Explore {tier.title}
                </Link>
              </div>
            ))}
          </div>

          {/* Testimonials Sub-Section */}
          <div className="pt-20 border-t border-gray-100">
             <div className="text-center mb-16">
                <h2 className="text-brand-accent font-bold uppercase tracking-widest text-xs mb-4">Success Stories</h2>
                <h3 className="text-3xl font-serif font-bold text-brand-dark">What Your Neighbors Are Saying</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} className="bg-brand-cream p-8 rounded-[2rem] border border-brand-green/5 shadow-sm">
                    <div className="flex gap-1 mb-4">
                      {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} className="fill-brand-accent text-brand-accent" />)}
                    </div>
                    <Quote className="text-brand-accent/20 mb-4" size={32} />
                    <p className="text-gray-700 italic mb-6 leading-relaxed">"{t.text}"</p>
                    <div>
                      <p className="font-bold text-brand-dark">{t.name}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-widest">{t.location}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-24 bg-brand-dark text-white w-full px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-accent opacity-20"></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-accent/20 text-brand-accent rounded-full text-xs font-bold uppercase tracking-widest mb-8">
              <ExternalLink size={14} /> Connect With Us
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Follow Our Growth</h2>
            <p className="text-brand-cream/60 max-w-2xl mx-auto text-lg leading-relaxed">
              Join our community of Missouri homeowners. See daily project reveals, native plant tips, and high-tech landscape transformations on social media.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {SOCIAL_LINKS.map((social) => (
              <a 
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col items-center justify-center p-8 bg-white/5 rounded-[2.5rem] border border-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:border-brand-accent ${social.color}`}
              >
                <div className="w-16 h-16 bg-brand-dark rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {React.cloneElement(social.icon as React.ReactElement<any>, { size: 32 })}
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-[10px] uppercase tracking-[0.2em] text-brand-accent mb-1">
                    {social.name}
                  </span>
                  <span className="text-xs text-brand-cream/40 group-hover:text-white transition-colors">
                    {social.handle}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
