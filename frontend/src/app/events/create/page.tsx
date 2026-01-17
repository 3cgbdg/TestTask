'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { addEvent } from '@/src/redux/eventsSlice';
import { AppDispatch } from '@/src/redux/store';

export default function CreateEventPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventFormData>({
    // @ts-ignore - Zod schema handles string/number conversion for latitude/longitude
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      location: '',
      category: '',
      latitude: undefined,
      longitude: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateEventFormData) => {
      const res = await eventsService.createEvent(data);
      return res.data;
    },
    onSuccess: (event: any) => {
      dispatch(addEvent(event));
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.push('/events');
    },
  });

  const onSubmit = async (data: CreateEventFormData) => {
    mutation.mutate(data as CreateEventFormData);
  };

  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().slice(0, 16);
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

        <form onSubmit={handleSubmit(onSubmit as any)}>
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
              inputProps={{ min: getMinDate() }}
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
                label="Latitude (-90 to 90)"
                {...register('latitude', { valueAsNumber: true })}
                error={!!errors.latitude}
                helperText={errors.latitude?.message}
                inputProps={{ step: 'any', min: -90, max: 90 }}
              />

              <TextField
                fullWidth
                type="number"
                label="Longitude (-180 to 180)"
                {...register('longitude', { valueAsNumber: true })}
                error={!!errors.longitude}
                helperText={errors.longitude?.message}
                inputProps={{ step: 'any', min: -180, max: 180 }}
              />
            </Box>


            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => router.push('/events')}
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
                Create
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
