export type GaEventName =
  // Navigation & Consumption
  | 'login'
  | 'logout'
  | 'search'
  | 'select_content'
  | 'file_download'
  | 'video_start'
  | 'view_item_list'
  | 'click'
  // Business - Management
  | 'manage_schedule' // Schedules: Add, Modify shift
  | 'manage_entity' // Admin: Users, Absences, Vacations
  | 'manage_content' // Health/Board: Videos, News
  | 'manage_communication' // Distribution Messages
  // Business - Transactional
  | 'generate_lead' // Requests, Incidents, Orders
  | 'begin_checkout' // Start room booking
  | 'schedule_booking' // Confirm room booking
  // Personal & Security
  | 'log_attendance' // Clock-in/out Start/Stop
  | 'view_account' // View balances/vacations
  | 'verify_auth' // Validate PIN
  | 'generate_token' // Generate PIN
  // System
  | 'device_alert' // POS Terminal Error
  | 'app_exception' // JS/API Error
  | 'contact'; // Chat

export type ModuleSection =
  | 'public_nav'
  | 'personal_365'
  | 'admin_portal_vacations'
  | 'admin_portal_payroll'
  | 'admin_portal_users'
  | 'admin_portal_schedules'
  | 'health'
  | 'room_scheduler'
  | 'monitor_system';

export interface FileMeta {
  name: string;
  extension: 'pdf' | 'xlsx' | 'doc' | 'mp4';
  category?: 'payrolls' | 'reports' | 'justifications' | 'training';
}

export interface InteractionContext {
  target?: string; // Employee ID, Room Name, Store ID
  status?: 'success' | 'error' | 'pending';
  value?: number; // Vacation days, Amount, # of attendees
  filter_used?: string; // "Year 2024", "Supervisor X"
  method?: string; // "manual", "chat", "pin"
}

// DataLayer structure for GTM
export interface GtmPayload {
  event: GaEventName;
  module_section: ModuleSection;
  ui_component: string;
  user_role: string;
  file_meta?: FileMeta;
  interaction_context?: InteractionContext;
  timestamp: string;
  page_location: string;
}
