import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Edit, MessageSquare, Phone, Mail } from 'lucide-react';
import { apiClient } from '../api/client';
import type { Enquiry } from '../api/types';
import StageBadge from '../components/StageBadge';
import Filters from '../components/Filters';
import Pagination from '../components/Pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const EnquiryList: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();

  const itemsPerPage = 20;

  const fetchEnquiries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.listEnquiries({
        stage: stageFilter === 'all' ? undefined : stageFilter,
        class: classFilter === 'all' ? undefined : classFilter,
        q: searchQuery || undefined,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      });
      setEnquiries(response.items);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Failed to fetch enquiries:', error);
      toast({
        title: "Error",
        description: "Failed to load enquiries. Please try again.",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading enquiries...</div>
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
              {searchQuery || stageFilter !== 'all' || classFilter !== 'all'
                ? 'No enquiries match your current filters.'
                : 'No enquiries found. Create your first enquiry to get started.'}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {enquiries.map((enquiry) => (
              <Card key={enquiry.id} className="hover:shadow-md transition-shadow">
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
                          <span className="font-medium">Class:</span> {enquiry.class_applied}
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
                          <span className="font-medium">Source:</span> {enquiry.source}
                        </div>
                      )}
                      
                      {enquiry.notes && (
                        <div className="mt-2 text-sm text-gray-700">
                          <span className="font-medium">Notes:</span> {enquiry.notes}
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
