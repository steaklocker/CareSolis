import React, { useMemo, useState } from 'react';
import { useCaresolis } from '../hooks/useCaresolis';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Send, 
  ArrowRight,
  Search,
  Download,
  Filter,
  Bell,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import { Pagination } from '../components/Pagination';

export default function NotificationHistory() {
  const { notifications } = useCaresolis();
  const [filterType, setFilterType] = useState<'all' | 'delivered' | 'failed' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Enhance notifications with simulated delivery status based on time elapsed
  // In a real app, this would come from the backend.
  const enhancedNotifications = useMemo(() => {
    const now = new Date().getTime();
    return notifications.map(note => {
        const sentTime = new Date(note.timestamp).getTime();
        const elapsed = (now - sentTime) / 1000 / 60; // minutes

        let status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' = 'read';
        
        // Simulate some variety based on content or random for demo purposes if not provided
        if (note.status) {
            status = note.status;
        } else {
             if (elapsed < 1) status = 'sending';
             else if (elapsed < 5) status = 'sent';
             else if (elapsed < 15) status = 'delivered';
             
             // Simulate a failure for "Error" subjects
             if (note.subject && note.subject.toLowerCase().includes('failed')) {
                 status = 'failed';
             }
        }
        
        return { ...note, status, elapsed };
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications]);

  // Filter & Search Logic
  const filteredNotifications = useMemo(() => {
    let filtered = enhancedNotifications;

    // Apply Filter
    if (filterType !== 'all') {
        filtered = filtered.filter(n => {
            if (filterType === 'delivered') return ['delivered', 'read', 'sent'].includes(n.status);
            if (filterType === 'failed') return n.status === 'failed';
            if (filterType === 'pending') return n.status === 'sending';
            return true;
        });
    }

    // Apply Search
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(n => 
            n.subject.toLowerCase().includes(query) ||
            n.body.toLowerCase().includes(query) ||
            (n.to && n.to.toLowerCase().includes(query))
        );
    }

    return filtered;
  }, [enhancedNotifications, filterType, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNotifications, currentPage]);

  // Reset page on filter change
  React.useEffect(() => {
      setCurrentPage(1);
  }, [filterType, searchQuery]);

  // Stats
  const stats = useMemo(() => {
      const total = enhancedNotifications.length;
      const today = new Date().toDateString();
      const todayCount = enhancedNotifications.filter(n => new Date(n.timestamp).toDateString() === today).length;
      const failed = enhancedNotifications.filter(n => n.status === 'failed').length;
      const successRate = total > 0 ? Math.round(((total - failed) / total) * 100) : 100;
      
      return { total, todayCount, successRate };
  }, [enhancedNotifications]);

  const downloadCSV = () => {
    const headers = ['ID', 'Timestamp', 'To', 'Subject', 'Body', 'Status'];
    const rows = filteredNotifications.map(note => {
      const date = new Date(note.timestamp).toLocaleString();
      return [
        note.id,
        `"${date}"`,
        note.to,
        `"${note.subject.replace(/"/g, '""')}"`,
        `"${note.body.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        note.status
      ].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `caresolis_notifications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
               <Bell className="w-6 h-6 text-sky-600 dark:text-sky-400" />
               Notification History
           </h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">
              Complete audit trail of all outbound alerts and communications.
           </p>
        </div>
        <button 
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-colors shadow-sm"
        >
            <Download className="w-4 h-4" />
            Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
                    <Mail className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">All Time</span>
            </div>
            <div className="mt-2">
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Notifications Sent</p>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full">Today</span>
            </div>
            <div className="mt-2">
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.todayCount}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Sent Today</p>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">Reliability</span>
            </div>
            <div className="mt-2">
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.successRate}%</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Delivery Success Rate</p>
            </div>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
             {/* Search */}
             <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Search by subject, recipient, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 dark:focus:border-sky-400 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                />
             </div>

             {/* Filters */}
             <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 hidden sm:block">Filter:</span>
                <button 
                    onClick={() => setFilterType('all')}
                    className={clsx(
                        "px-3 py-1.5 text-xs font-medium rounded-full transition-colors border whitespace-nowrap",
                        filterType === 'all' 
                            ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-100" 
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                    )}
                >
                    All
                </button>
                <button 
                    onClick={() => setFilterType('delivered')}
                    className={clsx(
                        "px-3 py-1.5 text-xs font-medium rounded-full transition-colors border whitespace-nowrap",
                        filterType === 'delivered' 
                            ? "bg-emerald-600 text-white border-emerald-600" 
                            : "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    )}
                >
                    Delivered
                </button>
                <button 
                    onClick={() => setFilterType('failed')}
                    className={clsx(
                        "px-3 py-1.5 text-xs font-medium rounded-full transition-colors border whitespace-nowrap",
                        filterType === 'failed' 
                            ? "bg-rose-600 text-white border-rose-600" 
                            : "bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-400 border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    )}
                >
                    Failed
                </button>
             </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
             <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
             </div>
             <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No Notifications Found</h3>
             <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                No notifications match your current filters.
             </p>
             {(filterType !== 'all' || searchQuery) && (
                 <button 
                    onClick={() => { setFilterType('all'); setSearchQuery(''); }}
                    className="mt-4 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium"
                 >
                    Clear Filters
                 </button>
             )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
             {paginatedNotifications.map((note) => (
                <div 
                    key={note.id}
                    className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Status Icon */}
                        <div className="shrink-0 pt-1">
                             <div className={clsx(
                                 "w-10 h-10 rounded-full flex items-center justify-center border",
                                 note.status === 'failed' ? "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-900/20 dark:border-rose-900/50 dark:text-rose-400" :
                                 note.status === 'sending' ? "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-400" :
                                 "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-900/50 dark:text-emerald-400"
                             )}>
                                 {note.status === 'failed' ? <AlertCircle className="w-5 h-5" /> :
                                  note.status === 'sending' ? <Send className="w-5 h-5" /> :
                                  <CheckCircle2 className="w-5 h-5" />
                                 }
                             </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={clsx(
                                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                        note.subject.includes('Level 1') ? "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50" :
                                        note.subject.includes('Level 2') ? "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/50" :
                                        note.subject.includes('Level 3') ? "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/50" :
                                        "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                                    )}>
                                        {note.subject.split(':')[0] || 'Notification'}
                                    </span>
                                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(note.timestamp).toLocaleString(undefined, { 
                                            month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true 
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                        <Smartphone size={12} />
                                        <span>To: {note.to}</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1 truncate">
                                {note.subject}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                                {note.body}
                            </p>
                        </div>

                        {/* Status Badge (Right) */}
                        <div className="shrink-0 flex flex-col items-end justify-center gap-1 pl-4 border-l border-slate-100 dark:border-slate-800 hidden md:flex">
                             <div className={clsx(
                                 "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors capitalize",
                                 note.status === 'failed' ? "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/50" :
                                 note.status === 'sending' ? "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50" :
                                 "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50"
                             )}>
                                 {note.status === 'read' ? 'Read' : note.status === 'delivered' ? 'Delivered' : note.status === 'failed' ? 'Failed' : 'Sending'}
                             </div>
                             {note.status === 'read' && (
                                 <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                     <Eye size={10} /> Read 2m ago
                                 </span>
                             )}
                        </div>
                    </div>
                </div>
             ))}
          </div>
        )}
        <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredNotifications.length}
            itemsPerPage={itemsPerPage}
        />
      </div>
    </motion.div>
  );
}
