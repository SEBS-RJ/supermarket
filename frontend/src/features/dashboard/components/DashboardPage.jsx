import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Paper, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import PointOfSaleIcon  from '@mui/icons-material/PointOfSale';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InventoryIcon    from '@mui/icons-material/Inventory2';
import PeopleIcon       from '@mui/icons-material/PeopleAlt';
import TrendingUpIcon   from '@mui/icons-material/TrendingUp';
import { BarChart }     from '@mui/x-charts/BarChart';
import { LineChart }    from '@mui/x-charts/LineChart';
import StateHandler     from '../../../components/shared/StateHandler';
import { useDashboard } from '../hooks/useDashboard';

function MetricCard({ icon, label, value, color, bgColor }) {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
        <Avatar sx={{ bgcolor: bgColor, width: 52, height: 52 }}>
          {React.cloneElement(icon, { sx: { color } })}
        </Avatar>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.3 }}>{label}</Typography>
          <Typography variant="h5" fontWeight={700}>{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { resumen, ventasCategoria, tendencia, productosTop, cargando, error, recargar } = useDashboard();

  const barXAxis = [{
    scaleType: 'band',
    data: ventasCategoria.length > 0 ? ventasCategoria.map(c => c.categoria || '') : ['Sin datos'],
  }];
  const barSeries = [{
    data: ventasCategoria.length > 0 ? ventasCategoria.map(c => Number(c.total || 0)) : [0],
    label: 'Total vendido (Bs.)', color: '#6366f1',
  }];
  const lineXAxis = [{
    scaleType: 'point',
    data: tendencia.length > 0 ? tendencia.map(t => {
      const d = new Date(t.fecha + 'T00:00:00');
      return d.toLocaleDateString('es', { day: '2-digit', month: 'short' });
    }) : ['Día 1'],
  }];
  const lineSeries = [{
    data: tendencia.length > 0 ? tendencia.map(t => Number(t.total || 0)) : [0],
    label: 'Monto vendido (Bs.)', color: '#059669', area: true,
  }];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" fontWeight={700}>Panel de Control</Typography>
        <Typography variant="body2" color="text.secondary">Estadísticas generales del negocio</Typography>
      </Box>

      <StateHandler
        loading={cargando}
        error={error}
        isEmpty={!cargando && !error && !resumen}
        emptyMessage="No hay estadísticas disponibles en este momento"
        onRetry={recargar}
      >
        {resumen && (
          <Box>
            {/* Tarjetas métricas */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard icon={<PointOfSaleIcon />}  label="Ventas de Hoy" value={`Bs. ${Number(resumen.ventas_hoy || 0).toFixed(2)}`}   color="#6366f1" bgColor="#eef2ff" />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard icon={<CalendarMonthIcon />} label="Total del Mes" value={`Bs. ${Number(resumen.ventas_mes || 0).toFixed(2)}`}   color="#059669" bgColor="#d1fae5" />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard icon={<InventoryIcon />}    label="Productos Activos" value={resumen.productos_activos || 0}                  color="#d97706" bgColor="#fef3c7" />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard icon={<PeopleIcon />}       label="Total de Clientes" value={resumen.total_clientes || 0}                     color="#7c3aed" bgColor="#ede9fe" />
              </Grid>
            </Grid>

            {/* Gráficas */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} md={7}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TrendingUpIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>Tendencia de Ventas — Últimos 30 Días</Typography>
                  </Box>
                  <LineChart xAxis={lineXAxis} series={lineSeries} height={260} margin={{ top: 10, bottom: 40, left: 60, right: 10 }} />
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Ventas por Categoría</Typography>
                  <BarChart xAxis={barXAxis} series={barSeries} height={260} margin={{ top: 10, bottom: 40, left: 60, right: 10 }} />
                </Paper>
              </Grid>
            </Grid>

            {/* Top 5 productos */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                🏆 Top 5 Productos Más Vendidos
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem' } }}>
                      <TableCell>#</TableCell>
                      <TableCell>Nombre del Producto</TableCell>
                      <TableCell align="right">Unidades Vendidas</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productosTop.map((p, i) => (
                      <TableRow key={p.producto_id || i} hover>
                        <TableCell>
                          <Chip label={`#${i + 1}`} size="small" color={i === 0 ? 'primary' : i === 1 ? 'secondary' : 'default'} sx={{ fontWeight: 700 }} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{p.nombre}</TableCell>
                        <TableCell align="right">
                          <Chip label={p.cantidad_vendida || 0} size="small" color="success" variant="outlined" />
                        </TableCell>
                      </TableRow>
                    ))}
                    {productosTop.length === 0 && (
                      <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>Sin datos de ventas aún</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}
      </StateHandler>
    </Box>
  );
}
