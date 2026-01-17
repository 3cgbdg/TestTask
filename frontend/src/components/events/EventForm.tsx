import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Box, Stack, Button, CircularProgress } from '@mui/material';
import { Save } from '@mui/icons-material';
import { createEventSchema, CreateEventFormData } from '@/src/schemas/event.schema';

interface EventFormProps {
    initialValues?: Partial<CreateEventFormData>;
    onSubmit: (data: CreateEventFormData) => void;
    isLoading?: boolean;
    submitLabel?: string;
    onCancel: () => void;
}

export default function EventForm({
    initialValues,
    onSubmit,
    isLoading,
    submitLabel = 'Save',
    onCancel,
}: EventFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CreateEventFormData>({
        // @ts-ignore - Zod schema handles string/number conversion for latitude/longitude
        resolver: zodResolver(createEventSchema),
        defaultValues: {
            title: initialValues?.title || '',
            description: initialValues?.description || '',
            date: initialValues?.date ? new Date(initialValues.date).toISOString().slice(0, 16) : '',
            location: initialValues?.location || '',
            category: initialValues?.category || '',
            latitude: initialValues?.latitude,
            longitude: initialValues?.longitude,
        },
    });

    const getMinDate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString().slice(0, 16);
    };

    return (
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
                        onClick={onCancel}
                        disabled={isSubmitting || isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={(isSubmitting || isLoading) ? <CircularProgress size={20} /> : <Save />}
                        disabled={isSubmitting || isLoading}
                    >
                        {submitLabel}
                    </Button>
                </Box>
            </Stack>
        </form>
    );
}
