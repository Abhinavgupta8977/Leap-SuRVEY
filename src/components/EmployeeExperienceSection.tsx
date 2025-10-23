import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { DriverResult } from '../utils/calculations';

interface EmployeeExperienceSectionProps {
  categoryData: DriverResult[];
  driverData: DriverResult[];
  overallPercentage: number;
  distribution: { '0-10': Record<number, number>; '1-5': Record<number, number> };
}

export function EmployeeExperienceSection({ 
  categoryData, 
  driverData, 
  overallPercentage,
  distribution 
}: EmployeeExperienceSectionProps) {
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-green-600">
            Positive Responses: {data.positivePercentage.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">
            {data.positiveCount} of {data.totalCount} responses
          </p>
        </div>
      );
    }
    return null;
  };

  // Sort data by positive percentage
  const sortedCategoryData = [...categoryData].sort((a, b) => b.positivePercentage - a.positivePercentage);
  const sortedDriverData = [...driverData].sort((a, b) => b.positivePercentage - a.positivePercentage);

  // Prepare distribution data for charts
  const distribution1to5 = Object.entries(distribution['1-5']).map(([score, count]) => ({
    score: `${score}`,
    count,
    isPositive: parseInt(score) >= 4
  }));

  const distribution0to10 = Object.entries(distribution['0-10']).map(([score, count]) => ({
    score: `${score}`,
    count,
    isPositive: parseInt(score) >= 7
  }));

  const COLORS = {
    positive: '#16a34a',
    neutral: '#6b7280'
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Gauge */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Experience Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {overallPercentage.toFixed(1)}%
              </div>
              <div className="text-lg font-medium text-gray-700">
                Overall Positive Experience
              </div>
              <div className="mt-4 w-64">
                <Progress value={overallPercentage} className="h-3" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Category</CardTitle>
          <p className="text-sm text-muted-foreground">
            Positive response rates across employee experience categories
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedCategoryData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="driver" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  domain={[0, 100]}
                  label={{ value: 'Positive %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="positivePercentage" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {sortedCategoryData.map((category) => (
              <div key={category.driver} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {category.positivePercentage.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-gray-700">{category.driver}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {category.positiveCount}/{category.totalCount} positive
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drivers Detailed View */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Driver Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4 text-green-700">Top Performing Drivers</h4>
              <div className="space-y-3">
                {sortedDriverData.slice(0, 6).map((driver) => (
                  <div key={driver.driver} className="p-3 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-800 flex-1 pr-2">
                        {driver.driver}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {driver.positivePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${driver.positivePercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4 text-orange-700">Areas for Improvement</h4>
              <div className="space-y-3">
                {sortedDriverData.slice(-6).reverse().map((driver) => (
                  <div key={driver.driver} className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-800 flex-1 pr-2">
                        {driver.driver}
                      </span>
                      <span className="text-lg font-bold text-orange-600">
                        {driver.positivePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full" 
                        style={{ width: `${driver.positivePercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Response Distribution Context</CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribution of responses across different scales
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4">1-5 Scale Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={distribution1to5}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="score" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill={(entry: any) => entry?.isPositive ? COLORS.positive : COLORS.neutral}
                  >
                    {distribution1to5.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isPositive ? COLORS.positive : COLORS.neutral} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">0-10 Scale Distribution (NPS)</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={distribution0to10}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="score" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill={(entry: any) => entry?.isPositive ? COLORS.positive : COLORS.neutral}
                  >
                    {distribution0to10.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isPositive ? COLORS.positive : COLORS.neutral} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}