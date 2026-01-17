import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { IEvent } from '@/src/types/events';
import { EventUtils } from '@/src/utils/event.utils';
import { useRouter } from 'next/navigation';

interface SimilarEventsProps {
    events: IEvent[];
}

export default function SimilarEvents({ events }: SimilarEventsProps) {
    const router = useRouter();

    if (events.length === 0) return null;

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
                Similar Events
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                {events.map((similarEvent) => (
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
                                {EventUtils.formatDate(similarEvent.date)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                                {similarEvent.location}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
}
