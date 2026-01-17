import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, CircularProgress } from '@mui/material';

interface DeleteConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
    title?: string;
    description?: string;
}

export default function DeleteConfirmDialog({
    open,
    onClose,
    onConfirm,
    loading,
    title = 'Confirm Deletion',
    description = 'Are you sure you want to delete this item? This action cannot be undone.',
}: DeleteConfirmDialogProps) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{description}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={20} /> : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
