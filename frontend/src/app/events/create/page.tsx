'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import eventsService from '@/src/services/eventsService';
import { CreateEventFormData } from '@/src/schemas/event.schema';
import EventForm from '@/src/components/events/EventForm';

export default function CreateEventPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateEventFormData) => {
      const res = await eventsService.createEvent(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.push('/events');
    },
  });

  const onSubmit = async (data: CreateEventFormData) => {
    mutation.mutate(data);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push('/events')}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Create Event
        </Typography>

        {mutation.error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {mutation.error instanceof Error ? mutation.error.message : 'Failed to create event'}
          </Alert>
        )}

        <EventForm
          onSubmit={onSubmit}
          isLoading={mutation.isPending}
          submitLabel="Create"
          onCancel={() => router.push('/events')}
        />
      </Paper>
    </Container>
  );
}

