// Performance monitoring utilities for CRM3
// Measures load times, render performance, memory usage, and API latency

export interface MetricsSnapshot {
  timestamp: Date;
  loadTime: number;
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  memoryUsage: {
    used: number;
    total: number;
    limit: number;
  };
  apiMetrics: {
    totalCalls: number;
    averageLatency: number;
    slowestCall: number;
    failedCalls: number;
  };
  renderMetrics: {
    componentMounts: number;
    rerenders: number;
    fps: number;
  };
  domMetrics: {
    nodeCount: number;
    listenerCount: number;
  };
}

export interface PerformanceReport {
  phase: string;
  timestamp: Date;
  metrics: {
    before: MetricsSnapshot | null;
    after: MetricsSnapshot;
    improvement: {
      loadTime: string;
      memory: string;
      apiCalls: string;
      fps: string;
      domNodes: string;
    };
  };
  userImpact: string;
  notes: string[];
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private observers: PerformanceObserver[] = [];
  private metrics: Partial<MetricsSnapshot> = {};
  private apiCalls: Array<{ url: string; duration: number; success: boolean; timestamp: Date }> = [];
  private renderCounts: { [component: string]: number } = {};
  private frameId: number | null = null;
  private fps = 0;
  private lastFrameTime = 0;
  private frameCount = 0;

  private constructor() {
    this.initObservers();
    this.startFPSMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initObservers(): void {
    // Web Vitals observer
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'largest-contentful-paint':
              this.metrics.lcp = entry.startTime;
              break;
            case 'first-input':
              this.metrics.fid = (entry as any).processingStart - entry.startTime;
              break;
            case 'layout-shift':
              if (!this.metrics.cls) this.metrics.cls = 0;
              this.metrics.cls += (entry as any).value;
              break;
          }
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    // Navigation timing
    if (performance.timing) {
      window.addEventListener('load', () => {
        const timing = performance.timing;
        this.metrics.loadTime = timing.loadEventEnd - timing.navigationStart;
        this.metrics.ttfb = timing.responseStart - timing.navigationStart;
      });
    }
  }

  private startFPSMonitoring(): void {
    const measureFPS = (currentTime: number) => {
      if (this.lastFrameTime) {
        this.frameCount++;
        const elapsed = currentTime - this.lastFrameTime;
        
        // Update FPS every second
        if (elapsed >= 1000) {
          this.fps = Math.round((this.frameCount * 1000) / elapsed);
          this.frameCount = 0;
          this.lastFrameTime = currentTime;
        }
      } else {
        this.lastFrameTime = currentTime;
      }
      
      this.frameId = requestAnimationFrame(measureFPS);
    };
    
    this.frameId = requestAnimationFrame(measureFPS);
  }

  // Track API calls
  trackApiCall(url: string, duration: number, success: boolean): void {
    this.apiCalls.push({
      url,
      duration,
      success,
      timestamp: new Date()
    });

    // Keep only last 100 calls to prevent memory leak
    if (this.apiCalls.length > 100) {
      this.apiCalls = this.apiCalls.slice(-100);
    }
  }

  // Track component renders
  trackRender(componentName: string): void {
    this.renderCounts[componentName] = (this.renderCounts[componentName] || 0) + 1;
  }

  // Get memory usage
  private getMemoryUsage(): MetricsSnapshot['memoryUsage'] {
    const memory = (performance as any).memory;
    if (memory) {
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return { used: 0, total: 0, limit: 0 };
  }

  // Get DOM metrics
  private getDOMMetrics(): MetricsSnapshot['domMetrics'] {
    return {
      nodeCount: document.querySelectorAll('*').length,
      listenerCount: this.getEventListenerCount()
    };
  }

  private getEventListenerCount(): number {
    // Approximate event listener count
    // This is a rough estimation as there's no direct API
    return document.querySelectorAll('[onclick], [onchange], [onsubmit], button, input, select, textarea').length;
  }

  // Get current snapshot
  getSnapshot(): MetricsSnapshot {
    const recentApiCalls = this.apiCalls.filter(call => 
      Date.now() - call.timestamp.getTime() < 60000 // Last minute
    );

    const apiMetrics = {
      totalCalls: recentApiCalls.length,
      averageLatency: recentApiCalls.length > 0 
        ? recentApiCalls.reduce((sum, call) => sum + call.duration, 0) / recentApiCalls.length 
        : 0,
      slowestCall: recentApiCalls.length > 0 
        ? Math.max(...recentApiCalls.map(call => call.duration)) 
        : 0,
      failedCalls: recentApiCalls.filter(call => !call.success).length
    };

    const totalRenders = Object.values(this.renderCounts).reduce((sum, count) => sum + count, 0);

    return {
      timestamp: new Date(),
      loadTime: this.metrics.loadTime || 0,
      ttfb: this.metrics.ttfb || 0,
      fcp: this.metrics.fcp || 0,
      lcp: this.metrics.lcp || 0,
      fid: this.metrics.fid || 0,
      cls: this.metrics.cls || 0,
      memoryUsage: this.getMemoryUsage(),
      apiMetrics,
      renderMetrics: {
        componentMounts: Object.keys(this.renderCounts).length,
        rerenders: totalRenders,
        fps: this.fps
      },
      domMetrics: this.getDOMMetrics()
    };
  }

  // Compare snapshots and generate report
  generateReport(
    phase: string,
    beforeSnapshot: MetricsSnapshot | null,
    afterSnapshot: MetricsSnapshot,
    notes: string[] = []
  ): PerformanceReport {
    const calculateImprovement = (before: number, after: number): string => {
      if (before === 0) return after === 0 ? '0%' : '+∞%';
      const improvement = ((before - after) / before) * 100;
      return improvement > 0 ? `-${improvement.toFixed(1)}%` : `+${Math.abs(improvement).toFixed(1)}%`;
    };

    const improvement = beforeSnapshot ? {
      loadTime: calculateImprovement(beforeSnapshot.loadTime, afterSnapshot.loadTime),
      memory: calculateImprovement(beforeSnapshot.memoryUsage.used, afterSnapshot.memoryUsage.used),
      apiCalls: calculateImprovement(beforeSnapshot.apiMetrics.totalCalls, afterSnapshot.apiMetrics.totalCalls),
      fps: calculateImprovement(beforeSnapshot.renderMetrics.fps, afterSnapshot.renderMetrics.fps).replace('-', '+'),
      domNodes: calculateImprovement(beforeSnapshot.domMetrics.nodeCount, afterSnapshot.domMetrics.nodeCount)
    } : {
      loadTime: 'N/A',
      memory: 'N/A', 
      apiCalls: 'N/A',
      fps: 'N/A',
      domNodes: 'N/A'
    };

    // Generate user impact summary
    let userImpact = 'Baseline measurement';
    if (beforeSnapshot) {
      const memoryReduction = parseFloat(improvement.memory.replace('%', ''));
      const loadTimeReduction = parseFloat(improvement.loadTime.replace('%', ''));
      const fpsIncrease = parseFloat(improvement.fps.replace('%', ''));

      if (memoryReduction > 20) userImpact = 'Significant memory optimization';
      else if (loadTimeReduction > 30) userImpact = 'Major loading speed improvement';
      else if (fpsIncrease > 10) userImpact = 'Smoother scrolling and interactions';
      else if (memoryReduction > 5 || loadTimeReduction > 10) userImpact = 'Moderate performance improvement';
      else userImpact = 'Minor optimizations applied';
    }

    return {
      phase,
      timestamp: new Date(),
      metrics: {
        before: beforeSnapshot,
        after: afterSnapshot,
        improvement
      },
      userImpact,
      notes
    };
  }

  // Reset counters for new phase
  resetCounters(): void {
    this.apiCalls = [];
    this.renderCounts = {};
    this.metrics = {};
  }

  // Cleanup
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
  }
}

// Convenient functions for use in components
export const perfMonitor = PerformanceMonitor.getInstance();

export const usePerformanceTracking = (componentName: string) => {
  perfMonitor.trackRender(componentName);
};

export const trackApiCall = (url: string, duration: number, success: boolean) => {
  perfMonitor.trackApiCall(url, duration, success);
};

export const getPerformanceSnapshot = () => {
  return perfMonitor.getSnapshot();
};

export const generatePerformanceReport = (
  phase: string,
  beforeSnapshot: MetricsSnapshot | null,
  afterSnapshot: MetricsSnapshot,
  notes?: string[]
) => {
  return perfMonitor.generateReport(phase, beforeSnapshot, afterSnapshot, notes);
};

// Development-only performance debugging
export const logPerformanceData = () => {
  if (process.env.NODE_ENV === 'development') {
    const snapshot = getPerformanceSnapshot();
    console.group('🚀 Performance Snapshot');
    console.log('📊 Memory:', `${(snapshot.memoryUsage.used / 1048576).toFixed(2)}MB used`);
    console.log('⚡ Load Time:', `${snapshot.loadTime}ms`);
    console.log('📡 API Calls:', `${snapshot.apiMetrics.totalCalls} calls, avg ${snapshot.apiMetrics.averageLatency.toFixed(1)}ms`);
    console.log('🎯 FPS:', snapshot.renderMetrics.fps);
    console.log('🌳 DOM Nodes:', snapshot.domMetrics.nodeCount);
    console.groupEnd();
  }
};