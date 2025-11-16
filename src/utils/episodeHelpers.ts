/**
 * Episode-related helper functions
 */

import { Episode } from '../store/projectsSlice';

/**
 * Get color for episode status
 * @param status - Episode status
 * @returns Color code
 */
export const getEpisodeStatusColor = (
  status: Episode['status']
): string => {
  switch (status) {
    case 'draft':
      return '#FFA500'; // Orange
    case 'processed':
      return '#4CAF50'; // Green
    case 'exported':
      return '#2196F3'; // Blue
    default:
      return '#9E9E9E'; // Gray
  }
};

/**
 * Get label for episode status
 * @param status - Episode status
 * @returns Human-readable status label
 */
export const getEpisodeStatusLabel = (
  status: Episode['status']
): string => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'processed':
      return 'Processed';
    case 'exported':
      return 'Exported';
    default:
      return 'Unknown';
  }
};

/**
 * Calculate total duration from an array of episodes
 * @param episodes - Array of episodes
 * @returns Total duration in milliseconds
 */
export const calculateTotalDuration = (episodes: Episode[]): number => {
  return episodes.reduce((acc, episode) => acc + episode.duration, 0);
};

/**
 * Sort episodes by recorded date (newest first)
 * @param episodes - Array of episodes
 * @returns Sorted array of episodes
 */
export const sortEpisodesByDate = (episodes: Episode[]): Episode[] => {
  return [...episodes].sort((a, b) => b.recordedAt - a.recordedAt);
};

/**
 * Filter episodes by status
 * @param episodes - Array of episodes
 * @param status - Status to filter by
 * @returns Filtered array of episodes
 */
export const filterEpisodesByStatus = (
  episodes: Episode[],
  status: Episode['status']
): Episode[] => {
  return episodes.filter((episode) => episode.status === status);
};

/**
 * Get episode statistics
 * @param episodes - Array of episodes
 * @returns Statistics object
 */
export const getEpisodeStats = (
  episodes: Episode[]
): {
  total: number;
  draft: number;
  processed: number;
  exported: number;
  totalDuration: number;
} => {
  return {
    total: episodes.length,
    draft: filterEpisodesByStatus(episodes, 'draft').length,
    processed: filterEpisodesByStatus(episodes, 'processed').length,
    exported: filterEpisodesByStatus(episodes, 'exported').length,
    totalDuration: calculateTotalDuration(episodes),
  };
};
