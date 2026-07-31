import { Card, CardContent, Typography, Box } from '@mui/material';

export const MetricCard = ({ titulo, valor, color = 'primary' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {titulo}
      </Typography>
      <Typography variant="h4" component="div" color={color}>
        {valor ?? '—'}
      </Typography>
    </CardContent>
  </Card>
);
