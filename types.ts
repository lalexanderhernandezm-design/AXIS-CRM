
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
}

export enum ContactStatus {
  PROSPECTO = 'Prospecto',
  CONTACTADO = 'Contactado',
  INTERESADO = 'Interesado',
  EN_CONTRATO = 'En Contrato',
  CONVERTIDO = 'Convertido'
}

export enum ServiceType {
  CONTACT_CENTER = 'Contact Center',
  COBRANZAS = 'Cobranzas',
  RECAUDO = 'Recaudo',
  ANALITICA = 'Analítica',
  DESARROLLO_SOFTWARE = 'Desarrollo de Software'
}

export interface PeriodicGoal {
  contracts: number;
  billing: number;
}

export interface UserGoalConfig {
  yearly: PeriodicGoal;
  quarters: {
    q1: PeriodicGoal;
    q2: PeriodicGoal;
    q3: PeriodicGoal;
    q4: PeriodicGoal;
  };
  months: Record<number, PeriodicGoal>; // 0-11
}

export interface Contact {
  id: string;
  ownerId: string;
  name: string;
  companyName: string; 
  role?: string;
  phone: string;
  email: string;
  website?: string;
  origin: string;
  serviceType: ServiceType;
  contractValue?: number;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Interaction {
  id: string;
  contactId: string;
  ownerId: string;
  timestamp: string;
  channel: string;
  summary: string;
  type?: 'interaction' | 'task';
  attachments?: string[];
}

export interface Task {
  id: string;
  contactId: string;
  ownerId: string;
  contactName?: string;
  title: string;
  date: string;
  time: string;
  channel: string;
  description: string;
  isCompleted: boolean;
  fulfillmentDescription?: string;
  attachments?: { name: string, type: string }[];
}

export interface LeadScore {
  stars: number;
}

export interface CatalogItem {
  id: string;
  name: string;
}

export interface IAInsight {
  findings: string[];
  interpretation: string;
  alerts: string[];
  recommendations: string[];
  suggestedQuestions: string[];
}
