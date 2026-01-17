'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import eventsService from '@/src/services/eventsService';
import MapView from '@/src/components/events/MapView';
import MapEventList from '@/src/components/events/MapEventList';

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
          {(error as any)?.message || 'Failed to load events'}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <MapView events={events} onEventClick={handleEventClick} />
          <MapEventList events={events} onEventClick={handleEventClick} />
        </>
      )}
    </Container>
  );
}

