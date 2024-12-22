import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { HiTruck } from "react-icons/hi";
import { HiServer } from "react-icons/hi";
import { useEffect, useState } from 'react';
import { LuBoxes } from "react-icons/lu";
import { AiFillDashboard } from "react-icons/ai";
import { FaUsers } from "react-icons/fa6";
import { AiFillMerge } from "react-icons/ai";
import { RiLogoutCircleLine } from "react-icons/ri";
import { FaStoreAlt } from "react-icons/fa";
import preview from "../assets/image/preview.jpg"
import ceLogo from "../assets/image/ce_logo.png"
import { useNavigate } from 'react-router-dom';
import { FaBuffer } from "react-icons/fa";
import { FiCpu } from "react-icons/fi";
import { PiHandArrowDownBold } from "react-icons/pi";
import { FaUsersLine } from "react-icons/fa6";
import { Collapse, Tooltip } from '@mui/material';
import { navHoverBackground, navIconColor, navTextColor, primaryColor } from '../constants';
import { GiCircuitry } from "react-icons/gi";
import { SiApplearcade } from "react-icons/si";
import { VscTypeHierarchySub } from "react-icons/vsc";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { getPermission, getPermissionScreens } from '../utils/Permissions';
import { logout } from '../slices/authSlice';
import { useAppDispatch } from '../hooks/redux-hooks';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    variants: [
      {
        props: ({ open }) => open,
        style: {
          ...openedMixin(theme),
          '& .MuiDrawer-paper': openedMixin(theme),
        },
      },
      {
        props: ({ open }) => !open,
        style: {
          ...closedMixin(theme),
          '& .MuiDrawer-paper': closedMixin(theme),
        },
      },
    ],
  }),
);

export default function SidebarNav(props: {currentPage?: string}) {
  const theme = useTheme();
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [menuData, setMenuData] = useState(props.currentPage ? props.currentPage : 'Dashboard')
  const navigate = useNavigate()
  const [screens, setScreens] = useState<string[]>()
  const [homeScreens, setHomeScreens] = useState<any[]>()
  const [vendorScreens, setVendorScreens] = useState<any[]>()
  const [partScreens, setPartScreens] = useState<any[]>()
  const [orderScreens, setOrderScreens] = useState<any[]>()
  const [menuIcons, setMenuIcons] = useState([
    {
      name: 'dashboard',
      icon: <AiFillDashboard />
    },
    {
      name: 'roles',
      icon: <AiFillMerge />
    },
    {
      name: 'users',
      icon: <FaUsers />
    },
    {
      name: 'stores',
      icon: <FaStoreAlt  />
    },
    {
      name: 'vendor',
      icon: <HiServer />
    },
    {
      name: 'supplier',
      icon: <HiTruck />
    },
    {
      name: 'customer',
      icon: <FaUsersLine />
    },
    {
      name: 'process',
      icon: <FaBuffer  />
    },
    {
      name: 'parts',
      icon: <FiCpu />
    },
    {
      name: 'boughtouts',
      icon: <PiHandArrowDownBold />
    },
    {
      name: 'subAssembly',
      icon: <VscTypeHierarchySub />
    },
    {
      name: 'machines',
      icon: <SiApplearcade />
    },
    {
      name: 'quotations',
      icon: <HiOutlineClipboardDocumentList />
    },
    {
      name: 'orders',
      icon: <LuBoxes />
    }
  ])

  const [homeExpand, setHomeExpand] = useState(false)
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(()=>{
    if(!screens || screens?.length == 0){
      const permission = getPermission()
      if(permission?.length > 0){
        setHomeScreens(permission.filter((p:any) => p.type == "home"))
        setVendorScreens(permission.filter((p:any) => p.type == "vendor"))
        setPartScreens(permission.filter((p:any) => p.type == "part"))
        setOrderScreens(permission.filter((p:any) => p.type == "order"))
      }
    }
  },[])
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" elevation={3} sx={{backgroundColor:'white', color:'gray'}}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={()=> setOpen(!open)}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div">
            <img src={ceLogo} alt="" width={"50px"} height={"50px"} />
            {getPermission()?.length > 0 ? getPermission().find((per:any)=> per.screen == menuData).name : ""}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        
          <List>
            {homeScreens?.map((hs:any) => (
              <ListItem key={hs.screen} disablePadding sx={{ display: 'block' }} onClick={()=>{ 
                setMenuData(hs.screen) 
                if(hs.screen == "dashboard") {
                  navigate("/")
                }else if(hs.screen == "roles") {
                  navigate("/roles")
                }else if(hs.screen == "users") {
                  navigate("/users")
                }
                }} >
                    <ListItemButton
                      sx={[
                        { height: 40, minHeight: 28, px: 2.5, backgroundColor: menuData == hs.screen ? primaryColor : 'white',
                          ":hover":{ backgroundColor: menuData == hs.screen ? primaryColor : navHoverBackground } },
                        open ? { justifyContent: 'initial', } : { justifyContent: 'center', }]}>
                      <ListItemIcon
                        sx={[
                          { minWidth: 0, justifyContent: 'center', backgroundColor: menuData == hs.screen ? primaryColor : 'white',
                            color: menuData == hs.screen ? 'white' : navIconColor,":hover":{ backgroundColor: menuData == hs.screen ? primaryColor : navHoverBackground } },
                          open ? { mr: 3, } : { mr: 'auto', },]} > 
                          {menuIcons.find((mi:any) => mi.name == hs.screen)?.icon}
                        </ListItemIcon>
                      <ListItemText
                        primary={hs.name}
                        sx={[{color: menuData == hs.screen ? 'white' : navTextColor},
                          open ? {  opacity: 1 } : { opacity: 0 } ]} />
                    </ListItemButton>
              </ListItem>
            ))}
          
          </List>
        {/* </Collapse> */}
          
        <Divider />
        
        <List>
          {vendorScreens?.map((hs:any) => (
            <ListItem key={hs.screen} disablePadding sx={{ display: 'block' }} onClick={()=>{
              setMenuData(hs.screen)
              if(hs.screen == "vendor") {
                navigate("/vendors")
              }else if(hs.screen == "supplier") {
                navigate("/suppliers")
              }else if(hs.screen == "customer"){
                navigate("/customers")
              }
            }} >
              {/* <Tooltip title={text}> */}
                <ListItemButton
                  sx={[
                    {
                      height: 40,
                      minHeight: 28,
                      px: 2.5,
                      backgroundColor: menuData == hs.screen ? primaryColor : 'white',
                      ":hover":{
                        backgroundColor: menuData == hs.screen ? primaryColor : navHoverBackground,
                      }
                    },
                    open
                      ? {
                          justifyContent: 'initial',
                        }
                      : {
                          justifyContent: 'center',
                        },
                  ]}
                >
                  <ListItemIcon
                    sx={[
                      {
                        minWidth: 0,
                        justifyContent: 'center',
                        backgroundColor: menuData == hs.screen ? primaryColor : 'white',
                        color: menuData == hs.screen ? 'white' : navIconColor,
                        ":hover":{
                          backgroundColor: menuData == hs.screen ? primaryColor : navHoverBackground,
                        }
                      },
                      open
                        ? {
                            mr: 3,
                          }
                        : {
                            mr: 'auto',
                          },
                    ]}
                  >
                    {menuIcons.find((mi:any) => mi.name == hs.screen)?.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={hs.name}
                    sx={[{color: menuData == hs.screen ? 'white' : navTextColor},
                      open
                        ? {
                            opacity: 1,
                          }
                        : {
                            opacity: 0,
                          },
                    ]}
                  />
                </ListItemButton>
              {/* </Tooltip> */}
            </ListItem>
          ))}
        </List>

        <Divider />

        <List>
          {partScreens?.map((hs:any) => (
            <ListItem key={hs.screen} disablePadding sx={{ display: 'block' }} onClick={()=>{
              setMenuData(hs.screen)
                if(hs.screen == "process"){
                    navigate("/process")
                }else if(hs.screen == "parts"){
                    navigate("/parts")
                }else if(hs.screen == "boughtouts"){
                    navigate("/boughtout")
                }else if(hs.screen == 'subAssembly'){
                  navigate("/subAssembly")
                }else if(hs.screen == 'machines'){
                    navigate("/machines")
                }
            }} >
              {/* <Tooltip title={text}> */}
                <ListItemButton
                  sx={[
                    {
                      height: 40,
                      minHeight: 28,
                      px: 2.5,
                      backgroundColor: menuData == hs.screen ? primaryColor : 'white',
                      ":hover":{
                        backgroundColor: menuData == hs.screen ? primaryColor : navHoverBackground,
                      }
                    },
                    open
                      ? {
                          justifyContent: 'initial',
                        }
                      : {
                          justifyContent: 'center',
                        },
                  ]}
                >
                  <ListItemIcon
                    sx={[
                      {
                        minWidth: 0,
                        justifyContent: 'center',
                        backgroundColor: menuData == hs.screen ? primaryColor : 'white',
                        color: menuData == hs.screen ? 'white' : navIconColor,
                        ":hover":{
                          backgroundColor: menuData == hs.screen ? primaryColor : navHoverBackground,
                        }
                      },
                      open
                        ? {
                            mr: 3,
                          }
                        : {
                            mr: 'auto',
                          },
                    ]}
                  >
                    {menuIcons.find((mi:any) => mi.name == hs.screen)?.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={hs.name}
                    sx={[{color: menuData == hs.screen ? 'white' : navTextColor},
                      open
                        ? {
                            opacity: 1,
                          }
                        : {
                            opacity: 0,
                          },
                    ]}
                  />
                </ListItemButton>
              {/* </Tooltip> */}
            </ListItem>
          ))}
        </List>
        
        <Divider />
        
        <List>
          {orderScreens?.map((hs:any) => (
            <ListItem key={hs.screen} disablePadding sx={{ display: 'block' }} onClick={()=>{
              setMenuData(hs.screen)
                if(hs.screen == "quotations"){
                  navigate('/quotations')
                }else if(hs.screen == "orders"){
                    navigate("/orders")
                }
              
            }} >
              {/* <Tooltip title={text}> */}
                <ListItemButton
                  sx={[
                    {
                      height: 40,
                      minHeight: 28,
                      px: 2.5,
                      backgroundColor: menuData == hs.screen ? primaryColor : 'white',
                      ":hover":{
                        backgroundColor: menuData == hs.screen ? primaryColor : navHoverBackground,
                      }
                    },
                    open
                      ? {
                          justifyContent: 'initial',
                        }
                      : {
                          justifyContent: 'center',
                        },
                  ]}
                >
                  <ListItemIcon
                    sx={[
                      {
                        minWidth: 0,
                        justifyContent: 'center',
                        backgroundColor: menuData == hs.screen ? primaryColor : 'white',
                        color: menuData == hs.screen ? 'white' : navIconColor,
                        ":hover":{
                          backgroundColor: menuData == hs.screen ? primaryColor : navHoverBackground,
                        }
                      },
                      open
                        ? {
                            mr: 3,
                          }
                        : {
                            mr: 'auto',
                          },
                    ]}
                  >
                    {menuIcons.find((mi:any) => mi.name == hs.screen)?.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={hs.name}
                    sx={[{color: menuData == hs.screen ? 'white' : navTextColor},
                      open
                        ? {
                            opacity: 1,
                          }
                        : {
                            opacity: 0,
                          },
                    ]}
                  />
                </ListItemButton>
              {/* </Tooltip> */}
            </ListItem>
          ))}
        </List>
        
        <Divider />
        
        <List>
          {['Logout'].map((text, index) => (
            <ListItem key={text} disablePadding sx={{ display: 'block' }} onClick={()=>{
              localStorage.clear()
              dispatch(logout())
              navigate("/login")
            }} >
              {/* <Tooltip title={text}> */}
                <ListItemButton
                  sx={[
                    {
                      height: 40,
                      minHeight: 28,
                      px: 2.5,
                      backgroundColor:'white',
                      ":hover":{
                        backgroundColor: menuData == text ? primaryColor : navHoverBackground,
                      }
                    },
                    open
                      ? {
                          justifyContent: 'initial',
                        }
                      : {
                          justifyContent: 'center',
                        },
                  ]}
                >
                  <ListItemIcon
                    sx={[
                      {
                        minWidth: 0,
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        color: navIconColor,
                        ":hover":{
                          backgroundColor: menuData == text ? primaryColor : navHoverBackground,
                        }
                      },
                      open
                        ? {
                            mr: 3,
                          }
                        : {
                            mr: 'auto',
                          },
                    ]}
                  >
                    <RiLogoutCircleLine />
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                    sx={[{color: menuData == text ? 'white' : navTextColor},
                      open
                        ? {
                            opacity: 1,
                          }
                        : {
                            opacity: 0,
                          },
                    ]}
                  />
                </ListItemButton>
              {/* </Tooltip> */}
            </ListItem>
          ))}
        </List>
        
        <Divider />

      </Drawer>
    </Box>
  );
}
