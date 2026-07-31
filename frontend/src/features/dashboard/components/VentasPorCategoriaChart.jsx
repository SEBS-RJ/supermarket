import { Card, CardContent, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

export const VentasPorCategoriaChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            No hay datos de ventas por categoría.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const categories = data.map(item => item.categoria);
  const totals = data.map(item => item.total);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Ventas por categoría
        </Typography>
        <BarChart
          xAxis={[{ data: categories, scaleType: 'band' }]}
          series={[{ data: totals }]}
          height={300}
          margin={{ left: 80 }}
        />
      </CardContent>
    </Card>
  );
};
