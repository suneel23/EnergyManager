import OpenAI from "openai";

// Initialize OpenAI client only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Interface for log analysis results
export interface LogAnalysisResult {
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

// Interface for performance recommendation results
export interface PerformanceRecommendation {
  category: 'system' | 'network' | 'equipment' | 'energy' | 'security';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  timeToImplement: 'immediate' | 'short-term' | 'long-term';
  estimatedImprovement: string;
  relatedMetrics: string[];
  priorityScore: number;
}

export interface PredictiveAnalysisResult {
  recommendations: PerformanceRecommendation[];
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
}

/**
 * Analyzes system logs to identify patterns, potential issues, and provide recommendations
 * @param logs Array of log entries to analyze
 * @returns Analysis results with potential issues, performance insights, and recommendations
 */
export async function analyzeSystemLogs(logs: any[]): Promise<LogAnalysisResult> {
  try {
    // Check if OpenAI client is available
    if (!openai) {
      throw new Error("OpenAI API key not configured");
    }
    
    // Prepare the logs for analysis
    // We'll limit to the most recent and relevant logs to avoid token limits
    const recentLogs = logs.slice(0, 100);
    
    // Format logs for the AI prompt
    const logsFormatted = recentLogs.map(log => 
      `[${log.timestamp}] [${log.severity}] [${log.component}] ${log.message}`
    ).join('\n');
    
    // Get component frequencies
    const componentFrequency: Record<string, number> = {};
    const severityByComponent: Record<string, Record<string, number>> = {};
    
    logs.forEach(log => {
      // Count component frequencies
      componentFrequency[log.component] = (componentFrequency[log.component] || 0) + 1;
      
      // Count severities by component
      if (!severityByComponent[log.component]) {
        severityByComponent[log.component] = {};
      }
      severityByComponent[log.component][log.severity] = 
        (severityByComponent[log.component][log.severity] || 0) + 1;
    });
    
    // Generate statistical summary for the model
    const componentStats = Object.entries(componentFrequency)
      .map(([component, count]) => {
        const severities = severityByComponent[component];
        return `Component "${component}": ${count} logs (${
          Object.entries(severities)
            .map(([severity, count]) => `${count} ${severity}`)
            .join(", ")
        })`;
      })
      .join("\n");
    
    // Define the analysis prompt
    const prompt = `
You are a highly specialized AI for analyzing energy management system logs. Your task is to identify patterns, potential issues, and provide actionable recommendations. The system contains components like equipment management, network infrastructure, authentication systems, metering, and power distribution control.

SYSTEM LOG STATISTICS:
${componentStats}

RECENT LOGS SAMPLE:
${logsFormatted}

Based on these logs, provide a comprehensive analysis in JSON format with the following structure:
{
  "potentialIssues": [
    {
      "severity": "low|medium|high|critical",
      "description": "Clear description of the issue",
      "affectedComponents": ["component names"],
      "recommendation": "Specific actionable recommendation"
    }
  ],
  "performanceInsights": [
    {
      "area": "Specific system area",
      "description": "Description of performance pattern",
      "trend": "improving|stable|degrading",
      "recommendation": "Performance optimization suggestion"
    }
  ],
  "anomalies": [
    {
      "component": "Component name",
      "description": "Description of the anomaly",
      "confidence": 0.95,
      "suggestedAction": "What to do about it"
    }
  ],
  "summary": "Brief executive summary of the analysis"
}

Focus on energy-related insights like consumption patterns, equipment efficiency, potential grid issues, and safety concerns.
Use specific examples from the logs to support your findings.
Limit to the most significant 2-4 items per category to ensure actionable results.
Provide specific, technically sound recommendations that would be appropriate for an energy management system.
`;

    // Call the OpenAI API for analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2048,
    });

    const messageContent = response.choices[0].message.content;
    const content = messageContent !== null && messageContent !== undefined ? messageContent : "{}";
    const result = JSON.parse(content);
    return result as LogAnalysisResult;
  } catch (error) {
    console.error("Error analyzing logs with AI:", error);
    // Return a fallback result when AI analysis fails
    return {
      potentialIssues: [
        {
          severity: 'medium',
          description: 'Unable to complete full AI analysis at this time.',
          affectedComponents: ['ai-analysis-service'],
          recommendation: 'Please try again later or check API key configuration.'
        }
      ],
      performanceInsights: [],
      anomalies: [],
      summary: 'AI analysis service encountered an error. Basic log review is still available.'
    };
  }
}

/**
 * Generates energy performance recommendations based on measurements and system state
 * @param energyData Recent energy measurement data
 * @param equipmentData Equipment information
 * @returns Specific recommendations for energy optimization
 */
export async function generateEnergyRecommendations(
  energyData: any[],
  equipmentData: any[]
): Promise<{
  recommendations: {
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    implementationEffort: 'easy' | 'moderate' | 'complex';
    estimatedSavings?: string;
  }[];
  efficiencyScore: number;
  summary: string;
}> {
  try {
    // Check if OpenAI client is available
    if (!openai) {
      throw new Error("OpenAI API key not configured");
    }
    
    // Format the data for the AI prompt
    const energyDataFormatted = JSON.stringify(energyData.slice(0, 50), null, 2);
    const equipmentDataFormatted = JSON.stringify(equipmentData.slice(0, 20), null, 2);
    
    // Define the analysis prompt
    const prompt = `
You are an energy optimization expert AI for an energy management system. Your task is to analyze energy consumption data and equipment information to provide actionable recommendations for improving energy efficiency.

ENERGY MEASUREMENT DATA:
${energyDataFormatted}

EQUIPMENT DATA:
${equipmentDataFormatted}

Based on this data, provide energy optimization recommendations in JSON format with the following structure:
{
  "recommendations": [
    {
      "title": "Short descriptive title",
      "description": "Detailed explanation of the recommendation",
      "impact": "low|medium|high",
      "implementationEffort": "easy|moderate|complex",
      "estimatedSavings": "Estimated savings if implemented (when possible)"
    }
  ],
  "efficiencyScore": 75,
  "summary": "Executive summary of findings and recommendations"
}

Focus on:
- Peak demand management
- Load balancing opportunities
- Equipment efficiency improvements
- Energy consumption patterns and anomalies
- Potential energy waste areas
- Cost-saving opportunities
- Maintenance recommendations with energy impact

Provide 3-5 specific, actionable recommendations backed by the data.
Estimate an overall efficiency score from 0-100 based on the current usage patterns.
Ensure recommendations are technically sound and appropriate for an energy management system.
`;

    // Call the OpenAI API for analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2048,
    });

    const messageContent = response.choices[0].message.content;
    const content = messageContent !== null && messageContent !== undefined ? messageContent : "{}";
    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("Error generating energy recommendations with AI:", error);
    // Return a fallback result when AI analysis fails
    return {
      recommendations: [
        {
          title: 'AI Analysis Currently Unavailable',
          description: 'The AI energy analysis service is temporarily unavailable. Basic energy reports are still accessible.',
          impact: 'medium',
          implementationEffort: 'easy'
        }
      ],
      efficiencyScore: 50,
      summary: 'Energy recommendation service encountered an error. Please try again later or check API key configuration.'
    };
  }
}

/**
 * Performs predictive analysis of system data to provide performance recommendations and forecasts
 * @param logs Recent system logs
 * @param energyData Recent energy measurements
 * @param equipmentData Equipment information
 * @returns Comprehensive predictive analysis with recommendations and maintenance forecasts
 */
export async function generatePredictiveAnalysis(
  logs: any[],
  energyData: any[],
  equipmentData: any[]
): Promise<PredictiveAnalysisResult> {
  try {
    // Check if OpenAI client is available
    if (!openai) {
      throw new Error("OpenAI API key not configured");
    }
    
    // Prepare the data for analysis
    const recentLogs = logs.slice(0, 70); // Get the most recent logs
    const logsFormatted = recentLogs.map(log => 
      `[${log.timestamp}] [${log.severity}] [${log.component}] ${log.message}`
    ).join('\n');
    
    // Format the energy and equipment data
    const energyDataSample = JSON.stringify(energyData.slice(0, 30), null, 2);
    const equipmentDataSample = JSON.stringify(equipmentData.slice(0, 15), null, 2);
    
    // Analyze pattern frequency in logs by components
    const componentPatterns: Record<string, string[]> = {};
    logs.forEach(log => {
      if (!componentPatterns[log.component]) {
        componentPatterns[log.component] = [];
      }
      componentPatterns[log.component].push(log.message);
    });
    
    // Identify recurring patterns
    const patternSummary = Object.entries(componentPatterns)
      .map(([component, messages]) => {
        // Count message frequencies
        const messageCounts: Record<string, number> = {};
        messages.forEach(msg => {
          messageCounts[msg] = (messageCounts[msg] || 0) + 1;
        });
        
        // Get top patterns (messages occurring more than once)
        const patterns = Object.entries(messageCounts)
          .filter(([_, count]) => count > 1)
          .map(([msg, count]) => `"${msg}" (occurs ${count} times)`)
          .join("\n");
        
        return `${component} patterns:\n${patterns || "No recurring patterns"}`;
      })
      .join("\n\n");
    
    // Define the analysis prompt
    const prompt = `
You are an advanced predictive analysis AI for energy management systems. Your task is to analyze system logs, energy measurements, and equipment data to provide predictive insights and performance recommendations.

SYSTEM LOGS SAMPLE:
${logsFormatted}

PATTERN ANALYSIS:
${patternSummary}

ENERGY DATA SAMPLE:
${energyDataSample}

EQUIPMENT DATA SAMPLE:
${equipmentDataSample}

Based on this comprehensive data set, provide a predictive analysis in JSON format with the following structure:
{
  "recommendations": [
    {
      "category": "system|network|equipment|energy|security",
      "title": "Clear descriptive title",
      "description": "Detailed explanation of the recommendation",
      "impact": "low|medium|high",
      "timeToImplement": "immediate|short-term|long-term",
      "estimatedImprovement": "Quantified improvement where possible",
      "relatedMetrics": ["specific metrics affected"],
      "priorityScore": 85
    }
  ],
  "predictiveInsights": [
    {
      "component": "Component name",
      "pattern": "Observed pattern description",
      "prediction": "What will likely happen if unaddressed",
      "timeframe": "When it's likely to occur",
      "confidence": 0.85
    }
  ],
  "maintenanceForecast": [
    {
      "equipment": "Equipment identifier",
      "currentStatus": "Current operational status",
      "predictedFailureWindow": "When failure/degradation is likely",
      "recommendedAction": "Specific maintenance action",
      "urgency": "low|medium|high"
    }
  ],
  "systemHealthScore": 78,
  "summaryReport": "Executive summary of findings, forecasts, and recommendations"
}

Focus your analysis on:
1. Predicting future system behavior based on observed patterns
2. Identifying equipment that may require preventative maintenance before failure
3. Forecasting capacity needs based on usage trends
4. Optimizing operational efficiency through targeted improvements
5. Detecting subtle patterns that may indicate developing problems
6. Providing practical, actionable recommendations with estimated benefits

Provide 4-6 specific, targeted recommendations with varying timeframes and impacts.
Include 3-5 predictive insights based on pattern recognition.
Forecast maintenance needs for 2-4 pieces of equipment based on observed behavior.
Calculate a system health score (0-100) based on overall system performance and stability.
Ensure all recommendations and insights are technically sound and appropriate for an energy management system.
`;

    // Call the OpenAI API for predictive analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 3000,
    });

    const messageContent = response.choices[0].message.content;
    const content = messageContent !== null && messageContent !== undefined ? messageContent : "{}";
    const result = JSON.parse(content);
    return result as PredictiveAnalysisResult;
  } catch (error) {
    console.error("Error generating predictive analysis with AI:", error);
    // Return a fallback result when AI analysis fails
    return {
      recommendations: [
        {
          category: 'system',
          title: 'AI Predictive Analysis Service Unavailable',
          description: 'The AI predictive analysis service is temporarily unavailable. Basic system monitoring is still operational.',
          impact: 'medium',
          timeToImplement: 'immediate',
          estimatedImprovement: 'N/A',
          relatedMetrics: ['system availability'],
          priorityScore: 70
        }
      ],
      predictiveInsights: [],
      maintenanceForecast: [],
      systemHealthScore: 60,
      summaryReport: 'Predictive analysis service encountered an error. Please try again later or check API key configuration.'
    };
  }
}