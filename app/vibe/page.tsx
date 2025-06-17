'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  Users,
  Target,
  Zap
} from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  progress: number;
  duration: number;
  metrics: {
    engagement: number;
    conversion: number;
    satisfaction: number;
  };
}

export default function Vibe() {
  const [activeTests, setActiveTests] = useState<TestResult[]>([
    {
      id: '1',
      name: 'Homepage Hero Section A/B Test',
      status: 'running',
      progress: 65,
      duration: 120,
      metrics: {
        engagement: 78,
        conversion: 12.5,
        satisfaction: 85
      }
    },
    {
      id: '2',
      name: 'Product Page Layout Test',
      status: 'completed',
      progress: 100,
      duration: 180,
      metrics: {
        engagement: 82,
        conversion: 15.2,
        satisfaction: 88
      }
    },
    {
      id: '3',
      name: 'Checkout Flow Optimization',
      status: 'pending',
      progress: 0,
      duration: 0,
      metrics: {
        engagement: 0,
        conversion: 0,
        satisfaction: 0
      }
    }
  ]);

  const [newTestName, setNewTestName] = useState('');

  const handleStartTest = () => {
    if (!newTestName.trim()) return;

    const newTest: TestResult = {
      id: Date.now().toString(),
      name: newTestName,
      status: 'running',
      progress: 0,
      duration: 0,
      metrics: {
        engagement: 0,
        conversion: 0,
        satisfaction: 0
      }
    };

    setActiveTests(prev => [...prev, newTest]);
    setNewTestName('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vibe TestBot</h1>
        <p className="text-gray-600">
          Automated A/B testing and user experience optimization
        </p>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Tests</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {/* Create New Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Create New Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  placeholder="Enter test name..."
                  className="flex-1"
                />
                <Button onClick={handleStartTest} disabled={!newTestName.trim()}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Test
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Tests List */}
          <div className="grid gap-4">
            {activeTests.map((test) => (
              <Card key={test.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <h3 className="font-semibold text-lg">{test.name}</h3>
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {test.status === 'running' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{test.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${test.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{test.duration}m</div>
                      <div className="text-sm text-gray-500">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{test.metrics.engagement}%</div>
                      <div className="text-sm text-gray-500">Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{test.metrics.conversion}%</div>
                      <div className="text-sm text-gray-500">Conversion</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{test.metrics.satisfaction}%</div>
                      <div className="text-sm text-gray-500">Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Best Performing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">Product Page Layout Test</div>
                  <div className="text-sm text-gray-600">+15.2% conversion rate</div>
                  <div className="text-sm text-gray-600">88% satisfaction score</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Total Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12,450</div>
                <div className="text-sm text-gray-600">Across all tests</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">78%</div>
                <div className="text-sm text-gray-600">Tests with positive results</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">User Engagement Patterns</h4>
                  <p className="text-blue-800 text-sm">
                    Users spend 23% more time on pages with simplified navigation and clear call-to-action buttons.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Conversion Optimization</h4>
                  <p className="text-green-800 text-sm">
                    Product pages with customer reviews visible above the fold show 18% higher conversion rates.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Mobile Experience</h4>
                  <p className="text-purple-800 text-sm">
                    Mobile users prefer single-column layouts with larger touch targets, resulting in 25% better satisfaction scores.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Implement winning variant</div>
                      <div className="text-sm text-gray-600">Deploy the product page layout that showed +15.2% conversion</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Test checkout flow</div>
                      <div className="text-sm text-gray-600">Run A/B test on the checkout process to reduce cart abandonment</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Mobile optimization</div>
                      <div className="text-sm text-gray-600">Focus next tests on mobile user experience improvements</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
