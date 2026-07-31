import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Container, Box, Card, CardContent, Typography,
  TextField, Button, Alert, CircularProgress,
  InputAdornment, IconButton
} from '@mui/material';
import Visibility     from '@mui/icons-material/Visibility';
import VisibilityOff  from '@mui/icons-material/VisibilityOff';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useAuth } from '../../../context/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Si ya está autenticado (token válido) → redirigir a su panel
  if (isAuthenticated) {
    const rol = (user?.rol || '').toLowerCase();
    const isAdmin = rol === 'administrador' || rol === 'admin';
    return <Navigate to={isAdmin ? '/admin' : '/venta'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);
    if (result.success) {
      const rol = (result.user?.rol || '').toLowerCase();
      const isAdmin = rol === 'administrador' || rol === 'admin';
      navigate(isAdmin ? '/admin' : '/venta', { replace: true });
    } else {
      setErrorMsg(result.message || 'Credenciales incorrectas');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', p: 2 }}>
      <Container maxWidth="xs">
        <Card elevation={0} sx={{ borderRadius: 4, p: 1, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Box sx={{ width: 60, height: 60, borderRadius: 3, bgcolor: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}>
              <StorefrontIcon sx={{ fontSize: 36 }} />
            </Box>

            <Typography variant="h5" component="h1" fontWeight={700} color="#0f172a" gutterBottom>
              SuperMarket
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Ingresa tus credenciales para acceder al sistema
            </Typography>

            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{errorMsg}</Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal" required fullWidth
                id="email" label="Correo Electrónico" name="email"
                autoComplete="email" autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal" required fullWidth
                name="password" label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                id="password" autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />
              <Button
                type="submit" fullWidth variant="contained"
                disabled={isSubmitting || !email || !password}
                sx={{ mt: 3, mb: 1, py: 1.4, fontWeight: 700, fontSize: '0.95rem', borderRadius: 2.5, bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
