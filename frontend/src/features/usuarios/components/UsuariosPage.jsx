import React, { useState } from 'react';
import {
  Box, Typography, Button, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControlLabel, Switch, Chip, Paper, Stack, InputAdornment
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon        from '@mui/icons-material/Add';
import EditIcon       from '@mui/icons-material/Edit';
import Visibility     from '@mui/icons-material/Visibility';
import VisibilityOff  from '@mui/icons-material/VisibilityOff';
import StateHandler  from '../../../components/shared/StateHandler';
import { useFeedback } from '../../../components/shared/Feedback';
import { useUsuarios } from '../hooks/useUsuarios';
import { usuariosApi } from '../api/usuariosApi';

export default function UsuariosPage() {
  const { showFeedback } = useFeedback();
  const { usuarios, cargando, error, recargar } = useUsuarios();

  const [openModal, setOpenModal]     = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData]       = useState({ name: '', email: '', password: '', activo: true });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting]   = useState(false);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ name: '', email: '', password: '', activo: true });
    setFieldErrors({});
    setShowPassword(false);
    setOpenModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name || item.nombre || '', email: item.email || '', password: '', activo: item.activo ?? true });
    setFieldErrors({});
    setShowPassword(false);
    setOpenModal(true);
  };

  const handleClose = () => { if (!submitting) setOpenModal(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (editingItem && !payload.password) delete payload.password;

      if (editingItem) {
        await usuariosApi.actualizar(editingItem.id, payload);
        showFeedback('Cajero actualizado correctamente', 'success');
      } else {
        await usuariosApi.crear(payload);
        showFeedback('Cajero creado correctamente', 'success');
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

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre Completo', flex: 1.2, minWidth: 160, valueGetter: (_, row) => row.name || row.nombre || '' },
    { field: 'email', headerName: 'Correo Electrónico', flex: 1.5, minWidth: 200 },
    {
      field: 'rol', headerName: 'Rol en Sistema', width: 140,
      valueGetter: (_, row) => row.role?.name || row.rol || 'vendedor',
      renderCell: (params) => (
        <Chip
          label={['administrador','admin'].includes((params.value||'').toLowerCase()) ? 'Administrador' : 'Cajero'}
          size="small"
          color={['administrador','admin'].includes((params.value||'').toLowerCase()) ? 'primary' : 'default'}
        />
      ),
    },
    {
      field: 'activo', headerName: 'Estado de Cuenta', width: 150,
      renderCell: (params) => (
        <Chip label={params.value !== false ? 'Activo' : 'Desactivado'} color={params.value !== false ? 'success' : 'default'} size="small" />
      ),
    },
    {
      field: 'acciones', headerName: 'Acciones', width: 100, sortable: false,
      renderCell: (params) => (
        <Tooltip title="Editar cajero">
          <IconButton size="small" color="primary" onClick={() => handleOpenEdit(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h1" fontWeight={700}>Gestión de Cajeros</Typography>
          <Typography variant="body2" color="text.secondary">Administra los usuarios con acceso al punto de venta</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ borderRadius: 2, px: 3 }}>
          Nuevo Cajero
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <StateHandler loading={cargando} error={error} isEmpty={!cargando && !error && usuarios.length === 0} emptyMessage="No hay cajeros registrados" onRetry={recargar}>
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={usuarios}
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
            {editingItem ? 'Editar Cajero' : 'Nuevo Cajero'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField label="Nombre completo" required fullWidth value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                error={!!fieldErrors.name} helperText={fieldErrors.name?.[0] || ''} />
              <TextField label="Correo electrónico" type="email" required fullWidth value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                error={!!fieldErrors.email} helperText={fieldErrors.email?.[0] || ''} />
              <TextField
                label={editingItem ? 'Contraseña (dejar en blanco para conservar la actual)' : 'Contraseña de acceso'}
                type={showPassword ? 'text' : 'password'} required={!editingItem} fullWidth value={formData.password}
                onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                error={!!fieldErrors.password} helperText={fieldErrors.password?.[0] || ''}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }
                }}
              />
              {editingItem && (
                <FormControlLabel control={<Switch checked={formData.activo} onChange={(e) => setFormData(p => ({ ...p, activo: e.target.checked }))} color="primary" />} label="Cuenta activa" />
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleClose} disabled={submitting}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={submitting} sx={{ px: 3, borderRadius: 2 }}>
              {editingItem ? 'Guardar Cambios' : 'Crear Cajero'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
