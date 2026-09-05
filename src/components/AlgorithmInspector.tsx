import React, { useState } from 'react';
import { 
  BookOpen, 
  Code, 
  Copy, 
  Check, 
  ShieldCheck, 
  ShieldAlert, 
  Layers, 
  Cpu, 
  Info,
  Search,
  Sigma,
  GitBranch,
  Table as TableIcon
} from 'lucide-react';
import { ALGORITHMS } from '../algorithms';
import { SupportedAlgorithmId } from '../types';

export const AlgorithmInspector: React.FC = () => {
  const [selectedAlgoId, setSelectedAlgoId] = useState<SupportedAlgorithmId>('bubbleSort');
  const [copied, setCopied] = useState(false);

  const selectedAlgo = ALGORITHMS[selectedAlgoId]?.info;

  const handleCopyCode = () => {
    if (selectedAlgo?.codeSnippet) {
      navigator.clipboard.writeText(selectedAlgo.codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const algorithmList = (Object.keys(ALGORITHMS) as SupportedAlgorithmId[]).map(
    (id) => ALGORITHMS[id].info
  );

  return (
    <div id="algo-inspector-container" className="space-y-8">
      {/* Top 5 Algorithm Selector Tabs */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Complexity Theory & Recurrence Guide
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                5 Core Algorithms
              </span>
            </div>
            <h2 className="text-2xl font-light text-slate-900 mt-1">
              Computational Complexity & Recurrence Analysis
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Detailed asymptotic proofs, recurrence relations, best/average/worst case derivations, and pseudocode for all 5 algorithms.
            </p>
          </div>

          {/* Quick 5 Algorithm Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/50">
            {algorithmList.map((algo) => {
              const isSelected = algo.id === selectedAlgoId;
              return (
                <button
                  key={algo.id}
                  id={`inspector-tab-${algo.id}`}
                  onClick={() => setSelectedAlgoId(algo.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: isSelected ? '#ffffff' : algo.color }}
                  />
                  <span>{algo.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Algorithm Deep Dive */}
        {selectedAlgo && (
          <div className="space-y-6">
            {/* Header with Title & Color Swatch */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-xs"
                    style={{ backgroundColor: selectedAlgo.color }}
                  />
                  <h3 className="text-2xl font-light text-slate-900">{selectedAlgo.name}</h3>
                  <span className="text-xs px-3 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium capitalize border border-slate-200/60">
                    {selectedAlgo.category.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-medium">{selectedAlgo.tagline}</p>
              </div>

              {/* Stability & In-place badges */}
              <div className="flex items-center space-x-2 text-xs">
                <span
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border font-medium ${
                    selectedAlgo.stable
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                      : 'bg-amber-50 text-amber-700 border-amber-200/60'
                  }`}
                >
                  {selectedAlgo.stable ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5" />
                  )}
                  <span>{selectedAlgo.stable ? 'Stable Sort' : 'Unstable Sort'}</span>
                </span>

                <span
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border font-medium ${
                    selectedAlgo.inPlace
                      ? 'bg-blue-50 text-blue-700 border-blue-200/60'
                      : 'bg-purple-50 text-purple-700 border-purple-200/60'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{selectedAlgo.inPlace ? 'In-Place (O(1) aux)' : 'Out-of-Place'}</span>
                </span>
              </div>
            </div>

            {/* Recurrence Relation & Mathematical Proof */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                {/* Mathematical Derivation */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sigma className="w-3.5 h-3.5 text-slate-600" />
                    <span>Recurrence Relation & Proof Derivation</span>
                  </h4>
                  <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-3">
                    {selectedAlgo.recurrenceRelation && (
                      <div className="p-3 rounded-xl bg-white border border-slate-200/60 font-mono text-xs text-slate-900 font-semibold shadow-2xs">
                        {selectedAlgo.recurrenceRelation}
                      </div>
                    )}
                    <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-sans">
                      {selectedAlgo.derivation}
                    </div>
                  </div>
                </div>

                {/* Algorithm Overview Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-600" />
                    <span>Algorithmic Architecture & Mechanics</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
                    {selectedAlgo.description}
                  </p>
                </div>
              </div>

              {/* Right Side: Pseudocode & Code Snippet */}
              <div className="lg:col-span-5 space-y-4">
                {/* Pseudocode Box */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-slate-600" />
                    <span>Standard Pseudocode Reference</span>
                  </h4>
                  <div className="rounded-2xl bg-slate-950 p-4 font-mono text-[11px] text-slate-300 space-y-1 overflow-x-auto leading-relaxed">
                    {selectedAlgo.pseudocode.map((line, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-slate-600 select-none w-4 text-right shrink-0">{i + 1}</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Implementation Snippet */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-slate-600" />
                      <span>TypeScript Implementation</span>
                    </h4>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="rounded-2xl bg-slate-950 p-4 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed max-h-56">
                    <pre><code>{selectedAlgo.codeSnippet}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comparative Master Complexity Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-slate-700" />
          <h3 className="text-base font-semibold text-slate-900">
            Comparative Complexity Matrix (The 5 Core Sorting Algorithms)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Best Case</th>
                <th className="py-3 px-4">Average Case</th>
                <th className="py-3 px-4">Worst Case</th>
                <th className="py-3 px-4">Auxiliary Space</th>
                <th className="py-3 px-4">Stability</th>
                <th className="py-3 px-4">In-Place</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {algorithmList.map((algo) => (
                <tr
                  key={algo.id}
                  onClick={() => setSelectedAlgoId(algo.id)}
                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                    algo.id === selectedAlgoId ? 'bg-slate-50/80 font-medium' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 flex items-center gap-2 font-semibold text-slate-900">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: algo.color }} />
                    <span>{algo.name}</span>
                  </td>
                  <td className="py-3.5 px-4 capitalize text-slate-500">
                    {algo.category.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-600 font-semibold">{algo.bestTime}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-900 font-semibold">{algo.avgTime}</td>
                  <td className="py-3.5 px-4 font-mono text-rose-600 font-semibold">{algo.worstTime}</td>
                  <td className="py-3.5 px-4 font-mono text-purple-600 font-semibold">{algo.space}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${algo.stable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                      {algo.stable ? 'Stable' : 'Unstable'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${algo.inPlace ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      {algo.inPlace ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
