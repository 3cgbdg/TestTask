import { z } from 'zod';

// Schema for optional number fields (latitude/longitude)
// Accepts string, number, or undefined and converts to number | undefined
const optionalNumberSchema = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
  z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90').optional()
);

const optionalLongitudeSchema = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
  z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180').optional()
);



export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required').min(10, 'Description must be at least 10 characters'),
  date: z.string().min(1, 'Date is required').refine(
    (date) => {
      const eventDate = new Date(date);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return eventDate >= now;
    },
    { message: 'Date cannot be in the past' }
  ),
  location: z.string().min(1, 'Location is required'),
  category: z.string().min(1, 'Category is required'),
  latitude: optionalNumberSchema,
  longitude: optionalLongitudeSchema,
});

export const updateEventSchema = createEventSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be filled' }
);

export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type UpdateEventFormData = z.infer<typeof updateEventSchema>;
