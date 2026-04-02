import { addDays, subDays } from 'date-fns';

export interface MockClient {
  _id: string;
  name: string;
  projectName: string;
  status: 'potential' | 'confirmed' | 'completed';
  expectedBudget?: number;
  totalAmount?: number;
  advanceAmount?: number;
  finalAmount?: number;
  lastFollowUp: string;
  nextFollowUp: string;
  followUpInterval: number;
  notes: string;
  sampleProvided: boolean;
  sampleLink?: string;
  shares: any[];
}

const today = new Date();

export const MOCK_CLIENTS: MockClient[] = [
  {
    _id: 'mock-1',
    name: 'Aman Sharma',
    projectName: 'Mobile App Revamp',
    status: 'confirmed',
    totalAmount: 45000,
    advanceAmount: 15000,
    lastFollowUp: subDays(today, 1).toISOString(),
    nextFollowUp: addDays(today, 2).toISOString(),
    followUpInterval: 3,
    notes: 'Needs focus on Dark Mode UI.',
    sampleProvided: true,
    sampleLink: 'https://behance.net/sample1',
    shares: []
  },
  {
    _id: 'mock-2',
    name: 'Priya Patel',
    projectName: 'E-commerce SEO',
    status: 'potential',
    expectedBudget: 25000,
    lastFollowUp: subDays(today, 6).toISOString(),
    nextFollowUp: subDays(today, 1).toISOString(), // Overdue
    followUpInterval: 5,
    notes: 'Interested in ranking for "organic skin care".',
    sampleProvided: false,
    shares: []
  },
  {
    _id: 'mock-3',
    name: 'Zomato Enterprise',
    projectName: 'Internal Dashboard',
    status: 'completed',
    totalAmount: 125000,
    finalAmount: 125000,
    lastFollowUp: subDays(today, 10).toISOString(),
    nextFollowUp: addDays(today, 20).toISOString(),
    followUpInterval: 30,
    notes: 'Project delivered on time. High-value client.',
    sampleProvided: true,
    sampleLink: 'https://figma.com/zomato-dash',
    shares: []
  },
  {
    _id: 'mock-4',
    name: 'Suresh Raina',
    projectName: 'Brand Identity',
    status: 'confirmed',
    totalAmount: 18000,
    advanceAmount: 5000,
    lastFollowUp: subDays(today, 4).toISOString(),
    nextFollowUp: addDays(today, 1).toISOString(),
    followUpInterval: 5,
    notes: 'Awaiting logo feedback.',
    sampleProvided: false,
    shares: []
  },
  {
    _id: 'mock-5',
    name: 'Neha Gupta',
    projectName: 'SaaS Landing Page',
    status: 'potential',
    expectedBudget: 35000,
    lastFollowUp: today.toISOString(),
    nextFollowUp: addDays(today, 3).toISOString(),
    followUpInterval: 3,
    notes: 'Budget is flexible if design quality is premium.',
    sampleProvided: true,
    sampleLink: 'https://dribbble.com/preview',
    shares: []
  },
  {
    _id: 'mock-6',
    name: 'Rocket Tech',
    projectName: 'CRM Integration',
    status: 'confirmed',
    totalAmount: 60000,
    advanceAmount: 20000,
    lastFollowUp: subDays(today, 2).toISOString(),
    nextFollowUp: addDays(today, 1).toISOString(),
    followUpInterval: 3,
    notes: 'Integration with HubSpot required.',
    sampleProvided: false,
    shares: []
  },
  {
    _id: 'mock-7',
    name: 'Karan Mehra',
    projectName: 'YouTube Thumbnail Design',
    status: 'completed',
    totalAmount: 5000,
    finalAmount: 5000,
    lastFollowUp: subDays(today, 15).toISOString(),
    nextFollowUp: addDays(today, 15).toISOString(),
    followUpInterval: 30,
    notes: 'Recurring monthly work.',
    sampleProvided: true,
    shares: []
  },
  {
    _id: 'mock-8',
    name: 'Blue Diamond',
    projectName: 'Social Media Management',
    status: 'potential',
    expectedBudget: 12000,
    lastFollowUp: subDays(today, 3).toISOString(),
    nextFollowUp: today.toISOString(),
    followUpInterval: 3,
    notes: 'Follow up about Instagram growth strategy.',
    sampleProvided: false,
    shares: []
  }
];
