'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  List,
} from '@mui/material';
import { ArrowBack, LocationOn } from '@mui/icons-material';
import eventsService from '@/src/services/eventsService';
import { IEvent } from '@/src/types/events';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });


// Fix for default marker icons in Leaflet with Next.js
function MapIconFix() {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet);
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

// Helper component to manage map view (centering, fitting bounds)
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

function EventMap({ events, onEventClick }: { events: IEvent[]; onEventClick: (id: string) => void }) {
  const eventsWithCoords = events.filter((e) => e.latitude != null && e.longitude != null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <Box sx={{ height: 700, bgcolor: 'grey.100', borderRadius: 2 }} />;

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
    <Box>
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

      <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
        Events on Map
      </Typography>
      <List sx={{ mt: 2 }}>
        {eventsWithCoords.map((event) => (
          <Card
            key={event.id}
            sx={{
              mb: 2,
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3,
                borderColor: 'primary.main',
              },
            }}
            onClick={() => onEventClick(event.id)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Chip
                    label={event.category}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 1.5 }}
                  />
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    {event.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <LocationOn fontSize="small" />
                    <Typography variant="body2">{event.location}</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </List>
    </Box>
  );
}


export default function EventsMapPage() {
  const router = useRouter();

  const { data: eventsResponse, isLoading, error } = useQuery({
    queryKey: ['events', { limit: 100 }],
    queryFn: () => eventsService.getEvents({ limit: 100 }),
  });

  const events = eventsResponse?.data || [];

  const handleEventClick = (id: string) => {
    router.push(`/events/${id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Events Map
        </Typography>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/events')}>
          Back to List
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Failed to load events'}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <EventMap events={events} onEventClick={handleEventClick} />
      )}
    </Container>
  );
}

