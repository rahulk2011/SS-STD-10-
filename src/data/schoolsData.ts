import { SchoolTenant, UserProfile } from '../types';

export const INITIAL_SCHOOLS: SchoolTenant[] = [
  {
    id: 'school_dps_gn',
    name: 'Delhi Public School, Gandhinagar',
    code: 'DPS-GUJ-01',
    city: 'Gandhinagar',
    state: 'Gujarat',
    board: 'CBSE / GSEB',
    totalStudents: 1420,
    totalTeachers: 68
  },
  {
    id: 'school_kv_ahmedabad',
    name: 'Kendriya Vidyalaya No. 1, Shahibaug',
    code: 'KV-AHM-04',
    city: 'Ahmedabad',
    state: 'Gujarat',
    board: 'CBSE',
    totalStudents: 1850,
    totalTeachers: 92
  },
  {
    id: 'school_sx_surat',
    name: "St. Xavier's High School, Surat",
    code: 'SX-SRT-09',
    city: 'Surat',
    state: 'Gujarat',
    board: 'GSEB English & Gujarati Medium',
    totalStudents: 1180,
    totalTeachers: 54
  }
];

export const DEMO_USERS: UserProfile[] = [
  {
    uid: 'demo_student_aarav',
    email: 'aarav.patel@student.edusmart.in',
    displayName: 'Aarav Patel (Student)',
    role: 'student',
    schoolId: 'school_dps_gn',
    classGrade: 'Class 10-A (Board Prep)',
    rollNumber: '10042',
    photoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  {
    uid: 'demo_parent_bhavin',
    email: 'bhavin.patel@parent.edusmart.in',
    displayName: 'Bhavin Patel (Parent)',
    role: 'parent',
    schoolId: 'school_dps_gn',
    childrenStudentIds: ['demo_student_aarav'],
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    uid: 'demo_teacher_mehtaji',
    email: 'hitesh.mehta@faculty.edusmart.in',
    displayName: 'Prof. Hitesh Mehta (Social Science Lead)',
    role: 'teacher',
    schoolId: 'school_dps_gn',
    classGrade: 'Department of Social Sciences',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    uid: 'demo_principal_sharma',
    email: 'principal.dps@edusmart.in',
    displayName: 'Dr. Radhika Sharma (Principal)',
    role: 'principal',
    schoolId: 'school_dps_gn',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  }
];
