import React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  AreaChart as RechartsAreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { format } from "date-fns";

interface ChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
    }[];
    title?: string;
    yAxisLabel?: string;
  };
  height?: number;
}

const COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f97316", // orange-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#f59e0b", // amber-500
  "#06b6d4", // cyan-500
  "#ef4444", // red-500
  "#84cc16", // lime-500
  "#6366f1", // indigo-500
];

// Prepare data for Recharts
const prepareChartData = (chartData: ChartProps["data"]) => {
  return chartData.labels.map((label, index) => {
    const dataObj: any = { name: label };
    chartData.datasets.forEach((dataset, datasetIndex) => {
      dataObj[dataset.label] = dataset.data[index];
    });
    return dataObj;
  });
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded p-3 shadow-sm">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="text-sm flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name}: </span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Line Chart
export function LineChart({ data, height = 400 }: ChartProps) {
  const chartData = prepareChartData(data);
  const dataKey = data.datasets[0]?.label || "";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }} 
          tickMargin={10}
          stroke="#9ca3af"
        />
        <YAxis 
          tick={{ fontSize: 12 }} 
          tickMargin={10} 
          stroke="#9ca3af"
          label={{ 
            value: data.yAxisLabel, 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' }
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: 20 }} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={COLORS[0]}
          activeDot={{ r: 6 }}
          strokeWidth={2}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

// Bar Chart
export function BarChart({ data, height = 400 }: ChartProps) {
  const chartData = prepareChartData(data);
  const dataKey = data.datasets[0]?.label || "";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }} 
          tickMargin={10}
          stroke="#9ca3af"
        />
        <YAxis 
          tick={{ fontSize: 12 }} 
          tickMargin={10} 
          stroke="#9ca3af"
          label={{ 
            value: data.yAxisLabel, 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' }
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: 20 }} />
        <Bar dataKey={dataKey} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

// Area Chart
export function AreaChart({ data, height = 400 }: ChartProps) {
  const chartData = prepareChartData(data);
  const dataKey = data.datasets[0]?.label || "";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8} />
            <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }} 
          tickMargin={10}
          stroke="#9ca3af"
        />
        <YAxis 
          tick={{ fontSize: 12 }} 
          tickMargin={10} 
          stroke="#9ca3af"
          label={{ 
            value: data.yAxisLabel, 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' }
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: 20 }} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={COLORS[0]}
          fillOpacity={1}
          fill="url(#colorGradient)"
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}

// Pie Chart
export function PieChart({ data, height = 400 }: ChartProps) {
  // For Pie chart, data structure is a bit different
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0].data[index],
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={150}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}