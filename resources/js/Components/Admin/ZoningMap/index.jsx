import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Map,
    MapPin,
    Search,
    Filter,
    Layers,
    Download,
    Eye,
    EyeOff,
    Grid3x3,
    BarChart3,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InteractiveMap } from "./InteractiveMap";

export function ZoningMapComponent({ properties, zoningRules, stats }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedZone, setSelectedZone] = useState("all");
    const [mapView, setMapView] = useState("grid"); // grid, list, map
    const [showLegend, setShowLegend] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(1);

    // Zone color mapping
    const zoneColors = {
        residential: "bg-green-500",
        commercial: "bg-blue-500",
        industrial: "bg-orange-500",
        agricultural: "bg-yellow-500",
        institutional: "bg-purple-500",
        mixed: "bg-pink-500",
        default: "bg-gray-500",
    };

    // Filter properties
    const filteredProperties = useMemo(() => {
        return properties.filter((property) => {
            const matchesSearch =
                searchTerm === "" ||
                property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                property.barangay?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                property.zone_classification?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesZone =
                selectedZone === "all" ||
                property.zone_classification?.toLowerCase() === selectedZone.toLowerCase();

            return matchesSearch && matchesZone;
        });
    }, [properties, searchTerm, selectedZone]);

    // Get unique zones
    const uniqueZones = useMemo(() => {
        const zones = new Set(
            properties
                .map((p) => p.zone_classification)
                .filter(Boolean)
        );
        return Array.from(zones);
    }, [properties]);

    return (
        <div className="space-y-4">
            {/* Header with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">
                                    Total Properties
                                </p>
                                <p className="text-3xl font-bold mt-2">
                                    {stats.total_properties}
                                </p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <MapPin className="h-8 w-8" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">
                                    Zoning Classifications
                                </p>
                                <p className="text-3xl font-bold mt-2">
                                    {stats.total_zones}
                                </p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Layers className="h-8 w-8" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">
                                    Mapped Areas
                                </p>
                                <p className="text-3xl font-bold mt-2">
                                    {filteredProperties.length}
                                </p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Map className="h-8 w-8" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card>
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Map className="h-6 w-6" />
                            Interactive Zoning Map
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowLegend(!showLegend)}
                            >
                                {showLegend ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                            <Button variant="secondary" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <Tabs value={mapView} onValueChange={setMapView} className="w-full">
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            {/* Search and Filters */}
                            <div className="flex-1 space-y-4">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            placeholder="Search by address, barangay, or zone..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="pl-10"
                                        />
                                    </div>
                                    <Select
                                        value={selectedZone}
                                        onValueChange={setSelectedZone}
                                    >
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Filter by zone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Zones
                                            </SelectItem>
                                            {uniqueZones.map((zone) => (
                                                <SelectItem
                                                    key={zone}
                                                    value={zone}
                                                >
                                                    {zone}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* View Switcher */}
                            <TabsList className="grid w-full md:w-[300px] grid-cols-3">
                                <TabsTrigger value="grid">
                                    <Grid3x3 className="h-4 w-4 mr-2" />
                                    Grid
                                </TabsTrigger>
                                <TabsTrigger value="map">
                                    <Map className="h-4 w-4 mr-2" />
                                    Map
                                </TabsTrigger>
                                <TabsTrigger value="stats">
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Stats
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Legend */}
                        {showLegend && (
                            <Card className="mb-6 bg-gray-50">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <span className="text-sm font-semibold text-gray-700">
                                            Zone Legend:
                                        </span>
                                        {Object.entries(zoneColors).map(
                                            ([zone, color]) =>
                                                zone !== "default" && (
                                                    <div
                                                        key={zone}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <div
                                                            className={`w-4 h-4 rounded ${color}`}
                                                        />
                                                        <span className="text-sm capitalize">
                                                            {zone}
                                                        </span>
                                                    </div>
                                                )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Grid View */}
                        <TabsContent value="grid" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredProperties.map((property) => (
                                    <PropertyCard
                                        key={property.id}
                                        property={property}
                                        zoneColors={zoneColors}
                                    />
                                ))}
                            </div>
                            {filteredProperties.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No properties found matching your criteria</p>
                                </div>
                            )}
                        </TabsContent>

                        {/* Map View */}
                        <TabsContent value="map" className="mt-0">
                            <InteractiveMap
                                properties={filteredProperties}
                                selectedZone={selectedZone}
                            />
                        </TabsContent>

                        {/* Statistics View */}
                        <TabsContent value="stats" className="mt-0">
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Properties by Zone Classification</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {Object.entries(stats.properties_by_zone || {}).map(
                                                ([zone, count]) => (
                                                    <div
                                                        key={zone}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`w-4 h-4 rounded ${
                                                                    zoneColors[
                                                                        zone.toLowerCase()
                                                                    ] || zoneColors.default
                                                                }`}
                                                            />
                                                            <span className="font-medium capitalize">
                                                                {zone}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-48 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full ${
                                                                        zoneColors[
                                                                            zone.toLowerCase()
                                                                        ] || zoneColors.default
                                                                    }`}
                                                                    style={{
                                                                        width: `${
                                                                            (count /
                                                                                stats.total_properties) *
                                                                            100
                                                                        }%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <Badge variant="secondary">
                                                                {count}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

function PropertyCard({ property, zoneColors }) {
    const zoneColor =
        zoneColors[property.zone_classification?.toLowerCase()] ||
        zoneColors.default;

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-base font-semibold line-clamp-2">
                            {property.address || "No Address"}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                            {property.barangay || "Unknown Barangay"}
                        </p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${zoneColor} flex-shrink-0 mt-1`} />
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Zone:</span>
                    <Badge variant="outline" className="capitalize">
                        {property.zone_classification || "Unclassified"}
                    </Badge>
                </div>
                {property.latitude && property.longitude && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">
                            {property.latitude}, {property.longitude}
                        </span>
                    </div>
                )}
                <Button variant="outline" size="sm" className="w-full mt-2">
                    <Eye className="h-3 w-3 mr-2" />
                    View Details
                </Button>
            </CardContent>
        </Card>
    );
}
