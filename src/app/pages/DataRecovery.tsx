import React, { useState, useEffect } from 'react';
import { Database, Download, Upload, AlertTriangle, CheckCircle, Clock, RefreshCw, Trash2 } from 'lucide-react';
import { 
  getBackupHistory, 
  restoreFromBackup, 
  deleteBackup, 
  getRelativeTime,
  createAutoBackup,
  type BackupSnapshot 
} from '../utils/autoBackup';

export default function DataRecovery() {
  const [recoveryData, setRecoveryData] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [backupHistory, setBackupHistory] = useState<BackupSnapshot[]>([]);

  useEffect(() => {
    loadBackupHistory();
  }, []);

  const loadBackupHistory = () => {
    const history = getBackupHistory();
    setBackupHistory(history);
  };

  const handleExport = () => {
    const data = {
      medications: localStorage.getItem('caresolis_medications'),
      schedules: localStorage.getItem('caresolis_schedules'),
      compartments: localStorage.getItem('caresolis_compartments'),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caresolis-backup-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setMessage('Data exported successfully!');
    setMessageType('success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (data.medications) localStorage.setItem('caresolis_medications', data.medications);
        if (data.schedules) localStorage.setItem('caresolis_schedules', data.schedules);
        if (data.compartments) localStorage.setItem('caresolis_compartments', data.compartments);

        setMessage('Data imported successfully! Please refresh the page.');
        setMessageType('success');
      } catch (error) {
        setMessage('Error importing data. Please check the file format.');
        setMessageType('error');
      }
    };
    reader.readAsText(file);
  };

  const handleManualRestore = () => {
    try {
      const data = JSON.parse(recoveryData);
      
      if (data.medications) localStorage.setItem('caresolis_medications', data.medications);
      if (data.schedules) localStorage.setItem('caresolis_schedules', data.schedules);
      if (data.compartments) localStorage.setItem('caresolis_compartments', data.compartments);

      setMessage('Data restored successfully! Please refresh the page.');
      setMessageType('success');
      setRecoveryData('');
    } catch (error) {
      setMessage('Invalid JSON format. Please check your data.');
      setMessageType('error');
    }
  };

  const handleViewCurrentData = () => {
    const data = {
      medications: localStorage.getItem('caresolis_medications'),
      schedules: localStorage.getItem('caresolis_schedules'),
      compartments: localStorage.getItem('caresolis_compartments'),
    };

    setRecoveryData(JSON.stringify(data, null, 2));
    setMessage('Current data loaded below');
    setMessageType('success');
  };

  const handleRestoreFromBackup = (backup: BackupSnapshot) => {
    restoreFromBackup(backup);
    setMessage('Data restored successfully! Refreshing page...');
    setMessageType('success');
    setTimeout(() => window.location.reload(), 1500);
  };

  const handleDeleteBackup = (timestamp: string) => {
    deleteBackup(timestamp);
    setMessage('Backup deleted successfully!');
    setMessageType('success');
    loadBackupHistory();
  };

  const handleCreateManualBackup = () => {
    createAutoBackup('manual', 'Manual backup created');
    setMessage('Manual backup created successfully!');
    setMessageType('success');
    loadBackupHistory();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Data Recovery</h1>
        <p className="text-slate-400 mt-2">
          Export, import, or manually restore your medication data
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            messageType === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
              : 'bg-red-500/20 border border-red-500/50 text-red-400'
          }`}
        >
          {messageType === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          {message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" />
            Export Data
          </h2>
          <p className="text-slate-400 mb-4">
            Download a backup of all your medication data
          </p>
          <button
            onClick={handleExport}
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Export to File
          </button>
        </div>

        {/* Import */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            Import Data
          </h2>
          <p className="text-slate-400 mb-4">
            Restore data from a backup file
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg"
          />
        </div>
      </div>

      {/* View Current Data */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-400" />
          View/Restore Current Data
        </h2>
        <div className="space-y-4">
          <button
            onClick={handleViewCurrentData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            Load Current Data
          </button>

          <textarea
            value={recoveryData}
            onChange={(e) => setRecoveryData(e.target.value)}
            placeholder="Paste your backup data here or click 'Load Current Data' to view what's stored..."
            className="w-full h-64 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm"
          />

          <button
            onClick={handleManualRestore}
            disabled={!recoveryData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Restore from Text Above
          </button>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          Backup History
        </h2>
        <div className="space-y-4">
          <button
            onClick={handleCreateManualBackup}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Create Manual Backup
          </button>

          <div className="space-y-2">
            {backupHistory.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">
                No backup history yet. Backups are created automatically when you add, edit, or delete medications.
              </p>
            ) : (
              backupHistory.map((backup) => (
                <div key={backup.timestamp} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          backup.action === 'add' ? 'bg-emerald-500/20 text-emerald-400' :
                          backup.action === 'edit' ? 'bg-blue-500/20 text-blue-400' :
                          backup.action === 'delete' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {backup.action.toUpperCase()}
                        </span>
                        <span className="text-sm text-slate-400">{getRelativeTime(backup.date)}</span>
                      </div>
                      <p className="text-slate-300 text-sm mb-1">{backup.description}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(backup.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestoreFromBackup(backup)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                        title="Restore this backup"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Restore
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(backup.timestamp)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white text-sm rounded-lg transition-colors"
                        title="Delete this backup"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-2">Instructions</h3>
        <ul className="text-slate-300 text-sm space-y-2 list-disc list-inside">
          <li><strong>Export:</strong> Create a backup file before making changes</li>
          <li><strong>Import:</strong> Upload a previously exported backup file</li>
          <li><strong>View/Restore:</strong> See what's currently stored or manually paste backup data</li>
          <li><strong>After Restore:</strong> Refresh the page to see your data</li>
        </ul>
      </div>
    </div>
  );
}