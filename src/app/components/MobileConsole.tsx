import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface LogEntry {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
}

export function MobileConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logQueueRef = useRef<LogEntry[]>([]);
  const flushTimeoutRef = useRef<number>();

  // Check if there are any alerts (errors or warnings)
  const hasAlerts = logs.some(log => log.type === 'error' || log.type === 'warn');

  useEffect(() => {
    // Intercept console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    // Queue logs instead of immediately updating state
    const queueLog = (type: LogEntry['type'], args: any[]) => {
      const message = args.map(arg => String(arg)).join(' ');
      logQueueRef.current.push({ type, message, timestamp: new Date() });
      
      // Debounce state updates to avoid setState during render
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      flushTimeoutRef.current = window.setTimeout(() => {
        setLogs(prev => [...prev, ...logQueueRef.current]);
        logQueueRef.current = [];
      }, 0);
    };

    console.log = (...args: any[]) => {
      originalLog(...args);
      queueLog('log', args);
    };

    console.error = (...args: any[]) => {
      originalError(...args);
      queueLog('error', args);
    };

    console.warn = (...args: any[]) => {
      originalWarn(...args);
      queueLog('warn', args);
    };

    console.info = (...args: any[]) => {
      originalInfo(...args);
      queueLog('info', args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const clearLogs = () => {
    setLogs([]);
    logQueueRef.current = [];
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-slate-300';
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  if (!isOpen) {
    // Only show button when there are alerts (errors or warnings)
    if (!hasAlerts) {
      return null;
    }
    
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[9999] bg-red-600 text-white px-4 py-3 rounded-full shadow-lg font-mono text-sm font-bold hover:bg-red-700 active:bg-red-800 touch-manipulation animate-pulse"
        style={{
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        ⚠️ Console ({logs.filter(l => l.type === 'error' || l.type === 'warn').length})
      </button>
    );
  }

  return (
    <div 
      className={`fixed right-0 bottom-0 left-0 z-[9999] bg-slate-950 border-t-2 border-green-500 shadow-2xl flex flex-col transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-96'
      }`}
      style={{
        maxHeight: isMinimized ? '64px' : '50vh'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono text-sm font-bold">📱 Mobile Console</span>
          <span className="text-slate-500 text-xs">({logs.length} logs)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearLogs}
            className="p-2 text-slate-400 hover:text-white active:text-green-400 touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 text-slate-400 hover:text-white active:text-green-400 touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-white active:text-red-400 touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-slate-500 text-center py-8">No logs yet. Tap the hamburger menu to test!</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`${getLogColor(log.type)} leading-relaxed`}>
                <span className="text-slate-600 mr-2">
                  {log.timestamp.toLocaleTimeString('en-US', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit',
                    fractionalSecondDigits: 3
                  })}
                </span>
                <span className="mr-2">{getLogIcon(log.type)}</span>
                <span className="break-all">{log.message}</span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  );
}