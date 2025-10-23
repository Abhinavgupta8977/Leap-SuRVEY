// Calculation utilities for LEAP Survey Dashboard

import type { AIReadinessResponse, LeadershipResponse, EmployeeExperienceResponse } from './mockData';

export interface PositivePercentageResult {
  positiveCount: number;
  totalCount: number;
  positivePercentage: number;
}

export interface SectionResult extends PositivePercentageResult {
  section: string;
}

export interface DriverResult extends PositivePercentageResult {
  driver: string;
  lens?: string;
  configuration?: string;
}

// Calculate AI Readiness Score: Average % of people who selected option 4 or 5
// Formula: AI Readiness Score = (Count of responses = 4 or 5 / Total responses) × 100
export function calculateAIReadinessPositives(
  data: AIReadinessResponse[],
  section?: string
): PositivePercentageResult {
  const filteredData = section ? data.filter(d => d.section === section) : data;
  const totalCount = filteredData.length;
  const positiveCount = filteredData.filter(d => d.response === 4 || d.response === 5).length;
  
  return {
    positiveCount,
    totalCount,
    positivePercentage: totalCount > 0 ? (positiveCount / totalCount) * 100 : 0
  };
}

// Calculate positive percentage by section for AI Readiness
export function calculateAIReadinessBySection(data: AIReadinessResponse[]): SectionResult[] {
  const sections = [...new Set(data.map(d => d.section))];
  
  return sections.map(section => ({
    section,
    ...calculateAIReadinessPositives(data, section)
  }));
}

// Calculate Leadership Score: Average cumulative score for questions in each category
// Formula: Leadership Score = Sum of all responses for 4 Qs / Total number of respondents
export function calculateLeadershipPositives(
  data: LeadershipResponse[],
  filters?: { lens?: string; configuration?: string; driver?: string }
): PositivePercentageResult {
  let filteredData = data;
  
  if (filters?.lens) {
    filteredData = filteredData.filter(d => d.lens === filters.lens);
  }
  if (filters?.configuration) {
    filteredData = filteredData.filter(d => d.configuration === filters.configuration);
  }
  if (filters?.driver) {
    filteredData = filteredData.filter(d => d.driver === filters.driver);
  }
  
  const totalCount = filteredData.length;
  
  if (totalCount === 0) {
    return {
      positiveCount: 0,
      totalCount: 0,
      positivePercentage: 0
    };
  }
  
  // Calculate average cumulative score (sum of all responses / total respondents)
  const sumOfResponses = filteredData.reduce((sum, response) => sum + response.response, 0);
  const averageScore = sumOfResponses / totalCount;
  
  // Convert to percentage (assuming 5-point scale, so divide by 5 and multiply by 100)
  const percentageScore = (averageScore / 5) * 100;
  
  return {
    positiveCount: sumOfResponses,
    totalCount,
    positivePercentage: percentageScore
  };
}

// Calculate positive percentage by lens for Leadership
export function calculateLeadershipByLens(data: LeadershipResponse[]): DriverResult[] {
  const lenses = [...new Set(data.map(d => d.lens))];
  
  return lenses.map(lens => ({
    driver: lens,
    lens,
    ...calculateLeadershipPositives(data, { lens })
  }));
}

// Calculate positive percentage by configuration for Leadership
export function calculateLeadershipByConfiguration(data: LeadershipResponse[]): DriverResult[] {
  const configurations = [...new Set(data.map(d => d.configuration))];
  
  return configurations.map(configuration => ({
    driver: configuration,
    configuration,
    ...calculateLeadershipPositives(data, { configuration })
  }));
}

// Calculate positive percentage by driver for Leadership
export function calculateLeadershipByDriver(data: LeadershipResponse[]): DriverResult[] {
  const drivers = [...new Set(data.map(d => d.driver))];
  
  return drivers.map(driver => {
    const driverData = data.filter(d => d.driver === driver);
    const lens = driverData[0]?.lens;
    const configuration = driverData[0]?.configuration;
    
    return {
      driver,
      lens,
      configuration,
      ...calculateLeadershipPositives(data, { driver })
    };
  });
}

// Calculate Employee Experience Score: Favorable employee rating (0-10 scale)
// Only 7, 8, 9, 10 responses are counted as favorable
// Formula: Employee Scale Score = (Number of 7-10 responses / Total responses) × 100
export function calculateEmployeeExperiencePositives(
  data: EmployeeExperienceResponse[],
  filters?: { category?: string; driver?: string }
): PositivePercentageResult {
  let filteredData = data;
  
  if (filters?.category) {
    filteredData = filteredData.filter(d => d.category === filters.category);
  }
  if (filters?.driver) {
    filteredData = filteredData.filter(d => d.driver === filters.driver);
  }
  
  const totalCount = filteredData.length;
  const positiveCount = filteredData.filter(d => {
    if (d.scale === '0-10') {
      // Only 7, 8, 9, 10 responses are counted as favorable
      return d.response >= 7 && d.response <= 10;
    } else {
      // For 1-5 scale, keep existing logic (4-5 are positive)
      return d.response >= 4;
    }
  }).length;
  
  return {
    positiveCount,
    totalCount,
    positivePercentage: totalCount > 0 ? (positiveCount / totalCount) * 100 : 0
  };
}

// Calculate positive percentage by category for Employee Experience
export function calculateEmployeeExperienceByCategory(data: EmployeeExperienceResponse[]): DriverResult[] {
  const categories = [...new Set(data.map(d => d.category))];
  
  return categories.map(category => ({
    driver: category,
    ...calculateEmployeeExperiencePositives(data, { category })
  }));
}

// Calculate positive percentage by driver for Employee Experience
export function calculateEmployeeExperienceByDriver(data: EmployeeExperienceResponse[]): DriverResult[] {
  const drivers = [...new Set(data.map(d => d.driver))];
  
  return drivers.map(driver => {
    const driverData = data.filter(d => d.driver === driver);
    const category = driverData[0]?.category;
    
    return {
      driver,
      ...calculateEmployeeExperiencePositives(data, { driver })
    };
  });
}

// Calculate overall averages for KPI cards
export function calculateOverallAverages(
  aiData: AIReadinessResponse[],
  leadershipData: LeadershipResponse[],
  employeeData: EmployeeExperienceResponse[]
) {
  const aiPositive = calculateAIReadinessPositives(aiData);
  const leadershipPositive = calculateLeadershipPositives(leadershipData);
  const employeePositive = calculateEmployeeExperiencePositives(employeeData);
  
  return {
    aiReadiness: aiPositive.positivePercentage,
    leadership: leadershipPositive.positivePercentage,
    employeeExperience: employeePositive.positivePercentage
  };
}

// Get score distribution for Employee Experience (for context charts)
export function getEmployeeExperienceDistribution(data: EmployeeExperienceResponse[]) {
  const distribution = { '0-10': {}, '1-5': {} } as any;
  
  // Initialize distributions
  for (let i = 0; i <= 10; i++) {
    distribution['0-10'][i] = 0;
  }
  for (let i = 1; i <= 5; i++) {
    distribution['1-5'][i] = 0;
  }
  
  // Count responses
  data.forEach(response => {
    distribution[response.scale][response.response]++;
  });
  
  return distribution;
}