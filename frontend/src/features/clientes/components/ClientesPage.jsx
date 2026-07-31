import React, { useState } from 'react';
import {
  Box, Typography, Button, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Paper, Stack
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon    from '@mui/icons-material/Add';
import EditIcon   from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StateHandler  from '../../../components/shared/StateHandler';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import { useFeedback } from '../../../components/shared/Feedback';
import { useClientes } from '../hooks/useClientes';
import { clientesApi } from '../api/clientesApi';

export default function ClientesPage() {
  const { showFeedback } = useFeedback();
  const { clientes, cargando, error, recargar } = useClientes();

  const [openModal, setOpenModal]     = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData]       = useState({ nombre: '', email: '', telefono: '', direccion: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [deleteId, setDeleteId]       = useState(null);
  const [deleting, setDeleting]       = useState(false);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ nombre: '', email: '', telefono: '', direccion: '' });
    setFieldErrors({});
    setOpenModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nombre:    item.nombre || '',
      email:     item.email || '',
      telefono:  item.telefono || '',
      direccion: item.direccion || '',
    });
    setFieldErrors({});
    setOpenModal(true);
  };

  const handleClose = () => { if (!submitting) setOpenModal(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setSubmitting(true);
    try {
      if (editingItem) {
        await clientesApi.actualizar(editingItem.id, formData);
        showFeedback('Cliente actualizado correctamente', 'success');
      } else {
        await clientesApi.crear(formData);
        showFeedback('Cliente creado correctamente', 'success');
      }
      setOpenModal(false);
      recargar();
    } catch (err) {
      if (err.response?.status === 422) {
        setFieldErrors(err.response.data.errors || {});
      } else {
        showFeedback(err.response?.data?.message || 'Error al guardar', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await clientesApi.eliminar(deleteId);
      showFeedback('Cliente eliminado correctamente', 'success');
      setDeleteId(null);
      recargar();
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Error al eliminar cliente', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'nombre', headerName: 'Nombre Completo', flex: 1.2, minWidth: 160 },
    { field: 'email', headerName: 'Correo Electrónico', flex: 1.2, minWidth: 180 },
    { field: 'telefono', headerName: 'Teléfono de Contacto', width: 160 },
    { field: 'direccion', headerName: 'Dirección', flex: 1.5, minWidth: 200 },
    {
      field: 'acciones', headerName: 'Acciones', width: 120, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', height: '100%' }}>
          <Tooltip title="Editar cliente">
            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar cliente">
            <IconButton size="small" color="error" onClick={() => setDeleteId(params.row.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h1" fontWeight={700}>Gestión de Clientes</Typography>
          <Typography variant="body2" color="text.secondary">Directorio de clientes registrados</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ borderRadius: 2, px: 3 }}>
          Nuevo Cliente
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <StateHandler loading={cargando} error={error} isEmpty={!cargando && !error && clientes.length === 0} emptyMessage="No hay clientes registrados" onRetry={recargar}>
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={clientes}
              columns={columns}
              pageSizeOptions={[10, 25]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              disableRowSelectionOnClick
              sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50', fontWeight: 600 } }}
            />
          </Box>
        </StateHandler>
      </Paper>

      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingItem ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField label="Nombre completo" required fullWidth value={formData.nombre}
                onChange={(e) => setFormData(p => ({ ...p, nombre: e.target.value }))}
                error={!!fieldErrors.nombre} helperText={fieldErrors.nombre?.[0] || ''} />
              <TextField label="Correo electrónico" type="email" required fullWidth value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                error={!!fieldErrors.email} helperText={fieldErrors.email?.[0] || ''} />
              <TextField label="Teléfono" fullWidth value={formData.telefono}
                onChange={(e) => setFormData(p => ({ ...p, telefono: e.target.value }))}
                error={!!fieldErrors.telefono} helperText={fieldErrors.telefono?.[0] || ''} />
              <TextField label="Dirección de residencia / entrega" multiline rows={2} fullWidth value={formData.direccion}
                onChange={(e) => setFormData(p => ({ ...p, direccion: e.target.value }))} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleClose} disabled={submitting}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={submitting} sx={{ px: 3, borderRadius: 2 }}>
              {editingItem ? 'Guardar Cambios' : 'Crear Cliente'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog open={!!deleteId} variant="delete" loading={deleting} onClose={() => setDeleteId(null)} onConfirm={handleDeleteConfirm} />
    </Box>
  );
}
