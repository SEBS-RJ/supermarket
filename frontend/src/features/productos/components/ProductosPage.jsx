import React, { useState, useRef } from 'react';
import {
  Box, Typography, Button, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControlLabel, Switch, Chip, Paper, Stack,
  MenuItem, FormControl, InputLabel, Select, Avatar
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon           from '@mui/icons-material/Add';
import EditIcon          from '@mui/icons-material/Edit';
import DeleteIcon        from '@mui/icons-material/Delete';
import PhotoCameraIcon   from '@mui/icons-material/PhotoCamera';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import StateHandler  from '../../../components/shared/StateHandler';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import { useFeedback } from '../../../components/shared/Feedback';
import { useProductos } from '../hooks/useProductos';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import { productosApi } from '../api/productosApi';

export default function ProductosPage() {
  const { showFeedback }  = useFeedback();
  const { productos, cargando, error, recargar } = useProductos();
  const { categorias }    = useCategorias();

  const [openModal, setOpenModal]     = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData]       = useState({ categoria_id: '', nombre: '', sku: '', descripcion: '', precio: '', stock: '', activo: true });
  const [imagenFile, setImagenFile]   = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [deleteId, setDeleteId]       = useState(null);
  const [deleting, setDeleting]       = useState(false);
  const fileInputRef = useRef(null);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ categoria_id: '', nombre: '', sku: '', descripcion: '', precio: '', stock: '', activo: true });
    setImagenFile(null);
    setImagenPreview(null);
    setFieldErrors({});
    setOpenModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      categoria_id: item.categoria_id || item.categoria?.id || '',
      nombre:       item.nombre || '',
      sku:          item.sku || '',
      descripcion:  item.descripcion || '',
      precio:       item.precio ?? '',
      stock:        item.stock ?? '',
      activo:       item.activo ?? true,
    });
    setImagenFile(null);
    setImagenPreview(item.imagen_url || null);
    setFieldErrors({});
    setOpenModal(true);
  };

  const handleClose = () => { if (!submitting) setOpenModal(false); };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagenFile(file);
    setImagenPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setSubmitting(true);
    try {
      let payload;
      if (imagenFile) {
        payload = new FormData();
        Object.entries(formData).forEach(([k, v]) => payload.append(k, v));
        payload.append('imagen', imagenFile);
        payload.append('precio', parseFloat(formData.precio));
        payload.append('stock', parseInt(formData.stock, 10));
        payload.append('activo', formData.activo ? '1' : '0');
      } else {
        payload = { ...formData, precio: parseFloat(formData.precio), stock: parseInt(formData.stock, 10) };
      }

      if (editingItem) {
        await productosApi.actualizar(editingItem.id, payload);
        showFeedback('Producto actualizado correctamente', 'success');
      } else {
        await productosApi.crear(payload);
        showFeedback('Producto creado correctamente', 'success');
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
      await productosApi.eliminar(deleteId);
      showFeedback('Producto eliminado correctamente', 'success');
      setDeleteId(null);
      recargar();
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Error al eliminar', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      field: 'imagen_url',
      headerName: 'Portada',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value ? (
            <Avatar variant="rounded" src={params.value} sx={{ width: 40, height: 40 }} />
          ) : (
            <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: 'grey.100' }}>
              <ImageNotSupportedIcon sx={{ color: 'grey.400', fontSize: 18 }} />
            </Avatar>
          )}
        </Box>
      ),
    },
    { field: 'nombre', headerName: 'Nombre del Producto', flex: 1.2, minWidth: 160 },
    { field: 'sku', headerName: 'Código', width: 110 },
    { field: 'categoria', headerName: 'Categoría', flex: 1, minWidth: 130, valueGetter: (_, row) => row.categoria?.nombre || 'Sin categoría' },
    { field: 'precio', headerName: 'Precio', width: 110, valueFormatter: (v) => `Bs. ${Number(v || 0).toFixed(2)}` },
    { field: 'stock', headerName: 'En Inventario', width: 120 },
    {
      field: 'activo', headerName: 'Estado', width: 120,
      renderCell: (params) => (
        <Chip label={params.value ? 'Disponible' : 'No disponible'} color={params.value ? 'success' : 'default'} size="small" />
      ),
    },
    {
      field: 'acciones', headerName: 'Acciones', width: 120, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', height: '100%' }}>
          <Tooltip title="Editar producto">
            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar producto">
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
          <Typography variant="h5" component="h1" fontWeight={700}>Gestión de Productos</Typography>
          <Typography variant="body2" color="text.secondary">Catálogo completo de artículos disponibles</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ borderRadius: 2, px: 3 }}>
          Nuevo Producto
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <StateHandler loading={cargando} error={error} isEmpty={!cargando && !error && productos.length === 0} emptyMessage="No hay productos registrados" onRetry={recargar}>
          <Box sx={{ height: 560, width: '100%' }}>
            <DataGrid
              rows={productos}
              columns={columns}
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              disableRowSelectionOnClick
              rowHeight={56}
              sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50', fontWeight: 600 } }}
            />
          </Box>
        </StateHandler>
      </Paper>

      {/* Modal Crear/Editar */}
      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingItem ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              {/* Imagen */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Imagen de portada
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    variant="rounded"
                    src={imagenPreview}
                    sx={{ width: 80, height: 80, bgcolor: 'grey.100', border: '2px dashed', borderColor: imagenPreview ? 'primary.main' : 'grey.300' }}
                  >
                    {!imagenPreview && <ImageNotSupportedIcon sx={{ color: 'grey.400', fontSize: 28 }} />}
                  </Avatar>
                  <Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PhotoCameraIcon />}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{ mb: 0.5 }}
                    >
                      {imagenPreview ? 'Cambiar imagen' : 'Subir imagen'}
                    </Button>
                    {!imagenPreview && editingItem && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Sin portada — el producto actual no tiene imagen
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" display="block">
                      JPG, PNG o WebP. Máximo 2 MB.
                    </Typography>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      onChange={handleImageChange}
                    />
                  </Box>
                </Box>
              </Box>

              <FormControl fullWidth required error={!!fieldErrors.categoria_id}>
                <InputLabel>Categoría</InputLabel>
                <Select value={formData.categoria_id} label="Categoría" onChange={(e) => setFormData(p => ({ ...p, categoria_id: e.target.value }))}>
                  {categorias.map((c) => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
                </Select>
              </FormControl>

              <TextField label="Nombre del producto" required fullWidth value={formData.nombre}
                onChange={(e) => setFormData(p => ({ ...p, nombre: e.target.value }))}
                error={!!fieldErrors.nombre} helperText={fieldErrors.nombre?.[0] || ''} />

              <TextField label="Código del Producto (SKU)" required fullWidth value={formData.sku}
                onChange={(e) => setFormData(p => ({ ...p, sku: e.target.value }))}
                error={!!fieldErrors.sku} helperText={fieldErrors.sku?.[0] || ''} />

              <Stack direction="row" spacing={2}>
                <TextField label="Precio de venta (Bs.)" type="number" required fullWidth
                  slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
                  value={formData.precio}
                  onChange={(e) => setFormData(p => ({ ...p, precio: e.target.value }))}
                  error={!!fieldErrors.precio} helperText={fieldErrors.precio?.[0] || ''} />
                <TextField label="Cantidad en Inventario" type="number" required fullWidth
                  slotProps={{ htmlInput: { min: '0' } }}
                  value={formData.stock}
                  onChange={(e) => setFormData(p => ({ ...p, stock: e.target.value }))}
                  error={!!fieldErrors.stock} helperText={fieldErrors.stock?.[0] || ''} />
              </Stack>

              <TextField label="Descripción (opcional)" multiline rows={2} fullWidth value={formData.descripcion}
                onChange={(e) => setFormData(p => ({ ...p, descripcion: e.target.value }))} />

              <FormControlLabel
                control={<Switch checked={formData.activo} onChange={(e) => setFormData(p => ({ ...p, activo: e.target.checked }))} color="primary" />}
                label="Producto disponible para la venta"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleClose} disabled={submitting}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={submitting} sx={{ px: 3, borderRadius: 2 }}>
              {editingItem ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog open={!!deleteId} variant="delete" loading={deleting} onClose={() => setDeleteId(null)} onConfirm={handleDeleteConfirm} />
    </Box>
  );
}
