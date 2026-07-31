import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Button, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControlLabel, Switch, Chip, Paper, Stack
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon    from '@mui/icons-material/Add';
import EditIcon   from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StateHandler  from '../../../components/shared/StateHandler';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import { useFeedback } from '../../../components/shared/Feedback';
import { useCategorias } from '../hooks/useCategorias';
import { categoriasApi } from '../api/categoriasApi';

function generarSlug(text) {
  return (text || '')
    .toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

export default function CategoriasPage() {
  const { showFeedback } = useFeedback();
  const [page, setPage] = useState(1);
  const { categorias, meta, cargando, error, recargar } = useCategorias(useMemo(() => ({ page }), [page]));

  const [openModal, setOpenModal]     = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData]       = useState({ nombre: '', descripcion: '', activo: true });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [deleteId, setDeleteId]       = useState(null);
  const [deleting, setDeleting]       = useState(false);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ nombre: '', descripcion: '', activo: true });
    setFieldErrors({});
    setOpenModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({ nombre: item.nombre || '', descripcion: item.descripcion || '', activo: item.activo ?? true });
    setFieldErrors({});
    setOpenModal(true);
  };

  const handleClose = () => { if (!submitting) setOpenModal(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setSubmitting(true);
    try {
      // slug se genera automáticamente desde el nombre
      const payload = { ...formData, slug: generarSlug(formData.nombre) };

      if (editingItem) {
        await categoriasApi.actualizar(editingItem.id, payload);
        showFeedback('Categoría actualizada correctamente', 'success');
      } else {
        await categoriasApi.crear(payload);
        showFeedback('Categoría creada correctamente', 'success');
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
      await categoriasApi.eliminar(deleteId);
      showFeedback('Categoría eliminada correctamente', 'success');
      setDeleteId(null);
      recargar();
    } catch (err) {
      showFeedback(err.response?.data?.message || 'No se pudo eliminar. Puede tener productos asociados.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'nombre', headerName: 'Nombre de la Categoría', flex: 1.2, minWidth: 180 },
    { field: 'descripcion', headerName: 'Descripción', flex: 1.5, minWidth: 200 },
    {
      field: 'activo', headerName: 'Estado', width: 140,
      renderCell: (params) => (
        <Chip label={params.value ? 'Disponible' : 'No disponible'} color={params.value ? 'success' : 'default'} size="small" />
      ),
    },
    {
      field: 'acciones', headerName: 'Acciones', width: 120, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', height: '100%' }}>
          <Tooltip title="Editar categoría">
            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar categoría">
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
          <Typography variant="h5" component="h1" fontWeight={700}>Gestión de Categorías</Typography>
          <Typography variant="body2" color="text.secondary">Organiza los productos por categoría</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ borderRadius: 2, px: 3 }}>
          Nueva Categoría
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <StateHandler loading={cargando} error={error} isEmpty={!cargando && !error && categorias.length === 0} emptyMessage="No hay categorías registradas" onRetry={recargar}>
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={categorias}
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

      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingItem ? 'Editar Categoría' : 'Nueva Categoría'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                label="Nombre de la Categoría"
                required
                fullWidth
                value={formData.nombre}
                onChange={(e) => setFormData(p => ({ ...p, nombre: e.target.value }))}
                error={!!fieldErrors.nombre}
                helperText={fieldErrors.nombre?.[0] || ''}
              />
              <TextField
                label="Descripción (opcional)"
                multiline
                rows={3}
                fullWidth
                value={formData.descripcion}
                onChange={(e) => setFormData(p => ({ ...p, descripcion: e.target.value }))}
                error={!!fieldErrors.descripcion}
                helperText={fieldErrors.descripcion?.[0] || ''}
              />
              <FormControlLabel
                control={<Switch checked={formData.activo} onChange={(e) => setFormData(p => ({ ...p, activo: e.target.checked }))} color="primary" />}
                label="Categoría disponible"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleClose} disabled={submitting}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={submitting} sx={{ px: 3, borderRadius: 2 }}>
              {editingItem ? 'Guardar Cambios' : 'Crear Categoría'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog open={!!deleteId} variant="delete" loading={deleting} onClose={() => setDeleteId(null)} onConfirm={handleDeleteConfirm} />
    </Box>
  );
}
