import React from 'react';
import { Grid, Container, Box } from '@mui/material';
import { useDashboard } from '../hooks/useDashboard';
import { MetricCard } from './MetricCard';
import { VentasPorCategoriaChart } from './VentasPorCategoriaChart';
import { TendenciaVentasChart } from './TendenciaVentasChart';
import { ProductosTopTable } from './ProductosTopTable';
import StateHandler from '../../../components/shared/StateHandler';

const DashboardPage = () => {
  const { resumen, ventasPorCategoria, tendencia, productosTop, loading, error, refetch } = useDashboard();

  return (
    <StateHandler
      loading={loading}
      error={error}
      isEmpty={!resumen && !ventasPorCategoria.length && !tendencia.length && !productosTop.length}
      onRetry={refetch}
      emptyMessage="no hay datos del dashboard disponibles"
    >
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard titulo="Ventas hoy" valor={resumen?.ventas_hoy} color="primary" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard titulo="Ventas del mes" valor={resumen?.ventas_mes} color="success" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard titulo="Productos activos" valor={resumen?.productos_activos} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard titulo="Clientes registrados" valor={resumen?.total_clientes} />
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <VentasPorCategoriaChart data={ventasPorCategoria} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TendenciaVentasChart data={tendencia} />
          </Grid>
          <Grid item xs={12}>
            <ProductosTopTable data={productosTop} />
          </Grid>
        </Grid>
      </Container>
    </StateHandler>
  );
};

export default DashboardPage;
