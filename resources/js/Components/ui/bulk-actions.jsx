import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Download, 
  Mail,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/Components/ui/use-toast';

function BulkActions({ 
  selectedItems = [], 
  onClearSelection, 
  onBulkApprove, 
  onBulkReject, 
  onBulkDelete,
  onBulkExport,
  onBulkEmail,
  isLoading = false,
  className = '' 
}) {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();

  const selectedCount = selectedItems.length;

  if (selectedCount === 0) {
    return null;
  }

  const handleBulkApprove = async () => {
    try {
      await onBulkApprove(selectedItems);
      toast({
        title: 'Requests Approved',
        description: `Successfully approved ${selectedCount} request(s).`
      });
      setShowApproveModal(false);
      onClearSelection();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Approval Failed',
        description: 'Failed to approve some requests. Please try again.'
      });
    }
  };

  const handleBulkReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejection.'
      });
      return;
    }

    try {
      await onBulkReject(selectedItems, rejectionReason);
      toast({
        title: 'Requests Rejected',
        description: `Successfully rejected ${selectedCount} request(s).`
      });
      setShowRejectModal(false);
      setRejectionReason('');
      onClearSelection();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Rejection Failed',
        description: 'Failed to reject some applications. Please try again.'
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await onBulkDelete(selectedItems);
      toast({
        title: 'Requests Deleted',
        description: `Successfully deleted ${selectedCount} request(s).`
      });
      setShowDeleteModal(false);
      onClearSelection();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Failed to delete some applications. Please try again.'
      });
    }
  };

  return (
    <>
      <Card className={`sticky top-4 z-10 border-blue-200 bg-blue-50/80 backdrop-blur-sm ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{selectedCount}</span>
                </div>
                <span className="text-sm font-medium text-blue-900">
                  {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
              >
                Clear selection
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              {/* Approve Button */}
              <Button
                size="sm"
                onClick={() => setShowApproveModal(true)}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Approve
              </Button>

              {/* Reject Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRejectModal(true)}
                disabled={isLoading}
                className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>

              {/* Export Button */}
              {onBulkExport && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onBulkExport(selectedItems)}
                  disabled={isLoading}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}

              {/* Email Button */}
              {onBulkEmail && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onBulkEmail(selectedItems)}
                  disabled={isLoading}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              )}

              {/* Delete Button */}
              {onBulkDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isLoading}
                  className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Approve Requests</h3>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to approve {selectedCount} request(s)? The applicants will be notified via email.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkApprove}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Approve Requests
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Reject Requests</h3>
                  <p className="text-sm text-gray-600">
                    You are about to reject {selectedCount} request(s)
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={4}
                  required
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkReject}
                  disabled={!rejectionReason.trim() || isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Reject Requests
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Requests</h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone. You are about to permanently delete {selectedCount} request(s).
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkDelete}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete Requests
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

export default BulkActions;