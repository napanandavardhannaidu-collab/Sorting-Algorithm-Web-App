import React from 'react';
import { 
  Play, 
  Square, 
  BarChart2, 
  Sliders, 
  GitCompare, 
  BookOpen, 
  Sparkles, 
  GraduationCap,
  Layers
} from 'lucide-react';

export type ActiveTabType = 'simulation' | 'benchmark' | 'race' | 'table' | 'theory';

interface NavbarProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  hasResults: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isRunning,
  onStart,
  onStop,
  hasResults,
}) => {
  return (
    <header id="main-header" className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-xs">
              SC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">
                  Sorting Complexity Lab
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  5 Core Algorithms
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/50 overflow-x-auto max-w-[55%] sm:max-w-none">
            <button
              id="tab-simulation"
              onClick={() => setActiveTab('simulation')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'simulation'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>User Input & Simulation</span>
            </button>

            <button
              id="tab-benchmark"
              onClick={() => setActiveTab('benchmark')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'benchmark'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Complexity Plots</span>
            </button>

            <button
              id="tab-race"
              onClick={() => setActiveTab('race')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'race'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Race</span>
            </button>

            <button
              id="tab-table"
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Data Matrix</span>
              {hasResults && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              )}
            </button>

            <button
              id="tab-theory"
              onClick={() => setActiveTab('theory')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'theory'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Theory & Proofs</span>
            </button>
          </nav>

          {/* Action Button & Status */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {isRunning ? 'Running' : 'Ready'}
              </span>
            </div>

            {isRunning ? (
              <button
                id="btn-cancel-benchmark"
                onClick={onStop}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition-colors cursor-pointer"
              >
                <Square className="w-3 h-3 fill-rose-600" />
                <span>Cancel</span>
              </button>
            ) : (
              <button
                id="btn-quick-run-benchmark"
                onClick={onStart}
                className="hidden sm:flex items-center gap-1.5 bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Run Experiment</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
