import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { AdminSidebar } from '@/Components/admin-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Save, X, FileText, Edit3 } from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from '@/Components/ui/breadcrumb';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { useToast } from '@/components/ui/use-toast';

export default function AddProperty({ zoningRules, requests = [] }) {
    const { toast } = useToast();
    const [mode, setMode] = useState('from-application');
    const [selectedRequest, setSelectedRequest] = useState(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        request_id: '',
        latitude: '',
        longitude: '',
        address: '',
        barangay: '',
        district: '',
        zoning_rule_id: '',
        lot_area: '',
        lot_number: '',
        title_number: '',
    });

    // Auto-fill form when request is selected
    useEffect(() => {
        if (selectedRequest) {
            const request = requests.find(r => r.id === parseInt(selectedRequest));
            if (request) {
                // Build address from request location fields
                const addressParts = [
                    request.project_location_number,
                    request.project_location_street,
                    request.project_location_barangay,
                    request.project_location_municipality,
                    request.project_location_province
                ].filter(Boolean);
                
                setData({
                    request_id: request.id,
                    latitude: data.latitude || '',
                    longitude: data.longitude || '',
                    address: addressParts.join(', '),
                    barangay: request.project_location_barangay || '',
                    district: data.district || '',
                    zoning_rule_id: data.zoning_rule_id || '',
                    lot_area: request.lot_area_sqm || '',
                    lot_number: data.lot_number || '',
                    title_number: data.title_number || '',
                });
            }
        }
    }, [selectedRequest]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.properties.store'), {
            onSuccess: () => {
                toast({
                    title: 'Success',
                    description: 'Property added successfully and will appear on the map.',
                });
                reset();
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to add property. Please check the form.',
                    variant: 'destructive',
                });
            },
        });
    };

    const handleReset = () => {
        reset();
    };

    return (
        <SidebarProvider>
            <Head title="Add Property" />
            <AdminSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>GIS & Zoning / Add Property</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="max-w-4xl mx-auto w-full">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-6 h-6 text-primary" />
                                    <div>
                                        <CardTitle>Add New Property</CardTitle>
                                        <CardDescription>
                                            Add property from existing application or enter manually
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={mode} onValueChange={setMode} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 mb-6">
                                        <TabsTrigger value="from-application" className="flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            From Application
                                        </TabsTrigger>
                                        <TabsTrigger value="manual" className="flex items-center gap-2">
                                            <Edit3 className="w-4 h-4" />
                                            Manual Entry
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="from-application">
                                        <div className="space-y-6">
                                            {/* Application Selection */}
                                            <div className="space-y-2">
                                                <Label htmlFor="request_select">
                                                    Select Application/Request <span className="text-red-500">*</span>
                                                </Label>
                                                <Select
                                                    value={selectedRequest}
                                                    onValueChange={setSelectedRequest}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose an application..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {requests.length === 0 ? (
                                                            <div className="p-4 text-sm text-muted-foreground text-center">
                                                                No applications available
                                                            </div>
                                                        ) : (
                                                            requests.map((request) => (
                                                                <SelectItem key={request.id} value={request.id.toString()}>
                                                                    #{request.id} - {request.applicant_name} ({request.project_location_barangay || 'No location'})
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-muted-foreground">
                                                    Select an application to auto-fill property details
                                                </p>
                                            </div>

                                            {selectedRequest && (
                                                <>
                                                    <Separator />
                                                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                        <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
                                                            ℹ️ Application details loaded. Please add GPS coordinates below.
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="manual">
                                        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                                            <p className="text-sm text-amber-900 dark:text-amber-100">
                                                ℹ️ Manual entry mode - Fill all property details below
                                            </p>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                                    {/* GPS Coordinates */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">GPS Coordinates</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="latitude">
                                                    Latitude <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="latitude"
                                                    type="number"
                                                    step="0.00000001"
                                                    value={data.latitude}
                                                    onChange={(e) => setData('latitude', e.target.value)}
                                                    placeholder="16.9754"
                                                    required
                                                />
                                                {errors.latitude && (
                                                    <p className="text-sm text-red-500">{errors.latitude}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    Ilagan City range: 16.95 to 17.00
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="longitude">
                                                    Longitude <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="longitude"
                                                    type="number"
                                                    step="0.00000001"
                                                    value={data.longitude}
                                                    onChange={(e) => setData('longitude', e.target.value)}
                                                    placeholder="121.8947"
                                                    required
                                                />
                                                {errors.longitude && (
                                                    <p className="text-sm text-red-500">{errors.longitude}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    Ilagan City range: 121.85 to 121.95
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Location Details */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Location Details</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="address">
                                                    Address <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="address"
                                                    value={data.address}
                                                    onChange={(e) => setData('address', e.target.value)}
                                                    placeholder="e.g., Maharlika Highway, Barangay Centro 1, Ilagan City"
                                                    required
                                                />
                                                {errors.address && (
                                                    <p className="text-sm text-red-500">{errors.address}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="barangay">Barangay</Label>
                                                    <Input
                                                        id="barangay"
                                                        value={data.barangay}
                                                        onChange={(e) => setData('barangay', e.target.value)}
                                                        placeholder="e.g., Centro 1"
                                                    />
                                                    {errors.barangay && (
                                                        <p className="text-sm text-red-500">{errors.barangay}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="district">District</Label>
                                                    <Input
                                                        id="district"
                                                        value={data.district}
                                                        onChange={(e) => setData('district', e.target.value)}
                                                        placeholder="e.g., District 1"
                                                    />
                                                    {errors.district && (
                                                        <p className="text-sm text-red-500">{errors.district}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Property Details */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Property Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="lot_area">
                                                    Lot Area (sqm) <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="lot_area"
                                                    type="number"
                                                    step="0.01"
                                                    value={data.lot_area}
                                                    onChange={(e) => setData('lot_area', e.target.value)}
                                                    placeholder="150.00"
                                                    required
                                                />
                                                {errors.lot_area && (
                                                    <p className="text-sm text-red-500">{errors.lot_area}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="zoning_rule_id">Zoning Classification</Label>
                                                <Select
                                                    value={data.zoning_rule_id}
                                                    onValueChange={(value) => setData('zoning_rule_id', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select zoning rule" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {zoningRules.map((rule) => (
                                                            <SelectItem key={rule.id} value={rule.id.toString()}>
                                                                {rule.zone_code} - {rule.zone_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.zoning_rule_id && (
                                                    <p className="text-sm text-red-500">{errors.zoning_rule_id}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="lot_number">Lot Number</Label>
                                                <Input
                                                    id="lot_number"
                                                    value={data.lot_number}
                                                    onChange={(e) => setData('lot_number', e.target.value)}
                                                    placeholder="e.g., LOT-001"
                                                />
                                                {errors.lot_number && (
                                                    <p className="text-sm text-red-500">{errors.lot_number}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="title_number">Title Number</Label>
                                                <Input
                                                    id="title_number"
                                                    value={data.title_number}
                                                    onChange={(e) => setData('title_number', e.target.value)}
                                                    placeholder="e.g., TCT-12345"
                                                />
                                                {errors.title_number && (
                                                    <p className="text-sm text-red-500">{errors.title_number}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleReset}
                                            disabled={processing}
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Reset
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            <Save className="w-4 h-4 mr-2" />
                                            {processing ? 'Saving...' : 'Save Property'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Help Card */}
                        <Card className="mt-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                            <CardContent className="pt-6">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                    How to Get GPS Coordinates
                                </h4>
                                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                                    <li>Open Google Maps and right-click on the property location</li>
                                    <li>Click the coordinates to copy them</li>
                                    <li>Paste latitude and longitude in the fields above</li>
                                    <li>Or use a GPS device/mobile app at the property location</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
