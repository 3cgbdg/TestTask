import { Card, CardContent, CardActions, Typography, Button, Box, Chip, Stack } from '@mui/material';
import { CalendarToday, LocationOn } from '@mui/icons-material';
import { IEvent } from '@/src/types/events';

interface EventCardProps {
    event: IEvent;
    onDetailsClick: (id: string) => void;
    formatDate: (date: string) => string;
    truncateDescription: (text?: string) => string;
}

export default function EventCard({ event, onDetailsClick, formatDate, truncateDescription }: EventCardProps) {
    return (
        <Card
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
                    onClick={() => onDetailsClick(event.id)}
                >
                    Details
                </Button>
            </CardActions>
        </Card>
    );
}
