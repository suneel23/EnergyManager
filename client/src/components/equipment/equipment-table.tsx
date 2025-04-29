import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Equipment } from "@shared/schema";
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
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";

export function EquipmentTable() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  
  const { data: equipment = [], isLoading } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
  });

  // Filter equipment based on search
  const filteredEquipment = equipment.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.equipmentId.toLowerCase().includes(search.toLowerCase()) ||
    item.type.toLowerCase().includes(search.toLowerCase()) ||
    item.location.toLowerCase().includes(search.toLowerCase())
  );

  // Paginate
  const totalPages = Math.ceil(filteredEquipment.length / pageSize);
  const paginatedEquipment = filteredEquipment.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational':
        return <Badge variant="outline" className="bg-green-500 bg-opacity-10 text-green-600">{t('operational')}</Badge>;
      case 'maintenance':
        return <Badge variant="outline" className="bg-amber-500 bg-opacity-10 text-amber-600">{t('maintenance')}</Badge>;
      case 'fault':
        return <Badge variant="outline" className="bg-red-500 bg-opacity-10 text-red-600">{t('fault')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: Date | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <Card>
      <CardHeader className="p-4 border-b border-gray-200 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium text-neutral-800">{t('equipment_inventory')}</CardTitle>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder={t('search_equipment')}
              className="pl-8 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button className="bg-primary-600 hover:bg-primary-700">
            <Plus className="h-4 w-4 mr-1" /> {t('add_equipment')}
          </Button>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
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
                    <TableHead>{t('equipment_id')}</TableHead>
                    <TableHead>{t('equipment_name')}</TableHead>
                    <TableHead>{t('equipment_type')}</TableHead>
                    <TableHead>{t('voltage_level')}</TableHead>
                    <TableHead>{t('location')}</TableHead>
                    <TableHead>{t('equipment_status')}</TableHead>
                    <TableHead>{t('last_maintenance')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEquipment.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-neutral-500">
                        No equipment found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedEquipment.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{item.equipmentId}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.voltageLevel}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>{formatDate(item.lastMaintenance)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="link" className="text-primary-600 h-auto p-0">View</Button>
                            <Button variant="link" className="text-neutral-600 h-auto p-0">Edit</Button>
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
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, filteredEquipment.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredEquipment.length}</span> results
                </p>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index + 1 ? "default" : "outline"}
                    className={currentPage === index + 1 ? "bg-primary-600" : ""}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
