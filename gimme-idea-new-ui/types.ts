
export interface User {
  address: string;
  username?: string;
  avatar?: string;
  reputation: number;
  usdcEarned: number;
  role: 'Developer' | 'Designer' | 'Auditor' | 'Investor';
  skills: string[];
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  category: ChartCategory;
  votes: number;
  feedbackCount: number;
  author: User;
  stage: 'Idea' | 'MVP' | 'Testnet' | 'Mainnet';
  bounty: number;
  createdAt: string;
  techStack: string[];
  repoUrl?: string;
  demoUrl?: string;
}

export interface Feedback {
  id: string;
  author: User;
  content: string;
  sentiment: 'positive' | 'constructive' | 'critical';
  qualityScore: number;
  helpfulCount: number;
  timestamp: string;
  replies: Feedback[];
}

export interface Metric {
  name: string;
  value: number | string;
  trend: number; // percentage
}

export enum ChartCategory {
  DEFI = 'DeFi',
  GAMING = 'Gaming',
  NFT = 'NFT',
  INFRA = 'Infrastructure',
  DAO = 'DAO',
  CONSUMER = 'Consumer'
}

export interface Notification {
  id: string;
  type: 'feedback' | 'mention' | 'bounty' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export type ModalType = 
  | 'notification' 
  | 'reply' 
  | 'share' 
  | 'report' 
  | 'tip' 
  | 'team' 
  | 'editProfile' 
  | 'claim' 
  | 'filter' 
  | 'success'
  | 'launchSuccess';

export interface ModalContextType {
  isOpen: boolean;
  type: ModalType | null;
  props: any;
  openModal: (type: ModalType, props?: any) => void;
  closeModal: () => void;
}
