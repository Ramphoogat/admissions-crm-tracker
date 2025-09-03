import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { Enquiry, CreateEnquiryRequest, UpdateEnquiryRequest } from '../api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const EnquiryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [formData, setFormData] = useState({
    student_name: '',
    class_applied: '',
    guardian_name: '',
    phone: '',
    source: '',
    notes: '',
    stage: 'new' as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      fetchEnquiry();
    }
  }, [id, isEdit]);

  const fetchEnquiry = async () => {
    try {
      setLoading(true);
      const response = await apiClient.listEnquiries({ q: id });
      const enquiry = response.items.find(e => e.id === parseInt(id!));
      if (enquiry) {
        setEnquiry(enquiry);
        setFormData({
          student_name: enquiry.student_name,
          class_applied: enquiry.class_applied,
          guardian_name: enquiry.guardian_name,
          phone: enquiry.phone,
          source: enquiry.source || '',
          notes: enquiry.notes || '',
          stage: enquiry.stage,
        });
      } else {
        toast({
          title: "Error",
          description: "Enquiry not found.",
          variant: "destructive",
        });
        navigate('/enquiries');
      }
    } catch (error) {
      console.error('Failed to fetch enquiry:', error);
      toast({
        title: "Error",
        description: "Failed to load enquiry. Please try again.",
        variant: "destructive",
      });
      navigate('/enquiries');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.student_name.trim()) {
      newErrors.student_name = 'Student name is required';
    }

    if (!formData.class_applied.trim()) {
      newErrors.class_applied = 'Class is required';
    }

    if (!formData.guardian_name.trim()) {
      newErrors.guardian_name = 'Guardian name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s]{7,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone must be 7-15 characters with numbers, +, -, or spaces only';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (isEdit && id) {
        const updateData: UpdateEnquiryRequest = {};
        if (formData.stage !== enquiry?.stage) updateData.stage = formData.stage;
        if (formData.notes !== (enquiry?.notes || '')) updateData.notes = formData.notes;
        if (formData.class_applied !== enquiry?.class_applied) updateData.class_applied = formData.class_applied;
        if (formData.source !== (enquiry?.source || '')) updateData.source = formData.source;

        if (Object.keys(updateData).length > 0) {
          await apiClient.updateEnquiry(parseInt(id), updateData);
          toast({
            title: "Success",
            description: "Enquiry updated successfully.",
          });
        }
      } else {
        const createData: CreateEnquiryRequest = {
          student_name: formData.student_name.trim(),
          class_applied: formData.class_applied.trim(),
          guardian_name: formData.guardian_name.trim(),
          phone: formData.phone.trim(),
          source: formData.source.trim() || undefined,
          notes: formData.notes.trim() || undefined,
        };

        await apiClient.createEnquiry(createData);
        toast({
          title: "Success",
          description: "Enquiry created successfully.",
        });
      }

      navigate('/enquiries');
    } catch (error) {
      console.error('Failed to save enquiry:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save enquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Enquiry' : 'New Enquiry'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_name">Student Name *</Label>
                <Input
                  id="student_name"
                  value={formData.student_name}
                  onChange={(e) => handleInputChange('student_name', e.target.value)}
                  className={errors.student_name ? 'border-red-500' : ''}
                />
                {errors.student_name && (
                  <p className="text-sm text-red-500">{errors.student_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="class_applied">Class Applied *</Label>
                <Select value={formData.class_applied} onValueChange={(value) => handleInputChange('class_applied', value)}>
                  <SelectTrigger className={errors.class_applied ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pre-K">Pre-K</SelectItem>
                    <SelectItem value="Kindergarten">Kindergarten</SelectItem>
                    <SelectItem value="Grade 1">Grade 1</SelectItem>
                    <SelectItem value="Grade 2">Grade 2</SelectItem>
                    <SelectItem value="Grade 3">Grade 3</SelectItem>
                    <SelectItem value="Grade 4">Grade 4</SelectItem>
                    <SelectItem value="Grade 5">Grade 5</SelectItem>
                    <SelectItem value="Grade 6">Grade 6</SelectItem>
                    <SelectItem value="Grade 7">Grade 7</SelectItem>
                    <SelectItem value="Grade 8">Grade 8</SelectItem>
                    <SelectItem value="Grade 9">Grade 9</SelectItem>
                    <SelectItem value="Grade 10">Grade 10</SelectItem>
                    <SelectItem value="Grade 11">Grade 11</SelectItem>
                    <SelectItem value="Grade 12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
                {errors.class_applied && (
                  <p className="text-sm text-red-500">{errors.class_applied}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guardian_name">Guardian Name *</Label>
                <Input
                  id="guardian_name"
                  value={formData.guardian_name}
                  onChange={(e) => handleInputChange('guardian_name', e.target.value)}
                  className={errors.guardian_name ? 'border-red-500' : ''}
                />
                {errors.guardian_name && (
                  <p className="text-sm text-red-500">{errors.guardian_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="e.g., +1-555-123-4567"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  placeholder="e.g., Website, Referral, Advertisement"
                />
              </div>

              {isEdit && (
                <div className="space-y-2">
                  <Label htmlFor="stage">Stage</Label>
                  <Select value={formData.stage} onValueChange={(value) => handleInputChange('stage', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="admitted">Admitted</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this enquiry..."
                rows={4}
              />
            </div>

            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/enquiries')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : isEdit ? 'Update Enquiry' : 'Create Enquiry'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnquiryForm;
