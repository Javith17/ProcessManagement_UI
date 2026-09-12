import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useEffect, useRef, useState } from 'react';
import { AiFillDashboard } from "react-icons/ai";
import { FaUsers, FaStoreAlt, FaBuffer, FaStroopwafel } from "react-icons/fa";
import { FaUsersLine } from "react-icons/fa6";
import { AiFillMerge } from "react-icons/ai";
import { RiLogoutCircleLine } from "react-icons/ri";
import { HiTruck, HiServer } from "react-icons/hi";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { TbCalendarUser } from "react-icons/tb";
import { TfiHeadphoneAlt } from "react-icons/tfi";
import { IoCalendarOutline } from "react-icons/io5";
import { LuBoxes } from "react-icons/lu";
import { FiCpu } from "react-icons/fi";
import { PiHandArrowDownBold } from "react-icons/pi";
import { SiApplearcade } from "react-icons/si";
import { VscTypeHierarchySub } from "react-icons/vsc";
import { useNavigate } from 'react-router-dom';
import { getPermission } from '../../utils/Permissions';
import { logout } from '../../slices/authSlice';
import { useAppDispatch } from '../../hooks/redux-hooks';
import { v2Colors, v2Fonts } from '../theme';

const drawerWidthOpen = 240;
const drawerWidthClosed = 64;

const menuIcons: { name: string; icon: JSX.Element }[] = [
  { name: 'dashboard', icon: <AiFillDashboard /> },
  { name: 'roles', icon: <AiFillMerge /> },
  { name: 'users', icon: <FaUsers /> },
  { name: 'stores', icon: <FaStoreAlt /> },
  { name: 'attendance', icon: <IoCalendarOutline /> },
  { name: 'leave_request', icon: <TbCalendarUser /> },
  { name: 'enquiry', icon: <TfiHeadphoneAlt /> },
  { name: 'vendor', icon: <HiServer /> },
  { name: 'supplier', icon: <HiTruck /> },
  { name: 'customer', icon: <FaUsersLine /> },
  { name: 'process', icon: <FaBuffer /> },
  { name: 'parts', icon: <FiCpu /> },
  { name: 'boughtouts', icon: <PiHandArrowDownBold /> },
  { name: 'assemblySettings', icon: <VscTypeHierarchySub /> },
  { name: 'machines', icon: <SiApplearcade /> },
  { name: 'enquiries', icon: <HiOutlineClipboardDocumentList /> },
  { name: 'quotations', icon: <HiOutlineClipboardDocumentList /> },
  { name: 'assembly', icon: <FaStroopwafel /> },
  { name: 'orders', icon: <LuBoxes /> },
];

// Visual reskin of pages/SidebarNav.tsx. Same permission-driven menu
// structure/groups/navigation targets (just re-parented under /v2), same
// "collapse chevron does nothing" quirk as the original (only the AppBar
// hamburger actually toggles width).
export default function V2SidebarNav(props: { currentPage?: string }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [menuData, setMenuData] = useState(props.currentPage ? props.currentPage : 'dashboard');
  const [homeScreens, setHomeScreens] = useState<any[]>();
  const [vendorScreens, setVendorScreens] = useState<any[]>();
  const [partScreens, setPartScreens] = useState<any[]>();
  const [orderScreens, setOrderScreens] = useState<any[]>();
  const activeItemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const permission = getPermission();
    if (permission?.length > 0) {
      setHomeScreens(permission.filter((p: any) => p.type === 'home'));
      setVendorScreens(permission.filter((p: any) => p.type === 'vendor'));
      setPartScreens(permission.filter((p: any) => p.type === 'part'));
      setOrderScreens(permission.filter((p: any) => p.type === 'order'));
    }
  }, []);

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: 'nearest' });
  }, [homeScreens, vendorScreens, partScreens, orderScreens]);

  const handleDrawerClose = () => {
    // Intentional no-op, matching pages/SidebarNav.tsx's DrawerHeader chevron
    // (setOpen(false) is commented out there too).
  };

  const itemSx = (active: boolean) => ({
    height: 42,
    minHeight: 28,
    px: open ? 2.25 : 0,
    justifyContent: open ? 'flex-start' : 'center',
    borderLeft: active ? `3px solid ${v2Colors.primary}` : '3px solid transparent',
    backgroundColor: active ? 'rgba(187,0,55,0.18)' : 'transparent',
    color: active ? '#fff' : v2Colors.sidebarText,
    '&:hover': { backgroundColor: active ? 'rgba(187,0,55,0.18)' : 'rgba(255,255,255,0.06)', color: '#fff' },
  });

  const renderGroup = (label: string, list: any[] | undefined, onPick: (screen: string) => void) => (
    <Box sx={{ mt: 2 }}>
      {open && (
        <Typography sx={{ px: 2.25, pb: 0.75, fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', color: v2Colors.sidebarTextDim, fontWeight: 600 }}>
          {label}
        </Typography>
      )}
      <List disablePadding>
        {list?.map((hs: any) => (
          <ListItem key={hs.screen} ref={menuData === hs.screen ? activeItemRef : undefined} disablePadding sx={{ display: 'block' }} onClick={() => { setMenuData(hs.screen); onPick(hs.screen); }}>
            <ListItemButton sx={itemSx(menuData === hs.screen)}>
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', justifyContent: 'center', color: 'inherit' }}>
                {menuIcons.find((mi) => mi.name === hs.screen)?.icon}
              </ListItemIcon>
              <ListItemText primary={hs.name} sx={{ opacity: open ? 1 : 0, '& .MuiTypography-root': { fontSize: 13.5, fontWeight: 600 } }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" elevation={0} sx={{ backgroundColor: v2Colors.surface, color: v2Colors.ink, borderBottom: `1px solid ${v2Colors.line}`, zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" onClick={() => setOpen(!open)} edge="start">
            <MenuIcon />
          </IconButton>
          <Box sx={{ width: 34, height: 34, borderRadius: '4px', ml: 1, mr: 1.5, background: `linear-gradient(155deg, ${v2Colors.primary}, #7d0027)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: v2Fonts.display, fontWeight: 700, fontSize: 14 }}>
            CE
          </Box>
          <Typography variant="h6" noWrap component="div" sx={{ fontSize: 17 }}>
            {getPermission()?.length > 0 ? getPermission().find((per: any) => per.screen === menuData)?.name : 'Process Management'}
          </Typography>
        </Toolbar>
      </AppBar>
      <MuiDrawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidthOpen : drawerWidthClosed,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          '& .MuiDrawer-paper': {
            width: open ? drawerWidthOpen : drawerWidthClosed,
            overflowX: 'hidden',
            transition: 'width .2s ease',
            backgroundColor: v2Colors.sidebarBg,
            backgroundImage: `linear-gradient(180deg, ${v2Colors.sidebarBg}, ${v2Colors.sidebarBg2})`,
            borderRight: `1px solid ${v2Colors.sidebarLine}`,
          },
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={handleDrawerClose} sx={{ color: v2Colors.sidebarText }}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider sx={{ borderColor: v2Colors.sidebarLine }} />

        {renderGroup('General', homeScreens, (screen) => {
          if (screen === 'dashboard') navigate('/v2');
          else if (screen === 'roles') navigate('/v2/roles');
          else if (screen === 'users') navigate('/v2/users');
          else if (screen === 'stores') navigate('/v2/stores');
          else if (screen === 'attendance') navigate('/v2/attendance');
          else if (screen === 'leave_request') navigate('/v2/leave-request');
          else if (screen === 'enquiry') navigate('/v2/enquiries');
        })}

        <Divider sx={{ borderColor: v2Colors.sidebarLine, mt: 1 }} />

        {renderGroup('Vendor Network', vendorScreens, (screen) => {
          if (screen === 'vendor') navigate('/v2/vendors');
          else if (screen === 'supplier') navigate('/v2/suppliers');
          else if (screen === 'customer') navigate('/v2/customers');
        })}

        <Divider sx={{ borderColor: v2Colors.sidebarLine, mt: 1 }} />

        {renderGroup('Production', partScreens, (screen) => {
          if (screen === 'process') navigate('/v2/process');
          else if (screen === 'parts') navigate('/v2/parts');
          else if (screen === 'boughtouts') navigate('/v2/boughtout');
          else if (screen === 'assemblySettings') navigate('/v2/subAssembly');
          else if (screen === 'machines') navigate('/v2/machines');
        })}

        <Divider sx={{ borderColor: v2Colors.sidebarLine, mt: 1 }} />

        {renderGroup('Order Pipeline', orderScreens, (screen) => {
          if (screen === 'quotations') navigate('/v2/quotations');
          else if (screen === 'orders') navigate('/v2/orders', { state: { type: 'order' } });
          else if (screen === 'assembly') navigate('/v2/orders', { state: { type: 'assembly' } });
        })}

        <Divider sx={{ borderColor: v2Colors.sidebarLine, mt: 1 }} />

        <List disablePadding sx={{ mt: 1 }}>
          <ListItem disablePadding sx={{ display: 'block' }} onClick={() => {
            localStorage.clear();
            dispatch(logout());
            navigate('/v2/login');
          }}>
            <ListItemButton sx={itemSx(false)}>
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', justifyContent: 'center', color: 'inherit' }}>
                <RiLogoutCircleLine />
              </ListItemIcon>
              <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0, '& .MuiTypography-root': { fontSize: 13.5, fontWeight: 600 } }} />
            </ListItemButton>
          </ListItem>
        </List>
      </MuiDrawer>
    </Box>
  );
}
