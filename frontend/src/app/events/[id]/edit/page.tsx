'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import eventsService from '@/src/services/eventsService';
import { CreateEventFormData } from '@/src/schemas/event.schema';
import { IEvent } from '@/src/types/events';
import EventForm from '@/src/components/events/EventForm';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const { data: event, isLoading, error } = useQuery<IEvent>({
    queryKey: ['events', id],
    queryFn: () => eventsService.getEvent(id),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateEventFormData) => {
      const eventData: Partial<IEvent> = {
        title: data.title,
        description: data.description,
        date: data.date,
        location: data.location,
        category: data.category,
        latitude: data.latitude || undefined,
        longitude: data.longitude || undefined,
      };
      await eventsService.updateEvent(id, eventData as IEvent);
      return { ...event!, ...eventData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', id] });
      router.push(`/events/${id}`);
    },
  });

  const onSubmit = async (data: CreateEventFormData) => {
    mutation.mutate(data);
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
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Failed to load event'}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/events')}>
          Back to List
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push(`/events/${id}`)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Edit Event
        </Typography>

        {mutation.error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {mutation.error instanceof Error ? mutation.error.message : 'Failed to update event'}
          </Alert>
        )}

        <EventForm
          initialValues={event}
          onSubmit={onSubmit}
          isLoading={mutation.isPending}
          submitLabel="Save Changes"
          onCancel={() => router.push(`/events/${id}`)}
        />
      </Paper>
    </Container>
  );
}

