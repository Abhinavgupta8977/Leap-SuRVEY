import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { SurveyQuestion } from '../types/survey';
import api from '../utils/api';
import { generateMockData } from '../utils/mockData';
import useRealtimeStats from '../hooks/useRealtimeStats';

interface UserResponse {
  questionId: string;
  answer: string;
}

interface MyResponsesResultsProps {
  module: string;
  userId: string; // Assuming you have a way to identify the user
}

interface ApiResponse {
  questions: SurveyQuestion[];
  responses: Record<string, string>;
}

export function MyResponsesResults({ module, userId }: MyResponsesResultsProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moduleAverage, setModuleAverage] = useState<number | null>(null);

  const fetchMyResponses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        // This simulates an API call to fetch questions and user's responses for a module
        // In a real app, you would fetch from your backend:
        // const response = await fetch(`/api/surveys/responses/${module}/${userId}`);
        // const result = await response.json();
        
        // For demonstration, we'll dynamically import questions and use an empty response set
        // In a real scenario, the API would return both questions and the user's responses
        // surveyData exports arrays of question definitions; import them directly
        const { aiReadinessQuestions, leadershipQuestions, employeeExperienceQuestions } = await import('../utils/surveyData');
        let questionsRaw: any[] = [];
        if (module === 'ai-readiness') questionsRaw = aiReadinessQuestions;
        else if (module === 'leadership') questionsRaw = leadershipQuestions;
        else if (module === 'employee-experience') questionsRaw = employeeExperienceQuestions;

        // Map to SurveyQuestion shape expected by this component
        const questions: SurveyQuestion[] = questionsRaw.map(q => ({
          id: q.id,
          question: q.question,
          section: q.section || 'General',
          scale: q.scale || '1-5'
        }));

        // Try to fetch user's responses from backend first
        let surveyResponses: Record<string, string> = {};
        try {
          const resp = await api.responses.getByUser(userId);
          // api.responses.getByUser returns the full SurveyResponseData shape - we'll map to questionId -> response
          // resp may contain arrays per module; try to pick the right module
          if (module === 'ai-readiness' && resp.aiReadiness) {
            resp.aiReadiness.forEach(r => {
              surveyResponses[r.questionId] = String(r.response);
            });
          } else if (module === 'leadership' && resp.leadership) {
            resp.leadership.forEach(r => {
              surveyResponses[r.questionId] = String(r.response);
            });
          } else if (module === 'employee-experience' && resp.employeeExperience) {
            resp.employeeExperience.forEach(r => {
              surveyResponses[r.questionId] = String(r.response);
            });
          }
        } catch (err) {
          // Backend not available or user not found — fallback to simulated single-user responses using mockData
          const mock = generateMockData();
          const source = module === 'ai-readiness' ? mock.aiReadinessData : module === 'leadership' ? mock.leadershipData : mock.employeeExperienceData;
          // pick one record per question id if present, otherwise simulate
          source.forEach((r: any) => {
            // if already have question ids from questions list, prefer those
            const qmatch = questions.find((q: SurveyQuestion) => q.id === r.questionId);
            if (qmatch) surveyResponses[r.questionId] = String(r.response);
          });
          // If still empty, simulate predictable answers for each question
          if (Object.keys(surveyResponses).length === 0) {
            questions.forEach((q: SurveyQuestion, i: number) => {
              // simulate mid-to-positive answers
              surveyResponses[q.id] = q.scale === '1-5' ? String((i % 5) + 1) : String(7 + (i % 4));
            });
          }
        }

        // Compute module average positive percentage using the questions and surveyResponses
        const total = questions.length;
        let positiveCount = 0;
        questions.forEach((q: SurveyQuestion) => {
          const resp = surveyResponses[q.id];
          if (!resp) return;
          const val = parseInt(resp);
          if (q.scale === '1-5') {
            if (val >= 4) positiveCount++;
          } else {
            if (val >= 7) positiveCount++;
          }
        });

        const avg = total > 0 ? Math.round((positiveCount / total) * 100) : 0;
        setModuleAverage(avg);

      setData({ questions, responses: surveyResponses });

    } catch (err) {
      setError('Failed to fetch your responses. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [module, userId]);

  // Initial load and whenever module/userId change
  useEffect(() => {
    fetchMyResponses();
  }, [fetchMyResponses]);

  // Listen for a global event dispatched after a survey is submitted so the UI can update immediately
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (ev: Event) => {
      try {
        const ce = ev as CustomEvent<any>;
        const detail = ce?.detail || {};
        // If the event is for a different user or module, ignore
        if (detail.userId && detail.userId !== userId) return;
        if (detail.module && detail.module !== module) return;
        // otherwise refresh
        fetchMyResponses();
      } catch (e) {
        // ignore malformed events
      }
    };

    window.addEventListener('survey:submitted', handler as EventListener);
    return () => window.removeEventListener('survey:submitted', handler as EventListener);
  }, [fetchMyResponses, module, userId]);

  // Use realtime stats hook (general stats) — we still fetch module analytics for module-specific positive average
  const { stats: realtimeStats } = useRealtimeStats();

  useEffect(() => {
    let mounted = true;
    const fetchModuleAnalytics = async () => {
      try {
        let result: any = null;
        if (module === 'ai-readiness') result = await api.analytics.getAIReadiness();
        else if (module === 'leadership') result = await api.analytics.getLeadership();
        else if (module === 'employee-experience') result = await api.analytics.getEmployeeExperience();

        if (!mounted) return;
        if (result && typeof result.positiveScore === 'number') {
          setModuleAverage(Math.round(result.positiveScore));
        }
      } catch (err) {
        // ignore — moduleAverage already set from local calc fallback
      }
    };

    fetchModuleAnalytics();
    const interval = setInterval(fetchModuleAnalytics, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, [module]);

  const { questions = [], responses: surveyResponses = {} } = (data || {}) as ApiResponse;

  // Get scale labels based on question scale
  const getScaleLabel = (scale: string, value: string): string => {
    const numValue = parseInt(value);
    
    if (scale === '1-5') {
      const labels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
      return labels[numValue - 1] || value;
    } else if (scale === '1-10') {
      if (numValue <= 3) return `${value} - Low`;
      if (numValue <= 6) return `${value} - Medium`;
      return `${value} - High`;
    }
    return value;
  };

  // Check if response is positive
  const isPositiveResponse = (scale: string, value: string): boolean => {
    const numValue = parseInt(value);
    
    if (scale === '1-5') {
      return numValue >= 4; // 4 or 5 is positive
    } else if (scale === '1-10') {
      return numValue >= 7; // 7-10 is positive
    }
    return false;
  };

  // Group questions by section
  const groupedQuestions = useMemo(() => {
    const groups: Record<string, typeof questions> = {};
    
    questions.forEach(question => {
      if (!groups[question.section]) {
        groups[question.section] = [];
      }
      groups[question.section].push(question);
    });
    
    return groups;
  }, [questions]);

  // Filter to only show questions that have responses
  const answeredSections = useMemo(() => {
    const sections: Record<string, typeof questions> = {};
    
    Object.entries(groupedQuestions).forEach(([sectionName, sectionQuestions]) => {
      const answeredInSection = sectionQuestions.filter(q => surveyResponses[q.id]);
      if (answeredInSection.length > 0) {
        sections[sectionName] = answeredInSection;
      }
    });
    
    return sections;
  }, [groupedQuestions, surveyResponses]);

  const totalResponses = Object.keys(surveyResponses).length;
  const positiveResponses = Object.entries(surveyResponses).filter(([key, value]) => {
    const question = questions.find(q => q.id === key);
    if (!question) return false;
    return isPositiveResponse(question.scale, String(value));
  }).length;

  const positivePercentage = totalResponses > 0 ? Math.round((positiveResponses / totalResponses) * 100) : 0;

  if (totalResponses === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-600">No responses recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle2 className="h-6 w-6" />
            Your Response Summary
          </CardTitle>
          <CardDescription className="text-green-700">
            Review all your submitted responses for this module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-sm text-gray-600 mb-1">Total Responses</div>
              <div className="text-2xl font-bold text-gray-900">{totalResponses}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-sm text-gray-600 mb-1">Positive Responses</div>
              <div className="text-2xl font-bold text-green-600">{positiveResponses}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-sm text-gray-600 mb-1">Positive Rate</div>
              <div className="text-2xl font-bold text-green-600">{positivePercentage}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responses by Section */}
      <div className="space-y-6">
        {Object.entries(answeredSections).map(([sectionName, sectionQuestions], sectionIndex) => (
          <Card key={sectionIndex}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{sectionName}</CardTitle>
                  <CardDescription>
                    {sectionQuestions.length} question{sectionQuestions.length > 1 ? 's' : ''} answered
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Section {sectionIndex + 1}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sectionQuestions.map((question, qIndex) => {
                  const response = surveyResponses[question.id];
                  if (!response) return null;
                  
                  const isPositive = isPositiveResponse(question.scale, response);
                  const scaleLabel = getScaleLabel(question.scale, response);
                  
                  return (
                    <div key={question.id} className="space-y-3">
                      {qIndex > 0 && <Separator />}
                      
                      <div className="space-y-2">
                        {/* Question */}
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 p-1 rounded-full ${isPositive ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {isPositive ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{question.question}</p>
                          </div>
                        </div>
                        
                        {/* Response */}
                        <div className="ml-10 flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Your response:</span>
                              <Badge 
                                variant="outline" 
                                className={`${
                                  isPositive 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : 'bg-gray-50 text-gray-700 border-gray-200'
                                }`}
                              >
                                {scaleLabel}
                              </Badge>
                            </div>
                            
                            {/* Visual scale indicator */}
                            <div className="mt-2 flex items-center gap-1">
                              {question.scale === '1-5' && (
                                <>
                                  {[1, 2, 3, 4, 5].map((num) => (
                                    <div
                                      key={num}
                                      className={`h-2 flex-1 rounded ${
                                        num === parseInt(response)
                                          ? isPositive
                                            ? 'bg-green-500'
                                            : 'bg-gray-500'
                                          : 'bg-gray-200'
                                      }`}
                                    />
                                  ))}
                                </>
                              )}
                              {question.scale === '1-10' && (
                                <>
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <div
                                      key={num}
                                      className={`h-2 flex-1 rounded ${
                                        num === parseInt(response)
                                          ? isPositive
                                            ? 'bg-green-500'
                                            : 'bg-gray-500'
                                          : 'bg-gray-200'
                                      }`}
                                    />
                                  ))}
                                </>
                              )}
                            </div>
                            
                            {/* Scale labels */}
                            <div className="mt-1 flex justify-between text-xs text-gray-500">
                              <span>{question.scale === '1-5' ? '1 - Strongly Disagree' : '1 - Low'}</span>
                              <span>{question.scale === '1-5' ? '5 - Strongly Agree' : '10 - High'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
