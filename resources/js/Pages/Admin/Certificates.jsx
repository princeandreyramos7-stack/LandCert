import { AdminSidebar } from "@/Components/admin-sidebar";
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Eye, CheckCircle, Package } from 'lucide-react';

export default function Certificates({ auth, certificates, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showMarkReadyModal, setShowMarkReadyModal] = useState(false);
    const [showReleaseModal, setShowReleaseModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [markReadyForm, setMarkReadyForm] = useState({
        certificate_number: '',
        notes: '',
    });

    const [releaseForm, setReleaseForm] = useState({
        collected_by_name: '',
        release_date: new Date().toISOString().split('T')[0],
        release_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        valid_id_type: '',
        valid_id_number: '',
        relationship_to_applicant: '',
        remarks: '',
    });

    const handleSearch = () => {
        router.get(route('admin.certificates'), {
            search,
            status: statusFilter === 'all' ? '' : statusFilter,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleViewDetails = (certificate) => {
        setSelectedCertificate(certificate);
        setShowDetailsModal(true);
    };

    const handleMarkReady = (certificate) => {
        setSelectedCertificate(certificate);
        setMarkReadyForm({
            certificate_number: certificate.certificate_number || '',
            notes: '',
        });
        setShowMarkReadyModal(true);
    };

    const handleRelease = (certificate) => {
        setSelectedCertificate(certificate);
        setReleaseForm({
            collected_by_name: '',
            release_date: new Date().toISOString().split('T')[0],
            release_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            valid_id_type: '',
            valid_id_number: '',
            relationship_to_applicant: '',
            remarks: '',
        });
        setShowReleaseModal(true);
    };

    const submitMarkReady = () => {
        setProcessing(true);
        router.post(route('admin.certificates.mark-ready', selectedCertificate.id), markReadyForm, {
            onFinish: () => {
                setProcessing(false);
                setShowMarkReadyModal(false);
                setSelectedCertificate(null);
            },
        });
    };

    const submitRelease = () => {
        setProcessing(true);
        router.post(route('admin.certificates.release', selectedCertificate.id), releaseForm, {
            onFinish: () => {
                setProcessing(false);
                setShowReleaseModal(false);
                setSelectedCertificate(null);
            },
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            generated: { variant: 'secondary', label: 'Generated' },
            ready_for_collection: { variant: 'default', label: 'Ready for Collection' },
            collected: { variant: 'success', label: 'Collected' },
        };
        const config = statusMap[status] || { variant: 'secondary', label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <SidebarProvider>
            <Head title="Certificate Management - Admin" />
            <AdminSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-gray-900 font-semibold">
                                        Certificate Management
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {/* Content */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6">
                            {flash?.success && (
                                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                                    {flash.success}
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">Physical Certificates</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="text"
                                            placeholder="Search certificates..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            className="w-64"
                                        />
                                        <Button onClick={handleSearch} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Select value={statusFilter} onValueChange={(value) => {
                                        setStatusFilter(value);
                                        router.get(route('admin.certificates'), {
                                            search,
                                            status: value === 'all' ? '' : value,
                                        }, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="generated">Generated</SelectItem>
                                            <SelectItem value="ready_for_collection">Ready for Collection</SelectItem>
                                            <SelectItem value="collected">Collected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Certificate #</TableHead>
                                        <TableHead>Applicant</TableHead>
                                        <TableHead>Project Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Issued Date</TableHead>
                                        <TableHead>Valid Until</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {certificates.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-gray-500">
                                                No certificates found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        certificates.data.map((certificate) => (
                                            <TableRow key={certificate.id}>
                                                <TableCell className="font-medium">
                                                    {certificate.certificate_number || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {certificate.request?.applicant_name || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {certificate.request?.project_type || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(certificate.status)}
                                                </TableCell>
                                                <TableCell>
                                                    {certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {certificate.valid_until ? new Date(certificate.valid_until).toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewDetails(certificate)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {certificate.status === 'generated' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleMarkReady(certificate)}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                            >
                                                                <Package className="h-4 w-4 mr-1" />
                                                                Mark Ready
                                                            </Button>
                                                        )}
                                                        {certificate.status === 'ready_for_collection' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleRelease(certificate)}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Record Collection
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {certificates.links && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-gray-500">
                                        Showing {certificates.from} to {certificates.to} of {certificates.total} certificates
                                    </div>
                                    <div className="flex gap-2">
                                        {certificates.links.map((link, index) => (
                                            <Button
                                                key={index}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={link.active ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SidebarInset>

            {/* Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Certificate Details</DialogTitle>
                    </DialogHeader>
                    {selectedCertificate && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-semibold">Certificate Number</Label>
                                    <p>{selectedCertificate.certificate_number || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">Status</Label>
                                    <div className="mt-1">{getStatusBadge(selectedCertificate.status)}</div>
                                </div>
                                <div>
                                    <Label className="font-semibold">Applicant Name</Label>
                                    <p>{selectedCertificate.request?.applicant_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">Project Type</Label>
                                    <p>{selectedCertificate.request?.project_type || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">Issued Date</Label>
                                    <p>{selectedCertificate.issued_at ? new Date(selectedCertificate.issued_at).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">Valid Until</Label>
                                    <p>{selectedCertificate.valid_until ? new Date(selectedCertificate.valid_until).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                            {selectedCertificate.release && (
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-3">Collection Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="font-semibold">Collected By</Label>
                                            <p>{selectedCertificate.release.collected_by_name}</p>
                                        </div>
                                        <div>
                                            <Label className="font-semibold">Relationship</Label>
                                            <p>{selectedCertificate.release.relationship_to_applicant}</p>
                                        </div>
                                        <div>
                                            <Label className="font-semibold">Valid ID</Label>
                                            <p>{selectedCertificate.release.valid_id_type} - {selectedCertificate.release.valid_id_number}</p>
                                        </div>
                                        <div>
                                            <Label className="font-semibold">Collection Date & Time</Label>
                                            <p>{new Date(selectedCertificate.release.release_date).toLocaleDateString()} {selectedCertificate.release.release_time}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Mark Ready Modal */}
            <Dialog open={showMarkReadyModal} onOpenChange={setShowMarkReadyModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark Certificate as Ready for Collection</DialogTitle>
                        <DialogDescription>
                            Confirm that the physical certificate is printed and ready for collection.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="certificate_number">Certificate Number *</Label>
                            <Input
                                id="certificate_number"
                                value={markReadyForm.certificate_number}
                                onChange={(e) => setMarkReadyForm({ ...markReadyForm, certificate_number: e.target.value })}
                                placeholder="Enter certificate number"
                            />
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={markReadyForm.notes}
                                onChange={(e) => setMarkReadyForm({ ...markReadyForm, notes: e.target.value })}
                                placeholder="Any additional notes..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMarkReadyModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={submitMarkReady} disabled={processing || !markReadyForm.certificate_number} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {processing ? 'Processing...' : 'Mark as Ready'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Release/Collection Modal */}
            <Dialog open={showReleaseModal} onOpenChange={setShowReleaseModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Record Certificate Collection</DialogTitle>
                        <DialogDescription>
                            Record the physical collection of the certificate document.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="collected_by_name">Collected By (Full Name) *</Label>
                                <Input
                                    id="collected_by_name"
                                    value={releaseForm.collected_by_name}
                                    onChange={(e) => setReleaseForm({ ...releaseForm, collected_by_name: e.target.value })}
                                    placeholder="Full name of collector"
                                />
                            </div>
                            <div>
                                <Label htmlFor="relationship_to_applicant">Relationship to Applicant *</Label>
                                <Input
                                    id="relationship_to_applicant"
                                    value={releaseForm.relationship_to_applicant}
                                    onChange={(e) => setReleaseForm({ ...releaseForm, relationship_to_applicant: e.target.value })}
                                    placeholder="e.g., Self, Representative, Attorney"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="valid_id_type">Valid ID Type *</Label>
                                <Select
                                    value={releaseForm.valid_id_type}
                                    onValueChange={(value) => setReleaseForm({ ...releaseForm, valid_id_type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select ID type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Driver's License">Driver's License</SelectItem>
                                        <SelectItem value="Passport">Passport</SelectItem>
                                        <SelectItem value="UMID">UMID</SelectItem>
                                        <SelectItem value="SSS ID">SSS ID</SelectItem>
                                        <SelectItem value="PhilHealth ID">PhilHealth ID</SelectItem>
                                        <SelectItem value="Voter's ID">Voter's ID</SelectItem>
                                        <SelectItem value="Postal ID">Postal ID</SelectItem>
                                        <SelectItem value="PRC ID">PRC ID</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="valid_id_number">ID Number *</Label>
                                <Input
                                    id="valid_id_number"
                                    value={releaseForm.valid_id_number}
                                    onChange={(e) => setReleaseForm({ ...releaseForm, valid_id_number: e.target.value })}
                                    placeholder="ID number"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="release_date">Collection Date *</Label>
                                <Input
                                    id="release_date"
                                    type="date"
                                    value={releaseForm.release_date}
                                    onChange={(e) => setReleaseForm({ ...releaseForm, release_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="release_time">Collection Time *</Label>
                                <Input
                                    id="release_time"
                                    type="time"
                                    value={releaseForm.release_time}
                                    onChange={(e) => setReleaseForm({ ...releaseForm, release_time: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                value={releaseForm.remarks}
                                onChange={(e) => setReleaseForm({ ...releaseForm, remarks: e.target.value })}
                                placeholder="Any additional remarks..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReleaseModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={submitRelease}
                            disabled={
                                processing ||
                                !releaseForm.collected_by_name ||
                                !releaseForm.relationship_to_applicant ||
                                !releaseForm.valid_id_type ||
                                !releaseForm.valid_id_number ||
                                !releaseForm.release_date ||
                                !releaseForm.release_time
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {processing ? 'Processing...' : 'Record Collection'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
}
