
import { ContactStatus, Contact, Interaction, CatalogItem, Task, ServiceType, UserAccount, UserRole } from './types';

export const MOCK_USERS: UserAccount[] = [
  { id: 'u1', name: 'Administrador Principal', email: 'admin@axis.com', role: UserRole.ADMIN },
  { id: 'u2', name: 'Carlos Comercial', email: 'carlos@axis.com', role: UserRole.USER },
  { id: 'u3', name: 'Ana Ventas', email: 'ana@axis.com', role: UserRole.USER }
];

export const ORIGINS: CatalogItem[] = [
  { id: '1', name: 'Referencia' },
  { id: '2', name: 'Orgánico' },
  { id: '3', name: 'Evento' },
  { id: '4', name: 'Compra de datos' }
];

export const CHANNELS: CatalogItem[] = [
  { id: '1', name: 'WhatsApp' },
  { id: '2', name: 'Llamada' },
  { id: '3', name: 'Mail' },
  { id: '4', name: 'Visita' }
];

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 'c1',
    ownerId: 'u2',
    name: 'Juan Pérez',
    companyName: 'Tech Innovators',
    role: 'CTO',
    phone: '+52 55 1234 5678',
    email: 'juan@tech.com',
    website: 'tech.com',
    origin: 'Referencia',
    serviceType: ServiceType.DESARROLLO_SOFTWARE,
    contractValue: 50000,
    status: ContactStatus.PROSPECTO,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'c2',
    ownerId: 'u3',
    name: 'María García',
    companyName: 'Global Sales S.A.',
    role: 'Gerente de Ventas',
    phone: '+52 55 8765 4321',
    email: 'maria@global.com',
    website: 'global.com',
    origin: 'Evento',
    serviceType: ServiceType.CONTACT_CENTER,
    contractValue: 120000,
    status: ContactStatus.CONVERTIDO,
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-20T14:00:00Z'
  },
  {
    id: 'c3',
    ownerId: 'u2',
    name: 'Carlos Slim Jr',
    companyName: 'Carso',
    role: 'CEO',
    phone: '+52 55 1111 2222',
    email: 'carlos@carso.com',
    website: 'carso.mx',
    origin: 'Orgánico',
    serviceType: ServiceType.ANALITICA,
    contractValue: 85000,
    status: ContactStatus.CONVERTIDO,
    createdAt: '2024-02-01T12:00:00Z',
    updatedAt: '2024-03-05T16:00:00Z'
  }
];

export const MOCK_INTERACTIONS: Interaction[] = [
  {
    id: 'i1',
    contactId: 'c1',
    ownerId: 'u2',
    timestamp: '2024-01-10T10:05:00Z',
    channel: 'Llamada',
    summary: 'Primera toma de contacto, interesado en servicios cloud.',
    type: 'interaction'
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    contactId: 'c1',
    ownerId: 'u2',
    contactName: 'Juan Pérez',
    title: 'Enviar propuesta técnica',
    date: '2024-05-20',
    time: '14:00',
    channel: 'Mail',
    description: 'Preparar PDF con la arquitectura sugerida.',
    isCompleted: false
  }
];
