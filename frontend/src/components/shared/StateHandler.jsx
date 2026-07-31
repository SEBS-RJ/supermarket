import React from 'react';
import { Box, Alert, Button, Typography, Skeleton } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import InboxIcon from '@mui/icons-material/Inbox';

export default function StateHandler({
  loading = false,
  error = null,
  isEmpty = false,
  onRetry,
  emptyMessage = 'no se encontraron registros',
  skeletonHeight = 60,
  skeletonCount = 4,
  children,
}) {
  if (loading) {
    return (
      <Box sx={{ width: '100%', py: 2 }}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={skeletonHeight}
            sx={{ mb: 1.5, borderRadius: 2 }}
            animation="wave"
          />
        ))}
      </Box>
    );
  }

  if (error) {
    const message = typeof error === 'string' ? error : error.message || 'ocurrió un error al cargar la información';
    return (
      <Box sx={{ py: 3, px: 1 }}>
        <Alert
          severity="error"
          sx={{ textTransform: 'lowercase', borderRadius: 2 }}
          action={
            onRetry && (
              <Button
                color="inherit"
                size="small"
                onClick={onRetry}
                startIcon={<ReplayIcon />}
                sx={{ textTransform: 'lowercase' }}
              >
                reintentar
              </Button>
            )
          }
        >
          {message}
        </Alert>
      </Box>
    );
  }

  if (isEmpty) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          px: 2,
          textAlign: 'center',
          color: 'text.secondary',
        }}
      >
        <InboxIcon sx={{ fontSize: 64, mb: 1, opacity: 0.5 }} />
        <Typography variant="body1" sx={{ textTransform: 'lowercase' }}>
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
