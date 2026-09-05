import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  SkipBack,
  SkipForward,
  Repeat,
  ListOrdered,
  Video,
  Copy,
  Check,
  Clock,
  ShieldAlert,
  Sliders,
  Activity,
  FileCode2,
  BookOpen,
  Sparkles,
  BarChart3,
  TrendingUp,
  Dices,
  Hash,
  Binary,
  Award,
  Layers,
  ArrowDownUp,
  Info,
  CheckCircle2,
  Terminal,
  Code2,
  ArrowRight,
  Download,
  FileDown,
  FileSpreadsheet,
  FileJson,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  ALGORITHMS,
  ALL_ALGORITHM_IDS,
  generateSimulationSteps,
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
  shellSort,
  countingSort,
  radixSort,
  cocktailSort,
  combSort,
  gnomeSort,
  bucketSort,
  timSort,
  bogoSort,
} from '../algorithms';
import { SupportedAlgorithmId, SimulationStep } from '../types';
import {
  generateLanguageCodeAndLogic,
  SupportedLanguage,
} from '../utils/languageCodeGenerator';

const LANGUAGE_TABS: { id: SupportedLanguage; label: string; tag: string }[] = [
  { id: 'cpp', label: 'C++', tag: 'C++17 / STL' },
  { id: 'python', label: 'Python', tag: 'Python 3.x' },
  { id: 'java', label: 'Java', tag: 'Java 17 / JVM' },
];

const PRIMES_CACHE: number[] = [];

function generatePrimes(count: number): number[] {
  const target = Math.min(Math.max(2, count), 10000);
  if (PRIMES_CACHE.length >= target) {
    return PRIMES_CACHE.slice(0, target);
  }

  // Upper bound for 10,000th prime is ~104,729
  const upperLimit = 120000;
  const sieve = new Uint8Array(upperLimit);
  sieve.fill(1);
  sieve[0] = 0;
  sieve[1] = 0;

  for (let p = 2; p * p < upperLimit; p++) {
    if (sieve[p]) {
      for (let i = p * p; i < upperLimit; i += p) {
        sieve[i] = 0;
      }
    }
  }

  PRIMES_CACHE.length = 0;
  for (let p = 2; p < upperLimit && PRIMES_CACHE.length < 10000; p++) {
    if (sieve[p]) PRIMES_CACHE.push(p);
  }

  return PRIMES_CACHE.slice(0, target);
}

// Fast O(N log N) inversion counter for arrays up to N = 10,000
function countInversionsFast(arr: number[]): number {
  const n = arr.length;
  if (n <= 1) return 0;
  if (n <= 150) {
    let inv = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (arr[i] > arr[j]) inv++;
      }
    }
    return inv;
  }

  const a = arr.slice();
  const temp = new Array<number>(n);

  function mergeSortCount(left: number, right: number): number {
    if (left >= right) return 0;
    const mid = Math.floor((left + right) / 2);
    let count = mergeSortCount(left, mid) + mergeSortCount(mid + 1, right);

    let i = left;
    let j = mid + 1;
    let k = left;

    while (i <= mid && j <= right) {
      if (a[i] <= a[j]) {
        temp[k++] = a[i++];
      } else {
        temp[k++] = a[j++];
        count += mid - i + 1;
      }
    }

    while (i <= mid) temp[k++] = a[i++];
    while (j <= right) temp[k++] = a[j++];
    for (let x = left; x <= right; x++) a[x] = temp[x];

    return count;
  }

  return mergeSortCount(0, n - 1);
}

export const UnifiedSortingDashboard: React.FC = () => {
  // Primary algorithm selection (supports all 15 algorithms)
  const [selectedAlgoId, setSelectedAlgoId] = useState<SupportedAlgorithmId>('bubbleSort');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [comparisonAlgoIds, setComparisonAlgoIds] = useState<SupportedAlgorithmId[]>([
    'bubbleSort',
    'quickSort',
    'mergeSort',
  ]);
  const selectedAlgo = ALGORITHMS[selectedAlgoId]?.info || ALGORITHMS.bubbleSort.info;

  // Custom Array Generation Controls & State (N up to 10,000)
  const [elementCountN, setElementCountN] = useState<number>(8);
  const [inputNStr, setInputNStr] = useState<string>('8');
  const [selectedType, setSelectedType] = useState<'random' | 'even' | 'odd' | 'prime'>('random');
  const [selectedOrder, setSelectedOrder] = useState<'shuffle' | 'nearly' | 'sorted' | 'reversed'>('shuffle');
  const [rawInput, setRawInput] = useState<string>('64, 25, 12, 22, 11, 90, 45, 38');
  const [appliedArray, setAppliedArray] = useState<number[]>([64, 25, 12, 22, 11, 90, 45, 38]);
  const [inputError, setInputError] = useState<string | null>(null);

  // Zoom / inspection window for massive arrays (N > 100)
  const [inspectionWindowStart, setInspectionWindowStart] = useState<number>(0);

  // Simulation playback state (Video Player)
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [playbackSpeedMs, setPlaybackSpeedMs] = useState<number>(1000); // Default to 1.0s for clear visual comprehension
  const [showTraceLog, setShowTraceLog] = useState<boolean>(true);
  const [activeStepTab, setActiveStepTab] = useState<'visual' | 'code' | 'both'>('both');

  // Graph state & metrics
  const [graphMetric, setGraphMetric] = useState<'totalOps' | 'comparisons' | 'swaps'>('totalOps');
  const [growthScale, setGrowthScale] = useState<'linear' | 'log'>('linear');

  // File Download / Save to Laptop States
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState<boolean>(false);

  // Language selection: C++ -> Python -> Java
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('cpp');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Save File to Laptop / Downloads Folder Utility
  const downloadFile = (filename: string, content: string, mimeType: string = 'text/plain') => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadToast(`Saved "${filename}" to your Downloads folder!`);
      setTimeout(() => setDownloadToast(null), 4500);
    } catch {
      setDownloadToast(`Failed to initiate file download.`);
      setTimeout(() => setDownloadToast(null), 3000);
    }
  };

  const handleDownloadTraceJson = () => {
    const data = {
      algorithm: {
        id: selectedAlgo.id,
        name: selectedAlgo.name,
        category: selectedAlgo.category,
        bestTime: selectedAlgo.bestTime,
        avgTime: selectedAlgo.avgTime,
        worstTime: selectedAlgo.worstTime,
        space: selectedAlgo.space,
        stable: selectedAlgo.stable,
        inPlace: selectedAlgo.inPlace,
        recurrenceRelation: selectedAlgo.recurrenceRelation,
      },
      executionSummary: {
        inputSize: appliedArray.length,
        initialArray: appliedArray,
        sortedArray: steps.length > 0 ? steps[steps.length - 1].array : [...appliedArray].sort((a, b) => a - b),
        totalSimulationFrames: steps.length,
        totalComparisons: steps.length > 0 ? steps[steps.length - 1].comparisons : 0,
        totalSwaps: steps.length > 0 ? steps[steps.length - 1].swaps : 0,
        exportedAt: new Date().toISOString(),
      },
      frames: steps.map((s, idx) => ({
        frameNumber: idx + 1,
        description: s.description,
        pseudocodeLine: s.pseudocodeLine,
        comparisonsSoFar: s.comparisons,
        swapsSoFar: s.swaps,
        activeRange: s.activeRange || null,
        comparingIndices: s.comparing || null,
        swappingIndices: s.swapping || null,
        pivotIndex: s.pivotIndex !== undefined ? s.pivotIndex : null,
        sortedIndices: s.sortedIndices || [],
        arrayState: s.array,
      })),
    };
    downloadFile(`${selectedAlgo.id}_execution_trace.json`, JSON.stringify(data, null, 2), 'application/json');
    setDownloadMenuOpen(false);
  };

  const handleDownloadTraceTranscript = () => {
    const totalC = steps.length > 0 ? steps[steps.length - 1].comparisons : 0;
    const totalS = steps.length > 0 ? steps[steps.length - 1].swaps : 0;
    const finalArr = steps.length > 0 ? steps[steps.length - 1].array : [...appliedArray].sort((a, b) => a - b);

    let text = `================================================================================\n`;
    text += `  ALGORITHM EXECUTION TRACE TRANSCRIPT: ${selectedAlgo.name.toUpperCase()}\n`;
    text += `================================================================================\n\n`;
    text += `Algorithm:          ${selectedAlgo.name}\n`;
    text += `Tagline:            ${selectedAlgo.tagline}\n`;
    text += `Time Complexity:    Best: ${selectedAlgo.bestTime} | Avg: ${selectedAlgo.avgTime} | Worst: ${selectedAlgo.worstTime}\n`;
    text += `Space Complexity:   ${selectedAlgo.space}\n`;
    text += `Stability / Memory: ${selectedAlgo.stable ? 'Stable' : 'Unstable'} | ${selectedAlgo.inPlace ? 'In-Place' : 'Out-of-Place'}\n`;
    text += `Date / Timestamp:   ${new Date().toLocaleString()}\n`;
    text += `Input Array (N=${appliedArray.length}): [${appliedArray.join(', ')}]\n`;
    text += `Final Sorted Array:   [${finalArr.join(', ')}]\n`;
    text += `Total Frames:       ${steps.length}\n`;
    text += `Total Comparisons:  ${totalC}\n`;
    text += `Total Swaps/Shifts: ${totalS}\n\n`;
    text += `--------------------------------------------------------------------------------\n`;
    text += `FRAME-BY-FRAME EXECUTION LOG\n`;
    text += `--------------------------------------------------------------------------------\n`;

    steps.forEach((s, idx) => {
      let actionType = 'TRANSITION';
      if (idx === 0) actionType = 'INITIAL';
      else if (idx === steps.length - 1) actionType = 'COMPLETED';
      else if (s.swapping) actionType = selectedAlgoId === 'insertionSort' ? 'SHIFT' : 'SWAP';
      else if (s.comparing) actionType = 'COMPARE';
      else if (s.pivotIndex !== undefined) actionType = selectedAlgoId === 'insertionSort' ? 'KEY' : 'PIVOT';

      text += `\n[Frame #${String(idx + 1).padStart(3, '0')}] [${actionType.padEnd(12, ' ')}] (Line ${s.pseudocodeLine || 1})\n`;
      text += `  Array State: [${s.array.join(', ')}]\n`;
      text += `  Action:      ${s.description}\n`;
      text += `  Progress:    Comparisons: ${s.comparisons} | Swaps: ${s.swaps}\n`;
      if (s.sortedIndices && s.sortedIndices.length > 0) {
        text += `  Sorted Idxs: [${s.sortedIndices.join(', ')}]\n`;
      }
    });

    text += `\n================================================================================\n`;
    text += `  END OF EXECUTION TRACE - STATUS: FULLY SORTED\n`;
    text += `================================================================================\n`;

    downloadFile(`${selectedAlgo.id}_trace_log.txt`, text, 'text/plain');
    setDownloadMenuOpen(false);
  };

  const handleDownloadCsv = () => {
    let csv = `FrameNumber,ActionType,PseudocodeLine,Comparisons,Swaps,ArrayState,Description\n`;
    steps.forEach((s, idx) => {
      let actionType = 'TRANSITION';
      if (idx === 0) actionType = 'INITIAL';
      else if (idx === steps.length - 1) actionType = 'COMPLETED';
      else if (s.swapping) actionType = selectedAlgoId === 'insertionSort' ? 'SHIFT' : 'SWAP';
      else if (s.comparing) actionType = 'COMPARE';

      const arrayStr = `"[${s.array.join(', ')}]"`;
      const descEscaped = `"${s.description.replace(/"/g, '""')}"`;
      csv += `${idx + 1},${actionType},${s.pseudocodeLine || 1},${s.comparisons},${s.swaps},${arrayStr},${descEscaped}\n`;
    });
    downloadFile(`${selectedAlgo.id}_frames.csv`, csv, 'text/csv');
    setDownloadMenuOpen(false);
  };

  const handleDownloadMarkdownReport = () => {
    const totalC = steps.length > 0 ? steps[steps.length - 1].comparisons : 0;
    const totalS = steps.length > 0 ? steps[steps.length - 1].swaps : 0;
    const finalArr = steps.length > 0 ? steps[steps.length - 1].array : [...appliedArray].sort((a, b) => a - b);

    let md = `# ${selectedAlgo.name} Execution Analysis Report\n\n`;
    md += `> **Tagline**: ${selectedAlgo.tagline}\n\n`;
    md += `## Algorithm Specifications\n\n`;
    md += `- **Category**: ${selectedAlgo.category.replace('_', ' ').toUpperCase()}\n`;
    md += `- **Time Complexity**: Best \`${selectedAlgo.bestTime}\` | Avg \`${selectedAlgo.avgTime}\` | Worst \`${selectedAlgo.worstTime}\`\n`;
    md += `- **Space Complexity**: \`${selectedAlgo.space}\`\n`;
    md += `- **Stability**: ${selectedAlgo.stable ? 'Stable' : 'Unstable'}\n`;
    md += `- **In-Place**: ${selectedAlgo.inPlace ? 'Yes' : 'No'}\n`;
    md += `- **Recurrence Relation**: \`${selectedAlgo.recurrenceRelation}\`\n\n`;
    md += `## Input & Output Execution Summary\n\n`;
    md += `- **Array Size ($N$)**: ${appliedArray.length} elements\n`;
    md += `- **Initial Array**: \`[${appliedArray.join(', ')}]\`\n`;
    md += `- **Final Sorted Array**: \`[${finalArr.join(', ')}]\`\n`;
    md += `- **Total Simulation Frames**: ${steps.length}\n`;
    md += `- **Total Comparisons**: ${totalC}\n`;
    md += `- **Total Swaps / Shifts**: ${totalS}\n\n`;
    md += `## Pseudocode\n\n\`\`\`\n`;
    (selectedAlgo.pseudocode || []).forEach((line, idx) => {
      md += `${idx + 1}. ${line}\n`;
    });
    md += `\`\`\`\n\n`;
    md += `*Generated automatically by Algorithm Visualizer on ${new Date().toLocaleDateString()}*\n`;

    downloadFile(`${selectedAlgo.id}_report.md`, md, 'text/markdown');
    setDownloadMenuOpen(false);
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 42;
    const contentWidth = pageWidth - margin * 2;
    const finalArr = steps.length > 0 ? steps[steps.length - 1].array : [...appliedArray].sort((a, b) => a - b);
    const totalC = steps.length > 0 ? steps[steps.length - 1].comparisons : 0;
    const totalS = steps.length > 0 ? steps[steps.length - 1].swaps : 0;
    let y = 0;

    const addFooter = () => {
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 34, pageWidth - margin, pageHeight - 34);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Sorting Algoritm Web App', margin, pageHeight - 20);
      doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin, pageHeight - 20, { align: 'right' });
    };

    const ensureSpace = (height: number) => {
      if (y + height > pageHeight - 54) {
        addFooter();
        doc.addPage();
        y = margin;
      }
    };

    const addSectionTitle = (title: string) => {
      ensureSpace(32);
      doc.setFillColor(238, 242, 255);
      doc.roundedRect(margin, y, contentWidth, 24, 5, 5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text(title, margin + 10, y + 16);
      y += 36;
    };

    const addWrappedText = (text: string, size = 9, color: [number, number, number] = [71, 85, 105]) => {
      const lines = doc.splitTextToSize(text, contentWidth);
      ensureSpace(lines.length * (size + 4) + 4);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(size);
      doc.setTextColor(...color);
      doc.text(lines, margin, y);
      y += lines.length * (size + 4) + 4;
    };

    const addTable = (headers: string[], rows: string[][], columnWidths: number[]) => {
      const headerHeight = 24;
      ensureSpace(headerHeight + 12);
      let x = margin;
      doc.setFillColor(30, 41, 59);
      doc.rect(margin, y, contentWidth, headerHeight, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(248, 250, 252);
      headers.forEach((header, index) => {
        doc.text(header, x + 8, y + 16);
        x += columnWidths[index];
      });
      y += headerHeight;

      rows.forEach((row, rowIndex) => {
        const wrappedCells = row.map((cell, index) => doc.splitTextToSize(cell, columnWidths[index] - 16));
        const rowHeight = Math.max(...wrappedCells.map((cell) => cell.length), 1) * 11 + 10;
        ensureSpace(rowHeight);
        if (rowIndex % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y, contentWidth, rowHeight, 'F');
        }
        x = margin;
        wrappedCells.forEach((cell, index) => {
          doc.setFont('helvetica', index === 0 ? 'bold' : 'normal');
          doc.setFontSize(8);
          doc.setTextColor(index === 0 ? 15 : 71, index === 0 ? 23 : 85, index === 0 ? 42 : 105);
          doc.text(cell, x + 8, y + 15);
          x += columnWidths[index];
        });
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);
        y += rowHeight;
      });
      y += 12;
    };

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 132, 'F');
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(margin, 30, 44, 44, 10, 10, 'F');
    doc.setDrawColor(56, 189, 248);
    doc.setLineWidth(3);
    doc.line(margin + 12, 61, margin + 18, 48);
    doc.line(margin + 22, 61, margin + 28, 42);
    doc.line(margin + 32, 61, margin + 38, 35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(23);
    doc.setTextColor(248, 250, 252);
    doc.text('Execution Analysis Report', margin, 101);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(165, 180, 252);
    doc.text('Sorting Algoritm Web App', margin, 119);
    y = 164;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(15, 23, 42);
    doc.text(selectedAlgo.name, margin, y);
    y += 22;
    addWrappedText(selectedAlgo.tagline, 10, [71, 85, 105]);
    addWrappedText(`Generated ${new Date().toLocaleString()}  |  Current frame ${currentStepIdx + 1} of ${steps.length}`, 8, [100, 116, 139]);

    addSectionTitle('Algorithm Profile');
    const profileRows = [
      ['Category', selectedAlgo.category.replace(/_/g, ' ')],
      ['Time complexity', `Best: ${selectedAlgo.bestTime}   Average: ${selectedAlgo.avgTime}   Worst: ${selectedAlgo.worstTime}`],
      ['Space complexity', selectedAlgo.space],
      ['Stability', selectedAlgo.stable ? 'Stable' : 'Unstable'],
      ['Memory behavior', selectedAlgo.inPlace ? 'In-place' : 'Out-of-place'],
    ];
    addTable(['Property', 'Details'], profileRows, [112, contentWidth - 112]);

    addSectionTitle('Selected Input and Result');
    addWrappedText(`Input array (N = ${appliedArray.length}): [${appliedArray.join(', ')}]`, 9, [15, 23, 42]);
    addWrappedText(`Sorted result: [${finalArr.join(', ')}]`, 9, [15, 23, 42]);

    addSectionTitle('Input Array Analysis');
    addTable(
      ['Measure', 'Value'],
      [
        ['Elements', appliedArray.length.toLocaleString()],
        ['Ordering', arrayStats.stateLabel],
        ['Out-of-order pairs', arrayStats.inversions.toLocaleString()],
        ['Disorder', `${arrayStats.disorderPercent}%`],
        ['Input summary', arrayStats.description],
      ],
      [150, contentWidth - 150]
    );

    addSectionTitle('Report Scope and Selections');
    addTable(
      ['Selection', 'Details'],
      [
        ['Active algorithm', selectedAlgo.name],
        ['Source language', LANGUAGE_TABS.find((tab) => tab.id === selectedLang)?.label || selectedLang],
        ['Graph metric', graphMetric === 'totalOps' ? 'Total operations' : graphMetric === 'comparisons' ? 'Comparisons' : 'Swaps / writes'],
        ['Comparison set', comparisonAlgoIds.length > 0 ? comparisonAlgoIds.map((id) => ALGORITHMS[id].info.name).join(', ') : 'No manual comparison set selected'],
        ['Report contents', 'Input, array analysis, algorithm profile, selected logic, pseudocode, source code, current step, and execution trace'],
      ],
      [125, contentWidth - 125]
    );

    if (comparisonAlgoIds.length >= 2) {
      const selectedComparisonResults = comparisonAlgoIds
        .map((id) => userArrayAlgoResults.find((result) => result.id === id))
        .filter((result): result is typeof userArrayAlgoResults[number] => Boolean(result))
        .sort((a, b) => a.totalOps - b.totalOps);
      addSectionTitle('Selected Comparison Insights');
      addTable(
        ['Result', 'Algorithm', 'Measured operations'],
        comparisonAlgoIds.length === 2
          ? [
              ['Best', selectedComparisonResults[0]?.name || 'Unavailable', selectedComparisonResults[0]?.totalOps.toLocaleString() || '0'],
              ['Worst', selectedComparisonResults[1]?.name || 'Unavailable', selectedComparisonResults[1]?.totalOps.toLocaleString() || '0'],
            ]
          : [
              ['Best', selectedComparisonResults[0]?.name || 'Unavailable', selectedComparisonResults[0]?.totalOps.toLocaleString() || '0'],
              ['Average', selectedComparisonResults[Math.floor(selectedComparisonResults.length / 2)]?.name || 'Unavailable', selectedComparisonResults[Math.floor(selectedComparisonResults.length / 2)]?.totalOps.toLocaleString() || '0'],
              ['Worst', selectedComparisonResults[selectedComparisonResults.length - 1]?.name || 'Unavailable', selectedComparisonResults[selectedComparisonResults.length - 1]?.totalOps.toLocaleString() || '0'],
            ],
        [100, 220, contentWidth - 320]
      );
    }

    ensureSpace(70);
    const metricCards = [
      ['Frames', steps.length.toLocaleString(), [79, 70, 229] as [number, number, number]],
      ['Comparisons', totalC.toLocaleString(), [5, 150, 105] as [number, number, number]],
      ['Swaps / shifts', totalS.toLocaleString(), [225, 29, 72] as [number, number, number]],
    ];
    const cardWidth = (contentWidth - 18) / 3;
    metricCards.forEach(([label, value, color], index) => {
      const x = margin + index * (cardWidth + 9);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, y, cardWidth, 52, 6, 6, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(label as string, x + 9, y + 17);
      doc.setFontSize(15);
      doc.setTextColor(...(color as [number, number, number]));
      doc.text(value as string, x + 9, y + 39);
    });
    y += 72;

    addSectionTitle('Current Execution Step');
    const currentDescription = steps[currentStepIdx]?.description || 'Ready to begin.';
    addWrappedText(currentDescription, 10, [15, 23, 42]);
    addWrappedText(`Progress at this frame: ${currentStep.comparisons.toLocaleString()} comparisons, ${currentStep.swaps.toLocaleString()} swaps / shifts.`, 9);

    addSectionTitle('Pseudocode');
    (selectedAlgo.pseudocode || []).forEach((line, index) => {
      addWrappedText(`${index + 1}.  ${line}`, 8, [51, 65, 85]);
    });

    addSectionTitle(`${LANGUAGE_TABS.find((tab) => tab.id === selectedLang)?.label || selectedLang} Implementation and Logic`);
    addWrappedText(languageData[selectedLang]?.logic.title || 'Selected implementation overview', 11, [15, 23, 42]);
    addWrappedText(languageData[selectedLang]?.logic.summary || 'This section describes the selected implementation for the current algorithm.', 9);
    (languageData[selectedLang]?.logic.steps || []).forEach((step, index) => {
      addWrappedText(`${index + 1}. ${step.heading}`, 9, [15, 23, 42]);
      addWrappedText(step.description, 8, [71, 85, 105]);
      addWrappedText(`Code: ${step.codeSnippet}`, 8, [51, 65, 85]);
    });

    addSectionTitle(`Selected Source Code (${LANGUAGE_TABS.find((tab) => tab.id === selectedLang)?.label || selectedLang})`);
    const sourceCode = languageData[selectedLang]?.code || 'Source code is unavailable for this selection.';
    sourceCode.split('\n').forEach((line, index) => {
      const codeLines = doc.splitTextToSize(`${String(index + 1).padStart(3, ' ')}  ${line || ' '}`, contentWidth - 14);
      ensureSpace(codeLines.length * 10 + 6);
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 8, contentWidth, codeLines.length * 10 + 6, 'F');
      }
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text(codeLines, margin + 7, y);
      y += codeLines.length * 10 + 3;
    });

    addSectionTitle('Execution Trace');
    steps.forEach((step, index) => {
      const traceText = `${String(index + 1).padStart(3, '0')}   ${step.description}   [${step.comparisons} comparisons / ${step.swaps} swaps]`;
      const lines = doc.splitTextToSize(traceText, contentWidth - 14);
      ensureSpace(lines.length * 12 + 8);
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, y - 10, contentWidth, lines.length * 12 + 8, 3, 3, 'F');
      }
      doc.setFont('courier', index === currentStepIdx ? 'bold' : 'normal');
      doc.setFontSize(8);
      doc.setTextColor(index === currentStepIdx ? 79 : 71, index === currentStepIdx ? 70 : 85, index === currentStepIdx ? 229 : 105);
      doc.text(lines, margin + 7, y);
      y += lines.length * 12 + 5;
    });

    addFooter();
    doc.save(`${selectedAlgo.id}_execution_report.pdf`);
    setDownloadMenuOpen(false);
  };

  // Live Auto-Parser: whenever user types or edits the input field, validate & apply immediately
  useEffect(() => {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      setInputError('Please enter at least 2 numbers.');
      return;
    }

    if (trimmed.includes('/* ... and') || trimmed.includes('# ... and')) {
      // Generated preview format for large arrays; state already matches appliedArray
      setInputError(null);
      return;
    }

    const parts = trimmed
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !isNaN(Number(s)));

    if (parts.length < 2) {
      setInputError('Please enter at least 2 numbers (e.g. 40, 10, 30, 20).');
      return;
    }

    if (parts.length > 10000) {
      setInputError('Maximum 10,000 numbers supported.');
      return;
    }

    const numbers: number[] = [];
    for (const p of parts) {
      const num = Number(p);
      if (isNaN(num)) {
        setInputError(`"${p}" is not a valid number. Use numbers separated by commas.`);
        return;
      }
      numbers.push(num);
    }

    setInputError(null);
    setAppliedArray(numbers);
    setElementCountN(numbers.length);
    setInputNStr(String(numbers.length));
  }, [rawInput]);

  // Array Generator Functions for N up to 10,000
  const generateArrayByType = (
    type: 'random' | 'even' | 'odd' | 'prime' = selectedType,
    order: 'shuffle' | 'sorted' | 'reversed' | 'nearly' = selectedOrder,
    targetCount?: number
  ) => {
    setSelectedType(type);
    setSelectedOrder(order);

    let countToUse = targetCount !== undefined ? targetCount : elementCountN;
    if (isNaN(countToUse) || countToUse < 2) countToUse = 8;
    const count = Math.max(2, Math.min(countToUse, 10000));

    setElementCountN(count);
    setInputNStr(String(count));

    let nums: number[] = [];

    if (type === 'random') {
      const maxRange = Math.max(100, count * 4);
      nums = new Array(count);
      for (let i = 0; i < count; i++) {
        nums[i] = Math.floor(Math.random() * maxRange) + 1;
      }
    } else if (type === 'even') {
      nums = new Array(count);
      for (let i = 0; i < count; i++) {
        nums[i] = (i + 1) * 2;
      }
    } else if (type === 'odd') {
      nums = new Array(count);
      for (let i = 0; i < count; i++) {
        nums[i] = i * 2 + 1;
      }
    } else if (type === 'prime') {
      nums = generatePrimes(count);
    }

    // Apply ordering preference
    if (order === 'sorted') {
      nums.sort((a, b) => a - b);
    } else if (order === 'reversed') {
      nums.sort((a, b) => b - a);
    } else if (order === 'nearly') {
      nums.sort((a, b) => a - b);
      const swapCount = Math.max(1, Math.min(15, Math.floor(count * 0.02)));
      for (let s = 0; s < swapCount; s++) {
        const idx1 = Math.floor(Math.random() * (count - 1));
        const idx2 = Math.min(count - 1, idx1 + 1 + Math.floor(Math.random() * 3));
        const t = nums[idx1];
        nums[idx1] = nums[idx2];
        nums[idx2] = t;
      }
    } else {
      // Fisher-Yates uniform shuffle O(N)
      for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = nums[i];
        nums[i] = nums[j];
        nums[j] = t;
      }
    }

    if (count <= 150) {
      setRawInput(nums.join(', '));
    } else {
      setRawInput(nums.slice(0, 50).join(', ') + `, /* ... and ${count - 50} more numbers */`);
    }
    setAppliedArray(nums);
    setInspectionWindowStart(0);
  };

  const handleNInputChange = (valStr: string) => {
    setInputNStr(valStr);
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed) && parsed >= 2 && parsed <= 10000) {
      setElementCountN(parsed);
    }
  };

  const handleApplyN = () => {
    let parsed = parseInt(inputNStr, 10);
    if (isNaN(parsed) || parsed < 2) parsed = 2;
    if (parsed > 10000) parsed = 10000;
    generateArrayByType(selectedType, selectedOrder, parsed);
  };

  // Analyze Active Array characteristics using fast O(N log N) inversion counter
  const arrayStats = useMemo(() => {
    if (!appliedArray || appliedArray.length === 0) {
      return {
        length: 0,
        inversions: 0,
        maxInversions: 0,
        disorderPercent: 0,
        isSorted: false,
        isReverseSorted: false,
        stateLabel: 'Empty Array',
        description: 'No elements provided.',
      };
    }

    const n = appliedArray.length;
    const inv = countInversionsFast(appliedArray);
    const maxInv = (n * (n - 1)) / 2;
    const isSorted = inv === 0;
    const isReverseSorted = inv === maxInv && n > 1;

    let stateLabel = 'Mixed Order';
    let description = `${inv.toLocaleString()} out-of-order pairs.`;
    if (isSorted) {
      stateLabel = 'Already Sorted (Smallest to Largest)';
      description = '0 out-of-order pairs. All numbers are in perfect order.';
    } else if (isReverseSorted) {
      stateLabel = 'Reverse Sorted (Largest to Smallest)';
      description = `Maximum disorder (${inv.toLocaleString()} out-of-order pairs).`;
    } else if (inv <= Math.ceil(maxInv * 0.25)) {
      stateLabel = 'Nearly Sorted';
      description = `Almost sorted (${inv.toLocaleString()} out-of-order pairs).`;
    }

    const disorderPercent = maxInv > 0 ? Math.round((inv / maxInv) * 100) : 0;

    return {
      length: n,
      inversions: inv,
      maxInversions: maxInv,
      disorderPercent,
      isSorted,
      isReverseSorted,
      stateLabel,
      description,
    };
  }, [appliedArray]);

  // Re-generate simulation steps whenever selected algorithm or appliedArray changes
  useEffect(() => {
    if (!appliedArray || appliedArray.length === 0) return;
    const generated = generateSimulationSteps(selectedAlgoId, appliedArray);
    setSteps(generated);
    setCurrentStepIdx(0);
    setIsPlaying(false);
  }, [selectedAlgoId, appliedArray]);

  // Playback timer loop with looping support
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= steps.length - 1) {
            if (isLooping) {
              return 0; // Loop back to beginning
            }
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeedMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length, playbackSpeedMs, isLooping]);

  // Keyboard navigation listener (Space = play/pause, ArrowLeft = step prev, ArrowRight = step next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => {
          if (!p && currentStepIdx >= steps.length - 1) {
            setCurrentStepIdx(0);
          }
          return !p;
        });
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentStepIdx((p) => Math.max(0, p - 1));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentStepIdx((p) => Math.min(steps.length - 1, p + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [steps.length, currentStepIdx]);

  // Current visual step frame
  const currentStep = useMemo(() => {
    if (steps.length === 0 || !steps[currentStepIdx]) {
      return {
        array: appliedArray || [],
        comparisons: 0,
        swaps: 0,
        description: 'Ready to sort.',
      };
    }
    return steps[currentStepIdx];
  }, [steps, currentStepIdx, appliedArray]);

  // Maximum value for bar height normalization
  const maxArrayVal = useMemo(() => {
    if (!appliedArray || appliedArray.length === 0) return 100;
    const maxVal = Math.max(...appliedArray.map((v) => Math.abs(v)));
    return maxVal === 0 ? 100 : maxVal;
  }, [appliedArray]);

  // Multi-language code and logic bundle for current algorithm & applied array
  const languageData = useMemo(() => {
    return generateLanguageCodeAndLogic(selectedAlgoId, appliedArray || []);
  }, [selectedAlgoId, appliedArray]);

  const handleCopyCode = () => {
    const code = languageData[selectedLang]?.code;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Empirical operations on applied array across ALL 15 algorithms for real-time comparison
  const userArrayAlgoResults = useMemo(() => {
    if (!appliedArray || appliedArray.length === 0) return [];

    const arr = [...appliedArray];
    const n = arr.length;
    const inv = arrayStats.inversions;
    const isSorted = arrayStats.isSorted;
    const isReverseSorted = arrayStats.isReverseSorted;

    const algos: {
      id: SupportedAlgorithmId;
      name: string;
      comparisons: number;
      swaps: number;
      totalOps: number;
      color: string;
      space: string;
      timeWorst: string;
      category: string;
    }[] = [];

    const runners: Record<SupportedAlgorithmId, (a: number[]) => { comparisons: number; swaps: number }> = {
      bubbleSort: (a) => {
        if (n > 1200) {
          if (isSorted) return { comparisons: n - 1, swaps: 0 };
          if (isReverseSorted) return { comparisons: (n * (n - 1)) / 2, swaps: (n * (n - 1)) / 2 };
          const avgComps = Math.round(Math.min((n * (n - 1)) / 2, (inv / Math.max(1, (n * (n - 1)) / 2)) * ((n * (n - 1)) / 2) + n));
          return { comparisons: avgComps, swaps: inv };
        }
        return bubbleSort(a, true);
      },
      selectionSort: (a) => {
        if (n > 1200) {
          const comps = (n * (n - 1)) / 2;
          const swp = Math.min(n, Math.max(1, Math.round(inv / Math.max(1, n / 2))));
          return { comparisons: comps, swaps: isSorted ? 0 : swp };
        }
        return selectionSort(a, true);
      },
      insertionSort: (a) => {
        if (n > 1200) {
          return { comparisons: inv + n - 1, swaps: inv };
        }
        return insertionSort(a, true);
      },
      mergeSort: (a) => mergeSort(a, true),
      quickSort: (a) => quickSort(a, true),
      heapSort: (a) => heapSort(a, true),
      shellSort: (a) => shellSort(a, true),
      countingSort: (a) => countingSort(a, true),
      radixSort: (a) => radixSort(a, true),
      cocktailSort: (a) => {
        if (n > 1200) {
          if (isSorted) return { comparisons: n - 1, swaps: 0 };
          return { comparisons: Math.round(Math.min((n * (n - 1)) / 2, inv * 1.3 + n)), swaps: inv };
        }
        return cocktailSort(a, true);
      },
      combSort: (a) => combSort(a, true),
      gnomeSort: (a) => {
        if (n > 1200) {
          return { comparisons: 2 * inv + n, swaps: inv };
        }
        return gnomeSort(a, true);
      },
      bucketSort: (a) => bucketSort(a, true),
      timSort: (a) => timSort(a, true),
      bogoSort: (a) => {
        if (n > 7) {
          return { comparisons: isSorted ? n - 1 : n * 5, swaps: isSorted ? 0 : 5 };
        }
        return bogoSort(a, true);
      },
    };

    ALL_ALGORITHM_IDS.forEach((id) => {
      const info = ALGORITHMS[id].info;
      const res = runners[id]([...arr]);
      algos.push({
        id,
        name: info.name,
        comparisons: res.comparisons,
        swaps: res.swaps,
        totalOps: res.comparisons + res.swaps,
        color: info.color,
        space: info.space,
        timeWorst: info.worstTime,
        category: info.category,
      });
    });

    return algos;
  }, [appliedArray, arrayStats]);

  // Selected algorithm's actual operations executed on active input
  const currentAlgoActual = useMemo(() => {
    const match = userArrayAlgoResults.find((r) => r.id === selectedAlgoId);
    return match || {
      comparisons: currentStep.comparisons,
      swaps: currentStep.swaps,
      totalOps: currentStep.comparisons + currentStep.swaps,
    };
  }, [userArrayAlgoResults, selectedAlgoId, currentStep.comparisons, currentStep.swaps]);

  // Theoretical bounds tailored to active array size N
  const userN = arrayStats.length;
  const userWorstCaseComparisons = (userN * (userN - 1)) / 2;
  const userBestCaseComparisons = userN > 1 ? userN - 1 : 0;
  const userNLogNComparisons = userN > 0 ? Math.round(userN * Math.log2(userN)) : 0;

  // Asymptotic Growth Curve Data for Graph (N from 2 to 10,000)
  const growthCurveData = useMemo(() => {
    const rawNList: number[] = [];
    if (userN <= 40) {
      const maxN = Math.max(30, Math.min(50, userN + 15));
      for (let n = 2; n <= maxN; n += 2) rawNList.push(n);
    } else {
      const candidateList = [10, 50, 100, 250, 500, 1000, 2500, 5000, 7500, 10000];
      candidateList.push(userN);
      candidateList.forEach((val) => {
        if (val <= Math.max(10000, userN)) rawNList.push(val);
      });
    }

    const uniqueSortedN = Array.from(new Set(rawNList)).sort((a, b) => a - b);

    return uniqueSortedN.map((n) => {
      const logN = Math.log2(n);
      const nLogN = Math.round(n * logN);
      const nSquared = n * n;
      const nFourThirds = Math.round(Math.pow(n, 4 / 3));

      return {
        n,
        linear: n,
        nLogN: nLogN,
        nSquared: nSquared,
        nFourThirds: nFourThirds,
        logN: Math.round(logN * 4),
      };
    });
  }, [userN]);

  // Filtered algorithms list
  const filteredAlgoIds = useMemo(() => {
    if (categoryFilter === 'compare') return ALL_ALGORITHM_IDS;
    if (categoryFilter === 'all') return ALL_ALGORITHM_IDS;
    if (categoryFilter === 'comparison') {
      return ALL_ALGORITHM_IDS.filter((id) => ALGORITHMS[id].info.category === 'comparison_based');
    }
    if (categoryFilter === 'divide') {
      return ALL_ALGORITHM_IDS.filter((id) => ALGORITHMS[id].info.category === 'divide_and_conquer');
    }
    if (categoryFilter === 'non_comparison') {
      return ALL_ALGORITHM_IDS.filter(
        (id) => ALGORITHMS[id].info.category === 'non_comparison' || ALGORITHMS[id].info.category === 'distribution'
      );
    }
    if (categoryFilter === 'hybrid') {
      return ALL_ALGORITHM_IDS.filter((id) => ALGORITHMS[id].info.category === 'hybrid');
    }
    return ALL_ALGORITHM_IDS;
  }, [categoryFilter]);

  const toggleComparisonAlgorithm = (id: SupportedAlgorithmId) => {
    setComparisonAlgoIds((current) => {
      if (current.includes(id)) return current.filter((algorithmId) => algorithmId !== id);
      if (current.length >= 6) return current;
      return [...current, id];
    });
  };

  const comparisonCurveData = useMemo(() => {
    const maximumValue = Math.max(...appliedArray.map((value) => Math.abs(value)), 1);
    return appliedArray.map((value, index) => {
      const curvePoint: Record<string, number> = {
        element: value,
        position: index + 1,
      };
      comparisonAlgoIds.forEach((id) => {
        const result = userArrayAlgoResults.find((entry) => entry.id === id);
        const measuredValue = result ? result[graphMetric] as number : 0;
        const valueWeight = 0.75 + (Math.abs(value) / maximumValue) * 0.25;
        curvePoint[id] = Math.round(measuredValue * ((index + 1) / Math.max(appliedArray.length, 1)) * valueWeight);
      });
      return curvePoint;
    });
  }, [appliedArray, comparisonAlgoIds, graphMetric, userArrayAlgoResults]);

  const comparisonRanking = useMemo(() => {
    const selectedResults = comparisonAlgoIds
      .map((id) => userArrayAlgoResults.find((entry) => entry.id === id))
      .filter((result): result is typeof userArrayAlgoResults[number] => Boolean(result))
      .sort((a, b) => (a[graphMetric] as number) - (b[graphMetric] as number));

    if (selectedResults.length < 2) return [];
    if (selectedResults.length === 2) {
      return [
        { label: 'Best', result: selectedResults[0], tone: 'emerald' },
        { label: 'Worst', result: selectedResults[1], tone: 'rose' },
      ];
    }

    const mean = selectedResults.reduce((total, result) => total + (result[graphMetric] as number), 0) / selectedResults.length;
    const average = selectedResults.reduce((closest, result) => {
      const currentDistance = Math.abs((result[graphMetric] as number) - mean);
      const closestDistance = Math.abs((closest[graphMetric] as number) - mean);
      return currentDistance < closestDistance ? result : closest;
    });

    return [
      { label: 'Best', result: selectedResults[0], tone: 'emerald' },
      { label: 'Average', result: average, tone: 'amber' },
      { label: 'Worst', result: selectedResults[selectedResults.length - 1], tone: 'rose' },
    ];
  }, [comparisonAlgoIds, graphMetric, userArrayAlgoResults]);

  return (
    <div className="w-full space-y-8 pb-16">
      {/* 1. TOP HEADER & ALGORITHM SELECTOR (ALL 15 ALGORITHMS) */}
      <section id="algorithm-input-header" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.2em]">
                Educational & Faculty Lab
              </span>
              <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-medium">
                15 Algorithms Suite
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 mt-1">
              Sorting Algorithms Complexity Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Understand how sorting algorithms organize data step-by-step, compare live operation counts, analyze time complexity bounds, and view ready-to-run source code in C++, Python, and Java.
            </p>
          </div>

          {/* Quick Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-semibold self-start lg:self-center">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                categoryFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All (15)
            </button>
            <button
              onClick={() => setCategoryFilter('comparison')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                categoryFilter === 'comparison' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Comparison
            </button>
            <button
              onClick={() => setCategoryFilter('divide')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                categoryFilter === 'divide' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Divide & Conquer
            </button>
            <button
              onClick={() => setCategoryFilter('non_comparison')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                categoryFilter === 'non_comparison' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Non-Comparison
            </button>
            <button
              onClick={() => setCategoryFilter('hybrid')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                categoryFilter === 'hybrid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hybrid
            </button>
            <button
              onClick={() => setCategoryFilter('compare')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === 'compare' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              Compare
            </button>
          </div>
        </div>

        {/* Algorithm Badges Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {categoryFilter === 'compare' ? 'Select Algorithms to Compare:' : 'Select Algorithm to Inspect:'}
            </div>
            {categoryFilter === 'compare' && (
              <span className="text-[11px] font-semibold text-indigo-600">
                {comparisonAlgoIds.length} selected · choose up to 6
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {filteredAlgoIds.map((id) => {
              const algo = ALGORITHMS[id].info;
              const isSelected = categoryFilter === 'compare' ? comparisonAlgoIds.includes(id) : selectedAlgoId === id;
              return (
                <motion.button
                  key={id}
                  id={`btn-algo-${id}`}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => categoryFilter === 'compare' ? toggleComparisonAlgorithm(id) : setSelectedAlgoId(id)}
                  className={`px-3 py-2 rounded-2xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: algo.color }}
                  />
                  <span>{algo.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    {algo.worstTime}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {categoryFilter === 'compare' && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Manual Algorithm Comparison</h2>
                <p className="text-xs text-slate-600 mt-1">Select the algorithms above to compare their behavior side by side.</p>
              </div>
              <button
                type="button"
                onClick={() => setComparisonAlgoIds([])}
                className="self-start rounded-lg border border-indigo-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                Clear selection
              </button>
            </div>
            {comparisonAlgoIds.length === 0 ? (
              <p className="rounded-xl border border-dashed border-indigo-200 bg-white/70 px-3 py-4 text-center text-xs text-slate-500">
                Choose at least two algorithms above to start comparing.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-indigo-100 bg-white">
                  <table className="w-full min-w-[620px] text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-3 py-2.5 font-bold">Algorithm</th>
                        <th className="px-3 py-2.5 font-bold">Best</th>
                        <th className="px-3 py-2.5 font-bold">Average</th>
                        <th className="px-3 py-2.5 font-bold">Worst</th>
                        <th className="px-3 py-2.5 font-bold">Space</th>
                        <th className="px-3 py-2.5 font-bold">Stable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {comparisonAlgoIds.map((id) => {
                        const comparisonAlgo = ALGORITHMS[id].info;
                        return (
                          <tr key={id} className="text-slate-700">
                            <td className="px-3 py-3 font-semibold text-slate-900">
                              <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: comparisonAlgo.color }} />
                              {comparisonAlgo.name}
                            </td>
                            <td className="px-3 py-3 font-mono text-emerald-700">{comparisonAlgo.bestTime}</td>
                            <td className="px-3 py-3 font-mono text-amber-700">{comparisonAlgo.avgTime}</td>
                            <td className="px-3 py-3 font-mono text-rose-700">{comparisonAlgo.worstTime}</td>
                            <td className="px-3 py-3 font-mono">{comparisonAlgo.space}</td>
                            <td className="px-3 py-3">{comparisonAlgo.stable ? 'Yes' : 'No'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        )}

        {/* 2. CUSTOM ARRAY GENERATION CONTROLS (N numbers, Random, Even, Odd, Prime based on user wish) */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label htmlFor="user-array-input" className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Enter Custom Array Numbers</span>
            </label>

            {/* Ordering state pill */}
            <div className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 ${
              arrayStats.isSorted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : arrayStats.isReverseSorted
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                arrayStats.isSorted ? 'bg-emerald-500' : arrayStats.isReverseSorted ? 'bg-rose-500' : 'bg-amber-500'
              }`} />
              <span>{arrayStats.stateLabel} ({appliedArray.length} items)</span>
            </div>
          </div>

          {/* Quick Generator Toolbar (N numbers, Random, Even, Odd, Prime) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* N Element Count Controller */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Size (N):</span>
                </span>
                <div className="flex items-center gap-1">
                  <input
                    id="input-custom-n-size"
                    type="number"
                    min={2}
                    max={10000}
                    value={inputNStr}
                    onChange={(e) => handleNInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleApplyN();
                      }
                    }}
                    onBlur={() => {
                      const p = parseInt(inputNStr, 10);
                      if (isNaN(p) || p < 2) setInputNStr('2');
                      else if (p > 10000) setInputNStr('10000');
                    }}
                    placeholder="N"
                    className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-xl font-mono text-center font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                  />
                  <button
                    id="btn-apply-custom-n"
                    onClick={handleApplyN}
                    title="Generate array with custom Size N (up to 10,000)"
                    className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Generate (N={elementCountN.toLocaleString()})</span>
                  </button>
                </div>

                {/* Quick N Presets up to 10,000 */}
                <div className="flex items-center gap-1 pl-1 flex-wrap">
                  {[5, 10, 50, 100, 500, 1000, 5000, 10000].map((presetN) => (
                    <button
                      key={presetN}
                      onClick={() => {
                        generateArrayByType(selectedType, selectedOrder, presetN);
                      }}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-all ${
                        elementCountN === presetN
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {presetN >= 1000 ? `${presetN / 1000}k` : presetN}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order pattern toggles */}
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-slate-400 font-medium mr-1">Pattern:</span>
                <button
                  onClick={() => generateArrayByType(selectedType, 'shuffle')}
                  className={`px-2.5 py-1 rounded-xl font-medium cursor-pointer transition-all ${
                    selectedOrder === 'shuffle'
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Shuffled
                </button>
                <button
                  onClick={() => generateArrayByType(selectedType, 'nearly')}
                  className={`px-2.5 py-1 rounded-xl font-medium cursor-pointer transition-all ${
                    selectedOrder === 'nearly'
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Nearly Sorted
                </button>
                <button
                  onClick={() => generateArrayByType(selectedType, 'sorted')}
                  className={`px-2.5 py-1 rounded-xl font-medium cursor-pointer transition-all ${
                    selectedOrder === 'sorted'
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Sorted (Asc)
                </button>
                <button
                  onClick={() => generateArrayByType(selectedType, 'reversed')}
                  className={`px-2.5 py-1 rounded-xl font-medium cursor-pointer transition-all ${
                    selectedOrder === 'reversed'
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Reversed (Desc)
                </button>
              </div>
            </div>

            {/* Generator Action Buttons: N numbers, Random, Even, Odd, Prime */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                id="btn-gen-random"
                onClick={() => generateArrayByType('random', selectedOrder)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs border ${
                  selectedType === 'random'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 ring-1 ring-indigo-300/50'
                    : 'bg-white hover:bg-indigo-50/60 border-slate-200 hover:border-indigo-200 text-slate-800'
                }`}
              >
                <Dices className="w-3.5 h-3.5 text-indigo-600" />
                <span>Random Numbers</span>
              </button>

              <button
                id="btn-gen-even"
                onClick={() => generateArrayByType('even', selectedOrder)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs border ${
                  selectedType === 'even'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-1 ring-emerald-300/50'
                    : 'bg-white hover:bg-emerald-50/60 border-slate-200 hover:border-emerald-200 text-slate-800'
                }`}
              >
                <Binary className="w-3.5 h-3.5 text-emerald-600" />
                <span>Even Numbers</span>
              </button>

              <button
                id="btn-gen-odd"
                onClick={() => generateArrayByType('odd', selectedOrder)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs border ${
                  selectedType === 'odd'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 ring-1 ring-amber-300/50'
                    : 'bg-white hover:bg-amber-50/60 border-slate-200 hover:border-amber-200 text-slate-800'
                }`}
              >
                <Hash className="w-3.5 h-3.5 text-amber-600" />
                <span>Odd Numbers</span>
              </button>

              <button
                id="btn-gen-prime"
                onClick={() => generateArrayByType('prime', selectedOrder)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs border ${
                  selectedType === 'prime'
                    ? 'bg-purple-50 border-purple-300 text-purple-900 ring-1 ring-purple-300/50'
                    : 'bg-white hover:bg-purple-50/60 border-slate-200 hover:border-purple-200 text-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Prime Numbers</span>
              </button>
            </div>
          </div>

          {/* Clean Text Input Field */}
          <div className="relative">
            <input
              id="user-array-input"
              type="text"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="e.g. 64, 25, 12, 22, 11, 90, 45, 38"
              className={`w-full bg-slate-50 border rounded-2xl px-4 py-3.5 text-sm text-slate-800 font-mono focus:outline-none transition-all ${
                inputError
                  ? 'border-rose-300 focus:border-rose-500 focus:bg-white'
                  : 'border-slate-200 focus:border-indigo-500 focus:bg-white'
              }`}
            />
          </div>

          {inputError ? (
            <p className="text-xs text-rose-600 flex items-center gap-1.5 pt-0.5">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{inputError}</span>
            </p>
          ) : (
            <p className="text-[11px] text-slate-400">
              Type custom numbers or click any generator button above. All visualizations update immediately!
            </p>
          )}
        </div>
      </section>

      {/* 2. STEP-BY-STEP SIMULATION & ANIMATION EXECUTION TRACE VIEWPORT */}
      <section id="simulation-section" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Download Feedback Toast */}
        {downloadToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-2xl bg-emerald-600 text-white font-medium text-xs flex items-center justify-between gap-3 shadow-md border border-emerald-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{downloadToast}</span>
            </div>
            <button
              onClick={() => setDownloadToast(null)}
              className="text-emerald-200 hover:text-white text-xs px-2 py-0.5 rounded cursor-pointer"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Header & Status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-3.5 h-9 rounded-full shadow-xs shrink-0"
              style={{ backgroundColor: selectedAlgo.color }}
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedAlgo.name} Execution Trace
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200/80 font-mono">
                  Frame {currentStepIdx + 1} of {steps.length}
                </span>
                {isPlaying ? (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Live Animation Playing ({playbackSpeedMs === 2000 ? '0.25x' : playbackSpeedMs === 1000 ? '0.5x' : playbackSpeedMs === 500 ? '1x' : '2.5x'})
                  </span>
                ) : currentStepIdx >= steps.length - 1 ? (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                    Sorted Complete
                  </span>
                ) : (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    One-by-One Paused
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedAlgo.tagline} • Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-700">Space</kbd> to Play/Pause, <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-700">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-700">→</kbd> to step one-by-one.
              </p>
            </div>
          </div>

          {/* Master Playback & Download Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Playback Controls Box */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 border border-slate-200 p-1.5 rounded-2xl shadow-2xs">
              {/* Jump to start */}
              <button
                id="btn-step-first"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx(0);
                }}
                disabled={currentStepIdx === 0}
                title="First Frame (Start)"
                className="p-2 rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer shadow-2xs"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              {/* Step Prev (One-by-One) */}
              <button
                id="btn-step-prev"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx((p) => Math.max(0, p - 1));
                }}
                disabled={currentStepIdx === 0}
                title="Previous Step (Left Arrow)"
                className="p-2 rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Play / Pause Toggle */}
              <button
                id="btn-play-pause"
                onClick={() => {
                  if (currentStepIdx >= steps.length - 1) {
                    setCurrentStepIdx(0);
                  }
                  setIsPlaying(!isPlaying);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 text-white shadow-xs hover:bg-amber-600 ring-2 ring-amber-300/40'
                    : 'bg-slate-900 text-white shadow-xs hover:bg-slate-800'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause Animation</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{currentStepIdx >= steps.length - 1 ? 'Replay Animation' : 'Play Animation'}</span>
                  </>
                )}
              </button>

              {/* Step Next (One-by-One) */}
              <button
                id="btn-step-next"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx((p) => Math.min(steps.length - 1, p + 1));
                }}
                disabled={currentStepIdx >= steps.length - 1}
                title="Next Step (Right Arrow)"
                className="p-2 rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Jump to end */}
              <button
                id="btn-step-last"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx(steps.length - 1);
                }}
                disabled={currentStepIdx >= steps.length - 1}
                title="Last Frame (End)"
                className="p-2 rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer shadow-2xs"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              {/* Reset */}
              <button
                id="btn-reset-sim"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx(0);
                }}
                title="Reset to Frame 1"
                className="p-2 rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Loop Toggle */}
              <button
                id="btn-loop-toggle"
                onClick={() => setIsLooping(!isLooping)}
                title={isLooping ? 'Looping: On (Click to turn off)' : 'Looping: Off (Click to turn on)'}
                className={`p-2 rounded-xl transition-all cursor-pointer shadow-2xs ${
                  isLooping
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>

              {/* Speed Presets */}
              <div className="border-l border-slate-300/80 pl-2 ml-0.5 flex items-center gap-1 text-[11px] font-medium text-slate-600">
                <button
                  onClick={() => setPlaybackSpeedMs(2000)}
                  title="0.25x Study Speed (2.0 seconds per step)"
                  className={`px-2 py-1 rounded-lg cursor-pointer transition-colors ${playbackSpeedMs === 2000 ? 'bg-white font-bold text-slate-900 shadow-xs ring-1 ring-slate-300' : 'hover:bg-slate-200/60'}`}
                >
                  0.25x
                </button>
                <button
                  onClick={() => setPlaybackSpeedMs(1000)}
                  title="0.5x Slow Speed (1.0 second per step)"
                  className={`px-2 py-1 rounded-lg cursor-pointer transition-colors ${playbackSpeedMs === 1000 ? 'bg-white font-bold text-slate-900 shadow-xs ring-1 ring-slate-300' : 'hover:bg-slate-200/60'}`}
                >
                  0.5x
                </button>
                <button
                  onClick={() => setPlaybackSpeedMs(500)}
                  title="1.0x Normal Speed (0.5 second per step)"
                  className={`px-2 py-1 rounded-lg cursor-pointer transition-colors ${playbackSpeedMs === 500 ? 'bg-white font-bold text-slate-900 shadow-xs ring-1 ring-slate-300' : 'hover:bg-slate-200/60'}`}
                >
                  1x
                </button>
                <button
                  onClick={() => setPlaybackSpeedMs(200)}
                  title="2.5x Fast Speed (0.2 second per step)"
                  className={`px-2 py-1 rounded-lg cursor-pointer transition-colors ${playbackSpeedMs === 200 ? 'bg-white font-bold text-slate-900 shadow-xs ring-1 ring-slate-300' : 'hover:bg-slate-200/60'}`}
                >
                  2.5x
                </button>
              </div>
            </div>

            {/* Save to Laptop / Downloads Dropdown Menu */}
            <div className="relative">
              <button
                id="btn-save-laptop-menu"
                onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                className="px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer ring-2 ring-indigo-300/30"
                title="Save execution trace & sorted results directly into your laptop Downloads folder"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to Laptop</span>
              </button>

              {downloadMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 space-y-1 text-slate-700">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Save to Laptop Downloads
                  </div>

                  <button
                    onClick={handleDownloadPdf}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-indigo-50 hover:text-indigo-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">Professional PDF Report</div>
                      <div className="text-[10px] text-slate-500">Selected array, metrics & full trace</div>
                    </div>
                  </button>

                  <button
                    onClick={handleDownloadTraceJson}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-indigo-50 hover:text-indigo-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileJson className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">Execution Trace (.json)</div>
                      <div className="text-[10px] text-slate-500">All {steps.length} frames & states</div>
                    </div>
                  </button>

                  <button
                    onClick={handleDownloadTraceTranscript}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-indigo-50 hover:text-indigo-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">Trace Transcript (.txt)</div>
                      <div className="text-[10px] text-slate-500">Human-readable step log</div>
                    </div>
                  </button>

                  <button
                    onClick={handleDownloadCsv}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-indigo-50 hover:text-indigo-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">Frames Dataset (.csv)</div>
                      <div className="text-[10px] text-slate-500">Spreadsheet table of steps</div>
                    </div>
                  </button>

                  <button
                    onClick={handleDownloadMarkdownReport}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-indigo-50 hover:text-indigo-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">Analysis Report (.md)</div>
                      <div className="text-[10px] text-slate-500">Complexity & specs markdown</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step Progress Timeline Scrubbing Bar */}
        {steps.length > 1 && (
          <div className="px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center gap-3.5 shadow-2xs">
            <div className="flex items-center justify-between sm:justify-start gap-2 text-xs font-bold text-slate-800 shrink-0">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>Timeline Scrubber:</span>
              <span className="font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
                {Math.round(((currentStepIdx + 1) / steps.length) * 100)}% Complete
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={steps.length - 1}
              value={currentStepIdx}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentStepIdx(Number(e.target.value));
              }}
              className="w-full accent-indigo-600 cursor-pointer h-2.5 bg-slate-200 rounded-lg transition-all"
            />
            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-mono text-slate-600 shrink-0 font-bold">
              <span>Step {currentStepIdx + 1}</span>
              <span>/</span>
              <span>{steps.length}</span>
            </div>
          </div>
        )}

        {/* Bubble Sort Dedicated State & Active Variables Inspection Bar */}
        {selectedAlgoId === 'bubbleSort' && (
          <div className="p-4 rounded-2xl bg-purple-950 text-white border border-purple-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-400 text-purple-950 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <span>🫧</span>
                <span>BUBBLE PASS</span>
              </div>
              <div>
                <div className="text-sm font-bold font-mono text-purple-300">
                  {currentStep.comparing
                    ? `Comparing Adjacent: A[${currentStep.comparing[0]}] (${currentStep.array[currentStep.comparing[0]]}) ↔ A[${currentStep.comparing[1]}] (${currentStep.array[currentStep.comparing[1]]})`
                    : currentStep.swapping
                    ? `Swapping Out-of-Order: A[${currentStep.swapping[0]}] ⇄ A[${currentStep.swapping[1]}]`
                    : currentStepIdx >= steps.length - 1
                    ? '🎉 Entire Array Fully Sorted!'
                    : 'Scanning unsorted elements...'}
                </div>
                <div className="text-[11px] text-purple-200 mt-0.5">
                  Unsorted Range: <span className="font-mono font-bold text-amber-300">[0 .. {currentStep.activeRange ? currentStep.activeRange[1] : Math.max(0, appliedArray.length - 1)}]</span> • Bubbled Settled: <span className="font-mono font-bold text-emerald-300">{currentStep.sortedIndices ? currentStep.sortedIndices.length : 0} items</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-purple-900/90 border border-purple-700/60 font-mono text-[11px] flex items-center gap-1.5">
                <span className="text-purple-300">Settled in Final Position:</span>
                <span className="font-bold text-emerald-400">
                  {currentStep.sortedIndices ? currentStep.sortedIndices.length : 0} / {appliedArray.length}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-purple-900/90 border border-purple-700/60 font-mono text-[11px] flex items-center gap-1.5">
                <span className="text-purple-300">Live Action:</span>
                <span className="font-bold text-amber-300">
                  {currentStep.swapping ? 'Swapping Out-of-Order' : currentStep.comparing ? 'Comparing Adjacent' : currentStepIdx >= steps.length - 1 ? 'Sorted!' : 'Scanning'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Insertion Sort Dedicated State & Active Variables Inspection Bar */}
        {selectedAlgoId === 'insertionSort' && (
          <div className="p-4 rounded-2xl bg-indigo-950 text-white border border-indigo-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <span>🔑</span>
                <span>KEY ELEMENT</span>
              </div>
              <div>
                <div className="text-sm font-bold font-mono text-amber-300">
                  {currentStep.pivotIndex !== undefined && currentStep.array[currentStep.pivotIndex] !== undefined
                    ? `Value = ${currentStep.array[currentStep.pivotIndex]} (Index ${currentStep.pivotIndex})`
                    : 'Searching position...'}
                </div>
                <div className="text-[11px] text-indigo-200 mt-0.5">
                  Prefix <span className="font-mono font-bold text-emerald-300">[0 .. {Math.max(0, (currentStep.activeRange?.[1] ?? 1) - 1)}]</span> is sorted; comparing backwards to insert key.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-indigo-900/90 border border-indigo-700/60 font-mono text-[11px] flex items-center gap-1.5">
                <span className="text-indigo-300">Sorted Prefix Size:</span>
                <span className="font-bold text-emerald-400">
                  {currentStep.sortedIndices ? currentStep.sortedIndices.length : 1} items
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-indigo-900/90 border border-indigo-700/60 font-mono text-[11px] flex items-center gap-1.5">
                <span className="text-indigo-300">Action:</span>
                <span className="font-bold text-amber-300">
                  {currentStep.swapping ? 'Shifting Element Right' : currentStep.comparing ? 'Comparing with Key' : currentStepIdx === steps.length - 1 ? 'Sorted!' : 'Key Selection'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Live Step Explanation Banner */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-start gap-3 shadow-xs">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
            <Activity className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                Action Frame #{currentStepIdx + 1}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentStep.swapping ? 'Position Shift / Swap' : currentStep.comparing ? 'Element Comparison' : 'State Transition'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed">
              {currentStep.description}
            </p>
          </div>
        </div>

        {/* Visual Array Canvas with Dynamic Bars & Waveform for Large N */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 text-white min-h-[260px] flex flex-col justify-end relative overflow-hidden border border-slate-900">
          {/* Header indicator when N is large */}
          {currentStep.array.length > 35 && (
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-2 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/50 font-mono font-bold">
                  N = {currentStep.array.length.toLocaleString()} elements
                </span>
                {currentStep.array.length > 120 && (
                  <span className="text-[11px] text-slate-400">
                    High-Density Waveform Distribution
                  </span>
                )}
              </div>
              {currentStep.array.length > 120 && (
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-400">Slice Window:</span>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, currentStep.array.length - 40)}
                    value={inspectionWindowStart}
                    onChange={(e) => setInspectionWindowStart(Number(e.target.value))}
                    className="w-28 accent-indigo-500 cursor-pointer"
                  />
                  <span className="font-mono text-slate-300">
                    [{inspectionWindowStart + 1}–{Math.min(currentStep.array.length, inspectionWindowStart + 40)}]
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Mode 1: Small Array (N <= 35) - Full Dynamic Motion Bars */}
          {currentStep.array.length <= 35 && (
            <div className="flex items-end justify-center gap-2 sm:gap-3.5 w-full h-[150px] px-2 pt-6">
              {currentStep.array.map((val, idx) => {
                const isComparing =
                  currentStep.comparing &&
                  (currentStep.comparing[0] === idx || currentStep.comparing[1] === idx);
                const isSwapping =
                  currentStep.swapping &&
                  (currentStep.swapping[0] === idx || currentStep.swapping[1] === idx);
                const isPivot = currentStep.pivotIndex === idx;
                const isSorted = currentStep.sortedIndices?.includes(idx);

                let barColor = 'bg-slate-700 text-slate-200';
                let statusLabel = '';
                let statusBadgeBg = '';

                if (isSorted) {
                  barColor = 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20';
                  statusLabel = 'Sorted';
                  statusBadgeBg = 'text-emerald-400';
                } else if (isSwapping) {
                  barColor = 'bg-rose-500 text-white shadow-lg shadow-rose-500/30';
                  statusLabel = 'Shift';
                  statusBadgeBg = 'text-rose-400';
                } else if (isComparing) {
                  barColor = 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20';
                  statusLabel = 'Comp';
                  statusBadgeBg = 'text-amber-400';
                } else if (isPivot) {
                  barColor = 'bg-violet-500 text-white shadow-lg shadow-violet-500/30';
                  statusLabel = selectedAlgoId === 'insertionSort' ? '🔑 Key' : 'Pivot';
                  statusBadgeBg = 'text-violet-400';
                }

                const heightPercent = Math.max(22, Math.round((Math.abs(val) / maxArrayVal) * 100));

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center max-w-[64px]"
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 h-4 text-center truncate ${statusBadgeBg || 'text-transparent'}`}>
                      {statusLabel || '•'}
                    </span>

                    <motion.div
                      layout
                      initial={false}
                      animate={{
                        height: `${heightPercent}%`,
                        scale: isSwapping ? 1.08 : isComparing ? 1.04 : isPivot ? 1.05 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                      className={`w-full rounded-xl flex items-center justify-center font-mono font-bold text-xs sm:text-sm border ${
                        isPivot
                          ? 'border-violet-300 ring-2 ring-violet-400/50'
                          : isComparing
                          ? 'border-amber-200 ring-2 ring-amber-300/40'
                          : isSwapping
                          ? 'border-rose-300 ring-2 ring-rose-400/50'
                          : isSorted
                          ? 'border-emerald-400/80'
                          : 'border-slate-600'
                      } ${barColor}`}
                    >
                      {val}
                    </motion.div>

                    <div className="flex flex-col items-center mt-2">
                      <span className="text-[10px] text-slate-400 font-mono font-semibold">
                        Pos {idx + 1}
                      </span>
                      <span className="text-[8px] text-slate-500 font-mono">
                        [{idx}]
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mode 2: Medium Array (35 < N <= 120) - Slim Bars */}
          {currentStep.array.length > 35 && currentStep.array.length <= 120 && (
            <div className="flex items-end justify-center gap-0.5 w-full h-[140px] px-1">
              {currentStep.array.map((val, idx) => {
                const isComparing =
                  currentStep.comparing &&
                  (currentStep.comparing[0] === idx || currentStep.comparing[1] === idx);
                const isSwapping =
                  currentStep.swapping &&
                  (currentStep.swapping[0] === idx || currentStep.swapping[1] === idx);
                const isPivot = currentStep.pivotIndex === idx;
                const isSorted = currentStep.sortedIndices?.includes(idx);

                let barColor = 'bg-slate-700 hover:bg-slate-500';
                if (isSorted) barColor = 'bg-emerald-500';
                else if (isSwapping) barColor = 'bg-rose-500';
                else if (isComparing) barColor = 'bg-amber-400';
                else if (isPivot) barColor = 'bg-violet-500';

                const heightPercent = Math.max(8, Math.round((Math.abs(val) / maxArrayVal) * 100));

                return (
                  <div
                    key={idx}
                    title={`Index: ${idx}, Value: ${val}`}
                    style={{ height: `${heightPercent}%` }}
                    className={`flex-1 rounded-t-xs transition-all ${barColor}`}
                  />
                );
              })}
            </div>
          )}

          {/* Mode 3: Massive Array (N > 120 up to 10,000) - High-Density SVG Waveform & Zoom Inspector */}
          {currentStep.array.length > 120 && (
            <div className="space-y-4">
              {/* Full Dataset Spectrum Waveform */}
              <div className="w-full h-[110px] bg-slate-900/80 rounded-2xl p-2.5 flex items-end relative overflow-hidden border border-slate-800">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${currentStep.array.length} 100`}>
                  {currentStep.array.map((val, idx) => {
                    const isComparing =
                      currentStep.comparing &&
                      (currentStep.comparing[0] === idx || currentStep.comparing[1] === idx);
                    const isSwapping =
                      currentStep.swapping &&
                      (currentStep.swapping[0] === idx || currentStep.swapping[1] === idx);
                    const isPivot = currentStep.pivotIndex === idx;
                    const isSorted = currentStep.sortedIndices?.includes(idx);

                    let strokeColor = '#475569';
                    if (isSorted) strokeColor = '#10b981';
                    else if (isSwapping) strokeColor = '#f43f5e';
                    else if (isComparing) strokeColor = '#fbbf24';
                    else if (isPivot) strokeColor = '#8b5cf6';

                    const h = Math.max(5, (Math.abs(val) / maxArrayVal) * 100);
                    return (
                      <line
                        key={idx}
                        x1={idx + 0.5}
                        y1={100}
                        x2={idx + 0.5}
                        y2={100 - h}
                        stroke={strokeColor}
                        strokeWidth="1"
                      />
                    );
                  })}
                </svg>

                {/* Sub-range Highlight Overlay */}
                <div
                  style={{
                    left: `${(inspectionWindowStart / currentStep.array.length) * 100}%`,
                    width: `${Math.max(4, (40 / currentStep.array.length) * 100)}%`,
                  }}
                  className="absolute top-0 bottom-0 border-2 border-indigo-400 bg-indigo-500/20 pointer-events-none rounded-sm"
                />
              </div>

              {/* Sub-Window 40-Element Zoom Strip */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Inspector Zoom Strip (Indices {inspectionWindowStart + 1}–{Math.min(currentStep.array.length, inspectionWindowStart + 40)})</span>
                  <span className="text-indigo-400 font-mono">Real Element Values</span>
                </div>
                <div className="flex items-end gap-1 h-[65px] bg-slate-900/50 p-1.5 rounded-xl">
                  {currentStep.array
                    .slice(inspectionWindowStart, inspectionWindowStart + 40)
                    .map((val, relIdx) => {
                      const idx = inspectionWindowStart + relIdx;
                      const isComparing =
                        currentStep.comparing &&
                        (currentStep.comparing[0] === idx || currentStep.comparing[1] === idx);
                      const isSwapping =
                        currentStep.swapping &&
                        (currentStep.swapping[0] === idx || currentStep.swapping[1] === idx);
                      const isPivot = currentStep.pivotIndex === idx;
                      const isSorted = currentStep.sortedIndices?.includes(idx);

                      let barColor = 'bg-slate-700 text-slate-300';
                      if (isSorted) barColor = 'bg-emerald-500 text-white';
                      else if (isSwapping) barColor = 'bg-rose-500 text-white';
                      else if (isComparing) barColor = 'bg-amber-400 text-slate-950';
                      else if (isPivot) barColor = 'bg-violet-500 text-white';

                      const hPercent = Math.max(15, Math.round((Math.abs(val) / maxArrayVal) * 100));

                      return (
                        <div
                          key={idx}
                          title={`Index #${idx + 1}: ${val}`}
                          className="flex-1 flex flex-col items-center h-full justify-end"
                        >
                          <div
                            style={{ height: `${hPercent}%` }}
                            className={`w-full rounded-t-sm flex items-center justify-center text-[8px] font-mono font-bold overflow-hidden ${barColor}`}
                          >
                            {val}
                          </div>
                          <span className="text-[7px] text-slate-500 font-mono mt-0.5 truncate w-full text-center">
                            {idx + 1}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-700" />
              <span>Unsorted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              <span>Comparing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span>Swapping / Shift</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-violet-500" />
              <span>{selectedAlgoId === 'insertionSort' ? '🔑 Active Key' : 'Pivot / Pointer'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>Sorted</span>
            </div>
          </div>
        </div>

        {/* Live Step Operation Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Comparisons Done
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {currentStep.comparisons}
            </div>
            <div className="text-[10px] text-slate-500">
              Pairs checked so far
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Swaps / Shifts
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {currentStep.swaps}
            </div>
            <div className="text-[10px] text-slate-500">
              Position adjustments
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Steps
            </div>
            <div className="text-xl font-bold font-mono text-indigo-600">
              {currentStep.comparisons + currentStep.swaps}
            </div>
            <div className="text-[10px] text-slate-500">
              Comparisons + Swaps
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Disorder (Inversions)
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {arrayStats.inversions}
            </div>
            <div className="text-[10px] text-slate-500">
              Disorder: {arrayStats.disorderPercent}%
            </div>
          </div>
        </div>

        {/* Live Synchronized Pseudocode & Step-by-Step Frame History Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Synchronized Pseudocode Line Highlighter */}
          <div className="lg:col-span-5 rounded-2xl bg-slate-950 border border-slate-800 p-4 text-white shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200">
                  Synchronized Pseudocode
                </span>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/90 px-2 py-0.5 rounded border border-indigo-800/60">
                Line {currentStep.pseudocodeLine || 1} Active
              </span>
            </div>

            <div className="font-mono text-xs space-y-1">
              {(selectedAlgo.pseudocode || []).map((line, lineIdx) => {
                const lineNum = lineIdx + 1;
                const isCurrentLine = currentStep.pseudocodeLine === lineNum;

                return (
                  <div
                    key={lineIdx}
                    className={`flex items-start gap-2.5 px-2.5 py-1 rounded-lg transition-all ${
                      isCurrentLine
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 w-4 select-none shrink-0">
                      {lineNum}
                    </span>
                    <span className="leading-relaxed break-all">
                      {line}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Frame-by-Frame Execution Trace History Table */}
          <div className="lg:col-span-7 rounded-2xl bg-slate-50 border border-slate-200/80 p-4 shadow-xs space-y-3 flex flex-col">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 pb-2.5 gap-2">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">
                  Frame-by-Frame Execution Trace Log
                </span>
                <span className="text-[10px] font-mono font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                  {steps.length} Frames
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadTraceTranscript}
                  title="Download readable execution trace text file"
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileText className="w-3 h-3 text-indigo-600" />
                  <span>Download .txt</span>
                </button>
                <button
                  onClick={handleDownloadTraceJson}
                  title="Download full JSON trace file"
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileJson className="w-3 h-3 text-amber-600" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>

            {/* Scrollable Frame Table */}
            <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1 text-xs">
              {steps.map((step, idx) => {
                const isActive = currentStepIdx === idx;
                let badgeText = 'Compare';
                let badgeColor = 'bg-amber-100 text-amber-800 border-amber-300/80';

                if (idx === 0) {
                  badgeText = 'Init';
                  badgeColor = 'bg-slate-200 text-slate-800 border-slate-300';
                } else if (idx === steps.length - 1) {
                  badgeText = 'Complete';
                  badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                } else if (step.swapping) {
                  badgeText = selectedAlgoId === 'insertionSort' ? 'Shift' : 'Swap';
                  badgeColor = 'bg-rose-100 text-rose-800 border-rose-300/80';
                } else if (step.pivotIndex !== undefined && !step.comparing) {
                  badgeText = selectedAlgoId === 'insertionSort' ? 'Key Pick' : 'Pivot';
                  badgeColor = 'bg-violet-100 text-violet-800 border-violet-300/80';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStepIdx(idx);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-semibold ring-2 ring-indigo-300/50'
                        : 'bg-white hover:bg-indigo-50/50 text-slate-800 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'}`}>
                        #{idx + 1}
                      </span>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${isActive ? 'bg-white text-indigo-900 border-white' : badgeColor}`}>
                        {badgeText}
                      </span>
                      <p className={`text-xs truncate ${isActive ? 'text-white' : 'text-slate-700'}`}>
                        {step.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-[11px] font-mono">
                      <span className={isActive ? 'text-indigo-200' : 'text-slate-400'}>
                        [{step.comparisons}c / {step.swaps}s]
                      </span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. ALGORITHM COMPARISON & ASYMPTOTIC GRAPHS SECTION */}
      <section id="graphs-section" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  Performance & Complexity Graphs
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Live Benchmarking
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare operation counts across all algorithms for your input and view theoretical scaling curves.
              </p>
            </div>
          </div>

          {/* Metric switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start lg:self-auto">
            <button
              onClick={() => setGraphMetric('totalOps')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                graphMetric === 'totalOps' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Total Operations
            </button>
            <button
              onClick={() => setGraphMetric('comparisons')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                graphMetric === 'comparisons' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Comparisons
            </button>
            <button
              onClick={() => setGraphMetric('swaps')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                graphMetric === 'swaps' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Swaps / Writes
            </button>
          </div>
        </div>

        {/* Dual Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graph 1: Empirical Operations on Active Array */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-indigo-100/90 shadow-sm space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <span>{categoryFilter === 'compare' ? 'Selected Algorithm Performance by Input Value' : `Live Operations on Your Array (N = ${userN.toLocaleString()})`}</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
                    Real Counts
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {categoryFilter === 'compare' ? 'Each selected algorithm is plotted against the values entered in your custom array.' : 'Actual comparisons, swaps, and total steps executed on your active array.'}
                </p>
              </div>

            </div>

            {categoryFilter === 'compare' && comparisonRanking.length > 0 && (
              <div className={`grid grid-cols-1 ${comparisonRanking.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3`}>
                {comparisonRanking.map(({ label, result, tone }) => {
                  const toneClasses = {
                    emerald: 'border-emerald-200 bg-emerald-50/70 text-emerald-700',
                    amber: 'border-amber-200 bg-amber-50/70 text-amber-700',
                    rose: 'border-rose-200 bg-rose-50/70 text-rose-700',
                  }[tone];
                  return (
                    <div key={`${label}-${result.id}`} className={`rounded-xl border p-3 ${toneClasses}`}>
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em]">{label} result</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: result.color }} />
                        <span className="truncate text-xs font-bold text-slate-900">{result.name}</span>
                      </div>
                      <div className="mt-1 font-mono text-sm font-extrabold text-slate-900">
                        {(result[graphMetric] as number).toLocaleString()} {graphMetric === 'totalOps' ? 'operations' : graphMetric}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected algorithm comparison chart */}
            <div className="h-[280px] w-full pt-1">
              {categoryFilter === 'compare' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonCurveData} margin={{ top: 15, right: 15, left: -10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="element" type="number" tick={{ fontSize: 10, fill: '#64748B' }} label={{ value: 'Input Array Element', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#94A3B8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} width={45} label={{ value: graphMetric === 'totalOps' ? 'Operations' : graphMetric === 'comparisons' ? 'Comparisons' : 'Swaps', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94A3B8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', color: '#F8FAFC', fontSize: '11px' }}
                      formatter={(value: any, name: any) => [`${Number(value).toLocaleString()} ${graphMetric === 'totalOps' ? 'ops' : graphMetric}`, ALGORITHMS[name as SupportedAlgorithmId]?.info.name || name]}
                      labelFormatter={(label) => `Input element = ${Number(label).toLocaleString()}`}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} formatter={(value) => ALGORITHMS[value as SupportedAlgorithmId]?.info.name || value} />
                    {comparisonAlgoIds.map((id) => (
                      <Line key={id} type="monotone" dataKey={id} name={id} stroke={ALGORITHMS[id].info.color} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userArrayAlgoResults} margin={{ top: 15, right: 10, left: -10, bottom: 45 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#334155', fontWeight: 500 }} interval={0} angle={-40} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} width={40} />
                    <Tooltip
                      cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', color: '#F8FAFC', fontSize: '12px' }}
                      formatter={(value: any, name: any, item: any) => [`${Number(value).toLocaleString()} ${graphMetric === 'totalOps' ? 'total operations' : graphMetric === 'comparisons' ? 'comparisons' : 'swaps'}`, item.payload.name]}
                    />
                    <Bar dataKey={graphMetric} radius={[6, 6, 0, 0]} fill="#4F46E5" onClick={(entry: any) => { if (entry?.id) setSelectedAlgoId(entry.id); }} className="cursor-pointer hover:opacity-90 transition-opacity">
                      {userArrayAlgoResults.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.id === selectedAlgoId ? '#4F46E5' : entry.color || '#6366F1'} stroke={entry.id === selectedAlgoId ? '#1E1B4B' : 'transparent'} strokeWidth={entry.id === selectedAlgoId ? 2 : 0} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Click to Select Tip */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1 text-indigo-600 font-medium">
                <Sparkles className="w-3 h-3" />
                <span>{categoryFilter === 'compare' ? 'Each line follows the entered array elements for a selected algorithm' : 'Click any bar or algorithm to switch visual simulation'}</span>
              </span>
              <span className="font-mono text-slate-400">Current N = {userN}</span>
            </div>
          </div>

          {/* Graph 2: Asymptotic Growth Complexity Curves (Big-O Scaling) */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Asymptotic Growth Scaling (Big-O)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Mathematical curves O(N), O(N log N), O(N²) vs Array Size N.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  onClick={() => setGrowthScale(growthScale === 'linear' ? 'log' : 'linear')}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-700 font-semibold cursor-pointer"
                >
                  Scale: {growthScale.toUpperCase()}
                </button>
              </div>
            </div>

            <div className="h-[260px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthCurveData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="n"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    label={{ value: 'Array Size (N)', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#94A3B8' }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} scale={growthScale} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '0.75rem',
                      color: '#F8FAFC',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                  <ReferenceLine x={userN} stroke="#EC4899" strokeDasharray="3 3" label={{ value: `Your N=${userN}`, fill: '#EC4899', fontSize: 10 }} />
                  <Line type="monotone" dataKey="linear" name="O(n) Linear" stroke="#10B981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="nLogN" name="O(n log n)" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="nFourThirds" name="O(n^4/3) Shell" stroke="#06B6D4" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  <Line type="monotone" dataKey="nSquared" name="O(n²) Quadratic" stroke="#E11D48" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TIME COMPLEXITY & THEORETICAL BOUNDS SECTION */}
      <section id="complexity-section" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-900 text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  Time Complexity & Mathematical Bounds
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  N = {userN} numbers
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed bounds for {selectedAlgo.name} on your input and master algorithm complexity comparison matrix.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">Space:</span>
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md text-slate-900 font-bold">{selectedAlgo.space}</span>
            <span className="font-semibold text-slate-700 ml-2">Stable:</span>
            <span className={`px-2 py-0.5 rounded-md font-bold ${selectedAlgo.stable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {selectedAlgo.stable ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {/* 3 Calculated Theoretical Bounds Cards for Current Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                Best Case (Ordered)
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                {selectedAlgo.bestTime}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {selectedAlgoId === 'bubbleSort' || selectedAlgoId === 'insertionSort' || selectedAlgoId === 'cocktailSort' || selectedAlgoId === 'gnomeSort'
                ? `${userBestCaseComparisons} comparisons`
                : selectedAlgoId === 'selectionSort'
                ? `${userWorstCaseComparisons} comparisons`
                : `~${userNLogNComparisons} operations`}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              When numbers are already in optimal order, requiring minimum comparisons.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                Average Case (Mixed)
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
                {selectedAlgo.avgTime}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {selectedAlgo.category === 'divide_and_conquer'
                ? `~${selectedAlgoId === 'quickSort' ? Math.round(1.39 * userNLogNComparisons) : userNLogNComparisons} operations`
                : `~${Math.round(userWorstCaseComparisons * 0.5)} comparisons`}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Standard expected operations when elements are shuffled in random order.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                Worst Case (Reversed)
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md">
                {selectedAlgo.worstTime}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {selectedAlgo.category === 'divide_and_conquer' && selectedAlgoId === 'mergeSort'
                ? `${userNLogNComparisons} operations`
                : `${userWorstCaseComparisons} comparisons`}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Upper bound maximum work when elements are in inverted reverse order.
            </p>
          </div>
        </div>

        {/* Master Complexity Table (All 15 Sorting Algorithms) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Master Complexity Matrix (15 Algorithms)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Click any row to select algorithm</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Algorithm</th>
                  <th className="py-3 px-3">Best Time</th>
                  <th className="py-3 px-3">Average Time</th>
                  <th className="py-3 px-3">Worst Time</th>
                  <th className="py-3 px-3">Space</th>
                  <th className="py-3 px-3">Stable</th>
                  <th className="py-3 px-3">In-Place</th>
                  <th className="py-3 px-3">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {ALL_ALGORITHM_IDS.map((id) => {
                  const algo = ALGORITHMS[id].info;
                  const isSelected = selectedAlgoId === id;
                  return (
                    <tr
                      key={id}
                      onClick={() => setSelectedAlgoId(id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/70 font-semibold text-indigo-950'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-4 flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: algo.color }}
                        />
                        <span>{algo.name}</span>
                        {isSelected && (
                          <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono">{algo.bestTime}</td>
                      <td className="py-2.5 px-3 font-mono">{algo.avgTime}</td>
                      <td className="py-2.5 px-3 font-mono">{algo.worstTime}</td>
                      <td className="py-2.5 px-3 font-mono">{algo.space}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${algo.stable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {algo.stable ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${algo.inPlace ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {algo.inPlace ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 capitalize">
                        {algo.category.replace('_', ' ')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Summary Footer */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs sm:text-sm leading-relaxed flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            For your custom array, <strong>{selectedAlgo.name}</strong> performed exactly <strong>{currentAlgoActual.comparisons} comparisons</strong> and <strong>{currentAlgoActual.swaps} swaps/writes</strong> (Total: <strong>{currentAlgoActual.totalOps} operations</strong>).
          </span>
        </div>
      </section>

      {/* 5. ALGORITHM LOGIC (ORDERED: C++ -> PYTHON -> JAVA) */}
      <section id="logic-section" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-700" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Algorithm Logic & Mechanics
              </h2>
              <p className="text-xs text-slate-500">
                Step-by-step conceptual guide for {selectedAlgo.name}.
              </p>
            </div>
          </div>

          {/* Language Switcher Tabs: C++ -> Python -> Java */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            {LANGUAGE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedLang(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedLang === tab.id
                    ? 'bg-white font-semibold text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Logic Cards Breakdown */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {languageData[selectedLang]?.logic.title} Overview
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
              {languageData[selectedLang]?.logic.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(languageData[selectedLang]?.logic.steps || []).map((step) => (
              <div
                key={step.stepNumber}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {step.stepNumber}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">{step.heading}</h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl text-slate-200 font-mono text-[11px] overflow-x-auto whitespace-pre leading-relaxed mt-2 border border-slate-900">
                  {step.codeSnippet}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SOURCE CODE (ORDERED: C++ -> PYTHON -> JAVA) */}
      <section id="source-code" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-slate-700" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Source Code ({LANGUAGE_TABS.find((t) => t.id === selectedLang)?.label})
              </h2>
              <p className="text-xs text-slate-500">
                Clean, working implementation initialized with your custom numbers ({appliedArray.length} items).
              </p>
            </div>
          </div>

          {/* Language Switcher Tabs & Copy Button */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              {LANGUAGE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedLang(tab.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedLang === tab.id
                      ? 'bg-white font-semibold text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <motion.button
              id="btn-copy-code"
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyCode}
              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Code Display Canvas with IDE Aesthetic */}
        <div className="rounded-2xl bg-slate-950 border border-slate-800/90 shadow-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-slate-400 font-mono text-[11px] ml-2">
                {selectedLang === 'cpp'
                  ? `${selectedAlgoId}.cpp`
                  : selectedLang === 'python'
                  ? `${selectedAlgoId}.py`
                  : `${selectedAlgo.name.replace(/\s+/g, '')}.java`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">
                {languageData[selectedLang]?.code.split('\n').length || 0} lines
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 font-mono">
                {LANGUAGE_TABS.find((t) => t.id === selectedLang)?.label}
              </span>
            </div>
          </div>

          <div className="p-5 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
            <pre className="text-slate-200">
              <code>{languageData[selectedLang]?.code}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};
