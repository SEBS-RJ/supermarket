import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, InputAdornment, Grid,
  Card, CardActionArea, CardMedia, CardContent, Avatar,
  Badge, Chip, Stack, Autocomplete, Button, Divider,
  IconButton, Tooltip, Paper, MenuItem, Select, FormControl,
  InputLabel, CircularProgress, Alert, useTheme, Fade,
  Dialog, DialogTitle, DialogContent, DialogActions, Pagination
} from '@mui/material';
import SearchIcon          from '@mui/icons-material/Search';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ShoppingCartIcon    from '@mui/icons-material/ShoppingCart';
import DeleteIcon          from '@mui/icons-material/Delete';
import AddIcon             from '@mui/icons-material/Add';
import RemoveIcon          from '@mui/icons-material/Remove';
import CheckCircleIcon     from '@mui/icons-material/CheckCircle';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import PersonAddAltIcon    from '@mui/icons-material/PersonAddAlt';
import { useFeedback }  from '../../../components/shared/Feedback';
import { useProductos, useProductosDestacados } from '../../productos/hooks/useProductos';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import { useClientes }  from '../../clientes/hooks/useClientes';
import { clientesApi }  from '../../clientes/api/clientesApi';
import { ventasApi }    from '../api/ventasApi';

// ─── Tarjeta de producto ────────────────────────────────────────────────────
function ProductCard({ producto, enCarrito, onAdd, compact = false }) {
  const theme = useTheme();
  const sinStock = producto.stock <= 0;

  return (
    <Card
      elevation={0}
      sx={{
        border: '1.5px solid',
        borderColor: enCarrito ? 'primary.main' : 'divider',
        borderRadius: 3,
        transition: 'all 0.18s',
        opacity: sinStock ? 0.55 : 1,
        '&:hover': sinStock ? {} : { borderColor: 'primary.main', boxShadow: `0 4px 16px ${theme.palette.primary.main}22`, transform: 'translateY(-1px)' },
        height: '100%',
      }}
    >
      <CardActionArea onClick={() => !sinStock && onAdd(producto)} disabled={sinStock} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        {/* Imagen */}
        <Box sx={{ position: 'relative', bgcolor: 'grey.50', height: compact ? 90 : 120, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px 10px 0 0', overflow: 'hidden' }}>
          {producto.imagen_url ? (
            <Box component="img" src={producto.imagen_url} alt={producto.nombre}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <ImageNotSupportedIcon sx={{ fontSize: compact ? 28 : 36, color: 'grey.300' }} />
          )}
          {sinStock && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.45)' }}>
              <Chip label="Sin stock" size="small" sx={{ bgcolor: '#ef4444', color: '#fff', fontWeight: 700, fontSize: '0.65rem' }} />
            </Box>
          )}
          {enCarrito && (
            <Box sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'primary.main', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircleIcon sx={{ color: '#fff', fontSize: 14 }} />
            </Box>
          )}
        </Box>

        {/* Info */}
        <CardContent sx={{ p: compact ? 1 : 1.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', lineHeight: 1 }}>
            {producto.categoria?.nombre || '—'}
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2, fontSize: compact ? '0.78rem' : '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {producto.nombre}
          </Typography>
          <Typography variant="subtitle2" color="primary.main" fontWeight={700} sx={{ mt: 'auto', pt: 0.5 }}>
            Bs. {Number(producto.precio).toFixed(2)}
          </Typography>
          <Typography variant="caption" color={producto.stock <= 5 ? 'warning.main' : 'text.secondary'} sx={{ fontSize: '0.65rem' }}>
            {producto.stock > 0 ? `${producto.stock} disponibles` : 'Agotado'}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

// ─── Ítem del carrito ───────────────────────────────────────────────────────
function CartItem({ item, onQtyChange, onRemove }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
      <Avatar variant="rounded" src={item.producto.imagen_url} sx={{ width: 38, height: 38, bgcolor: 'grey.100' }}>
        {!item.producto.imagen_url && <ImageNotSupportedIcon sx={{ fontSize: 16, color: 'grey.400' }} />}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" fontWeight={600} sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.producto.nombre}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Bs. {item.precio_unitario.toFixed(2)} c/u
        </Typography>
      </Box>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <IconButton size="small" onClick={() => onQtyChange(item.producto.id, item.cantidad - 1)} sx={{ p: 0.3 }}>
          <RemoveIcon fontSize="inherit" sx={{ fontSize: 14 }} />
        </IconButton>
        <Typography variant="body2" fontWeight={700} sx={{ minWidth: 20, textAlign: 'center' }}>
          {item.cantidad}
        </Typography>
        <IconButton size="small" onClick={() => onQtyChange(item.producto.id, item.cantidad + 1)} disabled={item.cantidad >= item.producto.stock} sx={{ p: 0.3 }}>
          <AddIcon fontSize="inherit" sx={{ fontSize: 14 }} />
        </IconButton>
      </Stack>
      <Typography variant="body2" fontWeight={700} sx={{ minWidth: 56, textAlign: 'right', color: 'primary.main' }}>
        Bs. {item.subtotal.toFixed(2)}
      </Typography>
      <IconButton size="small" color="error" onClick={() => onRemove(item.producto.id)} sx={{ p: 0.3 }}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function NuevaVentaPage() {
  const navigate = useNavigate();
  const { showFeedback } = useFeedback();
  const theme = useTheme();

  // Datos
  const { destacados, cargando: cargandoDest } = useProductosDestacados();
  const { categorias } = useCategorias();
  const { clientes, recargar: recargarClientes }   = useClientes();

  // Filtros
  const [busqueda, setBusqueda]       = useState('');
  const [debouncedBusqueda, setDebouncedBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [page, setPage] = useState(1);

  // Debounce para la búsqueda
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusqueda(busqueda);
      setPage(1); // Reset page on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const { productos, meta, cargando: cargandoProd } = useProductos(
    useMemo(() => {
      const f = { page };
      if (categoriaId) f.categoria_id = categoriaId;
      if (debouncedBusqueda) f.nombre = debouncedBusqueda;
      return f;
    }, [categoriaId, debouncedBusqueda, page])
  );

  // Carrito
  const [carrito, setCarrito]             = useState([]);
  const [clienteSelec, setClienteSelec]   = useState('');
  const [submitting, setSubmitting]       = useState(false);
  const [serverError, setServerError]     = useState('');

  // Cliente Modal
  const [openClientModal, setOpenClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState({ nombre: '', email: '', telefono: '', direccion: '' });
  const [clientSubmitting, setClientSubmitting] = useState(false);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setClientSubmitting(true);
    try {
      const res = await clientesApi.crear(newClientData);
      const newClient = res.data?.data || res.data;
      showFeedback('Cliente creado exitosamente', 'success');
      recargarClientes();
      setClienteSelec(newClient.id);
      setOpenClientModal(false);
      setNewClientData({ nombre: '', email: '', telefono: '', direccion: '' });
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Error al crear cliente', 'error');
    } finally {
      setClientSubmitting(false);
    }
  };

  const totalVenta  = carrito.reduce((s, i) => s + i.subtotal, 0);
  const totalItems  = carrito.reduce((s, i) => s + i.cantidad, 0);

  const addToCart = (producto) => {
    setCarrito(prev => {
      const idx = prev.findIndex(i => i.producto.id === producto.id);
      if (idx >= 0) {
        if (prev[idx].cantidad >= producto.stock) return prev;
        const next = [...prev];
        const qty  = next[idx].cantidad + 1;
        next[idx]  = { ...next[idx], cantidad: qty, subtotal: qty * next[idx].precio_unitario };
        return next;
      }
      return [...prev, { producto, producto_id: producto.id, cantidad: 1, precio_unitario: Number(producto.precio), subtotal: Number(producto.precio) }];
    });
    setServerError('');
  };

  const changeQty = (productoId, qty) => {
    if (qty <= 0) { removeFromCart(productoId); return; }
    setCarrito(prev => prev.map(i =>
      i.producto.id === productoId
        ? { ...i, cantidad: qty, subtotal: qty * i.precio_unitario }
        : i
    ));
  };

  const removeFromCart = (productoId) => setCarrito(prev => prev.filter(i => i.producto.id !== productoId));

  const enCarritoIds = useMemo(() => new Set(carrito.map(i => i.producto.id)), [carrito]);

  const handleVenta = async () => {
    if (carrito.length === 0) { showFeedback('Agrega al menos un producto al carrito', 'warning'); return; }
    setSubmitting(true);
    setServerError('');
    try {
      const res = await ventasApi.crear({
        cliente_id: clienteSelec || null,
        detalles: carrito.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      });
      const ventaId = res.data?.data?.id || res.data?.id;
      showFeedback('¡Venta registrada exitosamente!', 'success');
      setCarrito([]);
      setClienteSelec('');
      setServerError('');
      if (ventaId) navigate(`/venta/recibo/${ventaId}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrar la venta';
      setServerError(msg);
      showFeedback(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2.5, height: { md: 'calc(100vh - 48px)' }, flexDirection: { xs: 'column', md: 'row' } }}>

      {/* ── Columna Izquierda: Productos ── */}
      <Box sx={{ flex: 1, minWidth: 0, overflowY: { md: 'auto' }, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Título y buscador */}
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Punto de Venta</Typography>
          <Typography variant="body2" color="text.secondary">Selecciona productos para agregar al carrito</Typography>
        </Box>

        {/* Filtros */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            placeholder="Buscar producto por nombre o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }
            }}
            sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filtrar por Categoría</InputLabel>
            <Select
              value={categoriaId}
              label="Filtrar por Categoría"
              onChange={(e) => {
                setCategoriaId(e.target.value);
                setPage(1);
              }}
              sx={{ bgcolor: 'background.paper' }}
            >
              <MenuItem value=""><em>Todas las categorías</em></MenuItem>
              {categorias.filter(c => c.activo !== false).map(c => (
                <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Sección: Más Vendidos */}
        {!busqueda && !categoriaId && destacados.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <LocalFireDepartmentIcon sx={{ color: '#f59e0b' }} />
              <Typography variant="subtitle1" fontWeight={700}>Más Vendidos</Typography>
              <Chip label="Top 8" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600, fontSize: '0.7rem' }} />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 1.5 }}>
              {destacados.map(p => (
                <ProductCard key={p.id} producto={p} enCarrito={enCarritoIds.has(p.id)} onAdd={addToCart} compact />
              ))}
            </Box>
          </Box>
        )}

        {/* Sección: Todos los productos */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
            {busqueda || categoriaId ? 'Resultados de búsqueda' : 'Todos los Productos'}
            {!cargandoProd && meta && <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>({meta.total || productos.length})</Typography>}
          </Typography>

          {cargandoProd ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
          ) : productos.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
              <SearchIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
              <Typography>No se encontraron productos</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 1.5 }}>
                {productos.map(p => (
                  <ProductCard key={p.id} producto={p} enCarrito={enCarritoIds.has(p.id)} onAdd={addToCart} />
                ))}
              </Box>

              {/* Paginación */}
              {meta && meta.last_page > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                  <Pagination 
                    count={meta.last_page} 
                    page={page} 
                    onChange={(e, p) => setPage(p)} 
                    color="primary" 
                    shape="rounded"
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* ── Columna Derecha: Carrito ── */}
      <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Paper elevation={0} sx={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
          {/* Encabezado carrito */}
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingCartIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={700}>Carrito de Venta</Typography>
            </Box>
            {totalItems > 0 && (
              <Badge badgeContent={totalItems} color="primary">
                <Chip label={`${carrito.length} artículo${carrito.length !== 1 ? 's' : ''}`} size="small" color="primary" variant="outlined" />
              </Badge>
            )}
          </Box>

          {/* Ítems */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1 }}>
            {carrito.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <AddShoppingCartIcon sx={{ fontSize: 48, opacity: 0.25, mb: 1 }} />
                <Typography variant="body2">El carrito está vacío</Typography>
                <Typography variant="caption">Toca un producto para agregarlo</Typography>
              </Box>
            ) : (
              <Stack divider={<Divider flexItem />}>
                {carrito.map(item => (
                  <CartItem key={item.producto.id} item={item} onQtyChange={changeQty} onRemove={removeFromCart} />
                ))}
              </Stack>
            )}
          </Box>

          {/* Cliente + Total + Botón */}
          <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
            {/* Selector de cliente */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Cliente (opcional)</InputLabel>
              <Select
                value={clienteSelec || ''}
                label="Cliente (opcional)"
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    setOpenClientModal(true);
                  } else {
                    setClienteSelec(e.target.value);
                  }
                }}
                startAdornment={<InputAdornment position="start"><PersonAddAltIcon sx={{ color: 'text.secondary', fontSize: 18 }} /></InputAdornment>}
              >
                <MenuItem value=""><em>Ninguno (Cliente Casual)</em></MenuItem>
                <MenuItem value="new" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  <AddIcon sx={{ mr: 1, fontSize: 18, verticalAlign: 'text-bottom' }} /> Agregar Nuevo Cliente
                </MenuItem>
                {clientes.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.nombre} {c.telefono ? `(${c.telefono})` : ''}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {serverError && <Alert severity="error" sx={{ mb: 1.5, py: 0.5, fontSize: '0.8rem', borderRadius: 2 }}>{serverError}</Alert>}

            {/* Totales */}
            <Stack spacing={0.5} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Subtotal ({totalItems} artículos):</Typography>
                <Typography variant="body2" fontWeight={600}>Bs. {totalVenta.toFixed(2)}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={700}>Total a Cobrar:</Typography>
                <Typography variant="h5" fontWeight={800} color="primary.main">Bs. {totalVenta.toFixed(2)}</Typography>
              </Box>
            </Stack>

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={submitting || carrito.length === 0}
              onClick={handleVenta}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
              sx={{ py: 1.5, fontWeight: 700, borderRadius: 2.5, fontSize: '1rem' }}
            >
              {submitting ? 'Procesando...' : 'Completar Venta'}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Modal Nuevo Cliente */}
      <Dialog open={openClientModal} onClose={() => !clientSubmitting && setOpenClientModal(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <form onSubmit={handleCreateClient}>
          <DialogTitle sx={{ fontWeight: 700 }}>Nuevo Cliente</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Nombre Completo" required fullWidth value={newClientData.nombre} onChange={(e) => setNewClientData(p => ({ ...p, nombre: e.target.value }))} />
              <TextField label="Teléfono" fullWidth value={newClientData.telefono} onChange={(e) => setNewClientData(p => ({ ...p, telefono: e.target.value }))} />
              <TextField label="Correo Electrónico" type="email" fullWidth value={newClientData.email} onChange={(e) => setNewClientData(p => ({ ...p, email: e.target.value }))} />
              <TextField label="Dirección" fullWidth value={newClientData.direccion} onChange={(e) => setNewClientData(p => ({ ...p, direccion: e.target.value }))} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenClientModal(false)} disabled={clientSubmitting}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={clientSubmitting} sx={{ borderRadius: 2 }}>
              {clientSubmitting ? 'Creando...' : 'Crear Cliente'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
