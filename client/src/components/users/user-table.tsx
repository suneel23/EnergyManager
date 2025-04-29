import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
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
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserTable() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const pageSize = 5;

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Filter users based on search and selected tab
  const filteredUsers = users.filter((user) => {
    // Filter by tab
    if (activeTab === "administrators" && user.role !== "Admin") {
      return false;
    }
    if (activeTab === "operators" && user.role !== "Operator") {
      return false;
    }
    if (activeTab === "technicians" && user.role !== "Technician") {
      return false;
    }
    if (activeTab === "viewers" && user.role !== "Viewer") {
      return false;
    }

    // Filter by search
    return (
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.department?.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Paginate
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-500 bg-opacity-10 text-green-600">
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="outline" className="bg-neutral-300 bg-opacity-30 text-neutral-700">
            Inactive
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: Date | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const getUserRoleCounts = () => {
    const counts = {
      admin: users.filter(u => u.role === "Admin").length,
      operator: users.filter(u => u.role === "Operator").length,
      technician: users.filter(u => u.role === "Technician").length,
      viewer: users.filter(u => u.role === "Viewer").length
    };
    return counts;
  };

  const roleCounts = getUserRoleCounts();

  return (
    <Card>
      <CardHeader className="p-4 border-b border-gray-200 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium text-neutral-800">User Management</CardTitle>
        <div className="flex space-x-2">
          <Button className="bg-primary-600 hover:bg-primary-700">
            <UserPlus className="h-4 w-4 mr-1" /> Add User
          </Button>
        </div>
      </CardHeader>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="border-b border-gray-200">
          <TabsList className="h-auto p-0">
            <TabsTrigger
              value="all"
              className="data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 rounded-none border-b-2 border-transparent px-6 py-3"
            >
              All Users
            </TabsTrigger>
            <TabsTrigger
              value="administrators"
              className="data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 rounded-none border-b-2 border-transparent px-6 py-3"
            >
              Administrators ({roleCounts.admin})
            </TabsTrigger>
            <TabsTrigger
              value="operators"
              className="data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 rounded-none border-b-2 border-transparent px-6 py-3"
            >
              Operators ({roleCounts.operator})
            </TabsTrigger>
            <TabsTrigger
              value="technicians"
              className="data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 rounded-none border-b-2 border-transparent px-6 py-3"
            >
              Field Technicians ({roleCounts.technician})
            </TabsTrigger>
            <TabsTrigger
              value="viewers"
              className="data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 rounded-none border-b-2 border-transparent px-6 py-3"
            >
              Viewers ({roleCounts.viewer})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0 pt-0">
          <div className="p-4 flex justify-end">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search users..."
                className="pl-8 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-4 text-neutral-500"
                          >
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-10 w-10 mr-4">
                                  <AvatarFallback className="bg-primary-100 text-primary-800">
                                    {user.fullName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-neutral-800">
                                  {user.fullName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>{user.department || "—"}</TableCell>
                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                            <TableCell>{formatDate(user.lastLogin)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="link"
                                  className="text-primary-600 h-auto p-0"
                                >
                                  Edit
                                </Button>
                                {user.status === "active" ? (
                                  <Button
                                    variant="link"
                                    className="text-red-600 h-auto p-0"
                                  >
                                    Disable
                                  </Button>
                                ) : (
                                  <Button
                                    variant="link"
                                    className="text-green-600 h-auto p-0"
                                  >
                                    Enable
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
                        {filteredUsers.length > 0
                          ? (currentPage - 1) * pageSize + 1
                          : 0}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          currentPage * pageSize,
                          filteredUsers.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {filteredUsers.length}
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
