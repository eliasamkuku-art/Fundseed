export interface Opportunity {
  id: string;
  title: string;
  provider: string;
  amount: string;
  category: 'ruzuku' | 'mkopo' | 'equity' | 'incubator' | 'scholarship';
  description: string;
  eligibility: string[];
  deadline: string;
  origin: 'Tanzania' | 'Duniani';
  link?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  business: string;
  location: string;
  amountGranted: string;
  story: string;
  avatarChar: string;
  avatarColor: string;
  image?: string;
}

export interface BusinessPlanInput {
  businessName: string;
  industry: string;
  problem: string;
  solution: string;
  targetCustomers: string;
  budgetString: string;
}

export interface PitchDeckInput {
  startupName: string;
  industry: string;
  problem: string;
  solution: string;
  marketSize: string;
  businessModel: string;
  fundingNeeds: string;
}

export interface PitchCritiqueInput {
  pitchText: string;
  industry: string;
}

