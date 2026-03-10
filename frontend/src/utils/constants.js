export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const DEPARTMENTS = [
  'ICU',
  'ER', 
  'GENERAL',
  'PEDIATRICS',
  'CARDIOLOGY',
  'NEUROLOGY',
  'ORTHOPEDICS',
  'MATERNITY',
  'SURGERY',
  'LABORATORY',
  'RADIOLOGY'
];

export const RESOURCE_STATUS = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  MAINTENANCE: 'MAINTENANCE',
  RESERVED: 'RESERVED',
  CLEANING: 'CLEANING'
};

export const STATUS_COLORS = {
  [RESOURCE_STATUS.AVAILABLE]: 'bg-green-100 text-green-800 border-green-200',
  [RESOURCE_STATUS.OCCUPIED]: 'bg-red-100 text-red-800 border-red-200',
  [RESOURCE_STATUS.MAINTENANCE]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [RESOURCE_STATUS.RESERVED]: 'bg-purple-100 text-purple-800 border-purple-200',
  [RESOURCE_STATUS.CLEANING]: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

export const PRIORITY_COLORS = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  LOW: 'bg-green-100 text-green-800 border-green-200',
};

export const BED_STATUSES = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'CLEANING'];
export const ROOM_STATUSES = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'CLEANING'];
export const EQUIPMENT_STATUSES = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'CLEANING'];

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  VIEWER: 'VIEWER'
};

export const ALERT_TYPES = {
  THRESHOLD: 'THRESHOLD',
  MAINTENANCE: 'MAINTENANCE',
  EMERGENCY: 'EMERGENCY',
  SYSTEM: 'SYSTEM'
};

export const ALERT_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

export const ROOM_TYPES = [
  'ICU',
  'Operating Room',
  'General Ward',
  'Isolation Room',
  'Recovery Room',
  'Consultation Room',
  'Emergency Bay',
  'Delivery Room',
  'Pediatric Ward',
  'Maternity Ward'
];

export const EQUIPMENT_TYPES = [
  'Ventilator',
  'Defibrillator',
  'Patient Monitor',
  'Infusion Pump',
  'Suction Machine',
  'Oxygen Cylinder',
  'X-Ray Machine',
  'Ultrasound Machine',
  'ECG Machine',
  'Blood Pressure Monitor',
  'Pulse Oximeter',
  'Surgical Lights',
  'Anesthesia Machine',
  'Dialysis Machine',
  'Incubator'
];

export const MAINTENANCE_SCHEDULES = {
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY'
};

export const SOCKET_EVENTS = {
  // Resource events
  RESOURCE_UPDATE: 'resource-update',
  RESOURCE_CREATE: 'resource-create',
  RESOURCE_DELETE: 'resource-delete',
  STATUS_CHANGE: 'status-change',
  STATS_UPDATE: 'stats-update',
  
  // Department-specific events
  DEPARTMENT_RESOURCE_UPDATE: 'department-resource-update',
  DEPARTMENT_RESOURCE_CREATE: 'department-resource-create',
  DEPARTMENT_RESOURCE_DELETE: 'department-resource-delete',
  DEPARTMENT_STATUS_CHANGE: 'department-status-change',
  DEPARTMENT_STATS_UPDATE: 'department-stats-update',
  
  // Alert events
  NEW_ALERT: 'new-alert',
  ALERT_ACKNOWLEDGED: 'alert-acknowledged',
  ALERT_RESOLVED: 'alert-resolved',
  THRESHOLD_ALERT: 'threshold-alert',
  EMERGENCY_ALERT: 'emergency-alert',
  MAINTENANCE_REMINDER: 'maintenance-reminder',
  
  // Notification events
  NOTIFICATION: 'notification',
  
  // System events
  SYSTEM_ALERT: 'system-alert'
};

export const CHART_COLORS = [
  '#3b82f6', // primary-600
  '#10b981', // green-500
  '#f59e0b', // yellow-500
  '#ef4444', // red-500
  '#8b5cf6', // purple-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
];

export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 20,
  PAGE_SIZES: [10, 20, 50, 100]
};

export const DATE_FORMATS = {
  DATE: 'MMM dd, yyyy',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
  SHORT_DATE: 'MM/dd/yyyy'
};

export const VALIDATION_RULES = {
  BED_NUMBER: { minLength: 1, maxLength: 20 },
  ROOM_NUMBER: { minLength: 1, maxLength: 20 },
  EQUIPMENT_NAME: { minLength: 1, maxLength: 100 },
  NOTES: { maxLength: 500 },
  PATIENT_NAME: { minLength: 1, maxLength: 100 },
  PATIENT_ID: { minLength: 1, maxLength: 50 }
};
