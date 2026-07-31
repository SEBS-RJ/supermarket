import { Card, CardContent, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

export const TendenciaVentasChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            No hay datos de tendencia.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const fechas = data.map(item => item.fecha);
  const totales = data.map(item => item.total);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Tendencia de ventas (últimos 30 días)
        </Typography>
        <LineChart
          xAxis={[{ data: fechas, scaleType: 'point' }]}
          series={[{ data: totales }]}
          height={300}
          margin={{ left: 80 }}
        />
      </CardContent>
    </Card>
  );
};
