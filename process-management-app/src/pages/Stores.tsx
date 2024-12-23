import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, Grid2, InputAdornment, Paper, TextField, FormControl, InputLabel, OutlinedInput, Checkbox, ListItemText, Alert, CircularProgress, Pagination } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { createNewRole, fetchRoles } from '../slices/adminSlice';
import { Add, Search } from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import DialogTitle from '@mui/material/DialogTitle';
import { nav_roles, page_limit, TableRowStyled } from '../constants';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import loader from '../assets/image/loader.gif'

export default function Stores() {
  const dispatch = useAppDispatch()
  const { enqueueSnackbar } = useSnackbar()

  const { roles, status } = useAppSelector(
    (state) => state.admin
  );

  const [searchText, setSearchText] = useState("")
  const [createDialog, setCreateDialog] = useState(false)
  const [loadingDialog, setLoadingDialog] = useState(false)
  
  const [roleName, setRoleName] = useState("")
  const [roleScreens, setRoleScreens] = useState<string[]>([])
  const[pageNo, setPageNo] = useState(1)

  return (
    <Box sx={{display:'flex', direction:'column'}}>
      <SidebarNav currentPage={nav_roles} />

      <Grid2 container spacing={2} padding={2} sx={{mt:10, flexGrow:1}}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          
        </Grid2>
        <Grid2 size="grow" display="flex" alignItems="end" flexDirection="column">
         
        </Grid2>
        <Grid2 size={{ xs: 6, md: 12 }}>

        </Grid2>
      </Grid2>

    </Box>
  );
}
