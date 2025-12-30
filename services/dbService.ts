
import { Contact, Task, Interaction, ContactStatus, ServiceType } from '../types';
import { MOCK_CONTACTS, MOCK_TASKS, MOCK_INTERACTIONS } from '../constants';

const KEYS = {
  CONTACTS: 'axis_contacts_v1',
  TASKS: 'axis_tasks_v1',
  INTERACTIONS: 'axis_interactions_v1',
  GOALS: 'axis_master_goals_v3'
};

// Inicialización de datos (Hydration)
const initializeDB = () => {
  if (!localStorage.getItem(KEYS.CONTACTS)) {
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify(MOCK_CONTACTS));
  }
  if (!localStorage.getItem(KEYS.TASKS)) {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(MOCK_TASKS));
  }
  if (!localStorage.getItem(KEYS.INTERACTIONS)) {
    localStorage.setItem(KEYS.INTERACTIONS, JSON.stringify(MOCK_INTERACTIONS));
  }
};

initializeDB();

export const db = {
  // Contactos
  getContacts: (): Contact[] => {
    return JSON.parse(localStorage.getItem(KEYS.CONTACTS) || '[]');
  },
  saveContact: (contact: Partial<Contact>) => {
    const contacts = db.getContacts();
    const now = new Date().toISOString();
    
    if (contact.id) {
      const index = contacts.findIndex(c => c.id === contact.id);
      if (index !== -1) {
        contacts[index] = { ...contacts[index], ...contact, updatedAt: now } as Contact;
      }
    } else {
      const newContact: Contact = {
        ...contact,
        id: `c-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      } as Contact;
      contacts.push(newContact);
    }
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify(contacts));
    return contacts;
  },

  // Tareas
  getTasks: (contactId?: string): Task[] => {
    const tasks: Task[] = JSON.parse(localStorage.getItem(KEYS.TASKS) || '[]');
    return contactId ? tasks.filter(t => t.contactId === contactId) : tasks;
  },
  saveTask: (task: Partial<Task>) => {
    const tasks = db.getTasks();
    if (task.id) {
      const index = tasks.findIndex(t => t.id === task.id);
      tasks[index] = { ...tasks[index], ...task } as Task;
    } else {
      const newTask = { ...task, id: `t-${Date.now()}` } as Task;
      tasks.push(newTask);
    }
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  },

  // Interacciones
  getInteractions: (contactId?: string): Interaction[] => {
    const interactions: Interaction[] = JSON.parse(localStorage.getItem(KEYS.INTERACTIONS) || '[]');
    return contactId ? interactions.filter(i => i.contactId === contactId) : interactions;
  },
  saveInteraction: (interaction: Interaction) => {
    const interactions = db.getInteractions();
    interactions.push(interaction);
    localStorage.setItem(KEYS.INTERACTIONS, JSON.stringify(interactions));
  }
};
