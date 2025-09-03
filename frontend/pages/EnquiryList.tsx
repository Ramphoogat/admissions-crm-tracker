import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Edit, MessageSquare, Phone, AlertCircle, Trash2 } from "lucide-react";
import { apiClient } from "../api/client";
import type { Enquiry } from "../api/types";
import StageBadge from "../components/StageBadge";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

const EnquiryList: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const itemsPerPage = 20;

  const fetchEnquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.listEnquiries({
        stage: stageFilter === "all" ? undefined : stageFilter,
        class: classFilter === "all" ? undefined : classFilter,
        q: searchQuery || undefined,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      });
      setEnquiries(response.items);
      setTotalItems(response.total);
    } catch (error) {
      console.error("Failed to fetch enquiries:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load enquiries. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, stageFilter, classFilter, currentPage, toast]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStageChange = (value: string) => {
    setStageFilter(value);
    setCurrentPage(1);
  };

  const handleClassChange = (value: string) => {
    setClassFilter(value);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleRetry = () => {
    fetchEnquiries();
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId !== null) {
      try {
        await apiClient.deleteEnquiry(deleteId);
        toast({
          title: "Deleted",
          description: "Enquiry deleted successfully.",
        });
        // Remove the deleted enquiry from local state
        setEnquiries((prev) => prev.filter((e) => e.id !== deleteId));
        setTotalItems((prev) => (prev > 0 ? prev - 1 : 0));
        setShowDialog(false);
        setDeleteId(null);
        // Optionally refetch if you want to sync with backend
        // await fetchEnquiries();
      } catch (error) {
        let errorMessage = "Failed to delete enquiry.";
        if (error instanceof Error && error.message.includes("not found")) {
          errorMessage = "Enquiry not found. It may have already been deleted.";
        }
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        setShowDialog(false);
        setDeleteId(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDialog(false);
    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading enquiries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Enquiries</h1>
          <Link to="/enquiries/new">
            <Button>New Enquiry</Button>
          </Link>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Enquiries</h1>
        <Link to="/enquiries/new">
          <Button>New Enquiry</Button>
        </Link>
      </div>

      <Filters
        searchQuery={searchQuery}
        stageFilter={stageFilter}
        classFilter={classFilter}
        onSearchChange={handleSearchChange}
        onStageChange={handleStageChange}
        onClassChange={handleClassChange}
      />

      {enquiries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              {searchQuery || stageFilter !== "all" || classFilter !== "all"
                ? "No enquiries match your current filters."
                : "No enquiries found. Create your first enquiry to get started."}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {enquiries.map((enquiry) => (
              <Card
                key={enquiry.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {enquiry.student_name}
                        </h3>
                        <StageBadge stage={enquiry.stage} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Class:</span>{" "}
                          {enquiry.class_applied}
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">Guardian:</span>
                          <span>{enquiry.guardian_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{enquiry.phone}</span>
                        </div>
                      </div>

                      {enquiry.source && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Source:</span>{" "}
                          {enquiry.source}
                        </div>
                      )}

                      {enquiry.notes && (
                        <div className="mt-2 text-sm text-gray-700">
                          <span className="font-medium">Notes:</span>{" "}
                          {enquiry.notes}
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-500">
                        Created: {formatDate(enquiry.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Link to={`/enquiries/${enquiry.id}/followups`}>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/enquiries/${enquiry.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/enquiries/${enquiry.id}/delete`}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteClick(enquiry.id);
                          }}
                          aria-label="Delete"
                          className="border bg-background shadow-xs hover:bg-red-100 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Delete confirmation dialog */}
          {showDialog && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
              <div className="bg-white rounded shadow-lg p-6 min-w-[300px]">
                <div className="mb-4 text-lg font-semibold">
                  Are you sure you want to delete this enquiry?
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={handleConfirmDelete}
                  >
                    Yes
                  </Button>
                  <Button variant="outline" onClick={handleCancelDelete}>
                    No
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default EnquiryList;
