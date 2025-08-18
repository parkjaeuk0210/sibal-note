// Firebase 사용량 추적 유틸리티
interface FirebaseMetrics {
  reads: number;
  writes: number;
  deletes: number;
  listenerAttachments: number;
  storageUploads: number;
  storageDownloads: number;
}

class FirebaseMetricsTracker {
  private metrics: FirebaseMetrics = {
    reads: 0,
    writes: 0,
    deletes: 0,
    listenerAttachments: 0,
    storageUploads: 0,
    storageDownloads: 0
  };

  private startTime = Date.now();

  incrementRead() {
    this.metrics.reads++;
  }

  incrementWrite() {
    this.metrics.writes++;
  }

  incrementDelete() {
    this.metrics.deletes++;
  }

  incrementListener() {
    this.metrics.listenerAttachments++;
  }

  incrementStorageUpload() {
    this.metrics.storageUploads++;
  }

  incrementStorageDownload() {
    this.metrics.storageDownloads++;
  }

  getMetrics() {
    const runtime = Math.floor((Date.now() - this.startTime) / 1000);
    return {
      ...this.metrics,
      runtime,
      estimatedCost: this.calculateEstimatedCost()
    };
  }

  private calculateEstimatedCost() {
    // Firebase 무료 할당량
    const FREE_READS = 50000;
    const FREE_WRITES = 20000;
    const FREE_DELETES = 20000;
    
    // 무료 할당량 초과분 계산
    const chargeableReads = Math.max(0, this.metrics.reads - FREE_READS);
    const chargeableWrites = Math.max(0, this.metrics.writes - FREE_WRITES);
    const chargeableDeletes = Math.max(0, this.metrics.deletes - FREE_DELETES);
    
    // 예상 비용 (달러)
    const COST_PER_100K_READS = 0.06;
    const COST_PER_100K_WRITES = 0.18;
    const COST_PER_100K_DELETES = 0.02;
    
    const cost = 
      (chargeableReads / 100000) * COST_PER_100K_READS +
      (chargeableWrites / 100000) * COST_PER_100K_WRITES +
      (chargeableDeletes / 100000) * COST_PER_100K_DELETES;
    
    return {
      usd: cost.toFixed(4),
      freeQuotaUsage: {
        reads: `${((this.metrics.reads / FREE_READS) * 100).toFixed(1)}%`,
        writes: `${((this.metrics.writes / FREE_WRITES) * 100).toFixed(1)}%`,
        deletes: `${((this.metrics.deletes / FREE_DELETES) * 100).toFixed(1)}%`
      }
    };
  }

  reset() {
    this.metrics = {
      reads: 0,
      writes: 0,
      deletes: 0,
      listenerAttachments: 0,
      storageUploads: 0,
      storageDownloads: 0
    };
    this.startTime = Date.now();
  }

  // 콘솔에 현재 메트릭 출력
  logMetrics() {
    console.log('🔥 Firebase Usage Metrics:', this.getMetrics());
  }
}

export const firebaseMetrics = new FirebaseMetricsTracker();

// 개발 모드에서 주기적으로 메트릭 출력
if (import.meta.env.DEV) {
  setInterval(() => {
    firebaseMetrics.logMetrics();
  }, 60000); // 1분마다
}