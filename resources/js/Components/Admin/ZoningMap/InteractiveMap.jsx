import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ZoomIn, ZoomOut, Maximize2, Locate, MapPin, Plus, X } from "lucide-react";
import { useForm, router } from "@inertiajs/react";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export function InteractiveMap({ properties, selectedZone }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const clickHandlerRef = useRef(null);
    const [isAddingMarker, setIsAddingMarker] = useState(false);
    const [selectedMarkerType, setSelectedMarkerType] = useState(null);
    const [newMarkerData, setNewMarkerData] = useState(null);
    const [showTypeDialog, setShowTypeDialog] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);

    // Zone color mapping - Bright green for residential
    const zoneColors = {
        residential: "#10b981",  // Bright emerald green
        commercial: "#3b82f6",   // Blue
        industrial: "#f97316",   // Orange
        agricultural: "#eab308", // Yellow
        institutional: "#a855f7", // Purple
        mixed: "#ec4899",        // Pink
        default: "#6b7280",      // Gray
    };

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize map centered on Ilagan City, Isabela
        if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView(
                [17.1453, 121.8840], // Ilagan City coordinates
                13
            );

            // Add OpenStreetMap tiles
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(mapInstanceRef.current);
        }

        // Update click handler when adding marker state changes
        if (mapInstanceRef.current) {
            // Remove old click handler if exists
            if (clickHandlerRef.current) {
                mapInstanceRef.current.off('click', clickHandlerRef.current);
            }

            // Create new click handler
            clickHandlerRef.current = (e) => {
                if (isAddingMarker && selectedMarkerType) {
                    setNewMarkerData({
                        latitude: e.latlng.lat.toFixed(6),
                        longitude: e.latlng.lng.toFixed(6),
                        zone_type: selectedMarkerType,
                    });
                    setShowAddDialog(true);
                    setIsAddingMarker(false);
                    setSelectedMarkerType(null);
                    mapInstanceRef.current.getContainer().style.cursor = '';
                }
            };

            // Add new click handler
            mapInstanceRef.current.on('click', clickHandlerRef.current);
        }

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        // Filter properties based on selected zone
        const filteredProperties = properties.filter((property) => {
            if (selectedZone === "all") return true;
            return property.zone_classification?.toLowerCase() === selectedZone.toLowerCase();
        });

        // Add markers for properties with coordinates
        filteredProperties.forEach((property) => {
            if (property.latitude && property.longitude) {
                const zoneType = property.zone_classification?.toLowerCase() || "default";
                const color = zoneColors[zoneType] || zoneColors.default;

                // Create custom icon
                const customIcon = L.divIcon({
                    className: "custom-marker",
                    html: `
                        <div style="
                            background-color: ${color};
                            width: 24px;
                            height: 24px;
                            border-radius: 50% 50% 50% 0;
                            transform: rotate(-45deg);
                            border: 2px solid white;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        ">
                            <div style="
                                width: 8px;
                                height: 8px;
                                background-color: white;
                                border-radius: 50%;
                                position: absolute;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%);
                            "></div>
                        </div>
                    `,
                    iconSize: [24, 24],
                    iconAnchor: [12, 24],
                });

                const marker = L.marker([property.latitude, property.longitude], {
                    icon: customIcon,
                }).addTo(mapInstanceRef.current);

                // Add popup with property information
                const popupContent = `
                    <div style="min-width: 200px;">
                        <h3 style="font-weight: bold; margin-bottom: 8px; color: ${color};">
                            ${property.zone_classification || "Unclassified"}
                        </h3>
                        <p style="margin: 4px 0;"><strong>Address:</strong> ${property.address || "N/A"}</p>
                        <p style="margin: 4px 0;"><strong>Barangay:</strong> ${property.barangay || "N/A"}</p>
                        <p style="margin: 4px 0;"><strong>Zone Name:</strong> ${property.zone_name || "N/A"}</p>
                        <p style="margin: 4px 0;"><strong>Zone Code:</strong> ${property.zone_code || "N/A"}</p>
                        ${property.lot_area ? `<p style="margin: 4px 0;"><strong>Lot Area:</strong> ${property.lot_area} sqm</p>` : ""}
                        <p style="margin: 4px 0; font-size: 12px; color: #666;">
                            <strong>Coordinates:</strong><br/>
                            ${property.latitude}, ${property.longitude}
                        </p>
                    </div>
                `;

                marker.bindPopup(popupContent);
                markersRef.current.push(marker);
            }
        });

        // Fit bounds to show all markers if there are any
        if (markersRef.current.length > 0) {
            const group = L.featureGroup(markersRef.current);
            mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
        }

        return () => {
            // Cleanup on unmount
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [properties, selectedZone, isAddingMarker, selectedMarkerType]);

    const handleZoomIn = () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.zoomIn();
        }
    };

    const handleZoomOut = () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.zoomOut();
        }
    };

    const handleResetView = () => {
        if (mapInstanceRef.current) {
            if (markersRef.current.length > 0) {
                const group = L.featureGroup(markersRef.current);
                mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
            } else {
                mapInstanceRef.current.setView([17.1453, 121.8840], 13);
            }
        }
    };

    const handleLocate = () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.locate({ setView: true, maxZoom: 16 });
        }
    };

    const toggleAddMarker = () => {
        if (!isAddingMarker) {
            // Show zone type selection dialog first
            setShowTypeDialog(true);
        } else {
            // Cancel adding marker
            setIsAddingMarker(false);
            setSelectedMarkerType(null);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.getContainer().style.cursor = '';
            }
        }
    };

    const handleSelectMarkerType = (type) => {
        setSelectedMarkerType(type);
        setIsAddingMarker(true);
        setShowTypeDialog(false);
        if (mapInstanceRef.current) {
            mapInstanceRef.current.getContainer().style.cursor = 'crosshair';
        }
    };

    const handleSaveMarker = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const data = {
            latitude: newMarkerData.latitude,
            longitude: newMarkerData.longitude,
            address: formData.get('address'),
            barangay: formData.get('barangay'),
            zone_type: newMarkerData.zone_type,
            lot_area: formData.get('lot_area'),
        };

        // Submit to backend
        router.post(route('admin.properties.store'), data, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddDialog(false);
                setNewMarkerData(null);
                // Reload the page to fetch updated properties
                router.reload({ only: ['properties', 'stats'] });
            },
            onError: (errors) => {
                console.error('Error saving property:', errors);
                alert('Error saving property. Please check the console for details.');
            }
        });
    };

    // Zone type options with colors
    const zoneTypeOptions = [
        { value: 'residential', label: 'Residential', color: '#10b981', icon: '🏠' },
        { value: 'commercial', label: 'Commercial', color: '#3b82f6', icon: '🏢' },
        { value: 'industrial', label: 'Industrial', color: '#f97316', icon: '🏭' },
        { value: 'agricultural', label: 'Agricultural', color: '#eab308', icon: '🌾' },
        { value: 'institutional', label: 'Institutional', color: '#a855f7', icon: '🏛️' },
        { value: 'mixed', label: 'Mixed Use', color: '#ec4899', icon: '🏘️' },
    ];

    return (
        <>
            <div className="relative">
                <div
                    ref={mapRef}
                    className="w-full h-[600px] rounded-lg shadow-lg border border-gray-200 relative z-0"
                />
                
                {/* Map Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
                    <Button
                        size="sm"
                        variant={isAddingMarker ? "default" : "secondary"}
                        className={`shadow-lg ${isAddingMarker ? 'bg-green-600 hover:bg-green-700' : 'bg-white hover:bg-gray-100'}`}
                        onClick={toggleAddMarker}
                        title={isAddingMarker ? "Cancel Adding Marker" : "Add New Marker"}
                    >
                        {isAddingMarker ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        className="shadow-lg bg-white hover:bg-gray-100"
                        onClick={handleZoomIn}
                        title="Zoom In"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        className="shadow-lg bg-white hover:bg-gray-100"
                        onClick={handleZoomOut}
                        title="Zoom Out"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        className="shadow-lg bg-white hover:bg-gray-100"
                        onClick={handleResetView}
                        title="Reset View"
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        className="shadow-lg bg-white hover:bg-gray-100"
                        onClick={handleLocate}
                        title="Locate Me"
                    >
                        <Locate className="h-4 w-4" />
                    </Button>
                </div>

                {/* Property Count Badge */}
                <div className="absolute bottom-4 left-4 z-[1000]">
                    <Card className="bg-white/95 backdrop-blur-sm shadow-lg px-4 py-2">
                        <p className="text-sm font-medium">
                            Showing {markersRef.current.length} {markersRef.current.length === 1 ? "property" : "properties"}
                        </p>
                    </Card>
                </div>

                {/* Add Marker Mode Indicator */}
                {isAddingMarker && selectedMarkerType && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
                        <Card 
                            className="text-white shadow-lg px-4 py-2"
                            style={{ backgroundColor: zoneTypeOptions.find(z => z.value === selectedMarkerType)?.color }}
                        >
                            <p className="text-sm font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Click on the map to add a {zoneTypeOptions.find(z => z.value === selectedMarkerType)?.label} property marker
                            </p>
                        </Card>
                    </div>
                )}
            </div>

            {/* Select Zone Type Dialog */}
            <Dialog open={showTypeDialog} onOpenChange={setShowTypeDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Select Zone Type</DialogTitle>
                        <DialogDescription>
                            Choose the type of property zone you want to add to the map.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 py-4">
                        {zoneTypeOptions.map((zone) => (
                            <Button
                                key={zone.value}
                                variant="outline"
                                className="h-auto py-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                                style={{ borderColor: zone.color }}
                                onClick={() => handleSelectMarkerType(zone.value)}
                            >
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                                    style={{ backgroundColor: zone.color + '20' }}
                                >
                                    {zone.icon}
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold">{zone.label}</div>
                                    <div
                                        className="w-8 h-2 rounded-full mx-auto mt-1"
                                        style={{ backgroundColor: zone.color }}
                                    />
                                </div>
                            </Button>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowTypeDialog(false)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Property Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleSaveMarker}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <span style={{ fontSize: '24px' }}>
                                    {zoneTypeOptions.find(z => z.value === newMarkerData?.zone_type)?.icon}
                                </span>
                                Add New {zoneTypeOptions.find(z => z.value === newMarkerData?.zone_type)?.label} Property
                            </DialogTitle>
                            <DialogDescription>
                                Add a new property location to the map. Fill in the details below.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="latitude">Latitude</Label>
                                    <Input
                                        id="latitude"
                                        name="latitude"
                                        value={newMarkerData?.latitude || ''}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="longitude">Longitude</Label>
                                    <Input
                                        id="longitude"
                                        name="longitude"
                                        value={newMarkerData?.longitude || ''}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="zone_type">Zone Classification</Label>
                                <div 
                                    className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-50"
                                    style={{ 
                                        borderColor: zoneTypeOptions.find(z => z.value === newMarkerData?.zone_type)?.color,
                                        backgroundColor: zoneTypeOptions.find(z => z.value === newMarkerData?.zone_type)?.color + '10'
                                    }}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: zoneTypeOptions.find(z => z.value === newMarkerData?.zone_type)?.color }}
                                    />
                                    <span className="font-medium">
                                        {zoneTypeOptions.find(z => z.value === newMarkerData?.zone_type)?.label}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address *</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    placeholder="Enter property address"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="barangay">Barangay *</Label>
                                <Input
                                    id="barangay"
                                    name="barangay"
                                    placeholder="Enter barangay"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lot_area">Lot Area (sqm)</Label>
                                <Input
                                    id="lot_area"
                                    name="lot_area"
                                    type="number"
                                    step="0.01"
                                    placeholder="Enter lot area"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowAddDialog(false);
                                    setNewMarkerData(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                className="text-white"
                                style={{ backgroundColor: zoneTypeOptions.find(z => z.value === newMarkerData?.zone_type)?.color }}
                            >
                                <MapPin className="h-4 w-4 mr-2" />
                                Add Property
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
