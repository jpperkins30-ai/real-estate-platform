/**
 * Utility functions for formatting values
 */

/**
 * Formats a number as currency
 * @param value Number to format as currency
 * @param options Intl.NumberFormat options
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number,
  options: Intl.NumberFormatOptions = {}
): string => {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    ...options,
  };

  return new Intl.NumberFormat('en-US', defaultOptions).format(value);
};

/**
 * Formats a number with thousands separators
 * @param value Number to format
 * @param options Intl.NumberFormat options
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number,
  options: Intl.NumberFormatOptions = {}
): string => {
  const defaultOptions: Intl.NumberFormatOptions = {
    maximumFractionDigits: 2,
    ...options,
  };

  return new Intl.NumberFormat('en-US', defaultOptions).format(value);
};

/**
 * Formats a number as a percentage
 * @param value Number to format as percentage (0.1 = 10%)
 * @param options Intl.NumberFormat options
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number,
  options: Intl.NumberFormatOptions = {}
): string => {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    ...options,
  };

  return new Intl.NumberFormat('en-US', defaultOptions).format(value);
};

/**
 * Formats a date
 * @param date Date to format
 * @param options Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
};

/**
 * Formats a date as a relative time (e.g., "2 days ago")
 * @param date Date to format
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date | string | number): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  
  // Convert to seconds
  const diffSeconds = Math.floor(diffMs / 1000);
  
  if (diffSeconds < 60) {
    return 'just now';
  }
  
  // Convert to minutes
  const diffMinutes = Math.floor(diffSeconds / 60);
  
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Convert to hours
  const diffHours = Math.floor(diffMinutes / 60);
  
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Convert to days
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
  
  // Convert to weeks
  const diffWeeks = Math.floor(diffDays / 7);
  
  if (diffWeeks < 4) {
    return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  }
  
  // Convert to months
  const diffMonths = Math.floor(diffDays / 30);
  
  if (diffMonths < 12) {
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  }
  
  // Convert to years
  const diffYears = Math.floor(diffDays / 365);
  
  return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
};

/**
 * Formats a file size in bytes to a human-readable format
 * @param bytes Size in bytes
 * @param decimals Number of decimal places
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Formats an address
 * @param address Address components
 * @returns Formatted address string
 */
export const formatAddress = (address: {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}): string => {
  const { street, city, state, zipCode, country } = address;
  
  let formattedAddress = '';
  
  if (street) {
    formattedAddress += street;
  }
  
  if (city) {
    formattedAddress += formattedAddress ? `, ${city}` : city;
  }
  
  if (state) {
    formattedAddress += formattedAddress ? `, ${state}` : state;
  }
  
  if (zipCode) {
    formattedAddress += formattedAddress ? ` ${zipCode}` : zipCode;
  }
  
  if (country && country !== 'USA' && country !== 'United States') {
    formattedAddress += formattedAddress ? `, ${country}` : country;
  }
  
  return formattedAddress;
};

/**
 * Truncates text with ellipsis if it exceeds maxLength
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text string
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
}; 