import React, { useState } from 'react';
import { Download, FileText, BookOpen } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { generateComprehensiveDocumentation } from '../utils/documentation-generator';

export default function DeviceSetupGuideWithDownload() {
  const [activeTab, setActiveTab] = useState('documentation');

  const handleDownloadCodebase = async () => {
    try {
      console.log('🔵 Downloading source code from backend...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050/download-source-code`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const sourceCode = await response.text();
      console.log(`✅ Received ${sourceCode.length} bytes`);

      const blob = new Blob([sourceCode], { type: 'text/plain; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'caresolis-complete-source-code.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('✅ Source code downloaded successfully');
    } catch (error) {
      console.error('❌ Download error:', error);
      alert(`Failed to download source code: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 pb-20">
      {/* Page Header */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700 mb-8 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-emerald-400 mb-2">Help Center</h1>
          <p className="text-slate-400">Documentation, guides, and source code</p>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('documentation')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'documentation'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={20} />
            Documentation Package
          </button>
          <button
            onClick={() => setActiveTab('source')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'source'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={20} />
            Source Code
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Documentation Package Tab */}
        {activeTab === 'documentation' && (
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700 p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">CareSolis Documentation Package</h2>
                  <p className="text-slate-400 mt-1">Complete manuals and guides in a single downloadable file</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const docs = generateComprehensiveDocumentation();
                      const blob = new Blob([docs], { type: 'text/plain; charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'caresolis-documentation-package.txt';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
                  >
                    <Download size={20} />
                    Download Documentation (.txt)
                  </button>
                </div>
              </div>

              <div className="p-6 bg-indigo-900/20 border-2 border-indigo-500/30 rounded-lg mb-6">
                <h3 className="font-bold text-indigo-300 mb-3 flex items-center gap-2">
                  <BookOpen size={20} />
                  Complete Documentation Package
                </h3>
                <p className="text-sm text-indigo-200 mb-4">
                  This package includes <strong>all CareSolis manuals and guides</strong> in a single text file for easy reference.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-indigo-200">
                  <div>
                    <p className="font-semibold mb-2">📚 What's Included:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• <strong>Caregiver User Manual</strong> - Complete system guide</li>
                      <li>• <strong>Provider/Clinician Manual</strong> - RPM billing & compliance</li>
                      <li>• <strong>Device Setup Guide</strong> - Hardware installation</li>
                      <li>• <strong>Infrastructure Manual</strong> - Technical architecture</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">📊 File Details:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• <strong>Format:</strong> Plain text (.txt)</li>
                      <li>• <strong>Size:</strong> ~50 KB</li>
                      <li>• <strong>Compatible:</strong> All systems</li>
                      <li>• <strong>Searchable:</strong> Use Ctrl+F/Cmd+F</li>
                      <li>• <strong>Printable:</strong> Formatted for print</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-300">
                <h3 className="font-semibold text-base text-slate-100">📖 Documentation Sections:</h3>

                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <h4 className="font-semibold text-emerald-400 mb-2">1. Caregiver User Manual</h4>
                  <p className="text-xs text-slate-400">
                    Complete guide for family caregivers including dashboard navigation, escalation protocols, medication management, and troubleshooting.
                  </p>
                </div>

                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <h4 className="font-semibold text-emerald-400 mb-2">2. Provider/Clinician Manual</h4>
                  <p className="text-xs text-slate-400">
                    RPM billing guide, Medicare CPT codes, electronic signatures, patient consent workflows, and FDA compliance checklists.
                  </p>
                </div>

                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <h4 className="font-semibold text-emerald-400 mb-2">3. Device Setup Guide</h4>
                  <p className="text-xs text-slate-400">
                    Hardware installation instructions, Wi-Fi configuration, medication compartment setup, testing procedures, and troubleshooting.
                  </p>
                </div>

                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <h4 className="font-semibold text-emerald-400 mb-2">4. Systems Infrastructure Manual</h4>
                  <p className="text-xs text-slate-400">
                    Technical architecture, API endpoints, data model, security & compliance, deployment guide, and system monitoring.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Source Code Tab */}
        {activeTab === 'source' && (
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700 p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">CareSolis Complete Source Code</h2>
                  <p className="text-slate-400 mt-1">All source code files in a single downloadable text file</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadCodebase}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
                  >
                    <Download size={20} />
                    Download Source Code (.txt)
                  </button>
                </div>
              </div>

              <div className="p-6 bg-emerald-900/20 border-2 border-emerald-500/30 rounded-lg mb-6">
                <h3 className="font-bold text-emerald-300 mb-3 flex items-center gap-2">
                  <FileText size={20} />
                  Complete Source Code Export
                </h3>
                <p className="text-sm text-emerald-200 mb-4">
                  This is a <strong>single text file (~1 MB, 26,000+ lines)</strong> containing all CareSolis source code.
                  Each file is separated with a clear header in the format:
                </p>
                <div className="p-3 bg-slate-900 rounded font-mono text-xs text-emerald-300 mb-4">
                  === src/app/routes.tsx ===<br/>
                  [code here]<br/>
                  <br/>
                  === src/app/context/AuthContext.tsx ===<br/>
                  [code here]
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-emerald-200">
                  <div>
                    <p className="font-semibold mb-2">✅ What's Included:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• All TypeScript/React components</li>
                      <li>• All pages and routes</li>
                      <li>• Context providers and hooks</li>
                      <li>• Backend server code</li>
                      <li>• CSS styles and themes</li>
                      <li>• Configuration files</li>
                      <li>• Utility functions</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">📊 File Details:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• <strong>Format:</strong> Plain text (.txt)</li>
                      <li>• <strong>Size:</strong> ~1 MB</li>
                      <li>• <strong>Lines:</strong> 26,000+ lines of code</li>
                      <li>• <strong>Files:</strong> 217 source files</li>
                      <li>• <strong>Compatible:</strong> All systems</li>
                      <li>• <strong>Searchable:</strong> Use Ctrl+F/Cmd+F</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-300">
                <h3 className="font-semibold text-base text-slate-100">📁 How to Use:</h3>
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-3">
                  <div>
                    <p className="font-semibold mb-1">1. Download the file:</p>
                    <p className="text-xs text-slate-400">
                      Click the button above to download the complete source code (1MB, 217 files, 26,000+ lines). The file will save to your Downloads folder.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">2. Open with any text editor:</p>
                    <p className="text-xs text-slate-400">
                      Use VS Code, Sublime Text, Notepad++, or any text editor. The file is plain text and compatible with all systems.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">3. Search for specific files:</p>
                    <p className="text-xs text-slate-400">
                      Use Ctrl+F (or Cmd+F on Mac) to search for file names. Each file starts with "=== filename ===" making them easy to find.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">4. Copy specific sections:</p>
                    <p className="text-xs text-slate-400">
                      Find the code you need, copy it, and paste it into your project. Each file is complete and ready to use.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
