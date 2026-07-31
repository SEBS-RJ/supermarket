import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

const FeedbackContext = createContext(null);

export const FeedbackProvider = ({ children }) => {
  const [feedback, setFeedback] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error' | 'warning' | 'info'
  });

  const showFeedback = useCallback((message, severity = 'success') => {
    setFeedback({
      open: true,
      message: message ? message.toLowerCase() : '',
      severity,
    });
  }, []);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setFeedback((prev) => ({ ...prev, open: false }));
  };

  return (
    <FeedbackContext.Provider value={{ showFeedback }}>
      {children}
      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={feedback.severity}
          variant="filled"
          sx={{ width: '100%', textTransform: 'lowercase' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback debe ser usado dentro de un FeedbackProvider');
  }
  return context;
};

// Componente individual si se requiere usar de manera imperativa/prop directas
export function Feedback({ open, message, severity = 'success', onClose }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%', textTransform: 'lowercase' }}
      >
        {message ? message.toLowerCase() : ''}
      </Alert>
    </Snackbar>
  );
}
