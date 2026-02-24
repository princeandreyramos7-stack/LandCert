import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { AdminSidebar } from '@/Components/admin-sidebar';
import MapView from '@/Components/GIS/MapView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Building2, Ruler, Navigation } from 'lucide-react';
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

export default function ZoningMap({ auth, zoningRules, properties }) {
    const [selectedProperty, setSelectedProperty] = useState(null);

    return (
        <SidebarProvider>
            <Head title="Zoning Map - Ilagan City" />
            <AdminSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>GIS & Zoning / Zoning Map</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {/* Header */}
                    <div className="mb-2">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold">GIS Zoning Map</h2>
                        </div>
                        <p className="text-muted-foreground">
                            Interactive map showing property locations and zoning classifications in Ilagan City, Isabela
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Map Section */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Navigation className="w-5 h-5" />
                                        Ilagan City Zoning Map
                                    </CardTitle>
                                    <CardDescription>
                                        Click on property markers to view details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <MapView
                                        properties={properties}
                                        zoningRules={zoningRules}
                                        onPropertyClick={setSelectedProperty}
                                        height="700px"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            {/* Selected Property Details */}
                            {selectedProperty ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Property Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Address</p>
                                            <p className="font-medium">{selectedProperty.address}</p>
                                        </div>

                                        <Separator />

                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">Zoning Classification</p>
                                            <Badge variant="outline" className="text-sm">
                                                <Building2 className="w-3 h-3 mr-1" />
                                                {selectedProperty.zoning_rule?.zone_name || 'Unzoned'}
                                            </Badge>
                                        </div>

                                        <Separator />

                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Lot Area</p>
                                            <div className="flex items-center gap-2">
                                                <Ruler className="w-4 h-4 text-muted-foreground" />
                                                <p className="font-medium">{selectedProperty.lot_area} sqm</p>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Coordinates</p>
                                            <p className="text-xs font-mono bg-muted p-2 rounded">
                                                {selectedProperty.latitude}, {selectedProperty.longitude}
                                            </p>
                                        </div>

                                        {selectedProperty.barangay && (
                                            <>
                                                <Separator />
                                                <div>
                                                    <p className="text-sm text-muted-foreground mb-1">Barangay</p>
                                                    <p className="font-medium">{selectedProperty.barangay}</p>
                                                </div>
                                            </>
                                        )}

                                        {selectedProperty.district && (
                                            <>
                                                <Separator />
                                                <div>
                                                    <p className="text-sm text-muted-foreground mb-1">District</p>
                                                    <p className="font-medium">{selectedProperty.district}</p>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center text-muted-foreground">
                                            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">
                                                Click on a property marker to view details
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Statistics Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Statistics</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Total Properties</span>
                                        <Badge variant="secondary">{properties.length}</Badge>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Zoning Rules</span>
                                        <Badge variant="secondary">{zoningRules.length}</Badge>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Location</span>
                                        <span className="text-sm font-medium">Ilagan City</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Info Card */}
                            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                                <CardContent className="pt-6">
                                    <div className="flex gap-3">
                                        <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                                Ilagan City, Isabela
                                            </p>
                                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                                Map is restricted to Ilagan City area for accurate zoning management
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
