import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Card } from '@/Components/ui/card';
import { MapPin } from 'lucide-react';

export default function PropertyLocationForm({ request, zoningRules, onSuccess }) {
    const { data, setData, post, processing, errors } = useForm({
        request_id: request.id,
        latitude: '',
        longitude: '',
        address: request.project_location_street || '',
        barangay: request.project_location_barangay || '',
        district: '',
        zoning_rule_id: '',
        lot_area: request.lot_area_sqm || '',
        lot_number: '',
        title_number: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.property-locations.store'), {
            onSuccess: () => {
                if (onSuccess) onSuccess();
            },
        });
    };

    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Add Property Location</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="latitude">Latitude *</Label>
                        <Input
                            id="latitude"
                            type="number"
                            step="0.00000001"
                            value={data.latitude}
                            onChange={(e) => setData('latitude', e.target.value)}
                            placeholder="14.5995"
                            required
                        />
                        {errors.latitude && (
                            <p className="text-sm text-red-600 mt-1">{errors.latitude}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="longitude">Longitude *</Label>
                        <Input
                            id="longitude"
                            type="number"
                            step="0.00000001"
                            value={data.longitude}
                            onChange={(e) => setData('longitude', e.target.value)}
                            placeholder="120.9842"
                            required
                        />
                        {errors.longitude && (
                            <p className="text-sm text-red-600 mt-1">{errors.longitude}</p>
                        )}
                    </div>
                </div>

                <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                        id="address"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        required
                    />
                    {errors.address && (
                        <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="barangay">Barangay</Label>
                        <Input
                            id="barangay"
                            value={data.barangay}
                            onChange={(e) => setData('barangay', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="district">District</Label>
                        <Input
                            id="district"
                            value={data.district}
                            onChange={(e) => setData('district', e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="zoning_rule_id">Zoning Classification *</Label>
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
                        <p className="text-sm text-red-600 mt-1">{errors.zoning_rule_id}</p>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="lot_area">Lot Area (sqm) *</Label>
                        <Input
                            id="lot_area"
                            type="number"
                            step="0.01"
                            value={data.lot_area}
                            onChange={(e) => setData('lot_area', e.target.value)}
                            required
                        />
                        {errors.lot_area && (
                            <p className="text-sm text-red-600 mt-1">{errors.lot_area}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="lot_number">Lot Number</Label>
                        <Input
                            id="lot_number"
                            value={data.lot_number}
                            onChange={(e) => setData('lot_number', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="title_number">Title Number</Label>
                        <Input
                            id="title_number"
                            value={data.title_number}
                            onChange={(e) => setData('title_number', e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Save Property Location'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
