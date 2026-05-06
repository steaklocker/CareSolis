import React from 'react';
import { Brain, TrendingUp, Target, Shield, CheckCircle2, Info } from 'lucide-react';

export default function AIAdherenceScoring() {
  return (
    <div className="max-w-6xl mx-auto pb-20 p-8">
      {/* Header with distinctive icon */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-purple-100 rounded-xl">
          <Brain className="text-purple-600" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Adherence Scoring</h1>
          <p className="text-slate-600">Transparent Machine Learning Analysis</p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-emerald-600" size={24} />
            <span className="font-medium text-slate-900">Current Score</span>
          </div>
          <div className="text-3xl font-bold text-emerald-600">87.3%</div>
          <p className="text-sm text-slate-500 mt-1">Good adherence</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-blue-600" size={24} />
            <span className="font-medium text-slate-900">Model Confidence</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">94.2%</div>
          <p className="text-sm text-slate-500 mt-1">High confidence</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-purple-600" size={24} />
            <span className="font-medium text-slate-900">Human Overrides</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">0</div>
          <p className="text-sm text-slate-500 mt-1">Last 30 days</p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start gap-3">
          <Info className="text-slate-600 mt-1" size={20} />
          <div>
            <h2 className="font-semibold text-slate-900 mb-2">Explainable AI for Medication Adherence</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              This system provides transparent, interpretable machine learning analysis with:
            </p>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600" size={16} />
                <span><strong>Score Breakdown:</strong> 6 detailed factor categories with weights</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600" size={16} />
                <span><strong>Historical Trends:</strong> 30-day interactive charts showing score evolution</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600" size={16} />
                <span><strong>Model Confidence:</strong> Transparency in prediction certainty</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600" size={16} />
                <span><strong>Human Override:</strong> Clinical judgment with logged justification</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600" size={16} />
                <span><strong>Triple-Redundant Logging:</strong> FDA-compliant audit trail</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Brain className="text-purple-600" size={18} />
            AI Transparency Principles
          </h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• No black-box algorithms</li>
            <li>• All factors visible and weighted</li>
            <li>• Confidence levels always shown</li>
            <li>• Human oversight required</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Shield className="text-emerald-600" size={18} />
            FDA Compliance
          </h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• Triple-redundant audit logs</li>
            <li>• Biometric authentication for overrides</li>
            <li>• Mandatory reason documentation</li>
            <li>• 7-year data retention</li>
          </ul>
        </div>
      </div>

      {/* Documentation Link */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <h3 className="font-semibold text-purple-900 mb-2">📖 Complete Documentation Available</h3>
        <p className="text-purple-800 mb-3">
          Full technical specifications, scoring factors, and compliance guidelines:
        </p>
        <code className="block bg-white text-purple-900 px-4 py-3 rounded-lg text-sm border border-purple-200">
          /AI_ADHERENCE_SCORING_GUIDE.md
        </code>
      </div>

      {/* Route Confirmation */}
      <div className="mt-8 text-center text-xs text-slate-400">
        ✓ Route: /ai-adherence-scoring | Component: AIAdherenceScoring
      </div>
    </div>
  );
}
