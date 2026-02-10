export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  SUPERVISOR = 'SUPERVISOR'
}

export interface User {
  id: string;
  username: string;
  password?: string; // Optional for display purposes, but stored in logic
  fullName: string;
  role: UserRole;
}

export interface ClassGroup {
  id: string;
  name: string;
  teacherId: string;
}

export interface Absence {
  id: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  status: 'draft' | 'sent';
  timestamp: number;
}
