import React, { useState, useEffect } from 'react';
import { Activity, Database, Zap, Eye, BarChart3, X } from 'lucide-react';
import { Button } from './ui/button';
import { 
  getPerformanceSnapshot, 
  type MetricsSnapshot,
  generatePerformanceReport,
  type PerformanceReport 
} from '../utils/performance';

interface PerformanceMonitorProps {
  isVisible?: boolean;
  onToggle?: (visible: boolean) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  isVisible = false, 
  onToggle 
}) => {
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [reports, setReports] = useState<PerformanceReport[]>([]);
  const [baselineSnapshot, setBaselineSnapshot] = useState<MetricsSnapshot | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    const updateMetrics = () => {
      const snapshot = getPerformanceSnapshot();
      setMetrics(snapshot);
    };

    // Update metrics every 2 seconds
    const interval = setInterval(updateMetrics, 2000);
    updateMetrics(); // Initial call

    return () => clearInterval(interval);
  }, [isVisible]);

  const captureBaseline = () => {
    const snapshot = getPerformanceSnapshot();
    setBaselineSnapshot(snapshot);
    const report = generatePerformanceReport('Baseline', null, snapshot, [
      'Initial performance baseline captured',
      'This will be used to compare future optimizations'
    ]);
    setReports([report]);
    localStorage.setItem('crm3-baseline', JSON.stringify(snapshot));
  };

  const capturePhaseReport = (phaseName: string, notes: string[]) => {
    if (!baselineSnapshot) return;
    
    const currentSnapshot = getPerformanceSnapshot();
    const report = generatePerformanceReport(phaseName, baselineSnapshot, currentSnapshot, notes);
    setReports(prev => [...prev, report]);
    
    // Save to localStorage for persistence
    const allReports = [...reports, report];
    localStorage.setItem('crm3-performance-reports', JSON.stringify(allReports));
  };

  const formatBytes = (bytes: number) => {
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const formatMs = (ms: number) => {
    return ms.toFixed(1) + ' ms';
  };

  const formatFPS = (fps: number) => {
    const color = fps >= 55 ? 'text-green-600' : fps >= 30 ? 'text-yellow-600' : 'text-red-600';
    return <span className={color}>{fps} FPS</span>;
  };

  const getPerformanceGrade = (metrics: MetricsSnapshot): { grade: string; color: string } => {
    const memoryScore = metrics.memoryUsage.used < 50 * 1048576 ? 3 : metrics.memoryUsage.used < 100 * 1048576 ? 2 : 1;
    const fpsScore = metrics.renderMetrics.fps >= 55 ? 3 : metrics.renderMetrics.fps >= 30 ? 2 : 1;
    const apiScore = metrics.apiMetrics.averageLatency < 200 ? 3 : metrics.apiMetrics.averageLatency < 500 ? 2 : 1;
    
    const totalScore = memoryScore + fpsScore + apiScore;
    
    if (totalScore >= 8) return { grade: 'A', color: 'text-green-600' };
    if (totalScore >= 6) return { grade: 'B', color: 'text-yellow-600' };
    if (totalScore >= 4) return { grade: 'C', color: 'text-orange-600' };
    return { grade: 'D', color: 'text-red-600' };
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => onToggle?.(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Show Performance Monitor"
      >
        <Activity className="w-5 h-5" />
      </button>
    );
  }

  if (!metrics) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Loading metrics...</span>
          <Button variant="ghost" size="sm" onClick={() => onToggle?.(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
      </div>
    );
  }

  const { grade, color } = getPerformanceGrade(metrics);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm">
      {/* Compact header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">Performance</span>
          <span className={`text-lg font-bold ${color}`}>{grade}</span>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand details"}
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onToggle?.(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Compact metrics */}
      <div className="p-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3 text-purple-600" />
            <span>{formatBytes(metrics.memoryUsage.used)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-green-600" />
            {formatFPS(metrics.renderMetrics.fps)}
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-blue-600" />
            <span>{formatMs(metrics.apiMetrics.averageLatency)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-gray-600" />
            <span>{metrics.domMetrics.nodeCount} nodes</span>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-3 space-y-3 max-h-96 overflow-y-auto">
          {/* Detailed metrics */}
          <div>
            <h4 className="font-medium text-sm mb-2">Detailed Metrics</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div>Memory: {formatBytes(metrics.memoryUsage.used)} / {formatBytes(metrics.memoryUsage.total)}</div>
              <div>API Calls: {metrics.apiMetrics.totalCalls} ({metrics.apiMetrics.failedCalls} failed)</div>
              <div>Renders: {metrics.renderMetrics.rerenders} total</div>
              <div>Load Time: {formatMs(metrics.loadTime)}</div>
              {metrics.lcp > 0 && <div>LCP: {formatMs(metrics.lcp)}</div>}
              {metrics.fid > 0 && <div>FID: {formatMs(metrics.fid)}</div>}
            </div>
          </div>

          {/* Benchmark controls */}
          <div className="border-t border-gray-100 pt-3">
            <h4 className="font-medium text-sm mb-2">Benchmarking</h4>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={captureBaseline}
                className="text-xs"
              >
                📊 Capture Baseline
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => capturePhaseReport('Phase 1', ['Infinite scroll implemented'])}
                className="text-xs"
                disabled={!baselineSnapshot}
              >
                📈 Phase 1
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => capturePhaseReport('Phase 2', ['Virtualization implemented'])}
                className="text-xs"
                disabled={!baselineSnapshot}
              >
                🚀 Phase 2
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => capturePhaseReport('Phase 3', ['Caching and optimizations'])}
                className="text-xs"
                disabled={!baselineSnapshot}
              >
                ⚡ Phase 3
              </Button>
            </div>
          </div>

          {/* Recent reports */}
          {reports.length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <h4 className="font-medium text-sm mb-2">Performance Reports</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {reports.slice(-3).reverse().map((report, idx) => (
                  <div key={idx} className="bg-gray-50 rounded p-2 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{report.phase}</span>
                      <span className="text-gray-500">
                        {report.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-gray-600 mb-1">{report.userImpact}</div>
                    {report.metrics.before && (
                      <div className="flex gap-2 text-xs">
                        <span className="text-green-600">Mem: {report.metrics.improvement.memory}</span>
                        <span className="text-blue-600">Load: {report.metrics.improvement.loadTime}</span>
                        <span className="text-purple-600">API: {report.metrics.improvement.apiCalls}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Hook to easily add performance monitoring to any page
export const usePerformanceMonitor = () => {
  const [isVisible, setIsVisible] = useState(() => {
    return process.env.NODE_ENV === 'development' && 
           localStorage.getItem('crm3-perf-monitor') === 'true';
  });

  const toggle = (visible: boolean) => {
    setIsVisible(visible);
    localStorage.setItem('crm3-perf-monitor', visible.toString());
  };

  return { isVisible, toggle };
};