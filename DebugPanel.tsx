const logUploadDiagnostics = (message: string, level: 'info' | 'warn' | 'error' | 'success') => {
    diagnostics.log({
        timestamp: new Date().toISOString(),
        level: level,
        message: message,
        details: null,
    });
};

// Use the logUploadDiagnostics function to log for every stage of the queue and uploadMedia.

const retryUploadQueue = () => {
    logUploadDiagnostics('Retrying upload queue', 'info');
    // Functionality to clear failed uploads and re-queue them
};
<button onClick={retryUploadQueue} className="p-2 bg-yellow-500 text-white rounded-lg">
    Retry Sync
</button>

const displayHealthCheckDetails = (result: HealthCheckResult) => {
    logUploadDiagnostics(`Health Check:\n    Firestore Status: ${result.firestore.status}\n    Firestore Message: ${result.firestore.message}\n    Storage Status: ${result.storage.status}\n    Storage Message: ${result.storage.message}`, 'info');
    setHealthStatus(result);
};

// Extend handleRunHealthCheck to call displayHealthCheckDetails and log details.

useEffect(() => {
    console.log('Updated logs:', logs);
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
}, [logs]);

useEffect(() => {
    logs.forEach((log) => {
        if (log.message.includes('uploadMedia')) {
            console.log('Upload status:', log);
        }
    });
}, [logs]);