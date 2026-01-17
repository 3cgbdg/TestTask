'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import eventsService from '@/src/services/eventsService';
import { createEventSchema, CreateEventFormData } from '@/src/schemas/event.schema';
import { updateEvent } from '@/src/redux/eventsSlice';
import { AppDispatch } from '@/src/redux/store';
import { IEvent } from '@/src/types/events';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();

  const { data: event, isLoading, error } = useQuery<IEvent>({
    queryKey: ['events', id],
    queryFn: () => eventsService.getEvent(id),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateEventFormData>({
    // @ts-ignore - Zod schema handles string/number conversion for latitude/longitude
    resolver: zodResolver(createEventSchema),
  });

  useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description || '',
        date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
        location: event.location,
        category: event.category,
        latitude: event.latitude,
        longitude: event.longitude,
      });
    }
  }, [event, reset]);

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
      const response = await eventsService.updateEvent(id, eventData as IEvent);
      return { ...event!, ...eventData };
    },
    onSuccess: (data) => {
      dispatch(updateEvent(data));
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Event Title"
              {...register('title')}
              error={!!errors.title}
              helperText={errors.title?.message}
              required
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              {...register('description')}
              error={!!errors.description}
              helperText={errors.description?.message}
              required
            />

            <TextField
              fullWidth
              type="datetime-local"
              label="Date & Time"
              {...register('date')}
              error={!!errors.date}
              helperText={errors.date?.message}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              fullWidth
              label="Location"
              {...register('location')}
              error={!!errors.location}
              helperText={errors.location?.message}
              required
            />

            <TextField
              fullWidth
              label="Category"
              {...register('category')}
              error={!!errors.category}
              helperText={errors.category?.message}
              required
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="Latitude (optional)"
                {...register('latitude', { valueAsNumber: true })}
                error={!!errors.latitude}
                helperText={errors.latitude?.message || 'For map display'}
                inputProps={{ step: 'any', min: -90, max: 90 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Longitude (optional)"
                {...register('longitude', { valueAsNumber: true })}
                error={!!errors.longitude}
                helperText={errors.longitude?.message || 'For map display'}
                inputProps={{ step: 'any', min: -180, max: 180 }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => router.push(`/events/${id}`)}
                disabled={isSubmitting || mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={(isSubmitting || mutation.isPending) ? <CircularProgress size={20} /> : <Save />}
                disabled={isSubmitting || mutation.isPending}
              >
                Save
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
