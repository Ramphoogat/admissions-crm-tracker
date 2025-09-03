import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, MessageCircle } from 'lucide-react';
import { apiClient } from '../api/client';
import type { Enquiry, FollowUp, CreateFollowUpRequest } from '../api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import StageBadge from '../components/StageBadge';

const FollowUps: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    due_on: '',
    outcome: '',
    note: '',
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const enquiryId = parseInt(id!);

      // Fetch enquiry details
      const enquiriesResponse = await apiClient.listEnquiries({ q: id });
      const enquiry = enquiriesResponse.items.find(e => e.id === enquiryId);

      if (!enquiry) {
        toast({
          title: "Error",
          description: "Enquiry not found.",
          variant: "destructive",
        });
        return;
      }

      setEnquiry(enquiry);

      // Fetch follow-ups
      const followUpsResponse = await apiClient.getFollowUps(enquiryId);
      setFollowUps(followUpsResponse.followups);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.due_on) {
      toast({
        title: "Error",
        description: "Due date is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const enquiryId = parseInt(id!);

      const followUpData: CreateFollowUpRequest = {
        due_on: formData.due_on,
        outcome: formData.outcome.trim() || undefined,
        note: formData.note.trim() || undefined,
      };

      await apiClient.createFollowUp(enquiryId, followUpData);

      toast({
        title: "Success",
        description: "Follow-up created successfully.",
      });

      // Reset form and refresh data
      setFormData({ due_on: '', outcome: '', note: '' });
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create follow-up:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create follow-up. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Enquiry not found.</div>
        <Link to="/enquiries" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
          Back to Enquiries
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/enquiries">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Enquiries
          </Button>
        </Link>
      </div>

      {/* Enquiry Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Enquiry Details</CardTitle>
            <StageBadge stage={enquiry.stage} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Student:</span>
              <div className="text-gray-900">{enquiry.student_name}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Class:</span>
              <div className="text-gray-900">{enquiry.class_applied}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Guardian:</span>
              <div className="text-gray-900">{enquiry.guardian_name}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Phone:</span>
              <div className="text-gray-900">{enquiry.phone}</div>
            </div>
            {enquiry.source && (
              <div>
                <span className="font-medium text-gray-700">Source:</span>
                <div className="text-gray-900">{enquiry.source}</div>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <div className="text-gray-900">{formatDate(enquiry.created_at)}</div>
            </div>
          </div>
          {enquiry.notes && (
            <div className="mt-4">
              <span className="font-medium text-gray-700">Notes:</span>
              <div className="text-gray-900 mt-1">{enquiry.notes}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Follow-ups Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Follow-ups</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Follow-up
        </Button>
      </div>

      {/* Add Follow-up Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Follow-up</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due_on">Due Date *</Label>
                  <Input
                    id="due_on"
                    type="date"
                    value={formData.due_on}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_on: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outcome">Outcome</Label>
                  <Input
                    id="outcome"
                    value={formData.outcome}
                    onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
                    placeholder="e.g., Called, Emailed, Meeting scheduled"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Additional notes about this follow-up..."
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Follow-up'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Follow-ups List */}
      {followUps.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500">No follow-ups yet.</div>
            <div className="text-sm text-gray-400">Create your first follow-up to start tracking progress.</div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {followUps.map((followUp) => (
            <Card key={followUp.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`flex items-center space-x-2 ${isOverdue(followUp.due_on) ? 'text-red-600' : 'text-gray-600'}`}>
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">
                          Due: {formatDate(followUp.due_on)}
                        </span>
                        {isOverdue(followUp.due_on) && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {followUp.outcome && (
                      <div className="mb-2">
                        <span className="font-medium text-gray-700">Outcome:</span>
                        <span className="ml-2 text-gray-900">{followUp.outcome}</span>
                      </div>
                    )}
                    
                    {followUp.note && (
                      <div className="mb-2">
                        <span className="font-medium text-gray-700">Note:</span>
                        <div className="text-gray-900 mt-1">{followUp.note}</div>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Created: {formatDate(followUp.created_at)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowUps;
