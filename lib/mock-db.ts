import bcrypt from 'bcryptjs';

// Types
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string | null;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  image: string | null;
  paymentQR: string | null;
  category: string;
  isLive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventRegistration {
  id: string;
  userId: string;
  eventId: string;
  name: string;
  email: string;
  mobile: string;
  college: string;
  branch: string;
  department: string;
  address: string;
  paymentStatus: string;
  paymentProof?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create admin password hash synchronously for mock data
const adminPasswordHash = bcrypt.hashSync('admin123', 10);
const userPasswordHash = bcrypt.hashSync('password123', 10);

// Mock data
let users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    // Password: admin123
    password: adminPasswordHash,
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Test User',
    email: 'user@example.com',
    // Password: password123
    password: userPasswordHash,
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let events: Event[] = [
  {
    id: '1',
    title: '2025 Spring Chess Classic',
    description: 'A premier chess tournament for all skill levels',
    date: new Date('2025-05-15'),
    location: 'Grand Convention Center',
    image: '/placeholder.svg',
    paymentQR: null,
    category: 'Competition',
    isLive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Tech Innovators Summit',
    description: 'Connect with technology leaders and innovators',
    date: new Date('2025-06-05'),
    location: 'Digital Hub Arena',
    image: '/placeholder.svg',
    paymentQR: null,
    category: 'Conference',
    isLive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Global Tech Conference',
    description: 'Live technology showcase and networking event',
    date: new Date(),
    location: 'Innovation Center',
    image: '/placeholder.svg',
    paymentQR: null,
    category: 'Live',
    isLive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Hackathon 2024',
    description: 'Past coding competition for developers',
    date: new Date('2024-12-10'),
    location: 'Tech Campus',
    image: '/placeholder.svg',
    paymentQR: null,
    category: 'Competition',
    isLive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Initialize event registrations
let eventRegistrations: EventRegistration[] = [];

// For debugging
console.log('Mock DB initialized with users:', users.map(u => ({
  id: u.id,
  email: u.email,
  role: u.role,
  passwordLength: u.password.length
})));

// Mock database methods
export const db = {
  user: {
    findUnique: async ({ where }: { where: { email: string } }) => {
      const user = users.find(user => user.email === where.email) || null;
      console.log('Finding user by email:', where.email, 'Result:', user ? `Found (${user.role})` : 'Not found');
      return user;
    },
    create: async ({ data }: { data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> }) => {
      const newUser = {
        id: String(users.length + 1),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.push(newUser);
      console.log('Created new user:', newUser.email);
      return newUser;
    },
  },
  event: {
    findMany: async () => {
      return [...events];
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      const event = events.find(event => event.id === where.id) || null;
      return event;
    },
    create: async ({ data }: { data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> }) => {
      const newEvent = {
        id: String(events.length + 1),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      events.push(newEvent);
      return newEvent;
    },
    update: async ({ where, data }: { where: { id: string }, data: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>> }) => {
      const index = events.findIndex(event => event.id === where.id);
      if (index === -1) {
        throw new Error('Event not found');
      }
      
      events[index] = {
        ...events[index],
        ...data,
        updatedAt: new Date()
      };
      
      return events[index];
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const index = events.findIndex(event => event.id === where.id);
      if (index !== -1) {
        const deletedEvent = events[index];
        events = events.filter(event => event.id !== where.id);
        return deletedEvent;
      }
      throw new Error('Event not found');
    },
  },
  eventRegistration: {
    findMany: async () => {
      return [...eventRegistrations];
    },
    findByUserAndEvent: async ({ userId, eventId }: { userId: string, eventId: string }) => {
      return eventRegistrations.find(
        reg => reg.userId === userId && reg.eventId === eventId
      ) || null;
    },
    findByUser: async ({ userId }: { userId: string }) => {
      return eventRegistrations.filter(reg => reg.userId === userId);
    },
    create: async ({ data }: { data: Omit<EventRegistration, 'id' | 'createdAt' | 'updatedAt'> }) => {
      const newRegistration = {
        id: `reg_${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      eventRegistrations.push(newRegistration);
      return newRegistration;
    },
    update: async ({ 
      where, 
      data 
    }: { 
      where: { id: string }, 
      data: Partial<Omit<EventRegistration, 'id' | 'createdAt' | 'updatedAt'>> 
    }) => {
      const index = eventRegistrations.findIndex(reg => reg.id === where.id);
      if (index === -1) {
        throw new Error('Registration not found');
      }
      
      eventRegistrations[index] = {
        ...eventRegistrations[index],
        ...data,
        updatedAt: new Date()
      };
      
      return eventRegistrations[index];
    },
  },
}; 