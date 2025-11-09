'use client';

export interface TimerProps {
  /** Remaining time in seconds */
  remainingSeconds: number;
  /** Total duration in seconds */
  totalSeconds: number;
  /** Whether timer is active/running */
  isActive?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show progress bar */
  showProgress?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Timer component
 *
 * Displays countdown timer with optional progress indicator
 */
export function Timer({
  remainingSeconds,
  totalSeconds,
  isActive = true,
  size = 'md',
  showProgress = true,
  className = '',
}: TimerProps) {
  // Calculate progress percentage
  const progressPercentage =
    totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0;

  // Determine color based on remaining time
  const getTimerColor = (): string => {
    if (remainingSeconds <= 10) return 'text-red-600';
    if (remainingSeconds <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (): string => {
    if (remainingSeconds <= 10) return 'bg-red-500';
    if (remainingSeconds <= 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`flex flex-col items-center ${className}`}
      role="timer"
      aria-label={`${remainingSeconds} seconds remaining`}
      aria-live="polite"
    >
      {/* Timer Display */}
      <div
        className={`
          font-mono font-bold ${sizeClasses[size]} ${getTimerColor()}
          ${isActive ? 'animate-pulse' : ''}
        `}
      >
        {formatTime(remainingSeconds)}
      </div>

      {/* Status Text */}
      <div className="text-sm text-gray-500 mt-1">
        {isActive ? 'Time Remaining' : 'Paused'}
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="w-full max-w-md mt-4">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${getProgressColor()}`}
              style={{ width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={remainingSeconds}
              aria-valuemin={0}
              aria-valuemax={totalSeconds}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0:00</span>
            <span>{formatTime(totalSeconds)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
