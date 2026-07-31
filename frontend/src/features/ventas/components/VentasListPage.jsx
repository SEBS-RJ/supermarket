import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Box, Typography, Button, IconButton, Tooltip,
  Chip, Paper, Stack
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import VisibilityIcon    from '@mui/icons-material/Visibility';
import CancelIcon        from '@mui/icons-material/Cancel';
import PointOfSaleIcon   from '@mui/icons-material/PointOfSale';
import StateHandler  from '../../../components/shared/StateHandler';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import { useFeedback } from '../../../components/shared/Feedback';
import { useVentas } from '../hooks/useVentas';
import { ventasApi } from '../api/ventasApi';

export default function VentasListPage() {
  const navigate = useNavigate();
  const { showFeedback } = useFeedback();
  const { user } = useAuth();
  const isAdmin = ['administrador','admin'].includes((user?.rol || '').toLowerCase());

  const [page, setPage] = useState(1);
  const { ventas, meta, cargando, error, recargar } = useVentas(useMemo(() => ({ page }), [page]));
  const [anularId, setAnularId]   = useState(null);
  const [anulando, setAnulando]   = useState(false);

  const handleAnular = async () => {
    if (!anularId) return;
    setAnulando(true);
    try {
      await ventasApi.anular(anularId);
      showFeedback('Venta anulada correctamente', 'success');
      setAnularId(null);
      recargar();
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Error al anular la venta', 'error');
    } finally {
      setAnulando(false);
    }
  };

  const detailPath = (id) => isAdmin ? `/admin/ventas/${id}` : `/venta/recibo/${id}`;

  const columns = [
    { field: 'id', headerName: 'N° Venta', width: 90 },
    { field: 'cliente', headerName: 'Cliente', flex: 1, minWidth: 160, valueGetter: (_, row) => row.cliente?.nombre || 'Cliente general' },
    { field: 'total', headerName: 'Total', width: 130, valueFormatter: (v) => `Bs. ${Number(v || 0).toFixed(2)}` },
    { field: 'fecha_venta', headerName: 'Fecha y Hora', flex: 1, minWidth: 160, valueFormatter: (v) => v ? new Date(v).toLocaleString('es') : '' },
    {
      field: 'estado', headerName: 'Estado', width: 140,
      renderCell: (p) => {
        const anulada = p.value === 'cancelada' || p.value === 'anulada';
        return <Chip label={anulada ? 'Anulada' : 'Completada'} color={anulada ? 'error' : 'success'} size="small" />;
      },
    },
    {
      field: 'acciones', headerName: 'Acciones', width: 130, sortable: false,
      renderCell: (p) => {
        const anulada = p.row.estado === 'cancelada' || p.row.estado === 'anulada';
        return (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', height: '100%' }}>
            <Tooltip title="Ver detalle">
              <IconButton size="small" color="primary" onClick={() => navigate(detailPath(p.row.id))}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {isAdmin && !anulada && (
              <Tooltip title="Anular venta">
                <IconButton size="small" color="error" onClick={() => setAnularId(p.row.id)}>
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        );
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h1" fontWeight={700}>Registro de Ventas</Typography>
          <Typography variant="body2" color="text.secondary">Historial completo de todas las transacciones</Typography>
        </Box>
        <Button variant="contained" startIcon={<PointOfSaleIcon />} onClick={() => navigate('/admin/venta')} sx={{ borderRadius: 2, px: 3 }}>
          Nueva Venta
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <StateHandler loading={cargando} error={error} isEmpty={!cargando && !error && ventas.length === 0} emptyMessage="No hay ventas registradas" onRetry={recargar}>
          <Box sx={{ height: 560, width: '100%' }}>
            <DataGrid
              rows={ventas}
              columns={columns}
              paginationMode="server"
              rowCount={meta?.total || 0}
              paginationModel={{ page: page - 1, pageSize: 15 }}
              pageSizeOptions={[15]}
              onPaginationModelChange={(model) => setPage(model.page + 1)}
              loading={cargando}
              disableRowSelectionOnClick
              sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50', fontWeight: 600 } }}
            />
          </Box>
        </StateHandler>
      </Paper>

      <ConfirmDialog
        open={!!anularId}
        variant="void"
        loading={anulando}
        onClose={() => setAnularId(null)}
        onConfirm={handleAnular}
      />
    </Box>
  );
}
