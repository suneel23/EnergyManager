import { useState } from "react";
import { AppLayout } from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, FileText, Download, Printer, RefreshCw } from "lucide-react";

// Sample report data
const reportTypes = [
  { id: "daily", name: "Daily Operations Summary" },
  { id: "equipment", name: "Equipment Status Report" },
  { id: "energy", name: "Energy Consumption Analysis" },
  { id: "alerts", name: "Alert History Report" },
  { id: "permits", name: "Work Permit Summary" },
  { id: "reliability", name: "Grid Reliability Metrics" },
  { id: "maintenance", name: "Maintenance Schedule" },
  { id: "regulatory", name: "Regulatory Compliance Report" }
];

export default function ReportsPage() {
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<boolean>(false);

  const generateReport = () => {
    if (!selectedReportType || !startDate || !endDate) return;
    
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedReport(true);
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Report Generator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <label htmlFor="report-type" className="text-sm font-medium text-neutral-700">
                  Report Type
                </label>
                <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="start-date" className="text-sm font-medium text-neutral-700">
                  Start Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="start-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="end-date" className="text-sm font-medium text-neutral-700">
                  End Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="end-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                onClick={generateReport}
                disabled={!selectedReportType || !startDate || !endDate || isGenerating}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {generatedReport && (
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle>
                {reportTypes.find(r => r.id === selectedReportType)?.name}
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 mb-4 rounded-md">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-neutral-500">Report Type:</span>
                    <p className="font-medium">{reportTypes.find(r => r.id === selectedReportType)?.name}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Start Date:</span>
                    <p className="font-medium">{startDate ? format(startDate, "PPP") : "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500">End Date:</span>
                    <p className="font-medium">{endDate ? format(endDate, "PPP") : "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Generated:</span>
                    <p className="font-medium">{format(new Date(), "PPP p")}</p>
                  </div>
                </div>
              </div>

              {selectedReportType === "equipment" && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipment ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Voltage Level</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Maintenance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>EQ-1023</TableCell>
                      <TableCell>Transformer T-103</TableCell>
                      <TableCell>Power Transformer</TableCell>
                      <TableCell>110/35 kV</TableCell>
                      <TableCell>North Substation</TableCell>
                      <TableCell>Operational</TableCell>
                      <TableCell>2023-03-15</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>EQ-1024</TableCell>
                      <TableCell>Circuit Breaker CB-35</TableCell>
                      <TableCell>Circuit Breaker</TableCell>
                      <TableCell>35 kV</TableCell>
                      <TableCell>North Substation</TableCell>
                      <TableCell>Maintenance</TableCell>
                      <TableCell>2023-04-22</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>EQ-1025</TableCell>
                      <TableCell>Disconnector D-12</TableCell>
                      <TableCell>Disconnector</TableCell>
                      <TableCell>10 kV</TableCell>
                      <TableCell>East Substation</TableCell>
                      <TableCell>Operational</TableCell>
                      <TableCell>2023-02-08</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}

              {selectedReportType === "energy" && (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Energy Consumption Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white border rounded-md p-4 text-center">
                        <p className="text-neutral-500 text-sm">Total Consumption</p>
                        <p className="text-2xl font-bold">1,245.8 MWh</p>
                      </div>
                      <div className="bg-white border rounded-md p-4 text-center">
                        <p className="text-neutral-500 text-sm">Peak Load</p>
                        <p className="text-2xl font-bold">86.3 MW</p>
                      </div>
                      <div className="bg-white border rounded-md p-4 text-center">
                        <p className="text-neutral-500 text-sm">Energy Losses</p>
                        <p className="text-2xl font-bold">37.4 MWh (3.0%)</p>
                      </div>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Consumption (MWh)</TableHead>
                        <TableHead>Peak Load (MW)</TableHead>
                        <TableHead>Losses (MWh)</TableHead>
                        <TableHead>Loss Ratio (%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>2023-05-01</TableCell>
                        <TableCell>156.2</TableCell>
                        <TableCell>82.4</TableCell>
                        <TableCell>4.7</TableCell>
                        <TableCell>3.0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2023-05-02</TableCell>
                        <TableCell>162.5</TableCell>
                        <TableCell>84.1</TableCell>
                        <TableCell>4.9</TableCell>
                        <TableCell>3.0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2023-05-03</TableCell>
                        <TableCell>158.7</TableCell>
                        <TableCell>83.2</TableCell>
                        <TableCell>4.8</TableCell>
                        <TableCell>3.0</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </>
              )}

              {selectedReportType !== "equipment" && selectedReportType !== "energy" && (
                <div className="flex justify-center items-center p-8 text-neutral-500">
                  Report data would be displayed here for the selected report type
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Saved Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Generated On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Monthly Operations Summary</TableCell>
                  <TableCell>Daily Operations Summary</TableCell>
                  <TableCell>Apr 1, 2023 - Apr 30, 2023</TableCell>
                  <TableCell>May 1, 2023</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Q1 Reliability Report</TableCell>
                  <TableCell>Grid Reliability Metrics</TableCell>
                  <TableCell>Jan 1, 2023 - Mar 31, 2023</TableCell>
                  <TableCell>Apr 5, 2023</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Annual Equipment Status</TableCell>
                  <TableCell>Equipment Status Report</TableCell>
                  <TableCell>Jan 1, 2022 - Dec 31, 2022</TableCell>
                  <TableCell>Jan 15, 2023</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
