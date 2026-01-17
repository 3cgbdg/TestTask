'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  CalendarToday,
  LocationOn,
} from '@mui/icons-material';
import eventsService from '@/src/services/eventsService';
import { IEvent } from '@/src/types/events';
import { EventUtils } from '@/src/utils/event.utils';
import SimilarEvents from '@/src/components/events/SimilarEvents';
import DeleteConfirmDialog from '@/src/components/common/DeleteConfirmDialog';

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: event, isLoading, error } = useQuery<IEvent>({
    queryKey: ['events', id],
    queryFn: () => eventsService.getEvent(id),
    enabled: !!id,
  });

  const { data: similarEvents = [] } = useQuery<IEvent[]>({
    queryKey: ['events', id, 'similar'],
    queryFn: () => eventsService.getSimilarEvents(id, 4),
    enabled: !!id && !!event,
  });

  const deleteMutation = useMutation({
    mutationFn: () => eventsService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.push('/events');
    },
  });

  const handleDelete = async () => {
    deleteMutation.mutate();
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Failed to load event'}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/events')} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push('/events')}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      {(error || deleteMutation.error) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {(deleteMutation.error as any)?.message || (error as any)?.message || 'An error occurred'}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Chip label={event.category} color="primary" sx={{ mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              {event.title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => router.push(`/events/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Stack spacing={3}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CalendarToday color="primary" />
              <Typography variant="h6" fontWeight={500}>
                Date & Time
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ ml: 4 }}>
              {EventUtils.formatDate(event.date)}
            </Typography>
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationOn color="primary" />
              <Typography variant="h6" fontWeight={500}>
                Location
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ ml: 4 }}>
              {event.location}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom fontWeight={500}>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {event.description || 'No description'}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <SimilarEvents events={similarEvents} />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </Container>
  );
}

