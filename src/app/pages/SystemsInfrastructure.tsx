import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import clsx from 'clsx';
import { 
  Activity, 
  Cpu, 
  Database, 
  GitBranch, 
  Shield, 
  Zap,
  Server,
  Lock,
  Bell,
  FileCode,
  Layers,
  Search,
  Edit3,
  Save,
  X,
  ChevronRight,
  Clock,
  AlertTriangle,
  Pill,
  DollarSign,
  HeartPulse,
  Home,
  Settings,
  Smartphone,
  Copy,
  Check,
  Download
} from 'lucide-react';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

interface SystemSection {
  id: string;
  title: string;
  icon: any;
  category: 'architecture' | 'event_logic' | 'infrastructure' | 'features' | 'medication' | 'analytics' | 'integrations' | 'security';
  content: string;
  lastUpdated?: string;
  updatedBy?: string;
}

// Map category to icon component
const CATEGORY_ICON_MAP: Record<string, any> = {
  architecture: Layers,
  event_logic: Activity,
  infrastructure: Server,
  features: Zap,
  medication: Pill,
  analytics: HeartPulse,
  integrations: GitBranch,
  security: Shield
};

const DEFAULT_SECTIONS: SystemSection[] = [
  {
    id: 'system-overview',
    title: 'System Overview & Architecture',
    icon: Layers,
    category: 'architecture',
    content: `**Caresolis** is an infrastructure-grade interaction visibility system for aging households built on a three-tier architecture.

**System Architecture:**

**Three-Layer Model:**
1. **Device Layer (Solis):** Hardware interaction detection, local processing, ambient light communication
2. **Processing Layer (Cloud):** Event evaluation, escalation routing, data persistence
3. **Interface Layer (Dashboard):** Real-time visibility, caregiver controls, analytics

**Technology Stack:**

**Frontend (Client):**
- Framework: React (Vite) with Tailwind CSS v4
- State Management: \`CaresolisContext\` provides real-time synchronization
- UI/UX: Calm color palette (slate, emerald, rose), non-clinical aesthetic
- Routing: React Router (Data Mode) for seamless navigation
- Offline Support: Service Worker with intelligent caching

**Backend (Server):**
- Platform: Supabase (Edge Functions + KV Store)
- Runtime: Deno (secure TypeScript runtime)
- Web Framework: Hono (lightweight HTTP routing)
- Database: Single-table Key-Value design (\`kv_store\`) for flexibility
- Authentication: Supabase Auth with JWT tokens

**Data Model:**
- \`mds:events:YYYY-MM-DD\`: Daily schedule and slot status
- \`mds:device:state:v1\`: High-level system summary
- \`mds:audit:...\`: Immutable audit logs (FDA compliance)
- \`med:compartment:XX\`: Medication compartment assignments
- \`rpm:billing:YYYY-MM\`: Medicare billing records

**Design Pillars:**
- **Calm Technology:** Non-intrusive, ambient visibility
- **Infrastructure-Grade:** Built for reliability, not engagement
- **Finite Escalation:** Never spam caregivers with infinite alerts
- **Privacy-First:** No cameras, no audio, local processing
- **Professional Grade:** Clinical and home health agency use`
  },
  {
    id: 'event-sequence',
    title: 'Event Processing & Logic',
    icon: Activity,
    category: 'event_logic',
    content: `**Complete technical overview of Caresolis operational logic and event processing.**

**Core Event Loop:**

The Caresolis system operates on a continuous event-driven loop that processes interactions, evaluates household state, and triggers appropriate responses.`
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Sections', icon: FileCode },
  { id: 'architecture', label: 'Architecture', icon: Layers },
  { id: 'event_logic', label: 'Event Logic', icon: Activity },
  { id: 'infrastructure', label: 'Infrastructure', icon: Server },
  { id: 'features', label: 'Features', icon: Zap },
  { id: 'medication', label: 'Medication', icon: Pill },
  { id: 'analytics', label: 'Analytics', icon: HeartPulse },
  { id: 'integrations', label: 'Integrations', icon: GitBranch },
  { id: 'security', label: 'Security', icon: Shield }
];

export default function SystemsInfrastructure() {
  const [sections, setSections] = useState<SystemSection[]>(DEFAULT_SECTIONS);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [viewingSection, setViewingSection] = useState<string | null>(null);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [copiedDocument, setCopiedDocument] = useState(false);

  useEffect(() => {
    // Check if we're embedded in Help Center
    setIsEmbedded(window.location.pathname === '/help-center');
    loadDocument();
  }, []);

  const loadDocument = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/systems-infrastructure`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.sections && data.sections.length > 0) {
          setSections(data.sections);
        } else {
          setSections(DEFAULT_SECTIONS);
        }
      } else {
        setSections(DEFAULT_SECTIONS);
      }
    } catch (e) {
      console.error('Failed to load systems infrastructure document', e);
      setSections(DEFAULT_SECTIONS);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDocument = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/systems-infrastructure`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sections })
      });

      if (res.ok) {
        toast.success('Systems & Infrastructure document saved');
      } else {
        toast.error('Failed to save document');
      }
    } catch (e) {
      toast.error('Network error while saving');
    }
  };

  const startEdit = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setEditingSection(sectionId);
      setEditContent(section.content);
    }
  };

  const saveEdit = () => {
    if (!editingSection) return;

    const updated = sections.map(s => {
      if (s.id === editingSection) {
        return {
          ...s,
          content: editContent,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Administrator'
        };
      }
      return s;
    });

    setSections(updated);
    setEditingSection(null);
    setEditContent('');

    // Auto-save to backend
    fetch(`${SERVER_URL}/systems-infrastructure`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sections: updated })
    }).then(() => {
      toast.success('Section updated');
    });
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setEditContent('');
  };

  const handleViewSection = (sectionId: string) => {
    setViewingSection(sectionId);
  };

  const handleBackToList = () => {
    setViewingSection(null);
  };

  const generateFullDocumentText = () => {
    const lines = [];
    lines.push('# CARESOLIS SYSTEM INFRASTRUCTURE DOCUMENTATION');
    lines.push('');
    lines.push('**Complete Technical Reference**');
    lines.push('**Generated:** ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
    lines.push('**Platform Version:** v6.37.1 CLEAN');
    lines.push('');
    lines.push('---');
    lines.push('');

    sections.forEach((section, index) => {
      lines.push('## ' + (index + 1) + '. ' + section.title);
      lines.push('');
      lines.push('**Category:** ' + section.category.replace('_', ' ').toUpperCase());
      lines.push('');
      lines.push(section.content);
      lines.push('');
      lines.push('---');
      lines.push('');
    });

    lines.push('');
    lines.push('*End of Caresolis System Infrastructure Documentation*');
    lines.push('*Contact: support@caresolis.com*');
    
    return lines.join('\n');
  };

  const handleCopyDocument = () => {
    const fullText = generateFullDocumentText();
    navigator.clipboard.writeText(fullText);
    setCopiedDocument(true);
    toast.success('System Infrastructure documentation copied to clipboard!');
    setTimeout(() => setCopiedDocument(false), 3000);
  };

  const handleDownloadDocument = () => {
    const fullText = generateFullDocumentText();
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CARESOLIS-SYSTEM-INFRASTRUCTURE.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('System Infrastructure documentation downloaded!');
  };

  const filteredSections = sections.filter(section => {
    const matchesSearch = searchTerm === '' || 
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || section.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <div className="text-slate-400">Loading Systems & Infrastructure...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header - Hidden when embedded in Help Center */}
      {!isEmbedded && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-cyan-500/10 rounded-xl">
                    <Server className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-light text-slate-100 tracking-tight">
                      Systems & Infrastructure
                    </h1>
                    <p className="text-slate-400 mt-1">
                      Technical Architecture Documentation • Last Updated: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleCopyDocument}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  {copiedDocument ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDownloadDocument}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download .txt
                </Button>
                <Button
                  onClick={() => setIsAdmin(!isAdmin)}
                  className={clsx(
                    'gap-2 transition-colors',
                    isAdmin 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  )}
                >
                  <Edit3 className="w-4 h-4" />
                  {isAdmin ? 'Admin Mode Active' : 'Enable Editing'}
                </Button>
                {isAdmin && (
                  <Button
                    onClick={saveDocument}
                    className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save All
                  </Button>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search infrastructure documentation..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-8">
        <div className="flex gap-8">
          {/* Category Sidebar - Hide when viewing individual section */}
          {!viewingSection && (
            <div className="w-64 flex-shrink-0">
              <div className="sticky top-8 space-y-2">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const count = sections.filter(s => cat.id === 'all' || s.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={clsx(
                        'w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all',
                        activeCategory === cat.id
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-800/30 text-slate-400 border border-slate-700 hover:bg-slate-800/50 hover:text-slate-300'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{cat.label}</span>
                      </div>
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {viewingSection ? (
              // Single Section View
              (() => {
                const section = sections.find(s => s.id === viewingSection);
                if (!section) return null;

                const Icon = CATEGORY_ICON_MAP[section.category] || Server;
                const isEditing = editingSection === section.id;

                return (
                  <>
                    {/* Back Button */}
                    <Button
                      onClick={handleBackToList}
                      className="mb-6 bg-slate-700 hover:bg-slate-600 text-slate-200 gap-2"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      Back to All Sections
                    </Button>

                    {/* Section Content */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                      <div className="bg-slate-900/50 px-6 py-4 flex items-center justify-between border-b border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan-500/10 rounded-lg">
                            <Icon className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-semibold text-slate-100">
                              {section.title}
                            </h2>
                            {section.lastUpdated && (
                              <p className="text-xs text-slate-500 mt-1">
                                Last updated {new Date(section.lastUpdated).toLocaleDateString()} by {section.updatedBy || 'Administrator'}
                              </p>
                            )}
                          </div>
                        </div>
                        {isAdmin && !isEditing && (
                          <Button
                            onClick={() => startEdit(section.id)}
                            className="bg-slate-700 hover:bg-slate-600 text-slate-200 gap-2"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit Section
                          </Button>
                        )}
                      </div>

                      <div className="p-8">
                        {isEditing ? (
                          <div>
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={25}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                            <div className="flex gap-3 mt-4">
                              <Button
                                onClick={saveEdit}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2"
                              >
                                <Save className="w-4 h-4" />
                                Save Changes
                              </Button>
                              <Button
                                onClick={cancelEdit}
                                className="bg-slate-700 hover:bg-slate-600 text-slate-200 gap-2"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="prose prose-invert prose-slate max-w-none">
                            <DocumentContent content={section.content} />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()
            ) : (
              // List View - Show section cards with preview
              <>
                {filteredSections.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    No sections match your search
                  </div>
                ) : (
                  filteredSections.map((section, idx) => {
                    // Get icon from category map to avoid serialization issues
                    const Icon = CATEGORY_ICON_MAP[section.category] || Server;

                    return (
                      <div
                        key={section.id}
                        className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden mb-6"
                      >
                        {/* Section Header */}
                        <div className="bg-slate-900/50 px-6 py-4 flex items-center justify-between border-b border-slate-700">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/10 rounded-lg">
                              <Icon className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                              <h2 className="text-xl font-semibold text-slate-100">
                                {section.title}
                              </h2>
                              {section.lastUpdated && (
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Last updated {new Date(section.lastUpdated).toLocaleDateString()} by {section.updatedBy || 'Administrator'}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Section Preview */}
                        <div className="p-6">
                          <div className="prose prose-invert prose-slate max-w-none line-clamp-4">
                            <DocumentContent content={section.content.split('\n').slice(0, 3).join('\n')} />
                          </div>
                          <Button
                            onClick={() => handleViewSection(section.id)}
                            className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white gap-2"
                          >
                            Read Full Section
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-8 py-12 text-center">
        <div className="text-slate-500 text-sm space-y-2">
          <p className="font-mono">CARESOLIS_SYSTEMS_INFRASTRUCTURE_V1.0 • {sections.length} SECTIONS</p>
          <p>For technical support: engineering@caresolis.com</p>
        </div>
      </div>
    </div>
  );
}

// Markdown-like content renderer
function DocumentContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: string[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={elements.length} className="space-y-2 my-4 text-slate-300">
          {currentList.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const parseInline = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-100 font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-300 italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-900 text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
  };

  lines.forEach((line) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={elements.length} className="bg-slate-900 border border-slate-700 rounded-lg p-4 my-4 overflow-x-auto">
            <code className="text-cyan-400 text-sm font-mono">
              {codeLines.join('\n')}
            </code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (line.startsWith('- ') || line.startsWith('• ')) {
      currentList.push(line.substring(2));
    } else {
      flushList();

      if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(
          <h3 key={elements.length} className="text-lg font-semibold text-slate-100 mt-6 mb-3">
            {line.replace(/\*\*/g, '')}
          </h3>
        );
      } else if (line.trim() === '') {
        // Skip empty lines
      } else {
        elements.push(
          <p key={elements.length} className="text-slate-300 leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: parseInline(line) }} />
        );
      }
    }
  });

  flushList();

  return <>{elements}</>;
}