// A very simple in-memory log for the brain's activity
export interface BrainLog {
  timestamp: string;
  type: 'ai' | 'obsidian' | 'voice';
  message: string;
}

if (typeof global !== 'undefined') {
  if (!(global as any).brainLogs) {
    (global as any).brainLogs = [];
  }
}

export function logBrainActivity(type: BrainLog['type'], message: string) {
  const logs = (global as any).brainLogs;
  const log: BrainLog = {
    timestamp: new Date().toISOString(),
    type,
    message
  };
  logs.unshift(log);
  // Keep only last 50 logs
  if (logs.length > 50) {
    (global as any).brainLogs = logs.slice(0, 50);
  }
}

export function getBrainLogs() {
  return (global as any).brainLogs || [];
}
