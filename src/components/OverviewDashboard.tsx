import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Target,
  BarChart3,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MyResponsesResults } from './MyResponsesResults';

interface OverviewDashboardProps {
  overallAverages: {
    aiReadiness: number;
    leadership: number;
    employeeExperience: number;
  };
  surveyResponses: Record<string, string>;
  mockData: any;
  availableModules?: ('ai-readiness' | 'leadership' | 'employee-experience')[];
  activeModule?: string;
  userId?: string;
}

export function OverviewDashboard({ overallAverages, surveyResponses, mockData, availableModules = ['ai-readiness', 'leadership', 'employee-experience'], activeModule, userId }: OverviewDashboardProps) {
  // Mock trend data for time series
  const trendData = useMemo(() => [
    { month: 'Jan', responses: 45, aiReadiness: 67, leadership: 72, employeeExp: 69 },
    { month: 'Feb', responses: 52, aiReadiness: 71, leadership: 74, employeeExp: 71 },
    { month: 'Mar', responses: 48, aiReadiness: 69, leadership: 76, employeeExp: 68 },
    { month: 'Apr', responses: 61, aiReadiness: 73, leadership: 78, employeeExp: 72 },
    { month: 'May', responses: 58, aiReadiness: 75, leadership: 79, employeeExp: 74 },
    { month: 'Jun', responses: 67, aiReadiness: 78, leadership: 81, employeeExp: 76 }
  ], []);

  // Mock demographic distribution
  const demographicData = useMemo(() => [
    { name: 'Engineering', value: 35, color: '#3B82F6' },
    { name: 'Sales', value: 25, color: '#10B981' },
    { name: 'Marketing', value: 20, color: '#F59E0B' },
    { name: 'Operations', value: 15, color: '#EF4444' },
    { name: 'Other', value: 5, color: '#8B5CF6' }
  ], []);

  const totalParticipants = 250;
  const completedSurveys = 187;
  const activeRespondents = 98;
  const responseRate = Math.round((completedSurveys / totalParticipants) * 100);

  const overallScore = useMemo(() => {
    const moduleScores = [];
    if (availableModules.includes('ai-readiness')) moduleScores.push(overallAverages.aiReadiness);
    if (availableModules.includes('leadership')) moduleScores.push(overallAverages.leadership);
    if (availableModules.includes('employee-experience')) moduleScores.push(overallAverages.employeeExperience);
    
    return moduleScores.length > 0 ? Math.round(moduleScores.reduce((sum, score) => sum + score, 0) / moduleScores.length) : 0;
  }, [overallAverages, availableModules]);

  // Top performing questions (mock data)
  const topQuestions = [
    { text: "Team collaboration effectiveness", score: 85, module: "Leadership" },
    { text: "Technology training satisfaction", score: 82, module: "AI Readiness" },
    { text: "Work-life balance support", score: 79, module: "Employee Experience" },
    { text: "Innovation encouragement", score: 77, module: "Leadership" }
  ];

  // Questions needing attention (mock data)
  const attentionQuestions = [
    { text: "AI tool adoption readiness", score: 45, module: "AI Readiness" },
    { text: "Change management communication", score: 52, module: "Leadership" },
    { text: "Career development opportunities", score: 58, module: "Employee Experience" }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="responses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="responses">My Responses</TabsTrigger>
          <TabsTrigger value="results">My Results</TabsTrigger>
        </TabsList>

        <TabsContent value="responses" className="space-y-6">
          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Participants</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalParticipants}</div>
                <p className="text-xs text-gray-600 mt-1">Across all modules</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Surveys Completed</CardTitle>
                <FileText className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedSurveys}</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-green-600">+12% from last month</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Respondents</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeRespondents}</div>
                <p className="text-xs text-gray-600 mt-1">Currently taking surveys</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Response Rate</CardTitle>
                <Target className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{responseRate}%</div>
                <div className="mt-2">
                  <Progress value={responseRate} className="h-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Survey Volume Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Survey Volume Trend</CardTitle>
                <CardDescription>Monthly response activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="responses" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Response Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Response Distribution</CardTitle>
                <CardDescription>Participation by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={demographicData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {demographicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Participation']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {demographicData.map((item) => (
                    <Badge key={item.name} variant="outline" className="text-xs">
                      <div 
                        className="w-2 h-2 rounded-full mr-1" 
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {/* Live Module Scores - filtered by available modules */}
          <div className={`grid grid-cols-1 gap-4 ${
            availableModules.length === 1 ? 'md:grid-cols-1' :
            availableModules.length === 2 ? 'md:grid-cols-2' :
            'md:grid-cols-3'
          }`}>
            {availableModules.includes('ai-readiness') && (
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">AI Readiness</CardTitle>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600">+2.3%</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">
                    {overallAverages.aiReadiness.toFixed(1)}%
                  </div>
                  {/* showing only the positive percentage value as requested */}
                </CardContent>
              </Card>
            )}

            {availableModules.includes('leadership') && (
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Leadership</CardTitle>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600">+1.8%</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">
                    {overallAverages.leadership.toFixed(1)}%
                  </div>
                  {/* showing only the positive percentage value as requested */}
                </CardContent>
              </Card>
            )}

            {availableModules.includes('employee-experience') && (
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">Employee Experience</CardTitle>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-xs text-red-600">-0.5%</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">
                    {overallAverages.employeeExperience.toFixed(1)}%
                  </div>
                  {/* showing only the positive percentage value as requested */}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Replace overall and question review with the user's responses list */}
          <div className="space-y-6">
            <MyResponsesResults module={activeModule ?? availableModules[0] ?? 'employee-experience'} userId={userId ?? ''} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}