import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Brain, Users, Heart, ExternalLink, Copy } from 'lucide-react';
import { generateStandaloneModuleUrl } from '../utils/surveyManagement';
import { toast } from 'sonner@2.0.3';

export function StandaloneSurveyLinks() {
  const baseUrl = window.location.origin;
  
  const surveys = [
    {
      id: 'ai-readiness',
      title: 'AI Readiness Survey',
      description: 'Standalone AI readiness assessment for companies',
      icon: <Brain className="h-6 w-6" />,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      exampleUrl: generateStandaloneModuleUrl('ai-readiness', 'company-abc-001', baseUrl)
    },
    {
      id: 'leadership',
      title: 'Leadership Survey',
      description: 'Standalone leadership effectiveness assessment',
      icon: <Users className="h-6 w-6" />,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      exampleUrl: generateStandaloneModuleUrl('leadership', 'company-xyz-002', baseUrl)
    },
    {
      id: 'employee-experience',
      title: 'Employee Experience Survey',
      description: 'Standalone employee satisfaction assessment',
      icon: <Heart className="h-6 w-6" />,
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      exampleUrl: generateStandaloneModuleUrl('employee-experience', 'company-def-003', baseUrl)
    }
  ];

  const copyToClipboard = (url: string, title: string) => {
    navigator.clipboard.writeText(url);
    toast.success(`${title} URL copied to clipboard!`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Three Standalone Survey Dashboards</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Each company receives a unique link to their specific survey module. 
          No module selection screen - they go directly to their survey and see only their results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {surveys.map((survey) => (
          <Card key={survey.id} className={`${survey.borderColor} border-2`}>
            <CardHeader className={survey.bgColor}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-white ${survey.textColor}`}>
                  {survey.icon}
                </div>
              </div>
              <CardTitle className={survey.textColor}>{survey.title}</CardTitle>
              <CardDescription>{survey.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600">Example URL:</label>
                <div className="p-3 bg-gray-50 rounded border text-xs font-mono break-all">
                  {survey.exampleUrl}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => window.open(survey.exampleUrl, '_blank')}
                  className="flex-1 gap-2"
                  variant="default"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Survey
                </Button>
                <Button
                  onClick={() => copyToClipboard(survey.exampleUrl, survey.title)}
                  variant="outline"
                  size="icon"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="pt-2 border-t space-y-1">
                <p className="text-xs font-semibold text-gray-700">Flow:</p>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>Direct to survey (no menu)</li>
                  <li>Answer module questions</li>
                  <li>View personal responses</li>
                  <li>See benchmarks & insights</li>
                  <li>Complete isolated experience</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">URL Format for Your Sales:</h3>
            <div className="space-y-2">
              <div className="p-3 bg-white rounded border font-mono text-sm">
                <span className="text-gray-500">{baseUrl}?</span>
                <span className="text-blue-600">module=</span>
                <span className="text-green-600">[ai-readiness|leadership|employee-experience]</span>
                <span className="text-gray-500">&</span>
                <span className="text-blue-600">surveyId=</span>
                <span className="text-purple-600">[unique-company-id]</span>
              </div>
              <p className="text-sm text-gray-600">
                Replace <code className="text-xs bg-white px-1 py-0.5 rounded">[unique-company-id]</code> with 
                a unique identifier for each company you sell to.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">What Each Module Includes:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">AI Readiness</h4>
                </div>
                <ul className="text-xs space-y-1 text-gray-700">
                  <li>• 6 focused questions</li>
                  <li>• 3-5 minute completion time</li>
                  <li>• Strategy & Leadership analysis</li>
                  <li>• Infrastructure & Skills breakdown</li>
                  <li>• Data & Culture insights</li>
                  <li>• Individual response review</li>
                  <li>• Benchmark comparisons</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Leadership</h4>
                </div>
                <ul className="text-xs space-y-1 text-gray-700">
                  <li>• 8 comprehensive questions</li>
                  <li>• 4-6 minute completion time</li>
                  <li>• Strategic Vision assessment</li>
                  <li>• Team Development metrics</li>
                  <li>• Communication analysis</li>
                  <li>• Decision Making evaluation</li>
                  <li>• Leadership effectiveness scores</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">Employee Experience</h4>
                </div>
                <ul className="text-xs space-y-1 text-gray-700">
                  <li>• 16 detailed questions</li>
                  <li>• 8-10 minute completion time</li>
                  <li>• Work Environment insights</li>
                  <li>• Career Growth analysis</li>
                  <li>• Recognition & Rewards data</li>
                  <li>• Work-Life Balance metrics</li>
                  <li>• Comprehensive engagement scores</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
