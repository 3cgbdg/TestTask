import { Typography, List, Card, CardContent, Box, Chip } from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { IEvent } from '@/src/types/events';

interface MapEventListProps {
    events: IEvent[];
    onEventClick: (id: string) => void;
}

export default function MapEventList({ events, onEventClick }: MapEventListProps) {
    const eventsWithCoords = events.filter((e) => e.latitude != null && e.longitude != null);

    if (eventsWithCoords.length === 0) return null;

    return (
        <Box>
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                Events on Map
            </Typography>
            <List sx={{ mt: 2 }}>
                {eventsWithCoords.map((event) => (
                    <Card
                        key={event.id}
                        sx={{
                            mb: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 3,
                                borderColor: 'primary.main',
                            },
                        }}
                        onClick={() => onEventClick(event.id)}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Chip
                                        label={event.category}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{ mb: 1.5 }}
                                    />
                                    <Typography variant="h6" gutterBottom fontWeight={600}>
                                        {event.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                        <LocationOn fontSize="small" />
                                        <Typography variant="body2">{event.location}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </List>
        </Box>
    );
}
