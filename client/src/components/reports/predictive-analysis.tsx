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
  
  // Fetch advanced predictive analysis data
  const { 
    data: predictiveAnalysisData, 
    isLoading: isLoadingPredictiveAnalysis, 
    error: predictiveAnalysisError,
    refetch: refetchPredictiveAnalysis
  } = useQuery<{ 
    analysis: {
      recommendations: {
        category: 'system' | 'network' | 'equipment' | 'energy' | 'security';
        title: string;
        description: string;
        impact: 'low' | 'medium' | 'high';
        timeToImplement: 'immediate' | 'short-term' | 'long-term';
        estimatedImprovement: string;
        relatedMetrics: string[];
        priorityScore: number;
      }[];
      predictiveInsights: {
        component: string;
        pattern: string;
        prediction: string;
        timeframe: string;
        confidence: number;
      }[];
      maintenanceForecast: {
        equipment: string;
        currentStatus: string;
        predictedFailureWindow: string;
        recommendedAction: string;
        urgency: 'low' | 'medium' | 'high';
      }[];
      systemHealthScore: number;
      summaryReport: string;
    },
    samples: {
      logs: any[];
      energy: any[];
      equipment: any[];
    }
  }>({
    queryKey: ["/api/predictive-analysis", timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/predictive-analysis?timeRange=${timeRange}`);
      if (!res.ok) throw new Error("Failed to fetch predictive analysis");
      return await res.json();
    },
    refetchOnWindowFocus: false
  });
  
  // Fetch log analysis data for fallback and additional context
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
    refetchOnWindowFocus: false,
    enabled: !predictiveAnalysisData || !!predictiveAnalysisError // Only fetch if predictive analysis fails
  });
  
  // Fetch energy recommendations as fallback
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
    refetchOnWindowFocus: false,
    enabled: !predictiveAnalysisData || !!predictiveAnalysisError // Only fetch if predictive analysis fails
  });
  
  // Handle refresh of analysis
  const handleRefreshAnalysis = () => {
    refetchPredictiveAnalysis();
    if (!predictiveAnalysisData || predictiveAnalysisError) {
      refetchLogAnalysis();
      refetchEnergyRecommendations();
    }
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
  if (isLoadingPredictiveAnalysis || ((!predictiveAnalysisData || predictiveAnalysisError) && (isLoadingLogAnalysis || isLoadingEnergyRecommendations))) {
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
  
  // Handle error state for all API endpoints
  if (predictiveAnalysisError && logAnalysisError && energyRecommendationsError) {
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
              {(predictiveAnalysisError as Error).message}
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
  
  // Use advanced predictive analysis when available
  const hasAdvancedData = !!predictiveAnalysisData;
  
  // Extract basic analysis data
  const logAnalysis = logAnalysisData?.analysis;
  const energyData = energyRecommendationsData?.recommendations;
  
  // Determine data source based on availability
  const analysisData = hasAdvancedData 
    ? predictiveAnalysisData!.analysis 
    : {
        systemHealthScore: energyData?.efficiencyScore || 50,
        summaryReport: logAnalysis?.summary || "Analysis summary not available.",
        recommendations: [],
        predictiveInsights: [],
        maintenanceForecast: []
      };
  
  // Get the appropriate data for different sections based on what's available
  const potentialIssues = hasAdvancedData 
    ? [] // Advanced analysis doesn't have the same issues structure
    : logAnalysis?.potentialIssues || [];
  
  const performanceInsights = hasAdvancedData 
    ? [] // Advanced analysis doesn't have the same insights structure
    : logAnalysis?.performanceInsights || [];
  
  const anomalies = hasAdvancedData 
    ? [] // Advanced analysis doesn't have the same anomalies structure
    : logAnalysis?.anomalies || [];
  
  const recommendations = hasAdvancedData 
    ? analysisData.recommendations 
    : [];
  
  const predictiveInsights = hasAdvancedData 
    ? analysisData.predictiveInsights 
    : [];
  
  const maintenanceForecast = hasAdvancedData 
    ? analysisData.maintenanceForecast 
    : [];
  
  const energyRecommendations = hasAdvancedData 
    ? [] // We'll use the predictive analysis for energy recommendations when available
    : energyData?.recommendations || [];
  
  const efficiencyScore = hasAdvancedData 
    ? analysisData.systemHealthScore 
    : energyData?.efficiencyScore || 50;
  
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
              <p className="text-sm">{hasAdvancedData ? analysisData.summaryReport : logAnalysisData?.analysis.summary}</p>
            </div>
            <div className="flex flex-col items-center justify-center px-4 min-w-[140px]">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {hasAdvancedData ? "System Health" : "Efficiency Score"}
              </h3>
              <div className={`flex items-center justify-center w-16 h-16 rounded-full border-4 ${
                efficiencyScore > 75 ? "border-green-200 bg-green-50" : 
                efficiencyScore > 50 ? "border-amber-200 bg-amber-50" :
                "border-red-200 bg-red-50"
              }`}>
                <span className={`text-xl font-bold ${
                  efficiencyScore > 75 ? "text-green-600" : 
                  efficiencyScore > 50 ? "text-amber-600" :
                  "text-red-600"
                }`}>{efficiencyScore}%</span>
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
            {!hasAdvancedData && potentialIssues.length > 0 ? (
              <div className="space-y-4">
                {potentialIssues.map((issue, index) => (
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
            ) : hasAdvancedData && recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations
                  .filter(rec => rec.impact === 'high' || rec.priorityScore > 70)
                  .map((rec, index) => (
                    <Card key={index} className="shadow-sm">
                      <CardHeader className="py-4 px-5">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <CardTitle className="text-base">{rec.title}</CardTitle>
                            <CardDescription>
                              Category: {rec.category.charAt(0).toUpperCase() + rec.category.slice(1)}
                            </CardDescription>
                          </div>
                          <SeverityBadge severity={rec.impact} />
                        </div>
                      </CardHeader>
                      <CardContent className="py-0 px-5">
                        <div className="text-sm">
                          <p>{rec.description}</p>
                          <div className="mt-3 p-3 border rounded bg-gray-50">
                            <div className="flex gap-2 mb-1">
                              <Lightbulb className="h-4 w-4 text-amber-500" />
                              <h4 className="font-medium">Improvement:</h4>
                            </div>
                            <p>{rec.estimatedImprovement}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="py-3 px-5 bg-muted/20 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Priority Score: {rec.priorityScore}/100</span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded">
                <div className="flex gap-2 items-center">
                  <Award className="h-5 w-5" />
                  <p className="font-medium">No critical issues detected</p>
                </div>
                <p className="mt-1 text-sm">
                  The system appears to be running smoothly without any significant issues.
                </p>
              </div>
            )}
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">
                {hasAdvancedData ? "Predictive Insights" : "Anomaly Detection"}
              </h3>
              <div className="space-y-3">
                {!hasAdvancedData && anomalies.length > 0 ? (
                  anomalies.map((anomaly, index) => (
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
                  ))
                ) : hasAdvancedData && predictiveInsights.length > 0 ? (
                  predictiveInsights.map((insight, index) => (
                    <div 
                      key={index}
                      className="border rounded p-3 bg-indigo-50/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-2">
                          <SearchCheck className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium">{insight.component}</h4>
                            <p className="text-sm">Pattern: {insight.pattern}</p>
                            <div className="mt-2">
                              <h5 className="text-sm font-medium text-indigo-700">Prediction:</h5>
                              <p className="text-sm">{insight.prediction}</p>
                            </div>
                            <p className="text-xs mt-1 text-muted-foreground">
                              Expected timeframe: {insight.timeframe}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Confidence: {Math.round(insight.confidence * 100)}%
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
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
            
            {hasAdvancedData && maintenanceForecast.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Maintenance Forecast</h3>
                <div className="space-y-3">
                  {maintenanceForecast.map((forecast, index) => (
                    <div 
                      key={index}
                      className={`border rounded p-3 ${
                        forecast.urgency === 'high' ? 'bg-red-50/30' :
                        forecast.urgency === 'medium' ? 'bg-amber-50/30' :
                        'bg-blue-50/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-2">
                          <Wrench className={`h-5 w-5 ${
                            forecast.urgency === 'high' ? 'text-red-600' :
                            forecast.urgency === 'medium' ? 'text-amber-600' :
                            'text-blue-600'
                          } mt-0.5`} />
                          <div>
                            <h4 className="font-medium">{forecast.equipment}</h4>
                            <p className="text-sm">Status: {forecast.currentStatus}</p>
                            <div className="mt-2">
                              <h5 className="text-sm font-medium">Recommended action:</h5>
                              <p className="text-sm">{forecast.recommendedAction}</p>
                            </div>
                            <p className="text-xs mt-1 text-muted-foreground">
                              Predicted failure window: {forecast.predictedFailureWindow}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`
                          ${forecast.urgency === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                          forecast.urgency === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'}
                          capitalize
                        `}>
                          {forecast.urgency} urgency
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4 mt-2">
            <div className="space-y-4">
              {!hasAdvancedData && performanceInsights.length > 0 ? (
                performanceInsights.map((insight, index) => (
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
                ))
              ) : hasAdvancedData && recommendations.length > 0 ? (
                recommendations
                  .filter(rec => rec.category !== 'energy') // Filter energy recommendations for the Energy tab
                  .map((rec, index) => (
                    <Card key={index} className="shadow-sm">
                      <CardHeader className="py-4 px-5">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              {rec.category === 'system' && <ServerCog className="h-4 w-4 text-primary" />}
                              {rec.category === 'network' && <Network className="h-4 w-4 text-indigo-500" />}
                              {rec.category === 'equipment' && <Settings2 className="h-4 w-4 text-amber-500" />}
                              {rec.category === 'security' && <ShieldCheck className="h-4 w-4 text-red-500" />}
                              <span>{rec.title}</span>
                            </CardTitle>
                            <CardDescription>
                              Implementation: {rec.timeToImplement}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className={`
                            ${rec.impact === 'high' ? 'bg-green-50 text-green-700 border-green-200' :
                            rec.impact === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'}
                            capitalize
                          `}>
                            {rec.impact} impact
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="py-0 px-5">
                        <div className="mb-3 text-sm">{rec.description}</div>
                        <div className="mt-3 p-3 border rounded bg-gray-50 text-sm">
                          <div className="flex gap-2 mb-1">
                            <Gauge className="h-4 w-4 text-indigo-500" />
                            <h4 className="font-medium">Affected Metrics:</h4>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rec.relatedMetrics.map((metric, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                {metric}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="py-3 px-5 bg-muted/20 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>Estimated improvement: {rec.estimatedImprovement}</span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
              ) : (
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
                className={`h-2 ${
                  efficiencyScore >= 80 ? "[--progress-foreground:theme(colors.green.500)]" : 
                  efficiencyScore >= 60 ? "[--progress-foreground:theme(colors.amber.500)]" : 
                  "[--progress-foreground:theme(colors.red.500)]"
                }`} 
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
                          <BatteryMedium className={
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