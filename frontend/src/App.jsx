import React, { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FeedbackProvider } from './components/shared/Feedback';
import AppRouter from './routes/AppRouter';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// ─── Paleta Administrador ─── Navy / Indigo vibrante ──────────────────────
const adminPalette = {
  palette: {
    mode: 'light',
    primary:    { main: '#6366f1', light: '#818cf8', dark: '#4f46e5', contrastText: '#fff' },
    secondary:  { main: '#0f172a' },
    background: { default: '#f1f5f9', paper: '#ffffff' },
    success:    { main: '#22c55e' },
    warning:    { main: '#f59e0b' },
    error:      { main: '#ef4444' },
    text:       { primary: '#0f172a', secondary: '#64748b' },
  },
};

// ─── Paleta Vendedor ─── Verde oscuro / Esmeralda ──────────────────────────
const vendorPalette = {
  palette: {
    mode: 'light',
    primary:    { main: '#059669', light: '#34d399', dark: '#047857', contrastText: '#fff' },
    secondary:  { main: '#134e4a' },
    background: { default: '#f0fdf4', paper: '#ffffff' },
    success:    { main: '#22c55e' },
    warning:    { main: '#f59e0b' },
    error:      { main: '#ef4444' },
    text:       { primary: '#064e3b', secondary: '#6b7280' },
  },
};

const commonComponents = {
  MuiButton: {
    styleOverrides: {
      root: { borderRadius: 8, textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    },
  },
  MuiCard:  { styleOverrides: { root: { borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)' } } },
  MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
  MuiChip:  { styleOverrides: { root: { borderRadius: 6, fontWeight: 500 } } },
  MuiTextField: { defaultProps: { size: 'small' } },
  MuiInputBase: { styleOverrides: { root: { borderRadius: '8px !important' } } },
};

function InnerApp() {
  const { user } = useAuth();
  const isAdmin = ['administrador', 'admin'].includes((user?.rol || '').toLowerCase());

  const theme = useMemo(() =>
    createTheme({
      ...(isAdmin ? adminPalette : vendorPalette),
      typography: {
        fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 600 },
        subtitle1: { fontWeight: 600 },
      },
      shape: { borderRadius: 10 },
      components: commonComponents,
    }),
  [isAdmin]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <FeedbackProvider>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </FeedbackProvider>
  );
}
