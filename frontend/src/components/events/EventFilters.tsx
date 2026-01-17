import { Stack, TextField, FormControl, InputLabel, Select, MenuItem, Button, SelectChangeEvent, Box } from '@mui/material';
import { Search } from '@mui/icons-material';

interface EventFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    category: string;
    onCategoryChange: (value: string) => void;
    categories: string[];
    sortBy: string;
    sortOrder: string;
    onSortChange: (by: any, order: any) => void;
    onMapClick: () => void;
}

export default function EventFilters({
    search,
    onSearchChange,
    category,
    onCategoryChange,
    categories,
    sortBy,
    sortOrder,
    onSortChange,
    onMapClick,
}: EventFiltersProps) {
    return (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }} flexWrap="wrap">
            <TextField
                fullWidth
                sx={{ minWidth: 200, flex: 1 }}
                placeholder="Search..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
            />

            <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Category</InputLabel>
                <Select
                    value={category || ''}
                    label="Category"
                    onChange={(e: SelectChangeEvent) => onCategoryChange(e.target.value || '')}
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
                        onSortChange(by, order);
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
                onClick={onMapClick}
                sx={{ minWidth: 120 }}
            >
                Map
            </Button>
        </Stack>
    );
}
