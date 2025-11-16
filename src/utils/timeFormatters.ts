/**
 * Time and date formatting utilities
 */

/**
 * Format milliseconds to HH:MM:SS or MM:SS
 * @param milliseconds - Duration in milliseconds
 * @returns Formatted time string
 */
export const formatDuration = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};

/**
 * Format seconds to MM:SS or HH:MM:SS
 * @param seconds - Duration in seconds
 * @returns Formatted time string
 */
export const formatTime = (seconds: number): string => {
  return formatDuration(seconds * 1000);
};

/**
 * Format date to human-readable string
 * @param timestamp - Timestamp in milliseconds
 * @param format - Optional format type ('short', 'long', 'relative')
 * @returns Formatted date string
 */
export const formatDate = (
  timestamp: number,
  format: 'short' | 'long' | 'relative' = 'short'
): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (format === 'relative') {
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
  }

  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // 'short' format - default
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format total duration from episodes array to human-readable string
 * @param totalMilliseconds - Total duration in milliseconds
 * @returns Formatted duration string (e.g., "2 hours 30 minutes")
 */
export const formatTotalDuration = (totalMilliseconds: number): string => {
  const totalMinutes = Math.floor(totalMilliseconds / 60000);

  if (totalMinutes < 1) {
    const seconds = Math.floor(totalMilliseconds / 1000);
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }

  if (totalMinutes < 60) {
    return `${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (mins === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${
    mins !== 1 ? 's' : ''
  }`;
};
