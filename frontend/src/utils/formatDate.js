import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return format(dateObj, formatString);
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const formatTime = (date) => {
  return formatDate(date, 'HH:mm');
};

export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    
    if (isToday(dateObj)) {
      return `Today at ${format(dateObj, 'HH:mm')}`;
    }
    
    if (isYesterday(dateObj)) {
      return `Yesterday at ${format(dateObj, 'HH:mm')}`;
    }
    
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatShortDate = (date) => {
  return formatDate(date, 'MM/dd/yyyy');
};

export const formatFullDate = (date) => {
  return formatDate(date, 'EEEE, MMMM dd, yyyy');
};

export const isDateToday = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return isToday(dateObj);
  } catch (error) {
    return false;
  }
};

export const isDateYesterday = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return isYesterday(dateObj);
  } catch (error) {
    return false;
  }
};

export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '0 min';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} min`;
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
