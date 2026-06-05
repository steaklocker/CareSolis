import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Calendar, User, Clock, 
  CheckCircle2, Plus, Filter, Paperclip, 
  MoreHorizontal, Phone, Home, Stethoscope,
  Image as ImageIcon, Mic, X, UploadCloud, Heart, Play
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';
import { toast } from 'sonner';

// Mock Data for the Journal
const INITIAL_POSTS = [
  {
    id: 1,
    author: "Sarah (Daughter)",
    type: "visit",
    content: "Stopped by for lunch. Dad is in good spirits, ate well. We refilled the bird feeder.",
    timestamp: "2 hours ago",
    avatarColor: "bg-emerald-100 text-emerald-700",
    likes: 2
  },
  {
    id: 2,
    author: "Dr. Chen (Cardio)",
    type: "medical",
    content: "Routine follow-up completed. Blood pressure stable (120/80). Continue current regimen.",
    timestamp: "Yesterday, 2:30 PM",
    avatarColor: "bg-blue-100 text-blue-700",
    isProfessional: true
  },
  {
    id: 3,
    author: "System",
    type: "system",
    content: "Weekly Service Refill detected. All 49 slots loaded successfully.",
    timestamp: "Yesterday, 10:00 AM",
    avatarColor: "bg-slate-100 text-slate-600"
  },
  {
    id: 4,
    author: "Mike (Son)",
    type: "maintenance",
    content: "Fixed the loose handrail on the back porch. Also changed the batteries in the smoke detector.",
    timestamp: "2 days ago",
    avatarColor: "bg-amber-100 text-amber-700",
    likes: 1
  }
];

// Mock Data for Shared Photos
const INITIAL_PHOTOS = [
  { id: 1, url: "https://images.unsplash.com/photo-1759971529647-144f78aa0df1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFuZGtpZHMlMjBwbGF5aW5nJTIwcGFya3xlbnwxfHx8fDE3NzE0NTg5NjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", caption: "Kids at the park", sender: "Sarah", time: "2 days ago" },
  { id: 2, url: "https://images.unsplash.com/photo-1605650836938-9925888f7321?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBkaW5uZXIlMjBjZWxlYnJhdGlvbnxlbnwxfHx8fDE3NzE0MjkzNDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", caption: "Thanksgiving Dinner", sender: "Mike", time: "Last week" },
  { id: 3, url: "https://images.unsplash.com/photo-1654952136788-4e2ab237e496?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW4lMjBmbG93ZXJzJTIwc3Vubnl8ZW58MXx8fHwxNzcxNDU4OTY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", caption: "Spring blooms", sender: "Mom", time: "Yesterday" }
];

export default function CareCoordination() {
  const [activeTab, setActiveTab] = useState<'journal' | 'media'>('journal');
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState<'general' | 'visit' | 'medical' | 'maintenance'>('general');
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handlePost = () => {
    if (!newNote.trim()) return;
    
    setIsPosting(true);
    
    // Simulate network delay
    setTimeout(() => {
      const post = {
        id: Date.now(),
        author: "You",
        type: noteType,
        content: newNote,
        timestamp: "Just now",
        avatarColor: "bg-indigo-100 text-indigo-700",
        likes: 0
      };
      
      setPosts([post, ...posts]);
      setNewNote("");
      setIsPosting(false);
      toast.success("Note added to Care Circle.");
    }, 600);
  };

  const handleUpload = () => {
      setIsUploading(true);
      setTimeout(() => {
          setIsUploading(false);
          toast.success("Photo sent to Solis frame");
          // Add a dummy photo to list
          setPhotos([{
              id: Date.now(),
              url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              caption: "School Play",
              sender: "You",
              time: "Just now"
          }, ...photos]);
      }, 1500);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'visit': return Home;
      case 'medical': return Stethoscope;
      case 'maintenance': return MoreHorizontal;
      case 'system': return CheckCircle2;
      default: return MessageSquare;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-5xl mx-auto space-y-8 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-light text-slate-900 dark:text-slate-100 tracking-tight">Care Circle</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-light">Family coordination & shared moments</p>
        </div>
        <div className="flex -space-x-2">
            {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-500">
                    {i === 1 ? 'S' : i === 2 ? 'M' : 'D'}
                </div>
            ))}
            <button className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">
                <Plus size={16} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
                  <button 
                    onClick={() => setActiveTab('journal')}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                        activeTab === 'journal' 
                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                      <MessageSquare size={16} /> Journal
                  </button>
                  <button 
                    onClick={() => setActiveTab('media')}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                        activeTab === 'media' 
                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                      <ImageIcon size={16} /> Shared Moments
                  </button>
              </div>

              <AnimatePresence mode="wait">
                  {activeTab === 'journal' ? (
                      <motion.div 
                        key="journal"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {/* Compose Box */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Share an update, visit note, or observation..."
                                className="w-full bg-transparent border-none focus:ring-0 resize-none min-h-[80px] text-slate-700 dark:text-slate-200 placeholder-slate-400"
                            />
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setNoteType('visit')}
                                        className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5", noteType === 'visit' ? "bg-emerald-100 text-emerald-700" : "bg-slate-50 text-slate-600 hover:bg-slate-100")}
                                    >
                                        <Home size={14} /> Visit
                                    </button>
                                    <button 
                                        onClick={() => setNoteType('medical')}
                                        className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5", noteType === 'medical' ? "bg-blue-100 text-blue-700" : "bg-slate-50 text-slate-600 hover:bg-slate-100")}
                                    >
                                        <Stethoscope size={14} /> Medical
                                    </button>
                                    <button 
                                        onClick={() => setNoteType('general')}
                                        className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5", noteType === 'general' ? "bg-slate-200 text-slate-800" : "bg-slate-50 text-slate-600 hover:bg-slate-100")}
                                    >
                                        <MessageSquare size={14} /> General
                                    </button>
                                </div>
                                <Button 
                                    onClick={handlePost} 
                                    disabled={!newNote.trim() || isPosting}
                                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6"
                                >
                                    {isPosting ? "Posting..." : "Post Note"}
                                </Button>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-4">
                            {posts.map((post) => {
                                const Icon = getIcon(post.type);
                                return (
                                    <div
                                        key={post.id}
                                        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4"
                                    >
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm", post.avatarColor)}>
                                            {post.author[0]}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-900 dark:text-slate-100">{post.author}</span>
                                                    {post.isProfessional && (
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wide font-medium">Pro</span>
                                                    )}
                                                    {post.type === 'system' && (
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 uppercase tracking-wide font-medium">Auto</span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Clock size={12} /> {post.timestamp}
                                                </span>
                                            </div>
                                            
                                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                                                {post.content}
                                            </p>
                                            
                                            <div className="flex items-center gap-4 pt-2">
                                                <button className="text-xs font-medium text-slate-400 hover:text-slate-600 flex items-center gap-1">
                                                    Reply
                                                </button>
                                                {post.likes !== undefined && (
                                                    <button className="text-xs font-medium text-slate-400 hover:text-emerald-600 flex items-center gap-1">
                                                        Like {post.likes > 0 && `(${post.likes})`}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                      </motion.div>
                  ) : (
                      <motion.div 
                        key="media"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                          {/* Media Uploader */}
                          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-4 py-12 border-dashed">
                               <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm text-indigo-500">
                                   <UploadCloud size={32} />
                               </div>
                               <div>
                                   <h3 className="text-lg font-medium text-slate-900 dark:text-white">Send to Solis</h3>
                                   <p className="text-slate-500 max-w-sm mx-auto mt-1">Upload photos to display on the ambient frame or record a voice greeting.</p>
                               </div>
                               <div className="flex gap-3">
                                   <Button onClick={handleUpload} disabled={isUploading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                       <ImageIcon className="mr-2" size={16} /> {isUploading ? "Sending..." : "Upload Photo"}
                                   </Button>
                                   <Button variant="outline" className="border-slate-300 dark:border-slate-600">
                                       <Mic className="mr-2" size={16} /> Record Voice Drop
                                   </Button>
                               </div>
                          </div>

                          {/* Gallery Grid */}
                          <div className="grid grid-cols-2 gap-4">
                              {photos.map(photo => (
                                  <div key={photo.id} className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200 dark:border-slate-800">
                                      <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                          <p className="text-white font-medium text-sm">{photo.caption}</p>
                                          <p className="text-white/70 text-xs">Sent by {photo.sender}</p>
                                      </div>
                                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button className="p-1.5 bg-black/50 text-white rounded-lg hover:bg-red-500/80 transition-colors">
                                              <X size={14} />
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </motion.div>
                  )}
              </AnimatePresence>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                  <h3 className="font-medium text-emerald-900 dark:text-emerald-100 mb-2 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      Status Summary
                  </h3>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300 mb-4">
                      The household is currently <strong>stable</strong>. No outstanding tasks for the Care Circle.
                  </p>
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/50 space-y-3">
                      <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Next Scheduled Visit</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">Tomorrow, 2 PM</span>
                      </div>
                      <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Visitor</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">Sarah</span>
                      </div>
                  </div>
              </div>

              {/* Active Voice Drop Status */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                      <Mic size={18} className="text-indigo-500" />
                      Active Voice Drop
                  </h3>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800/30 flex items-center gap-3">
                      <button className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm hover:bg-indigo-700 transition-colors">
                          <Play size={16} fill="currentColor" />
                      </button>
                      <div className="flex-1 min-w-0">
                          <div className="h-1 bg-indigo-200 rounded-full w-full mb-1.5 overflow-hidden">
                              <div className="h-full bg-indigo-500 w-1/3" />
                          </div>
                          <p className="text-xs text-indigo-700 dark:text-indigo-300 truncate">
                              "Love you Dad! Have a..."
                          </p>
                      </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                      This message plays automatically after the next successful interaction on the Solis.
                  </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                      <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-lg">
                              <Calendar size={18} />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Schedule Visit</span>
                      </button>
                      <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-lg">
                              <Phone size={18} />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Group Call</span>
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </motion.div>
  );
}
