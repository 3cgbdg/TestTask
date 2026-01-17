'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import eventsService from '@/src/services/eventsService';
import EventCard from '@/src/components/events/EventCard';
import EventFilters from '@/src/components/events/EventFilters';
import { EventUtils } from '@/src/utils/event.utils';

export default function EventsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'createdAt'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [mounted, setMounted] = useState(false);

  // for 1st loading state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch categories
  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ['categories'],
    queryFn: () => eventsService.getCategories(),
  });



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
        limit: 10,
      });
      return response;
    },
  });

  // getting data from response
  const events = eventsResponse?.data || [];
  const totalPages = eventsResponse?.totalPages || 0;



  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // loading state
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

      <EventFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        category={category}
        onCategoryChange={(val) => {
          setCategory(val);
          setPage(1);
        }}
        categories={categories}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(by, order) => {
          setSortBy(by);
          setSortOrder(order);
        }}
        onMapClick={() => router.push('/events/map')}
      />

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
              <EventCard
                key={event.id}
                event={event}
                formatDate={EventUtils.formatDate}
                truncateDescription={EventUtils.truncateDescription}
                onDetailsClick={(id) => router.push(`/events/${id}`)}
              />
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
