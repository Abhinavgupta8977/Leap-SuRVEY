// Legacy mock data generator kept for local dev and until backend is fully migrated.
// Provides types and a generateMockData(surveyId?) helper used throughout the app.

export type ScaleType = '1-5' | '0-10';

export interface AIReadinessResponse {
  id: string;
  surveyId?: string;
  section: string; // e.g. 'Strategy & Leadership'
  questionId: string;
  response: number; // 1-5
  submittedAt?: string;
}

export interface LeadershipResponse {
  id: string;
  surveyId?: string;
  lens: string; // e.g. 'Strategic Vision'
  configuration: string; // e.g. 'Centralized'
  driver: string; // driver name
  questionId: string;
  response: number; // 1-5
  submittedAt?: string;
}

export interface EmployeeExperienceResponse {
  id: string;
  surveyId?: string;
  category: string; // e.g. 'Work Environment'
  driver: string; // e.g. 'Physical Workspace'
  questionId: string;
  scale: ScaleType; // '0-10' or '1-5'
  response: number; // numeric response
  submittedAt?: string;
}

export interface MockDataSet {
  aiReadinessData: AIReadinessResponse[];
  leadershipData: LeadershipResponse[];
  employeeExperienceData: EmployeeExperienceResponse[];
}

function nowIso(offsetMins = 0) {
  return new Date(Date.now() - offsetMins * 60000).toISOString();
}

// Minimal deterministic mock generator. If surveyId provided, it will annotate each record
export function generateMockData(surveyId?: string): MockDataSet {
  const aiReadinessData: AIReadinessResponse[] = [
    { id: 'ai-1', surveyId, section: 'Strategy & Leadership', questionId: 'ai-q-1', response: 4, submittedAt: nowIso(60) },
    { id: 'ai-2', surveyId, section: 'Strategy & Leadership', questionId: 'ai-q-2', response: 3, submittedAt: nowIso(58) },
    { id: 'ai-3', surveyId, section: 'Infrastructure & Skills', questionId: 'ai-q-3', response: 5, submittedAt: nowIso(55) },
    { id: 'ai-4', surveyId, section: 'Infrastructure & Skills', questionId: 'ai-q-4', response: 4, submittedAt: nowIso(53) },
    { id: 'ai-5', surveyId, section: 'Data & Culture', questionId: 'ai-q-5', response: 2, submittedAt: nowIso(50) },
    { id: 'ai-6', surveyId, section: 'Data & Culture', questionId: 'ai-q-6', response: 4, submittedAt: nowIso(48) }
  ];

  const leadershipData: LeadershipResponse[] = [
    { id: 'l-1', surveyId, lens: 'Strategic Vision', configuration: 'Centralized', driver: 'Vision Clarity', questionId: 'l-q-1', response: 4, submittedAt: nowIso(45) },
    { id: 'l-2', surveyId, lens: 'Strategic Vision', configuration: 'Centralized', driver: 'Vision Clarity', questionId: 'l-q-2', response: 3, submittedAt: nowIso(44) },
    { id: 'l-3', surveyId, lens: 'Team Development', configuration: 'Decentralized', driver: 'Coaching', questionId: 'l-q-3', response: 5, submittedAt: nowIso(42) },
    { id: 'l-4', surveyId, lens: 'Team Development', configuration: 'Decentralized', driver: 'Coaching', questionId: 'l-q-4', response: 4, submittedAt: nowIso(40) },
    { id: 'l-5', surveyId, lens: 'Communication Excellence', configuration: 'Centralized', driver: 'Listening', questionId: 'l-q-5', response: 4, submittedAt: nowIso(38) },
    { id: 'l-6', surveyId, lens: 'Decision Making', configuration: 'Centralized', driver: 'Accountability', questionId: 'l-q-6', response: 2, submittedAt: nowIso(36) },
    { id: 'l-7', surveyId, lens: 'Decision Making', configuration: 'Centralized', driver: 'Accountability', questionId: 'l-q-7', response: 3, submittedAt: nowIso(35) },
    { id: 'l-8', surveyId, lens: 'Communication Excellence', configuration: 'Decentralized', driver: 'Transparency', questionId: 'l-q-8', response: 5, submittedAt: nowIso(33) }
  ];

  const employeeExperienceData: EmployeeExperienceResponse[] = [];
  // create 16 sample EE responses across 4 categories
  const eeDrivers = [
    { category: 'Work Environment', driver: 'Physical Workspace' },
    { category: 'Career Growth', driver: 'Development Opportunities' },
    { category: 'Recognition & Rewards', driver: 'Compensation' },
    { category: 'Work-Life Balance', driver: 'Flexibility' }
  ];

  let eeId = 1;
  for (let i = 0; i < 16; i++) {
    const d = eeDrivers[i % eeDrivers.length];
    employeeExperienceData.push({
      id: `ee-${eeId++}`,
      surveyId,
      category: d.category,
      driver: d.driver,
      questionId: `ee-q-${i + 1}`,
      scale: '0-10',
      response: 6 + (i % 5), // produces responses in 6..10 range
      submittedAt: nowIso(30 - i)
    });
  }

  return {
    aiReadinessData,
    leadershipData,
    employeeExperienceData
  };
}

// Also export the raw arrays for components that may import them directly (legacy)
export const aiReadinessData = generateMockData().aiReadinessData;
export const leadershipData = generateMockData().leadershipData;
export const employeeExperienceData = generateMockData().employeeExperienceData;

export default generateMockData;
