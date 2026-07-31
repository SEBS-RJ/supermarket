import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  variant = 'delete', // 'delete' | 'void' | 'custom'
  title,
  content,
  confirmText,
  cancelText = 'cancelar',
  loading = false,
}) {
  let defaultTitle = '';
  let defaultContent = '';
  let defaultConfirmText = '';
  let confirmColor = 'error';

  if (variant === 'delete') {
    defaultTitle = 'confirmar eliminación';
    defaultContent = 'esta acción es permanente y no se puede deshacer. ¿deseas eliminar este elemento?';
    defaultConfirmText = 'eliminar';
    confirmColor = 'error';
  } else if (variant === 'void') {
    defaultTitle = 'confirmar anulación de venta';
    defaultContent = 'al anular esta venta, el stock de los productos será devuelto al inventario y la venta cambiará a estado anulada. ¿deseas continuar?';
    defaultConfirmText = 'anular venta';
    confirmColor = 'error';
  }

  const finalTitle = title || defaultTitle;
  const finalContent = content || defaultContent;
  const finalConfirmText = confirmText || defaultConfirmText || 'confirmar';

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 3, p: 1 }
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', textTransform: 'lowercase' }}>
        {finalTitle}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ textTransform: 'lowercase', color: 'text.primary' }}>
          {finalContent}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ textTransform: 'lowercase', borderRadius: 2 }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          disabled={loading}
          sx={{ textTransform: 'lowercase', borderRadius: 2, minWidth: 100 }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : finalConfirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
