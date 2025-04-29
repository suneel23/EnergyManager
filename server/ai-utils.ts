import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

/**
 * Analyzes system logs to identify patterns, potential issues, and provide recommendations
 * @param logs Array of log entries to analyze
 * @returns Analysis results with potential issues, performance insights, and recommendations
 */
export async function analyzeSystemLogs(logs: any[]): Promise<LogAnalysisResult> {
  try {
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

    const result = JSON.parse(response.choices[0].message.content);
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

    const result = JSON.parse(response.choices[0].message.content);
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