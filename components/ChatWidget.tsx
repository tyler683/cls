import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles, Trash2, Minimize2, Mic, MicOff, Volume2, Waves, MapPin, ExternalLink } from 'lucide-react';
import { ChatMessage } from '../types';
import { getChatResponse, ChatResponse } from '../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface MessageWithLinks extends ChatMessage {
  links?: { title: string; uri: string }[];
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [messages, setMessages] = useState<MessageWithLinks[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Helper functions for audio
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  };

  const startLiveConsultation = async () => {
    try {
      setIsLiveActive(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        // Always use the latest model name for native audio tasks as per guidelines
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              sessionPromise.then(session => session.sendRealtimeInput({ media: createBlob(inputData) }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsLiveActive(false),
          onerror: (e) => console.error("Live API Error:", e)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: "You are a friendly landscape consultant for Creative Landscaping Solutions. Speak naturally. Tyler Dennison is the owner. You know about Kansas City drainage, Missouri native plants, and hardscaping."
        }
      });
      liveSessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start voice consult:", err);
      setIsLiveActive(false);
    }
  };

  const stopLiveConsultation = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsLiveActive(false);
  };

  useEffect(() => {
    try {
      const savedChat = localStorage.getItem('cls_chat_history');
      if (savedChat) setMessages(JSON.parse(savedChat));
      else {
        setMessages([{
          role: 'model',
          text: "Hi there! 👋 I'm the Creative Landscaping local expert. Need advice on native plants in Brookside or a patio in Leawood? Ask away!",
          timestamp: Date.now()
        }]);
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (messages.length > 0) localStorage.setItem('cls_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: MessageWithLinks = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response: ChatResponse = await getChatResponse([...messages, userMsg], userMsg.text);
    setMessages(prev => [...prev, { 
      role: 'model', 
      text: response.text, 
      timestamp: Date.now(),
      links: response.groundingLinks
    }]);
    setIsLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[60] p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'bg-brand-dark text-white rotate-90' : 'bg-brand-green text-white hover:scale-110 hover:bg-brand-accent'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      <div className={`fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-[2rem] shadow-3xl border border-gray-100 z-[60] flex flex-col overflow-hidden transition-all duration-500 origin-bottom-right ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'
        }`}
        style={{ maxHeight: 'calc(100vh - 120px)' }}
      >
        {/* Header */}
        <div className="bg-brand-dark p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-brand-accent/20 p-2 rounded-xl text-brand-accent">
              {isVoiceMode ? <Waves className="animate-pulse" /> : <Sparkles size={20} />}
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg">AI Consultant</h3>
              <p className="text-[10px] text-brand-accent font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse"></span> {isLiveActive ? 'Voice Active' : 'Online'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (isVoiceMode) {
                  stopLiveConsultation();
                  setIsVoiceMode(false);
                } else {
                  setIsVoiceMode(true);
                  startLiveConsultation();
                }
              }}
              className={`p-2 rounded-xl transition-all ${isVoiceMode ? 'bg-brand-accent text-white' : 'hover:bg-white/10 text-gray-400'}`}
            >
              {isVoiceMode ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl text-gray-400"><Minimize2 size={18} /></button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-brand-cream/30 h-[450px]">
          {isVoiceMode ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
               <div className="relative">
                  <div className="absolute inset-0 bg-brand-accent/20 rounded-full blur-3xl animate-pulse scale-150"></div>
                  <div className={`w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl relative z-10 border-4 border-brand-accent/20 transition-transform duration-300 ${isLiveActive ? 'scale-110' : 'scale-100'}`}>
                    <Volume2 size={48} className={`text-brand-accent ${isLiveActive ? 'animate-bounce' : 'opacity-40'}`} />
                  </div>
               </div>
               <div>
                  <h4 className="font-serif font-bold text-xl text-brand-dark mb-2">Live Voice Consult</h4>
                  <p className="text-sm text-gray-500 max-w-[200px] mx-auto">Ask about your yard, drainage, or design. We're listening.</p>
               </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-[1.5rem] p-4 text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user' ? 'bg-brand-accent text-white rounded-br-none' : 'bg-white text-brand-dark border border-gray-100 rounded-bl-none'
                    }`}>
                    {msg.text}
                  </div>
                  {msg.links && msg.links.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 max-w-[85%]">
                      {msg.links.map((link, i) => (
                        <a 
                          key={i} 
                          href={link.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-brand-green/10 text-[10px] font-bold text-brand-green uppercase rounded-lg hover:bg-brand-cream transition-colors shadow-sm"
                        >
                          <MapPin size={10} /> {link.title} <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-brand-green" />
                    <span className="text-xs text-gray-400 font-bold uppercase">Gathering local data...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        {!isVoiceMode && (
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-50 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How can we help?"
              className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-brand-green"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded-2xl transition-all ${
                !input.trim() || isLoading ? 'bg-gray-100 text-gray-300' : 'bg-brand-dark text-white hover:bg-brand-accent'
              }`}
            >
              <Send size={20} />
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default ChatWidget;