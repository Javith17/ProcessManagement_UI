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
import { useState } from 'react';
import { LuBoxes } from "react-icons/lu";
import { AiFillDashboard } from "react-icons/ai";
import { FaUsers } from "react-icons/fa6";
import { AiFillMerge } from "react-icons/ai";
import { RiLogoutCircleLine } from "react-icons/ri";
import preview from "../assets/image/preview.jpg"
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
  const [open, setOpen] = useState(false)
  const [menuData, setMenuData] = useState(props.currentPage ? props.currentPage : 'Dashboard')
  const navigate = useNavigate()

  const [homeExpand, setHomeExpand] = useState(false)
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

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
            <img src={preview} alt="" width={"50px"} height={"50px"} />
            {menuData}
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
        
        {/* <ListItem key={'Home'} disablePadding sx={{ display: 'block' }} onClick={()=>{
              setHomeExpand(!homeExpand)     
            }} >
              
                <ListItemButton
                  sx={[
                    {
                      height: 40,
                      minHeight: 28,
                      px: 2.5,
                      backgroundColor: 'white',
                      ":hover":{
                        backgroundColor: navHoverBackground,
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
                          backgroundColor: navHoverBackground,
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
                    <FaUsers />
                  </ListItemIcon>
                  <ListItemText
                    primary={"Home"}
                    sx={[{color: navTextColor},
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
        </ListItem> 

        <Collapse in={homeExpand} timeout='auto' unmountOnExit>*/}
          <List>
          {['Dashboard', 'Users', 'Roles'].map((text, index) => (
            <ListItem key={text} disablePadding sx={{ display: 'block' }} onClick={()=>{
              setMenuData(text)
                if(text == "Dashboard"){
                    navigate("/")
                }else if(text == "Users"){
                    navigate("/users")
                }else if(text == "Roles") {
                    navigate("/roles")
                }
            }} >
              {/* <Tooltip title={text}> */}
                <ListItemButton
                  sx={[
                    {
                      height: 40,
                      minHeight: 28,
                      px: 2.5,
                      backgroundColor: menuData == text ? primaryColor : 'white',
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
                        backgroundColor: menuData == text ? primaryColor : 'white',
                        color: menuData == text ? 'white' : navIconColor,
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
                    {index === 0 ? <AiFillDashboard /> : index === 1 ? <FaUsers />  : <AiFillMerge />}
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
        {/* </Collapse> */}
          
        <Divider />
        <List>
          {['Vendors', 'Suppliers', 'Customers'].map((text, index) => (
            <ListItem key={text} disablePadding sx={{ display: 'block' }} onClick={()=>{
              setMenuData(text)
              if(text == "Vendors") {
                navigate("/vendors")
              }else if(text == "Suppliers") {
                navigate("/suppliers")
              }else{
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
                      backgroundColor: menuData == text ? primaryColor : 'white',
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
                        backgroundColor: menuData == text ? primaryColor : 'white',
                        color: menuData == text ? 'white' : navIconColor,
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
                    {index === 0 ? <HiServer /> : index === 1 ? <HiTruck /> : <FaUsersLine />}
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
        <List>
          {['Process', 'Parts', 'Boughtouts', 'Sub Assembly', 'Machines'].map((text, index) => (
            <ListItem key={text} disablePadding sx={{ display: 'block' }} onClick={()=>{
              setMenuData(text)
                if(text == "Process"){
                    navigate("/process")
                }else if(text == "Parts"){
                    navigate("/parts")
                }else if(text == "Boughtouts"){
                    navigate("/boughtout")
                }else if(text == 'Sub Assembly'){
                  navigate("/subAssembly")
                }else if(text == 'Machines'){
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
                      backgroundColor: menuData == text ? primaryColor : 'white',
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
                        backgroundColor: menuData == text ? primaryColor : 'white',
                        color: menuData == text ? 'white' : navIconColor,
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
                    {index === 0 ? <FaBuffer /> : index === 1 ? <FiCpu /> : index == 2 ? <PiHandArrowDownBold /> :
                    index == 3 ? <VscTypeHierarchySub /> : <SiApplearcade /> }
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
        <List>
          {['Quotations', 'Orders'].map((item, index) => (
            <ListItem key={item} disablePadding sx={{ display: 'block' }} onClick={()=>{
              setMenuData(item)
                if(item == "Quotations"){
                  navigate('/quotations')
                }else if(item == "Orders"){
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
                      backgroundColor: menuData == item ? primaryColor : 'white',
                      ":hover":{
                        backgroundColor: menuData == item ? primaryColor : navHoverBackground,
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
                        backgroundColor: menuData == item ? primaryColor : 'white',
                        color: menuData == item ? 'white' : navIconColor,
                        ":hover":{
                          backgroundColor: menuData == item ? primaryColor : navHoverBackground,
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
                    {index == 0 ? <HiOutlineClipboardDocumentList /> : <LuBoxes />}
                  </ListItemIcon>
                  <ListItemText
                    primary={item}
                    sx={[{color: menuData == item ? 'white' : navTextColor},
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
              navigate("/login")
            }} >
              {/* <Tooltip title={text}> */}
                <ListItemButton
                  sx={[
                    {
                      height: 40,
                      minHeight: 28,
                      px: 2.5,
                      backgroundColor: menuData == text ? primaryColor : 'white',
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
                        backgroundColor: menuData == text ? primaryColor : 'white',
                        color: menuData == text ? 'white' : navIconColor,
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
