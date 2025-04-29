import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WorkPermit, User } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export function PermitTable() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("active");
  const pageSize = 5;

  const { data: permits = [], isLoading: isLoadingPermits } = useQuery<WorkPermit[]>({
    queryKey: ["/api/permits"],
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Filter permits based on search and selected tab
  const filteredPermits = permits.filter((permit) => {
    // Filter by tab
    if (activeTab === "active" && !["approved", "pending", "critical"].includes(permit.status)) {
      return false;
    }
    if (activeTab === "pending" && permit.status !== "pending") {
      return false;
    }
    if (activeTab === "completed" && permit.status !== "completed") {
      return false;
    }
    if (activeTab === "rejected" && permit.status !== "rejected") {
      return false;
    }

    // Filter by search
    return (
      permit.permitId.toLowerCase().includes(search.toLowerCase()) ||
      permit.title.toLowerCase().includes(search.toLowerCase()) ||
      permit.affectedEquipment.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Paginate
  const totalPages = Math.ceil(filteredPermits.length / pageSize);
  const paginatedPermits = filteredPermits.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Get user name by ID
  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.fullName : "Unknown";
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-500 bg-opacity-10 text-green-600">
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-500 bg-opacity-10 text-amber-600">
            Pending
          </Badge>
        );
      case "critical":
        return (
          <Badge variant="outline" className="bg-red-500 bg-opacity-10 text-red-600">
            Critical
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-500 bg-opacity-10 text-blue-600">
            Completed
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-neutral-500 bg-opacity-10 text-neutral-600">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: Date | string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  return (
    <Card>
      <CardHeader className="p-4 border-b border-gray-200 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium text-neutral-800">Work Permits</CardTitle>
        <div className="flex space-x-2">
          <Button className="bg-primary-600 hover:bg-primary-700">
            <Plus className="h-4 w-4 mr-1" /> New Permit
          </Button>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <Tabs
        defaultValue="active"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="border-b border-gray-200">
          <TabsList className="h-auto p-0">
            <TabsTrigger
              value="active"
              className="data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 rounded-none border-b-2 border-transparent px-6 py-3"
            >
              Active ({permits.filter(p => ["approved", "pending", "critical"].includes(p.status)).length})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 rounded-none border-b-2 border-transparent px-6 py-3"
            >
              Pending ({permits.filter(p => p.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 rounded-none border-b-2 border-transparent px-6 py-3"
            >
              Completed ({permits.filter(p => p.status === "completed").length})
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              className="data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 rounded-none border-b-2 border-transparent px-6 py-3"
            >
              Rejected ({permits.filter(p => p.status === "rejected").length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0 pt-0">
          <div className="p-4 flex justify-end">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search permits..."
                className="pl-8 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <CardContent className="p-0">
            {isLoadingPermits || isLoadingUsers ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permit ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Affected Equipment</TableHead>
                        <TableHead>Requestor</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPermits.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-4 text-neutral-500"
                          >
                            No permits found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedPermits.map((permit) => (
                          <TableRow key={permit.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              {permit.permitId}
                            </TableCell>
                            <TableCell>{permit.title}</TableCell>
                            <TableCell>{permit.affectedEquipment}</TableCell>
                            <TableCell>{getUserName(permit.requestor)}</TableCell>
                            <TableCell>{formatDate(permit.startDate)}</TableCell>
                            <TableCell>{formatDate(permit.endDate)}</TableCell>
                            <TableCell>{getStatusBadge(permit.status)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="link"
                                  className="text-primary-600 h-auto p-0"
                                >
                                  View
                                </Button>
                                {permit.status === "pending" && (
                                  <>
                                    <Button
                                      variant="link"
                                      className="text-green-600 h-auto p-0"
                                    >
                                      <CheckCircle2 className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="link"
                                      className="text-red-600 h-auto p-0"
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {["approved", "critical"].includes(permit.status) && (
                                  <Button
                                    variant="link"
                                    className="text-neutral-600 h-auto p-0"
                                  >
                                    Edit
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between py-4 px-6 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-neutral-700">
                      Showing{" "}
                      <span className="font-medium">
                        {filteredPermits.length > 0
                          ? (currentPage - 1) * pageSize + 1
                          : 0}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          currentPage * pageSize,
                          filteredPermits.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {filteredPermits.length}
                      </span>{" "}
                      results
                    </p>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <Button
                          key={index}
                          variant={
                            currentPage === index + 1 ? "default" : "outline"
                          }
                          className={
                            currentPage === index + 1 ? "bg-primary-600" : ""
                          }
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
