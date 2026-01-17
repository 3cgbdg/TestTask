'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import {
  Container,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  SelectChangeEvent,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarToday,
  LocationOn,
  Search,
} from '@mui/icons-material';
import eventsService from '@/src/services/eventsService';
import { IEvent } from '@/src/types/events';
import { setEvents } from '@/src/redux/eventsSlice';
import { AppDispatch } from '@/src/redux/store';

export default function EventsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'createdAt'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch categories
  const { data: categoriesData } = useQuery<string[]>({
    queryKey: ['categories'],
    queryFn: () => eventsService.getCategories(),
  });

  // Ensure categories is always an array
  const categories = useMemo(() => {
    if (!categoriesData) return [];
    return Array.isArray(categoriesData) ? categoriesData : [];
  }, [categoriesData]);

  // Fetch events with filters
  const { data: eventsResponse, isLoading, error } = useQuery({
    queryKey: ['events', { search, category, page, sortBy, sortOrder }],
    queryFn: async () => {
      const response = await eventsService.getEvents({
        search: search || undefined,
        category: category || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 12,
      });
      dispatch(setEvents(response.data));
      return response;
    },
  });

  const events = eventsResponse?.data || [];
  const totalPages = eventsResponse?.totalPages || 0;

  const formatDate = useMemo(() => {
    return (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };
  }, []);

  const truncateDescription = (text?: string, maxLength: number = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!mounted) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Events
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/events/create')}
        >
          Create Event
        </Button>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }} flexWrap="wrap">
        <TextField
          fullWidth
          sx={{ minWidth: 200, flex: 1 }}
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category || ''}
            label="Category"
            onChange={(e: SelectChangeEvent) => {
              setCategory(e.target.value || '');
              setPage(1);
            }}
          >
            <MenuItem value="">All</MenuItem>
            {Array.isArray(categories) && categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={`${sortBy}_${sortOrder}`}
            label="Sort By"
            onChange={(e: SelectChangeEvent) => {
              const [by, order] = e.target.value.split('_');
              setSortBy(by as 'date' | 'title' | 'createdAt');
              setSortOrder(order as 'asc' | 'desc');
            }}
          >
            <MenuItem value="date_asc">Date (Ascending)</MenuItem>
            <MenuItem value="date_desc">Date (Descending)</MenuItem>
            <MenuItem value="title_asc">Title (A-Z)</MenuItem>
            <MenuItem value="title_desc">Title (Z-A)</MenuItem>
            <MenuItem value="createdAt_desc">Newest First</MenuItem>
            <MenuItem value="createdAt_asc">Oldest First</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          onClick={() => router.push('/events/map')}
          sx={{ minWidth: 120 }}
        >
          Map
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Failed to load events'}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : events.length === 0 ? (
        <Alert severity="info">No events found</Alert>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {events.map((event) => (
              <Card
                key={event.id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip label={event.category} size="small" color="primary" />
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom fontWeight={600}>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                    {truncateDescription(event.description)}
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(event.date)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {event.location}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => router.push(`/events/${event.id}`)}
                  >
                    Details
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
