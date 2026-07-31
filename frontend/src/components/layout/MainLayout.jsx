import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, Tooltip, Avatar, Divider,
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  useTheme, useMediaQuery, Badge, Chip
} from '@mui/material';
import MenuIcon              from '@mui/icons-material/Menu';
import CloseIcon             from '@mui/icons-material/Close';
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

const SIDEBAR_W = 260;

// ─── Menú por rol ──────────────────────────────────────────────────────────
const adminMenu = [
  { label: 'Estadísticas',        path: '/admin',           icon: <DashboardIcon /> },
  { label: 'Categorías',          path: '/admin/categorias', icon: <CategoryIcon /> },
  { label: 'Productos',           path: '/admin/productos',  icon: <InventoryIcon /> },
  { label: 'Clientes',            path: '/admin/clientes',   icon: <PeopleIcon /> },
  { label: 'Cajeros',             path: '/admin/usuarios',   icon: <PeopleOutlineIcon /> },
  { label: 'Registro de Ventas',  path: '/admin/ventas',     icon: <ReceiptLongIcon /> },
];

const vendorMenu = [
  { label: 'Punto de Venta',      path: '/venta',            icon: <PointOfSaleIcon /> },
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

function SidebarContent({ colors, navItems, user, onNavigate, onLogout, currentPath }) {
  const initials = (user?.name || user?.nombre || 'U').charAt(0).toUpperCase();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: colors.bg }}>
      {/* Logo */}
      <Box sx={{ px: 3, py: 2.5, bgcolor: colors.hdr, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ bgcolor: colors.active, borderRadius: 2, p: 0.6, display: 'flex' }}>
          <StorefrontIcon sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.1 }}>
            SuperMarket
          </Typography>
          <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.68rem' }}>
            Sistema de Gestión
          </Typography>
        </Box>
      </Box>

      {/* Menú de navegación */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 2 }}>
        <Typography variant="caption" sx={{ color: colors.textMuted, px: 1, mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem' }}>
          Menú
        </Typography>
        <List dense disablePadding>
          {navItems.map((item) => {
            const active = currentPath === item.path || currentPath.startsWith(item.path + '/');
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => onNavigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    px: 1.5,
                    py: 1,
                    bgcolor: active ? colors.activeBg : 'transparent',
                    '&:hover': { bgcolor: active ? colors.activeBg : 'rgba(255,255,255,0.06)' },
                    transition: 'background-color 0.15s',
                  }}
                >
                  <ListItemIcon sx={{ color: active ? colors.active : colors.textMuted, minWidth: 36 }}>
                    {React.cloneElement(item.icon, { fontSize: 'small' })}
                  </ListItemIcon>
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
                  {active && (
                    <Box sx={{ width: 3, height: 20, bgcolor: colors.active, borderRadius: 4, ml: 1 }} />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Usuario + Cerrar sesión */}
      <Box sx={{ p: 1.5, borderTop: `1px solid rgba(255,255,255,0.08)` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: colors.roleBg, fontSize: '0.875rem', fontWeight: 700 }}>
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || user?.nombre || 'Usuario'}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.chipColor, fontSize: '0.7rem' }}>
              {colors.roleLabel}
            </Typography>
          </Box>
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

  const sidebarProps = { colors, navItems, user, onNavigate: handleNavigate, onLogout: handleLogout, currentPath: location.pathname };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar permanente (desktop) */}
      {!isMobile && (
        <Box component="nav" sx={{ width: SIDEBAR_W, flexShrink: 0 }}>
          <Box sx={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: SIDEBAR_W, zIndex: 1200 }}>
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
