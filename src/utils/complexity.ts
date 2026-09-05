import { ALGORITHMS } from '../algorithms';
import { SizeBenchmarkData } from '../types';

export interface TheoreticalCurvePoint {
  size: number;
  [key: string]: number;
}

/**
 * Computes theoretical complexity reference curves scaled to match empirical range
 */
export function computeTheoreticalCurves(
  sizes: number[],
  baselineAlgoId: string,
  benchmarkData: SizeBenchmarkData[]
): TheoreticalCurvePoint[] {
  if (sizes.length === 0) return [];

  // Find a reference point in the middle
  const midIndex = Math.floor(sizes.length / 2);
  const refSize = sizes[midIndex];
  
  let refTime = 1.0;
  if (benchmarkData[midIndex] && benchmarkData[midIndex][baselineAlgoId]) {
    const stats = benchmarkData[midIndex][baselineAlgoId] as any;
    if (stats && stats.meanTimeMs > 0) {
      refTime = stats.meanTimeMs;
    }
  }

  // Normalization constants
  const cLinear = refTime / refSize;
  const cNLogN = refTime / (refSize * Math.log2(refSize || 2));
  const cN2 = refTime / (refSize * refSize);
  const cN1_5 = refTime / Math.pow(refSize, 1.5);

  return sizes.map((n) => {
    const nLogN = n * Math.log2(Math.max(2, n));
    const n2 = n * n;
    const n1_5 = Math.pow(n, 1.5);

    return {
      size: n,
      'Theoretical O(n)': Number((cLinear * n).toFixed(4)),
      'Theoretical O(n log n)': Number((cNLogN * nLogN).toFixed(4)),
      'Theoretical O(n^2)': Number((cN2 * n2).toFixed(4)),
      'Theoretical O(n^1.5)': Number((cN1_5 * n1_5).toFixed(4)),
    };
  });
}

/**
 * Exports benchmark results to CSV format
 */
export function exportToCSV(data: SizeBenchmarkData[], algorithmIds: string[]): string {
  const headers = ['Array Size (N)'];
  
  algorithmIds.forEach((id) => {
    const name = ALGORITHMS[id]?.info.name || id;
    headers.push(
      `"${name} (Mean ms)"`,
      `"${name} (Median ms)"`,
      `"${name} (Min ms)"`,
      `"${name} (Max ms)"`,
      `"${name} (StdDev ms)"`,
      `"${name} (Comparisons)"`,
      `"${name} (Swaps)"`
    );
  });

  const rows: string[] = [headers.join(',')];

  data.forEach((row) => {
    const cells: (string | number)[] = [row.size];
    algorithmIds.forEach((id) => {
      const stats = row[id] as any;
      if (stats && stats.meanTimeMs >= 0) {
        cells.push(
          stats.meanTimeMs,
          stats.medianTimeMs,
          stats.minTimeMs,
          stats.maxTimeMs,
          stats.stdDevMs,
          stats.comparisons >= 0 ? stats.comparisons : 'N/A',
          stats.swaps >= 0 ? stats.swaps : 'N/A'
        );
      } else {
        cells.push('N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A');
      }
    });
    rows.push(cells.join(','));
  });

  return rows.join('\n');
}

/**
 * Downloads a string as a file in browser
 */
export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
