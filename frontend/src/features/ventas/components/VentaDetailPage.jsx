import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Box, Typography, Button, Paper, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider, Stack, Avatar
} from '@mui/material';
import ArrowBackIcon          from '@mui/icons-material/ArrowBack';
import ReceiptIcon            from '@mui/icons-material/Receipt';
import PersonIcon             from '@mui/icons-material/Person';
import CalendarTodayIcon      from '@mui/icons-material/CalendarToday';
import ImageNotSupportedIcon  from '@mui/icons-material/ImageNotSupported';
import StateHandler           from '../../../components/shared/StateHandler';
import { ventasApi }          from '../api/ventasApi';

export default function VentaDetailPage() {
  const { id }     = useParams();
  const navigate = useNavigate();
  const { user }   = useAuth();
  const isAdmin  = ['administrador', 'admin'].includes((user?.rol || '').toLowerCase());

  const [venta, setVenta]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const backPath = isAdmin ? '/admin/ventas' : '/venta';

  const fetchVentaDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ventasApi.obtener(id);
      setVenta(response.data?.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los detalles de la venta');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchVentaDetail(); }, [fetchVentaDetail]);

  const isAnulada = venta?.estado === 'cancelada' || venta?.estado === 'anulada';
  const detalles  = venta?.detalles || [];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(backPath)}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          {isAdmin ? 'Volver al registro de ventas' : 'Volver al punto de venta'}
        </Button>
        <Typography variant="h5" component="h1" fontWeight={700}>
          Recibo de Venta #{id}
        </Typography>
      </Box>

      <StateHandler
        loading={loading}
        error={error}
        isEmpty={!loading && !error && !venta}
        emptyMessage="No se encontró la venta requerida"
        onRetry={fetchVentaDetail}
      >
        {venta && (
          <Grid container spacing={3}>
            {/* Resumen lateral */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ReceiptIcon color="primary" />
                  <Typography variant="h6" fontWeight={700}>Resumen del Comprobante</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Estado de la transacción:</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={isAnulada ? 'Anulada' : 'Completada'}
                        color={isAnulada ? 'error' : 'success'}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">Fecha y hora:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <CalendarTodayIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight={600}>
                        {venta.fecha_venta ? new Date(venta.fecha_venta).toLocaleString('es') : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">Cliente atendiéndose:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight={600}>
                        {venta.cliente?.nombre || 'Cliente general'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={700}>Total cobrado:</Typography>
                    <Typography variant="h4" fontWeight={800} color="primary.main">
                      Bs. {Number(venta.total || 0).toFixed(2)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Lista de productos */}
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Artículos incluidos ({detalles.length})
                </Typography>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary' } }}>
                        <TableCell>Portada</TableCell>
                        <TableCell>Producto</TableCell>
                        <TableCell>Código</TableCell>
                        <TableCell align="right">Precio Unit.</TableCell>
                        <TableCell align="center">Cantidad</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detalles.map((det) => (
                        <TableRow key={det.id} hover>
                          <TableCell>
                            <Avatar variant="rounded" src={det.producto?.imagen_url} sx={{ width: 36, height: 36, bgcolor: 'grey.100' }}>
                              {!det.producto?.imagen_url && <ImageNotSupportedIcon sx={{ fontSize: 16, color: 'grey.400' }} />}
                            </Avatar>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {det.producto?.nombre || `Producto #${det.producto_id}`}
                          </TableCell>
                          <TableCell color="text.secondary">
                            {det.producto?.sku || '-'}
                          </TableCell>
                          <TableCell align="right">Bs. {Number(det.precio_unitario || 0).toFixed(2)}</TableCell>
                          <TableCell align="center">{det.cantidad}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            Bs. {Number(det.subtotal || 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        )}
      </StateHandler>
    </Box>
  );
}
