
import React, { useEffect, useState, useRef } from 'react';
import { X, RefreshCw, Trash2, Activity, CheckCircle, AlertCircle, Info, Copy, Database, PlayCircle, HardDrive, Globe, ShieldCheck, Terminal } from 'lucide-react';
import { diagnostics, LogEntry } from '../services/diagnostics';
import { IS_FIREBASE_CONFIGURED, firebaseConfig } from '../firebaseConfig';
// Fix: Use corrected exported members from firebase service
import { runSystemHealthCheck, HealthCheckResult } from '../services/firebase';

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [healthStatus, setHealthStatus] = useState<HealthCheckResult | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const targetDomain = "creativelandscapingsolutions.com";
  const currentHost = window.location.hostname;
  const isTargetDomain = currentHost === targetDomain;
  const isFirebaseHost = currentHost.includes('web.app') || currentHost.includes('firebaseapp.com');

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = diagnostics.subscribe((updatedLogs) => {
      setLogs(updatedLogs);
    });
    return () => unsubscribe();
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message} ${l.details || ''}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleRunHealthCheck = async () => {
    setIsRunningTest(true);
    setHealthStatus(null);
    try {
      const result = await runSystemHealthCheck();
      setHealthStatus(result);
    } finally {
      setIsRunningTest(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-gray-900 text-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col relative z-10 border border-gray-700 font-mono text-sm">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800 rounded-t-xl">
          <div className="flex items-center gap-3">
            <Activity className="text-brand-accent animate-pulse" size={20} />
            <div>
                <h3 className="font-bold text-lg tracking-wide">System Diagnostics</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className={`w-2 h-2 rounded-full ${IS_FIREBASE_CONFIGURED ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    {IS_FIREBASE_CONFIGURED ? 'MODE: LIVE (Firebase)' : 'MODE: DEMO (Local Storage)'}
                </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleRunHealthCheck}
              disabled={isRunningTest || !IS_FIREBASE_CONFIGURED}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${isRunningTest ? 'bg-gray-700 text-gray-400' : 'bg-brand-green text-white hover:bg-brand-light'}`}
              title="Test Connection"
            >
              <PlayCircle size={16} /> {isRunningTest ? 'Testing...' : 'Run Health Check'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors ml-2">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Domain & Hosting Status */}
        <div className="p-4 bg-gray-800/50 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-brand-accent uppercase text-[10px] font-bold tracking-widest">
              <Globe size={14} /> Domain & Project Info
            </div>
            <div className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1">
              <Terminal size={12}/> Project ID: {firebaseConfig.projectId}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg border ${isTargetDomain ? 'bg-green-900/20 border-green-700/50' : 'bg-amber-900/20 border-amber-700/50'} flex items-center justify-between`}>
              <div>
                <div className="text-xs text-gray-400 font-bold uppercase mb-1">Target Domain</div>
                <div className="text-sm font-bold">{targetDomain}</div>
              </div>
              {isTargetDomain ? (
                <div className="flex items-center gap-1 text-green-400 text-xs font-bold bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                  <ShieldCheck size={12} /> Live
                </div>
              ) : (
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">
                  <AlertCircle size={12} /> Not Detected
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg border bg-gray-800/50 border-gray-700 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 font-bold uppercase mb-1">Current Environment</div>
                <div className="text-sm font-bold">{currentHost}</div>
              </div>
              {isFirebaseHost && (
                <div className="text-blue-400 text-[10px] font-bold uppercase bg-blue-400/10 px-2 py-1 rounded-full border border-blue-400/20">
                  Firebase Preview
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Firebase Health Area */}
        {healthStatus && (
           <div className="p-4 bg-gray-800 border-b border-gray-700 grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg border flex items-center gap-3 ${
                  healthStatus.firestore.status === 'ok' ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'
              }`}>
                 <Database size={24} className={healthStatus.firestore.status === 'ok' ? 'text-green-500' : 'text-red-500'} />
                 <div>
                    <div className="font-bold text-gray-300">Firestore Database</div>
                    <div className={`text-xs ${healthStatus.firestore.status === 'ok' ? 'text-green-400' : 'text-red-300'}`}>
                      {healthStatus.firestore.message}
                    </div>
                 </div>
              </div>

              <div className={`p-3 rounded-lg border flex items-center gap-3 ${
                  healthStatus.storage.status === 'ok' ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'
              }`}>
                 <HardDrive size={24} className={healthStatus.storage.status === 'ok' ? 'text-green-500' : 'text-red-500'} />
                 <div>
                    <div className="font-bold text-gray-300">Storage Bucket</div>
                    <div className={`text-xs ${healthStatus.storage.status === 'ok' ? 'text-green-400' : 'text-red-300'}`}>
                      {healthStatus.storage.message}
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* Logs Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-2 bg-black/50" ref={scrollRef}>
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-600 italic">
              Listening for system events...
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors border-l-2 border-transparent hover:border-gray-600 group">
                <span className="text-gray-500 shrink-0 select-none w-20 text-xs mt-0.5">{log.timestamp}</span>
                <div className="shrink-0 mt-0.5">
                  {log.level === 'error' && <AlertCircle size={16} className="text-red-500" />}
                  {log.level === 'warn' && <AlertCircle size={16} className="text-yellow-500" />}
                  {log.level === 'success' && <CheckCircle size={16} className="text-green-500" />}
                  {log.level === 'info' && <Info size={16} className="text-blue-500" />}
                </div>
                <div className="flex-grow break-all">
                  <span className={`font-bold ${
                    log.level === 'error' ? 'text-red-400' : 
                    log.level === 'warn' ? 'text-yellow-400' : 
                    log.level === 'success' ? 'text-green-400' : 'text-gray-300'
                  }`}>
                    {log.message}
                  </span>
                  {log.details && (
                    <pre className="mt-1 text-xs text-gray-500 bg-black/30 p-2 rounded overflow-x-auto whitespace-pre-wrap font-mono">
                      {log.details}
                    </pre>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-gray-700 bg-gray-800 rounded-b-xl text-xs text-gray-400 flex justify-between items-center">
           <div className="flex gap-4">
              <button onClick={handleCopy} className="hover:text-white transition-colors flex items-center gap-1">
                {copyFeedback ? <CheckCircle size={12} /> : <Copy size={12} />} {copyFeedback ? 'Copied' : 'Copy Logs'}
              </button>
              <button onClick={() => diagnostics.clear()} className="hover:text-white transition-colors flex items-center gap-1">
                <Trash2 size={12} /> Clear
              </button>
           </div>
           <span className="flex items-center gap-1"><Database size={12}/> {IS_FIREBASE_CONFIGURED ? 'Live Cloud Sync' : 'Demo Mode'}</span>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
