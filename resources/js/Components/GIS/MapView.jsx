import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MapView({ 
    center = { lat: 16.9754, lng: 121.8947 }, // Ilagan City, Isabela, Philippines
    zoom = 14,
    properties = [],
    zoningRules = [],
    onPropertyClick = null,
    height = '600px'
}) {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        // Check if Leaflet is loaded
        if (!window.L) {
            console.error('Leaflet library not loaded');
            return;
        }

        // Initialize Leaflet Map with OpenStreetMap - Centered on Ilagan City
        const mapInstance = window.L.map(mapRef.current, {
            center: [center.lat, center.lng],
            zoom: zoom,
            minZoom: 12, // Prevent zooming out too far
            maxZoom: 19,
            // Restrict map bounds to Ilagan City area
            maxBounds: [
                [16.8754, 121.7947], // Southwest corner
                [17.0754, 121.9947]  // Northeast corner
            ],
            maxBoundsViscosity: 1.0 // Makes bounds "hard"
        });

        // Add OpenStreetMap tile layer (free!)
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(mapInstance);

        // Add a marker for Ilagan City Hall as reference
        const cityHallMarker = window.L.marker([16.9754, 121.8947], {
            icon: window.L.divIcon({
                className: 'city-hall-marker',
                html: `<div style="
                    background-color: #ef4444;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 16px;
                ">🏛️</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
            })
        }).addTo(mapInstance);

        cityHallMarker.bindPopup(`
            <div style="padding: 8px;">
                <h3 style="font-weight: 600; margin-bottom: 4px;">Ilagan City Hall</h3>
                <p style="font-size: 12px; color: #666;">Reference Point</p>
            </div>
        `);

        setMap(mapInstance);

        return () => {
            if (mapInstance) {
                mapInstance.remove();
            }
        };
    }, []);

    useEffect(() => {
        if (!map) return;

        // Clear existing markers
        markers.forEach(marker => map.removeLayer(marker));

        // Add property markers
        const newMarkers = properties.map(property => {
            const markerColor = getZoneColor(property.zoning_rule?.zone_type);
            
            // Create custom icon
            const customIcon = window.L.divIcon({
                className: 'custom-marker',
                html: `<div style="
                    background-color: ${markerColor};
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            });

            const marker = window.L.marker(
                [parseFloat(property.latitude), parseFloat(property.longitude)],
                { icon: customIcon }
            ).addTo(map);

            // Create popup content
            const popupContent = `
                <div style="padding: 8px; min-width: 200px;">
                    <h3 style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">${property.address}</h3>
                    <p style="margin: 4px 0; font-size: 12px;"><strong>Zone:</strong> ${property.zoning_rule?.zone_name || 'N/A'}</p>
                    <p style="margin: 4px 0; font-size: 12px;"><strong>Lot Area:</strong> ${property.lot_area} sqm</p>
                    <p style="margin: 4px 0; font-size: 12px;"><strong>Request ID:</strong> ${property.request_id}</p>
                </div>
            `;

            marker.bindPopup(popupContent);

            // Handle click event
            marker.on('click', () => {
                if (onPropertyClick) {
                    onPropertyClick(property);
                }
            });

            return marker;
        });

        setMarkers(newMarkers);

        // Fit bounds to show all markers
        if (newMarkers.length > 0) {
            const group = window.L.featureGroup(newMarkers);
            map.fitBounds(group.getBounds().pad(0.1));
        }
    }, [map, properties]);

    return (
        <div className="space-y-4">
            <div ref={mapRef} style={{ width: '100%', height }} className="rounded-lg border" />
            
            <Card className="p-4">
                <h3 className="font-semibold mb-3">Zone Legend</h3>
                <div className="flex flex-wrap gap-2">
                    {zoningRules.map(rule => (
                        <Badge 
                            key={rule.id} 
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <span 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: getZoneColor(rule.zone_type) }}
                            />
                            {rule.zone_name}
                        </Badge>
                    ))}
                </div>
            </Card>
        </div>
    );
}

function getZoneColor(zoneType) {
    const colors = {
        residential: '#10b981',
        commercial: '#3b82f6',
        industrial: '#f59e0b',
        agricultural: '#84cc16',
        mixed: '#8b5cf6',
    };
    return colors[zoneType] || '#6b7280';
}
