import React, { useState, useEffect } from 'react';
import { BarChart3, Users, UserCheck, UserX, Clock, Calendar, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/client';
import type { SummaryResponse } from '../api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Summary: React.FC = () => {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchSummary();
  }, [classFilter]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getSummary(classFilter === 'all' ? undefined : classFilter);
      setSummary(response);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load summary. Please try again.';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'new':
        return <Users className="w-6 h-6" />;
      case 'contacted':
        return <Clock className="w-6 h-6" />;
      case 'scheduled':
        return <Calendar className="w-6 h-6" />;
      case 'admitted':
        return <UserCheck className="w-6 h-6" />;
      case 'lost':
        return <UserX className="w-6 h-6" />;
      default:
        return <Users className="w-6 h-6" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'new':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'contacted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'scheduled':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'admitted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'lost':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'new':
        return 'New';
      case 'contacted':
        return 'Contacted';
      case 'scheduled':
        return 'Scheduled';
      case 'admitted':
        return 'Admitted';
      case 'lost':
        return 'Lost';
      default:
        return stage;
    }
  };

  const calculateConversionRate = () => {
    if (!summary || summary.total === 0) return 0;
    return Math.round((summary.byStage.admitted / summary.total) * 100);
  };

  const calculatePercentage = (stage: string) => {
    if (!summary || summary.total === 0) return 0;
    return Math.round((summary.byStage[stage] / summary.total) * 100);
  };

  const handleRetry = () => {
    fetchSummary();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading summary...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Summary Dashboard</h1>
          </div>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Summary Dashboard</h1>
        </div>

        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            <SelectItem value="Pre-K">Pre-K</SelectItem>
            <SelectItem value="Kindergarten">Kindergarten</SelectItem>
            <SelectItem value="Grade 1">Grade 1</SelectItem>
            <SelectItem value="Grade 2">Grade 2</SelectItem>
            <SelectItem value="Grade 3">Grade 3</SelectItem>
            <SelectItem value="Grade 4">Grade 4</SelectItem>
            <SelectItem value="Grade 5">Grade 5</SelectItem>
            <SelectItem value="Grade 6">Grade 6</SelectItem>
            <SelectItem value="Grade 7">Grade 7</SelectItem>
            <SelectItem value="Grade 8">Grade 8</SelectItem>
            <SelectItem value="Grade 9">Grade 9</SelectItem>
            <SelectItem value="Grade 10">Grade 10</SelectItem>
            <SelectItem value="Grade 11">Grade 11</SelectItem>
            <SelectItem value="Grade 12">Grade 12</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {summary && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Enquiries</p>
                    <p className="text-3xl font-bold">{summary.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Admitted</p>
                    <p className="text-3xl font-bold">{summary.byStage.admitted}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">In Progress</p>
                    <p className="text-3xl font-bold">
                      {summary.byStage.contacted + summary.byStage.scheduled}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Conversion Rate</p>
                    <p className="text-3xl font-bold">{calculateConversionRate()}%</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stage Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Enquiries by Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(summary.byStage).map(([stage, count]) => (
                  <div
                    key={stage}
                    className={`p-4 rounded-lg border-2 ${getStageColor(stage)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStageIcon(stage)}
                        <span className="font-medium">{getStageLabel(stage)}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm opacity-75">
                        {calculatePercentage(stage)}% of total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Visual Progress Bar */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(summary.byStage)
                  .filter(([_, count]) => count > 0)
                  .map(([stage, count]) => (
                    <div key={stage} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{getStageLabel(stage)}</span>
                        <span className="text-gray-600">
                          {count} ({calculatePercentage(stage)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            stage === 'new'
                              ? 'bg-gray-400'
                              : stage === 'contacted'
                              ? 'bg-blue-400'
                              : stage === 'scheduled'
                              ? 'bg-yellow-400'
                              : stage === 'admitted'
                              ? 'bg-green-400'
                              : 'bg-red-400'
                          }`}
                          style={{
                            width: `${Math.max(calculatePercentage(stage), 2)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Summary;
