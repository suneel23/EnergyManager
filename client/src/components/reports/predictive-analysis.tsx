import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart4,
  Brain,
  ChevronRight,
  FlaskConical,
  LineChart,
  Lightbulb,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Zap,
  BatteryMedium
} from "lucide-react";

// Define the shape of the AI analysis response
interface LogAnalysisResult {
  potentialIssues: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedComponents: string[];
    recommendation: string;
  }[];
  performanceInsights: {
    area: string;
    description: string;
    trend: 'improving' | 'stable' | 'degrading';
    recommendation: string;
  }[];
  anomalies: {
    component: string;
    description: string;
    confidence: number;
    suggestedAction: string;
  }[];
  summary: string;
}

interface EnergyRecommendation {
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  implementationEffort: 'easy' | 'moderate' | 'complex';
  estimatedSavings?: string;
}

interface EnergyRecommendationResult {
  recommendations: EnergyRecommendation[];
  efficiencyScore: number;
  summary: string;
}

export function PredictiveAnalysis() {
  const [timeRange, setTimeRange] = useState("7d");
  const [activeTab, setActiveTab] = useState("issues");
  
  // Fetch log analysis data
  const { 
    data: logAnalysisData, 
    isLoading: isLoadingLogAnalysis, 
    error: logAnalysisError,
    refetch: refetchLogAnalysis
  } = useQuery<{ logs: any[]; analysis: LogAnalysisResult }>({
    queryKey: ["/api/logs/analysis", timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/logs/analysis?timeRange=${timeRange}`);
      if (!res.ok) throw new Error("Failed to fetch log analysis");
      return await res.json();
    },
    refetchOnWindowFocus: false
  });
  
  // Fetch energy recommendations
  const { 
    data: energyRecommendationsData, 
    isLoading: isLoadingEnergyRecommendations, 
    error: energyRecommendationsError,
    refetch: refetchEnergyRecommendations
  } = useQuery<{ 
    recommendations: EnergyRecommendationResult; 
    energyDataSample: any[];
    equipmentDataSample: any[];
  }>({
    queryKey: ["/api/recommendations/energy"],
    queryFn: async () => {
      const res = await fetch("/api/recommendations/energy");
      if (!res.ok) throw new Error("Failed to fetch energy recommendations");
      return await res.json();
    },
    refetchOnWindowFocus: false
  });
  
  // Handle refresh of analysis
  const handleRefreshAnalysis = () => {
    refetchLogAnalysis();
    refetchEnergyRecommendations();
  };
  
  // Severity badge component
  const SeverityBadge = ({ severity }: { severity: 'low' | 'medium' | 'high' | 'critical' }) => {
    const getColor = () => {
      switch (severity) {
        case 'low': return "bg-blue-50 text-blue-700 border-blue-200";
        case 'medium': return "bg-amber-50 text-amber-700 border-amber-200";
        case 'high': return "bg-orange-50 text-orange-700 border-orange-200";
        case 'critical': return "bg-red-50 text-red-700 border-red-200";
        default: return "bg-gray-50 text-gray-700 border-gray-200";
      }
    };
    
    return (
      <Badge variant="outline" className={`${getColor()} capitalize font-medium`}>
        {severity}
      </Badge>
    );
  };
  
  // Trend indicator component
  const TrendIndicator = ({ trend }: { trend: 'improving' | 'stable' | 'degrading' }) => {
    const getStyle = () => {
      switch (trend) {
        case 'improving': return { color: 'text-green-600', icon: <ArrowRight className="h-4 w-4 rotate-[-45deg]" /> };
        case 'stable': return { color: 'text-blue-600', icon: <ArrowRight className="h-4 w-4" /> };
        case 'degrading': return { color: 'text-red-600', icon: <ArrowRight className="h-4 w-4 rotate-45" /> };
        default: return { color: 'text-gray-600', icon: <ArrowRight className="h-4 w-4" /> };
      }
    };
    
    const style = getStyle();
    
    return (
      <Badge variant="outline" className={`${style.color} bg-opacity-10 capitalize font-medium flex items-center gap-1`}>
        {style.icon}
        <span>{trend}</span>
      </Badge>
    );
  };
  
  // Handle loading state
  if (isLoadingLogAnalysis || isLoadingEnergyRecommendations) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <span>AI-Powered Predictive Analysis</span>
          </CardTitle>
          <CardDescription>
            Loading system analysis and recommendations...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Handle error state
  if (logAnalysisError || energyRecommendationsError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>Analysis Error</span>
          </CardTitle>
          <CardDescription>
            There was an error loading the predictive analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {logAnalysisError ? (logAnalysisError as Error).message : (energyRecommendationsError as Error).message}
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshAnalysis}
                  className="gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // Destructure data for easier access
  const { analysis } = logAnalysisData!;
  const { recommendations: energyRecommendations } = energyRecommendationsData!.recommendations;
  const efficiencyScore = energyRecommendationsData!.recommendations.efficiencyScore;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>AI-Powered Predictive Analysis</span>
            </CardTitle>
            <CardDescription>
              Proactive insights and recommendations based on system data
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              size="icon"
              onClick={handleRefreshAnalysis}
              title="Refresh Analysis"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="px-6 py-4 bg-muted/50">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Executive Summary</h3>
              <p className="text-sm">{analysis.summary}</p>
            </div>
            <div className="flex flex-col items-center justify-center px-4 min-w-[140px]">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Efficiency Score</h3>
              <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-primary-100 bg-primary-50">
                <span className="text-xl font-bold text-primary">{efficiencyScore}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="issues" className="flex items-center gap-1">
              <ShieldAlert className="h-4 w-4" />
              <span className="hidden md:inline">Potential Issues</span>
              <span className="inline md:hidden">Issues</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1">
              <LineChart className="h-4 w-4" />
              <span className="hidden md:inline">Performance Insights</span>
              <span className="inline md:hidden">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="energy" className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <span className="hidden md:inline">Energy Optimization</span>
              <span className="inline md:hidden">Energy</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="issues" className="space-y-4 mt-2">
            {analysis.potentialIssues.length > 0 ? (
              <div className="space-y-4">
                {analysis.potentialIssues.map((issue, index) => (
                  <Card key={index} className="shadow-sm">
                    <CardHeader className="py-4 px-5">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{issue.description}</CardTitle>
                          <CardDescription>
                            Affects: {issue.affectedComponents.join(', ')}
                          </CardDescription>
                        </div>
                        <SeverityBadge severity={issue.severity} />
                      </div>
                    </CardHeader>
                    <CardContent className="py-0 px-5">
                      <div className="text-sm">
                        <h4 className="font-medium mb-1">Recommendation:</h4>
                        <p>{issue.recommendation}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="py-3 px-5 bg-muted/20 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Priority: {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}</span>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded">
                <div className="flex gap-2 items-center">
                  <Award className="h-5 w-5" />
                  <p className="font-medium">No potential issues detected</p>
                </div>
                <p className="mt-1 text-sm">
                  The system appears to be running smoothly without any significant issues.
                </p>
              </div>
            )}
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Anomaly Detection</h3>
              <div className="space-y-3">
                {analysis.anomalies.map((anomaly, index) => (
                  <div 
                    key={index}
                    className="border rounded p-3 bg-amber-50/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-2">
                        <FlaskConical className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">{anomaly.component}</h4>
                          <p className="text-sm">{anomaly.description}</p>
                          <div className="mt-2 flex items-center gap-1 text-sm">
                            <ChevronRight className="h-4 w-4 text-amber-600" />
                            <span>{anomaly.suggestedAction}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Confidence: {Math.round(anomaly.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
                
                {analysis.anomalies.length === 0 && (
                  <div className="border rounded p-3 bg-slate-50 text-slate-700">
                    <div className="flex gap-2">
                      <div className="mt-0.5">
                        <FlaskConical className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">No anomalies detected</h4>
                        <p className="text-sm">
                          System behavior appears to be within normal operating parameters.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4 mt-2">
            <div className="space-y-4">
              {analysis.performanceInsights.map((insight, index) => (
                <Card key={index} className="shadow-sm">
                  <CardHeader className="py-4 px-5">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{insight.area}</CardTitle>
                      <TrendIndicator trend={insight.trend} />
                    </div>
                  </CardHeader>
                  <CardContent className="py-0 px-5">
                    <div className="mb-3 text-sm">{insight.description}</div>
                    <div className="p-3 border rounded bg-gray-50 text-sm">
                      <div className="flex gap-2 mb-1">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        <h4 className="font-medium">Recommendation:</h4>
                      </div>
                      <p>{insight.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {analysis.performanceInsights.length === 0 && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded">
                  <div className="flex gap-2 items-center">
                    <BarChart4 className="h-5 w-5" />
                    <p className="font-medium">No performance insights available</p>
                  </div>
                  <p className="mt-1 text-sm">
                    There's not enough data to generate meaningful performance insights at this time.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="energy" className="space-y-4 mt-2">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Energy Efficiency Score</h3>
                <span className="text-sm">{efficiencyScore}%</span>
              </div>
              <Progress 
                value={efficiencyScore} 
                className="h-2" 
                indicatorClassName={
                  efficiencyScore >= 80 ? "bg-green-500" : 
                  efficiencyScore >= 60 ? "bg-amber-500" : 
                  "bg-red-500"
                }
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Needs Improvement</span>
                <span>Excellent</span>
              </div>
            </div>
            
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium mb-2">Energy Optimization Recommendations</h3>
                
                {energyRecommendations.map((rec, index) => (
                  <Card key={index} className="shadow-sm">
                    <CardHeader className="py-3 px-5">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Lightning className={
                            rec.impact === 'high' ? "text-green-500" : 
                            rec.impact === 'medium' ? "text-amber-500" : 
                            "text-blue-500"
                          } />
                          <span>{rec.title}</span>
                        </CardTitle>
                        <Badge 
                          variant="outline" 
                          className={
                            rec.impact === 'high' ? "bg-green-50 text-green-700 border-green-200" : 
                            rec.impact === 'medium' ? "bg-amber-50 text-amber-700 border-amber-200" : 
                            "bg-blue-50 text-blue-700 border-blue-200"
                          }
                        >
                          {rec.impact} impact
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="py-0 px-5">
                      <p className="text-sm">{rec.description}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-slate-50">
                          Effort: {rec.implementationEffort}
                        </Badge>
                        {rec.estimatedSavings && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Est. Savings: {rec.estimatedSavings}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {energyRecommendations.length === 0 && (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded">
                    <p className="font-medium">No optimization recommendations available</p>
                    <p className="mt-1 text-sm">
                      The system appears to be running at optimal efficiency levels.
                    </p>
                  </div>
                )}
                
                <Separator className="my-4" />
                
                <div className="p-4 border rounded bg-blue-50/30">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <span>Analysis Summary</span>
                  </h3>
                  <p className="text-sm">
                    {energyRecommendationsData!.recommendations.summary}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}