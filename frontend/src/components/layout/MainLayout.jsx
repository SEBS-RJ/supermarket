import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, Tooltip, Avatar, Divider,
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  useTheme, useMediaQuery, Badge, Chip
} from '@mui/material';
import MenuIcon              from '@mui/icons-material/Menu';
import CloseIcon             from '@mui/icons-material/Close';
import ChevronLeftIcon       from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon      from '@mui/icons-material/ChevronRight';
import LogoutIcon            from '@mui/icons-material/Logout';
import DashboardIcon         from '@mui/icons-material/BarChart';
import CategoryIcon          from '@mui/icons-material/Category';
import InventoryIcon         from '@mui/icons-material/Inventory2';
import PeopleIcon            from '@mui/icons-material/PeopleAlt';
import PeopleOutlineIcon     from '@mui/icons-material/ManageAccounts';
import ReceiptLongIcon       from '@mui/icons-material/ReceiptLong';
import PointOfSaleIcon       from '@mui/icons-material/PointOfSale';
import StorefrontIcon        from '@mui/icons-material/Storefront';
import { useAuth } from '../../context/AuthContext';

const SIDEBAR_W          = 260;
const SIDEBAR_W_COLLAPSED = 76;
const SIDEBAR_COLLAPSE_KEY = 'sidebar_collapsed';

// ─── Menú por rol ──────────────────────────────────────────────────────────
// El path que representa la "raíz" del panel (Estadísticas / Punto de Venta)
// se marca explícitamente porque es prefijo de todas las demás rutas del
// mismo rol (p. ej. "/admin" es prefijo de "/admin/productos"), así que no
// puede usar la misma regla de "startsWith" que el resto de los ítems.
const adminMenu = [
  { label: 'Estadísticas',        path: '/admin',           icon: <DashboardIcon />,      exact: true },
  { label: 'Categorías',          path: '/admin/categorias', icon: <CategoryIcon /> },
  { label: 'Productos',           path: '/admin/productos',  icon: <InventoryIcon /> },
  { label: 'Clientes',            path: '/admin/clientes',   icon: <PeopleIcon /> },
  { label: 'Cajeros',             path: '/admin/usuarios',   icon: <PeopleOutlineIcon /> },
  { label: 'Ventas',              path: '/admin/ventas',     icon: <ReceiptLongIcon /> },
  { label: 'Punto de Venta',      path: '/admin/venta',      icon: <PointOfSaleIcon /> },
];

const vendorMenu = [
  { label: 'Punto de Venta',      path: '/venta',            icon: <PointOfSaleIcon />,    exact: true },
];

// ─── Colores sidebar por rol ────────────────────────────────────────────────
const sidebarColors = {
  admin: {
    bg:         '#0f172a',
    hdr:        '#1e293b',
    active:     '#6366f1',
    activeBg:   'rgba(99,102,241,0.18)',
    text:       'rgba(255,255,255,0.85)',
    textMuted:  'rgba(255,255,255,0.45)',
    chipBg:     'rgba(99,102,241,0.25)',
    chipColor:  '#818cf8',
    roleLabel:  'Administrador',
    roleBg:     '#4f46e5',
  },
  vendor: {
    bg:         '#064e3b',
    hdr:        '#065f46',
    active:     '#34d399',
    activeBg:   'rgba(52,211,153,0.18)',
    text:       'rgba(255,255,255,0.88)',
    textMuted:  'rgba(255,255,255,0.45)',
    chipBg:     'rgba(52,211,153,0.2)',
    chipColor:  '#6ee7b7',
    roleLabel:  'Cajero',
    roleBg:     '#059669',
  },
};

// Determina si un ítem del menú debe pintarse como activo.
// - Ítems "exact" (la raíz del panel) solo se activan con match exacto.
// - El resto se activa con match exacto o si la ruta actual "cuelga" de él
//   (p. ej. "/admin/ventas/5" activa a "Ventas" -> "/admin/ventas").
function isItemActive(item, currentPath) {
  if (item.exact) return currentPath === item.path;
  return currentPath === item.path || currentPath.startsWith(`${item.path}/`);
}

function SidebarContent({ colors, navItems, user, onNavigate, onLogout, currentPath, collapsed, onToggleCollapse, showCollapseToggle }) {
  const initials = (user?.name || user?.nombre || 'U').charAt(0).toUpperCase();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: colors.bg }}>
      {/* Logo */}
      <Box sx={{
        px: collapsed ? 1.5 : 3, py: 2.5, bgcolor: colors.hdr,
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between', gap: 1.5,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Box sx={{ bgcolor: colors.active, borderRadius: 2, p: 0.6, display: 'flex', flexShrink: 0 }}>
            <StorefrontIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          {!collapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                SuperMarket
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                Sistema de Gestión
              </Typography>
            </Box>
          )}
        </Box>

        {/* Botón para colapsar/expandir (solo desktop) */}
        {showCollapseToggle && !collapsed && (
          <Tooltip title="Contraer menú">
            <IconButton size="small" onClick={onToggleCollapse} sx={{ color: colors.textMuted, flexShrink: 0 }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {showCollapseToggle && collapsed && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1, bgcolor: colors.hdr }}>
          <Tooltip title="Expandir menú" placement="right">
            <IconButton size="small" onClick={onToggleCollapse} sx={{ color: colors.textMuted }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Menú de navegación */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: collapsed ? 1 : 1.5, py: 2 }}>
        {!collapsed && (
          <Typography variant="caption" sx={{ color: colors.textMuted, px: 1, mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem' }}>
            Menú
          </Typography>
        )}
        <List dense disablePadding>
          {navItems.map((item) => {
            const active = isItemActive(item, currentPath);
            const button = (
              <ListItemButton
                onClick={() => onNavigate(item.path)}
                sx={{
                  borderRadius: 2,
                  px: collapsed ? 1 : 1.5,
                  py: 1,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  bgcolor: active ? colors.activeBg : 'transparent',
                  '&:hover': { bgcolor: active ? colors.activeBg : 'rgba(255,255,255,0.06)' },
                  transition: 'background-color 0.15s',
                }}
              >
                <ListItemIcon sx={{ color: active ? colors.active : colors.textMuted, minWidth: collapsed ? 'auto' : 36, justifyContent: 'center' }}>
                  {React.cloneElement(item.icon, { fontSize: 'small' })}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: '0.875rem',
                          fontWeight: active ? 600 : 400,
                          color: active ? '#fff' : colors.text,
                        }
                      }
                    }}
                  />
                )}
                {!collapsed && active && (
                  <Box sx={{ width: 3, height: 20, bgcolor: colors.active, borderRadius: 4, ml: 1 }} />
                )}
              </ListItemButton>
            );

            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                {collapsed ? (
                  <Tooltip title={item.label} placement="right">
                    <Box sx={{ width: '100%' }}>{button}</Box>
                  </Tooltip>
                ) : button}
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Usuario + Cerrar sesión */}
      <Box sx={{ p: 1.5, borderTop: `1px solid rgba(255,255,255,0.08)` }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2,
          bgcolor: 'rgba(255,255,255,0.05)', justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: colors.roleBg, fontSize: '0.875rem', fontWeight: 700, flexShrink: 0 }}>
            {initials}
          </Avatar>
          {!collapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || user?.nombre || 'Usuario'}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.chipColor, fontSize: '0.7rem' }}>
                {colors.roleLabel}
              </Typography>
            </Box>
          )}
          <Tooltip title="Cerrar sesión">
            <IconButton onClick={onLogout} size="small" sx={{ color: colors.textMuted, '&:hover': { color: '#ef4444' } }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sidebar colapsable en desktop, con preferencia persistida.
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch {
      // localStorage no disponible (modo privado, etc.): se ignora.
    }
  }, [collapsed]);

  const userRole = (user?.rol || '').toLowerCase();
  const isAdmin  = userRole === 'administrador' || userRole === 'admin';

  const navItems = isAdmin ? adminMenu : vendorMenu;
  const colors   = isAdmin ? sidebarColors.admin : sidebarColors.vendor;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const currentSidebarW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  const sidebarProps = {
    colors, navItems, user, onNavigate: handleNavigate, onLogout: handleLogout,
    currentPath: location.pathname, collapsed: !isMobile && collapsed,
    onToggleCollapse: () => setCollapsed((c) => !c), showCollapseToggle: !isMobile,
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar permanente (desktop), colapsable */}
      {!isMobile && (
        <Box component="nav" sx={{ width: currentSidebarW, flexShrink: 0, transition: 'width 0.2s ease' }}>
          <Box sx={{
            position: 'fixed', top: 0, left: 0, height: '100vh', width: currentSidebarW,
            zIndex: 1200, transition: 'width 0.2s ease', overflow: 'hidden',
          }}>
            <SidebarContent {...sidebarProps} />
          </Box>
        </Box>
      )}

      {/* Drawer temporal (móvil) */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: SIDEBAR_W, border: 'none' } }}
        >
          <SidebarContent {...sidebarProps} />
        </Drawer>
      )}

      {/* Área principal */}
      <Box component="main" sx={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar solo en móvil */}
        {isMobile && (
          <Box sx={{ position: 'sticky', top: 0, zIndex: 100, bgcolor: colors.bg, px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#fff' }}>
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StorefrontIcon sx={{ color: colors.active, fontSize: 22 }} />
              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700 }}>SuperMarket</Typography>
            </Box>
          </Box>
        )}

        {/* Contenido */}
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
