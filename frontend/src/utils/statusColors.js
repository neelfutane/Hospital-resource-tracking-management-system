import { RESOURCE_STATUS, STATUS_COLORS, PRIORITY_COLORS } from './constants';

export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || STATUS_COLORS[RESOURCE_STATUS.AVAILABLE];
};

export const getStatusTextColor = (status) => {
  const colorMap = {
    [RESOURCE_STATUS.AVAILABLE]: 'text-green-600',
    [RESOURCE_STATUS.OCCUPIED]: 'text-red-600',
    [RESOURCE_STATUS.MAINTENANCE]: 'text-yellow-600',
    [RESOURCE_STATUS.RESERVED]: 'text-purple-600',
    [RESOURCE_STATUS.CLEANING]: 'text-cyan-600',
  };
  return colorMap[status] || 'text-gray-600';
};

export const getStatusBgColor = (status) => {
  const colorMap = {
    [RESOURCE_STATUS.AVAILABLE]: 'bg-green-100',
    [RESOURCE_STATUS.OCCUPIED]: 'bg-red-100',
    [RESOURCE_STATUS.MAINTENANCE]: 'bg-yellow-100',
    [RESOURCE_STATUS.RESERVED]: 'bg-purple-100',
    [RESOURCE_STATUS.CLEANING]: 'bg-cyan-100',
  };
  return colorMap[status] || 'bg-gray-100';
};

export const getPriorityColor = (priority) => {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.LOW;
};

export const getPriorityTextColor = (priority) => {
  const colorMap = {
    LOW: 'text-gray-600',
    MEDIUM: 'text-blue-600',
    HIGH: 'text-orange-600',
    CRITICAL: 'text-red-600',
  };
  return colorMap[priority] || 'text-gray-600';
};

export const getPriorityBgColor = (priority) => {
  const colorMap = {
    LOW: 'bg-gray-100',
    MEDIUM: 'bg-blue-100',
    HIGH: 'bg-orange-100',
    CRITICAL: 'bg-red-100',
  };
  return colorMap[priority] || 'bg-gray-100';
};

export const getDepartmentColor = (department) => {
  const colorMap = {
    ICU: 'bg-red-500',
    ER: 'bg-orange-500',
    GENERAL: 'bg-blue-500',
    PEDIATRICS: 'bg-pink-500',
    CARDIOLOGY: 'bg-red-600',
    NEUROLOGY: 'bg-purple-500',
    ORTHOPEDICS: 'bg-green-500',
    MATERNITY: 'bg-pink-600',
    SURGERY: 'bg-indigo-500',
    LABORATORY: 'bg-yellow-500',
    RADIOLOGY: 'bg-cyan-500',
  };
  return colorMap[department] || 'bg-gray-500';
};

export const getRoleColor = (role) => {
  const colorMap = {
    ADMIN: 'bg-purple-500',
    DOCTOR: 'bg-blue-500',
    NURSE: 'bg-green-500',
    VIEWER: 'bg-gray-500',
  };
  return colorMap[role] || 'bg-gray-500';
};
