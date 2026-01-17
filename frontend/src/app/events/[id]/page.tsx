'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  Grid,
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
import { removeEvent } from '@/src/redux/eventsSlice';
import { AppDispatch } from '@/src/redux/store';

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
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
      dispatch(removeEvent(id));
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.push('/events');
    },
  });

  const handleDelete = async () => {
    deleteMutation.mutate();
  };

  const formatDate = useMemo(() => {
    return (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };
  }, []);

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
          {deleteMutation.error instanceof Error 
            ? deleteMutation.error.message 
            : error instanceof Error 
            ? error.message 
            : 'Error'}
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
              {formatDate(event.date)}
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

      {similarEvents.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
            Similar Events
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            {similarEvents.map((similarEvent) => (
              <Card
                key={similarEvent.id}
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => router.push(`/events/${similarEvent.id}`)}
              >
                <CardContent>
                  <Chip label={similarEvent.category} size="small" sx={{ mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    {similarEvent.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {formatDate(similarEvent.date)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {similarEvent.location}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
