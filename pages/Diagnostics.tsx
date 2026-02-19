import React, { useEffect, useState, useRef } from 'react';
import { 
  Activity, 
  Database, 
  HardDrive, 
  Globe, 
  ShieldCheck, 
  Terminal, 
  RefreshCw, 
  Trash2, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Info,
  ChevronLeft,
  Settings,
  AlertTriangle,
  ServerCrash,
  LifeBuoy,
  RotateCcw,
  Upload
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { diagnostics, LogEntry } from '../services/diagnostics';
import { IS_FIREBASE_CONFIGURED, firebaseConfig } from '../firebaseConfig';
import { runSystemHealthCheck, HealthCheckResult } from '../services/firebase';
import { useGallery } from '../context/GalleryContext';

const Diagnostics: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [healthStatus, setHealthStatus] = useState<HealthCheckResult | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [supportFeedback, setSupportFeedback] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { uploadQueue, retryFailedProjects } = useGallery();

  const targetDomain = "creativelandscapingsolutions.com";
  const currentHost = window.location.hostname;
  const isTargetDomain = currentHost === targetDomain;
  const isFallbackDomain = currentHost.includes('web.app');
  
  // Detection for the Squarespace 403 Conflict
  const [dnsConflict, setDnsConflict] = useState(false);

  useEffect(() => {
    const unsubscribe = diagnostics.subscribe((updatedLogs) => {
      setLogs(updatedLogs);
    });
    handleRunHealthCheck();
    
    if (currentHost !== 'localhost' && !isFallbackDomain && !isTargetDomain) {
      setDnsConflict(true);
    }

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleRunHealthCheck = async () => {
    setIsRunningTest(true);
    try {
      const result = await runSystemHealthCheck();
      setHealthStatus(result);
    } finally {
      setIsRunningTest(false);
    }
  };

  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message} ${l.details || ''}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleCopySupportTicket = () => {
    const ticket = `Hello Support,
    
I am moving my website to Firebase Hosting. I am currently experiencing a DNS_PROBE_FINISHED_NXDOMAIN error.

Please verify that my DNS records are set as follows:
1. A Record (@): 199.36.158.100
2. A Record (@): 151.101.1.195
3. CNAME Record (www): ${firebaseConfig.authDomain}

Also, please ensure all previous Squarespace A records (198.185.159.x) have been completely removed from the zone file.

Thank you.`;
    navigator.clipboard.writeText(ticket);
    setSupportFeedback(true);
    setTimeout(() => setSupportFeedback(false), 2000);
  };

  const handleFactoryReset = () => {
    if (window.confirm("CAUTION: This will clear all locally saved data and settings. Your live Firebase data will remain intact, but your browser session will be reset. Proceed?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleRetryUploads = async () => {
    setIsRetrying(true);
    try {
      await retryFailedProjects();
    } finally {
      setIsRetrying(false);
    }
  };

  const failedUploads = uploadQueue.filter(q => q.uploadStatus === 'failed' || q.error);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-mono selection:bg-brand-accent selection:text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-12">
          <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
            <ChevronLeft size={20} /> Back to Public Site
          </Link>
          <div className="flex items-center gap-3">
             <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${IS_FIREBASE_CONFIGURED ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                Mode: {IS_FIREBASE_CONFIGURED ? 'Live Production' : 'Demo / Development'}
             </div>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center gap-4 mb-12">
          <div className="p-4 bg-brand-accent/20 text-brand-accent rounded-2xl shadow-[0_0_30px_rgba(188,108,70,0.2)]">
            <Activity size={32} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tighter">Command Center</h1>
            <p className="text-gray-500">System Diagnostics & Deployment Verification</p>
          </div>
        </div>

        {/* DNS Conflict Alert */}
        {(dnsConflict || isFallbackDomain) && (
          <div className="mb-8 p-8 bg-amber-500/10 border border-amber-500/30 rounded-[2rem] flex flex-col md:flex-row items-center gap-8">
            <div className="p-4 bg-amber-500/20 text-amber-500 rounded-2xl">
              <ServerCrash size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-2">DNS Propagation in Progress</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                You are currently viewing the site via the <strong>fallback domain</strong>. If you are seeing NXDOMAIN on your primary domain, ensure you have added the <code className="text-white bg-white/10 px-1">www</code> CNAME record and removed all Squarespace records.
              </p>
              <button 
                onClick={handleCopySupportTicket}
                className="flex items-center gap-2 text-[10px] font-bold uppercase bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all"
              >
                {supportFeedback ? <CheckCircle size={14} /> : <LifeBuoy size={14} />}
                {supportFeedback ? 'Ticket Copied' : 'Copy Support Ticket for Registrar'}
              </button>
            </div>
          </div>
        )}

        {/* Health Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <div className={`p-6 bg-gray-900/50 border rounded-3xl transition-colors ${isTargetDomain ? 'border-gray-800' : 'border-amber-500/30'}`}>
            <div className="flex items-center justify-between mb-4">
              <Globe className={isTargetDomain ? "text-blue-400" : "text-amber-400"} />
              <span className="text-[10px] font-bold text-gray-600 uppercase">Routing</span>
            </div>
            <h3 className="text-xl font-bold mb-1 truncate">{currentHost}</h3>
            <p className="text-xs text-gray-500 mb-4">Hostname Status</p>
            {isTargetDomain ? (
              <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                <CheckCircle size={14} /> Domain Verified
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <AlertTriangle size={14} /> Fallback Active
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <Database className="text-brand-accent" />
              <span className="text-[10px] font-bold text-gray-600 uppercase">Persistence</span>
            </div>
            <h3 className="text-xl font-bold mb-1">Firestore</h3>
            <p className="text-xs text-gray-500 mb-4">Database Connection</p>
            {healthStatus?.firestore.status === 'ok' ? (
              <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                <CheckCircle size={14} /> Online & Responsive
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                <AlertCircle size={14} /> {healthStatus?.firestore.message || 'Connecting...'}
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <HardDrive className="text-purple-400" />
              <span className="text-[10px] font-bold text-gray-600 uppercase">Media</span>
            </div>
            <h3 className="text-xl font-bold mb-1">Storage</h3>
            <p className="text-xs text-gray-500 mb-4">Cloud Assets Bucket</p>
            {healthStatus?.storage.status === 'ok' ? (
              <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                <CheckCircle size={14} /> Bucket Reachable
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                <AlertCircle size={14} /> {healthStatus?.storage.message || 'Connecting...'}
              </div>
            )}
          </div>

        </div>

        {/* Upload Queue */}
        {uploadQueue.length > 0 && (
          <div className="mb-12 bg-gray-900/50 border border-gray-800 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Upload size={18} className="text-gray-500" />
                <h2 className="font-bold text-lg">Upload Queue</h2>
                <span className="text-xs text-gray-500">({uploadQueue.length} item{uploadQueue.length !== 1 ? 's' : ''})</span>
              </div>
              {failedUploads.length > 0 && (
                <button
                  onClick={handleRetryUploads}
                  disabled={isRetrying}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl transition-colors text-xs font-bold disabled:opacity-50"
                >
                  <RotateCcw size={14} className={isRetrying ? 'animate-spin' : ''} />
                  {isRetrying ? 'Retrying...' : `Retry Failed (${failedUploads.length})`}
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-800/50">
              {uploadQueue.map((item) => {
                const status = item.uploadStatus ?? (item.error ? 'failed' : 'pending');
                const statusConfig = {
                  pending:   { label: 'Pending',   color: 'text-gray-400',  bg: 'bg-gray-500/10'  },
                  uploading: { label: 'Uploading',  color: 'text-blue-400',  bg: 'bg-blue-500/10'  },
                  success:   { label: 'Success',    color: 'text-green-400', bg: 'bg-green-500/10' },
                  failed:    { label: 'Failed',     color: 'text-red-400',   bg: 'bg-red-500/10'   },
                }[status];
                return (
                  <div key={item.id} className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{item.title}</p>
                      {item.error && <p className="text-xs text-red-400 mt-0.5 truncate">{item.error}</p>}
                      {status === 'uploading' && typeof item.uploadProgress === 'number' && (
                        <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${item.uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusConfig.color} ${statusConfig.bg}`}>
                      {statusConfig.label}
                      {status === 'uploading' && typeof item.uploadProgress === 'number'
                        ? ` ${Math.round(item.uploadProgress)}%`
                        : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Logs Dashboard */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-[2.5rem] overflow-hidden flex flex-col h-[500px]">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Terminal size={18} className="text-gray-500" />
              <h2 className="font-bold text-lg">System Flight Logs</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={handleRunHealthCheck} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                <RefreshCw size={18} className={isRunningTest ? 'animate-spin' : ''} />
              </button>
              <button onClick={handleCopy} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors text-xs font-bold flex items-center gap-2 px-4">
                {copyFeedback ? <CheckCircle size={14} /> : <Copy size={14} />} {copyFeedback ? 'Copied' : 'Copy All'}
              </button>
              <button onClick={() => diagnostics.clear()} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto p-6 space-y-3 no-scrollbar" ref={scrollRef}>
            {logs.map((log) => (
              <div key={log.id} className="group flex gap-4 text-sm animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-gray-600 select-none w-20 shrink-0">{log.timestamp}</span>
                <span className={`font-bold w-16 shrink-0 ${
                  log.level === 'error' ? 'text-red-500' :
                  log.level === 'warn' ? 'text-amber-500' :
                  log.level === 'success' ? 'text-green-500' : 'text-blue-500'
                }`}>
                  [{log.level.toUpperCase()}]
                </span>
                <div className="flex-grow">
                  <p className="text-gray-200">{log.message}</p>
                  {log.details && (
                    <pre className="mt-2 p-3 bg-black rounded-xl text-xs text-gray-500 overflow-x-auto border border-white/5">
                      {log.details}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Tools */}
        <div className="mt-12 p-8 border border-red-900/30 bg-red-900/5 rounded-[2.5rem]">
           <div className="flex items-center gap-3 mb-4 text-red-500">
              <Settings />
              <h3 className="font-bold text-xl">Emergency Recovery</h3>
           </div>
           <p className="text-gray-500 mb-6 max-w-2xl">If the application is behaving unexpectedly or showing "corrupted" data despite being connected to Firebase, you can clear the local browser state.</p>
           <button 
            onClick={handleFactoryReset}
            className="px-8 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-2xl shadow-red-500/20 hover:bg-red-600 transition-all flex items-center gap-2"
           >
             <Trash2 size={18} /> Perform Factory Reset
           </button>
        </div>

      </div>
    </div>
  );
};

export default Diagnostics;