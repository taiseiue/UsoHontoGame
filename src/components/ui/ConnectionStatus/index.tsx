import type { ConnectionStatus as Status } from '@/hooks/useSSEConnection';

export interface ConnectionStatusProps {
  /** Current connection status */
  status: Status;
  /** Whether to show status text (default: true) */
  showText?: boolean;
  /** Custom class name */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Connection status indicator component
 *
 * Displays current real-time connection status with appropriate styling
 */
export function ConnectionStatus({
  status,
  showText = true,
  className = '',
  size = 'md',
}: ConnectionStatusProps) {
  const sizeClasses = {
    sm: 'w-2 h-2 text-xs',
    md: 'w-3 h-3 text-sm',
    lg: 'w-4 h-4 text-base',
  };

  const statusConfig = {
    connected: {
      color: 'bg-green-500',
      text: 'Connected',
      pulse: true,
    },
    connecting: {
      color: 'bg-yellow-500',
      text: 'Connecting...',
      pulse: true,
    },
    disconnected: {
      color: 'bg-gray-400',
      text: 'Disconnected',
      pulse: false,
    },
    error: {
      color: 'bg-red-500',
      text: 'Connection Error',
      pulse: false,
    },
  };

  const config = statusConfig[status];
  const dotSizeClass = sizeClasses[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Pulse animation for active states */}
        {config.pulse && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${config.color} opacity-75`}
          />
        )}
        {/* Status indicator dot */}
        <span
          className={`relative inline-flex rounded-full ${config.color} ${dotSizeClass.split(' ').slice(0, 2).join(' ')}`}
        />
      </div>

      {/* Status text */}
      {showText && (
        <span
          className={`font-medium ${status === 'error' ? 'text-red-600' : status === 'disconnected' ? 'text-gray-500' : 'text-gray-700'} ${dotSizeClass.split(' ').slice(2).join(' ')}`}
        >
          {config.text}
        </span>
      )}
    </div>
  );
}
