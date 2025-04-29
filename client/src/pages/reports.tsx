import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/layouts/app-layout";
import { LogAnalyzer } from "@/components/reports/log-analyzer";
import { EnergyReports } from "@/components/reports/energy-reports";
import { PredictiveAnalysis } from "@/components/reports/predictive-analysis";
import { FrequencyReports } from "@/components/reports/frequency-reports";
import { ReportGenerator } from "@/components/reports/report-generator";
import { Helmet } from "react-helmet";
import { useLanguage } from "@/hooks/use-language";
import { 
  AlertCircle, 
  BarChart, 
  Brain, 
  CalendarClock, 
  FileText, 
  PieChart, 
  Zap,
  FileOutput
} from "lucide-react";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("generator");
  const { t } = useLanguage();
  
  return (
    <AppLayout>
      <Helmet>
        <title>{t('reports')} & {t('analytics')} | {t('app_name')}</title>
      </Helmet>
      
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('reports')} & {t('analytics')}</h1>
            <p className="text-muted-foreground">
              {t('generate')} {t('report_standard')}, {t('view')} {t('system_logs')}, {t('analytics')} {t('energy')}
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full md:w-auto">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <FileOutput className="h-4 w-4" />
              <span className="hidden md:inline">{t('report_generator')}</span>
              <span className="inline md:hidden">{t('generate')}</span>
            </TabsTrigger>
            <TabsTrigger value="frequency" className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              <span className="hidden md:inline">{t('kpi_reports')}</span>
              <span className="inline md:hidden">KPIs</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">{t('system_logs')}</span>
              <span className="inline md:hidden">{t('logs')}</span>
            </TabsTrigger>
            <TabsTrigger value="energy" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden md:inline">{t('energy_reports')}</span>
              <span className="inline md:hidden">{t('energy')}</span>
            </TabsTrigger>
            <TabsTrigger value="predictive" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden md:inline">{t('predictions')}</span>
              <span className="inline md:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="hidden md:inline">{t('alerts_analysis')}</span>
              <span className="inline md:hidden">{t('alerts')}</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden md:inline">{t('performance_analytics')}</span>
              <span className="inline md:hidden">{t('analytics')}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="generator" className="mt-6">
            <ReportGenerator />
          </TabsContent>
          
          <TabsContent value="frequency" className="mt-6">
            <FrequencyReports />
          </TabsContent>
          
          <TabsContent value="logs" className="mt-6">
            <LogAnalyzer />
          </TabsContent>
          
          <TabsContent value="energy" className="mt-6">
            <EnergyReports />
          </TabsContent>
          
          <TabsContent value="predictive" className="mt-6">
            <PredictiveAnalysis />
          </TabsContent>
          
          <TabsContent value="alerts" className="mt-6">
            <AlertsAnalysis />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <PerformanceAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

// Placeholder components for future implementation
function AlertsAnalysis() {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <PieChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('alerts_analysis')}</h3>
          <p className="text-gray-500 max-w-md">
            This feature is coming soon. The alerts analysis will provide insights into system alerts, 
            patterns, and resolution times.
          </p>
        </div>
      </div>
    </div>
  );
}

function PerformanceAnalytics() {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('performance_analytics')}</h3>
          <p className="text-gray-500 max-w-md">
            This feature is coming soon. The performance analytics will provide more detailed insights 
            into system efficiency, response times, and operational metrics.
          </p>
        </div>
      </div>
    </div>
  );
}