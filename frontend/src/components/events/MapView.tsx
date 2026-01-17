'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { IEvent, IMapViewProps } from '@/src/types/events';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

// Fix for default marker icons --- dynamically changing icon urls
function MapIconFix() {
    useEffect(() => {
        import('leaflet').then((leaflet) => {
            // @ts-ignore
            delete leaflet.Icon.Default.prototype._getIconUrl;
            leaflet.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            });
        });
    }, []);

    return null;
}

// Helper component to manage map view 
const MapController = ({ bounds }: { bounds: any[] }) => {
    const { useMap } = require('react-leaflet');
    const map = useMap();

    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50], animate: true });
        }
    }, [bounds, map]);

    return null;
};



export default function MapView({ events, onEventClick }: IMapViewProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <Box sx={{ height: 700, bgcolor: 'grey.100', borderRadius: 2 }} />;

    const eventsWithCoords = events.filter((e) => e.latitude != null && e.longitude != null);

    if (eventsWithCoords.length === 0) {
        return (
            <Paper
                sx={{
                    height: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                }}
            >
                <Typography color="text.secondary">
                    No events with coordinates to display on the map
                </Typography>
            </Paper>
        );
    }

    const bounds = eventsWithCoords.map((e) => [e.latitude!, e.longitude!]);
    const centerLat = eventsWithCoords.reduce((sum, e) => sum + (e.latitude || 0), 0) / eventsWithCoords.length;
    const centerLng = eventsWithCoords.reduce((sum, e) => sum + (e.longitude || 0), 0) / eventsWithCoords.length;

    return (
        <Box sx={{ height: 700, width: '100%', borderRadius: 2, overflow: 'hidden', mb: 4, boxShadow: 3 }}>
            <MapIconFix />
            <MapContainer
                // @ts-ignore
                center={[centerLat, centerLng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <MapController bounds={bounds} />
                <TileLayer
                    // @ts-ignore
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {eventsWithCoords.map((event) => (
                    <Marker
                        key={event.id}
                        // @ts-ignore
                        position={[event.latitude!, event.longitude!]}
                    >
                        <Popup>
                            <Box sx={{ p: 1, minWidth: 150 }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    {event.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                    {event.location}
                                </Typography>
                                <Button
                                    size="small"
                                    variant="contained"
                                    fullWidth
                                    onClick={() => onEventClick(event.id)}
                                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                >
                                    Details
                                </Button>
                            </Box>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </Box>
    );
}
