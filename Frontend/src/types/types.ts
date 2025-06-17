// User Role Type
export type UserRole = 'client' | 'doctor' | 'admin';

// Base User Interface
export interface User {
  userId: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;
  profile?: {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
  };
}

export interface UserState {
    token: string | null;
    user: User | null;
}
// Client Profile Interface
export interface ClientProfile {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  phone?: string;
  address?: string;
}

// Doctor Profile Interface
export interface DoctorProfile {
  userId: string;
  licenseNumber: string;
  specialization?: string;
}

// Health Program Interface
export interface HealthProgram {
  programId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Enrollment Interface
export interface Enrollment {
    id: number;
    userId: string;
    programId: string;
    enrolledAt: string;
    completedAt: string | null;
    status: 'active' | 'completed' | 'inactive';
    progress: number;
    notes: string | null;
    lastAccessedAt: string;
    user?: {
        email: string;
        role: string;
    };
    program?: {
        name: string;
    };
}

// Combined User Type for API Responses
export type CompleteUser = User & {
  profile: ClientProfile | DoctorProfile | null;
};

// Authentication Response Type
export interface AuthResponse {
  token: string;
  user: CompleteUser;
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination Metadata
export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

// Paginated Response
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// Types for Form Inputs
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'doctor' | 'admin';
  confirmPassword?: string;
  gender: string;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
}