export function calculateNewTime(current: number, increment: number): number {
  return current + increment;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function mapEventTypeToLogType(eventType: string): 'info' | 'success' | 'warning' | 'error' {
  switch (eventType) {
    case 'join':
    case 'request':
    case 'sync':
      return 'success';
    case 'leave':
    case 'stop':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'info';
  }
}
