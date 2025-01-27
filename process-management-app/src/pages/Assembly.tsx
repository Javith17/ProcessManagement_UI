import { useMemo, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, CircularProgress, Dialog, Grid2, InputAdornment, Pagination, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { fetchCustomers, fetchRoles } from '../slices/adminSlice';
import { Add, Search } from '@mui/icons-material';
import { ImCheckboxChecked } from "react-icons/im";
import { IoMdClose } from "react-icons/io";
import { useLocation, useNavigate } from 'react-router-dom';
import { nav_assembly, nav_customers, page_limit, TableRowStyled } from '../constants';
import { getMachineMainAssembly, getMachineSectionAssembly, getMachineSubAssembly, getOrderDetail } from '../slices/assemblySlice';
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from 'material-react-table';

export default function Assembly() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [subAssemblies, setSubAssemblies] = useState<any[]>([])
  const [mainAssemblies, setMainAssemblies] = useState<any[]>([])
  const [sectionAssemblies, setSectionAssemblies] = useState<any[]>([])
  const [orderDetail, setOrderDetail] = useState<any>()
  const [currentTab, setCurrentTab] = useState(0)

  useEffect(() => {
    dispatch(getMachineSubAssembly({ machineId: state?.machine_id, orderId: state?.order_id })).unwrap().then((res: any) => {
      setSubAssemblies(res)
    })
    dispatch(getOrderDetail(state?.order_id)).unwrap().then((res: any) => {
      setOrderDetail(res)
    })
  }, [dispatch])

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    //column definitions...
    () => [
      {
        header: 'Sub Assembly Name',
        accessorKey: 'sub_assembly_name'
      },
      {
        header: 'Sub Assembly Qty',
        accessorKey: 'sub_assembly_qty',
      },
      {
        header: 'Part',
        accessorKey: 'part_name',
      },
      {
        header: 'Boughtout',
        accessorKey: 'bought_out_name',
      },
      {
        header: 'Qty',
        accessorKey: 'qty',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        Cell: (row: any) => (
          <Box
            sx={{
              borderColor: row.status == null ? '#F95454' : '#006BFF',
              color: row.status == null ? '#F95454' : '#006BFF',
              borderStyle: 'solid', borderWidth: 'thin',
              textAlign: 'center',
              borderRadius: '4px', cursor: 'pointer',
              // ":hover": {
              //     backgroundColor: row?.row?.original?.status.includes('Progress') ? '#006BFF' : 'white',
              //     color: row?.row?.original?.status.includes('Progress') ? 'white' :
              //     row?.row?.original?.status.includes('Pending') ? '#F95454' : '#347928'
              // }
            }}
            onClick={() => {

            }}>{row?.status ? row?.status : 'Pending'}</Box>
        )
      }
    ],
    [],
    //end
  );

  const table = useMaterialReactTable({
    columns,
    data: subAssemblies && subAssemblies.length > 0 ? subAssemblies : [],
    enableGrouping: true,
    groupedColumnMode: 'remove',
    initialState: {
      grouping: ['sub_assembly_name']
    },
    muiTableContainerProps: { sx: { maxHeight: '800px' } },
    enablePagination: false,
    enableBottomToolbar: false,
    enableTopToolbar: false,
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: '#fadbda'
      }
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        //   backgroundColor: row.index % 2 == 0 ? 'white' : '#F2F2F2',
        '&:hover': {
          backgroundColor: 'lightskyblue',
        }
      },
    }),
  });

  const mainColumns = useMemo<MRT_ColumnDef<any>[]>(
    //column definitions...
    () => [
      {
        header: 'Main Assembly Name',
        accessorKey: 'main_assembly_name',
      },
      {
        header: 'Main Assembly Qty',
        accessorKey: 'main_assembly_qty',
      },
      {
        header: 'Sub Assembly Name',
        accessorKey: 'sub_assembly_name',
      },
      {
        header: 'Part',
        accessorKey: 'part_name',
      },
      {
        header: 'Boughtout',
        accessorKey: 'bought_out_name',
      },
      {
        header: 'Qty',
        accessorKey: 'qty',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        Cell: (row: any) => (
          <Box
            sx={{
              borderColor: row.status == null ? '#F95454' : '#006BFF',
              color: row.status == null ? '#F95454' : '#006BFF',
              borderStyle: 'solid', borderWidth: 'thin',
              textAlign: 'center',
              borderRadius: '4px', cursor: 'pointer',
              // ":hover": {
              //     backgroundColor: row?.row?.original?.status.includes('Progress') ? '#006BFF' : 'white',
              //     color: row?.row?.original?.status.includes('Progress') ? 'white' :
              //     row?.row?.original?.status.includes('Pending') ? '#F95454' : '#347928'
              // }
            }}
            onClick={() => {

            }}>{row?.status ? row?.status : 'Pending'}</Box>
        )
      }
    ],
    [],
    //end
  );

  const mainTable = useMaterialReactTable({
    columns: mainColumns,
    data: mainAssemblies && mainAssemblies.length > 0 ? mainAssemblies : [],
    enableGrouping: true,
    groupedColumnMode: 'remove',
    initialState: {
      grouping: ['main_assembly_name']
    },
    muiTableContainerProps: { sx: { maxHeight: '800px' } },
    enablePagination: false,
    enableBottomToolbar: false,
    enableTopToolbar: false,
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: '#fadbda'
      }
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        //   backgroundColor: row.index % 2 == 0 ? 'white' : '#F2F2F2',
        '&:hover': {
          backgroundColor: 'lightskyblue',
        }
      },
    }),
  });

  const sectionColumns = useMemo<MRT_ColumnDef<any>[]>(
    //column definitions...
    () => [
      {
        header: 'Section Assembly Name',
        accessorKey: 'section_assembly_name',
      },
      {
        header: 'Main Assembly Name',
        accessorKey: 'main_assembly_name',
      },
      {
        header: 'Sub Assembly Name',
        accessorKey: 'sub_assembly_name',
      },
      {
        header: 'Part',
        accessorKey: 'part_name',
      },
      {
        header: 'Boughtout',
        accessorKey: 'bought_out_name',
      },
      {
        header: 'Qty',
        accessorKey: 'qty',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        Cell: (row: any) => (
          <Box
            sx={{
              borderColor: row.status == null ? '#F95454' : '#006BFF',
              color: row.status == null ? '#F95454' : '#006BFF',
              borderStyle: 'solid', borderWidth: 'thin',
              textAlign: 'center',
              borderRadius: '4px', cursor: 'pointer',
              // ":hover": {
              //     backgroundColor: row?.row?.original?.status.includes('Progress') ? '#006BFF' : 'white',
              //     color: row?.row?.original?.status.includes('Progress') ? 'white' :
              //     row?.row?.original?.status.includes('Pending') ? '#F95454' : '#347928'
              // }
            }}
            onClick={() => {

            }}>{row?.status ? row?.status : 'Pending'}</Box>
        )
      }
    ],
    [],
    //end
  );

  const sectionTable = useMaterialReactTable({
    columns: sectionColumns,
    data: sectionAssemblies && sectionAssemblies.length > 0 ? sectionAssemblies : [],
    enableGrouping: true,
    groupedColumnMode: 'remove',
    initialState: {
      grouping: ['section_assembly_name']
    },
    muiTableContainerProps: { sx: { maxHeight: '800px' } },
    enablePagination: false,
    enableBottomToolbar: false,
    enableTopToolbar: false,
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: '#fadbda'
      }
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        //   backgroundColor: row.index % 2 == 0 ? 'white' : '#F2F2F2',
        '&:hover': {
          backgroundColor: 'lightskyblue',
        }
      },
    }),
  });

  return (
    <Box sx={{ display: 'flex', direction: 'column' }}>
      <SidebarNav currentPage={nav_assembly} />

      <Grid2 container spacing={2} padding={2} sx={{ mt: 10, flexGrow: 1 }}>

        <Grid2 size={2}>
          <Typography variant='subtitle2' color={'grey'}>Quotation No</Typography>
          <Typography variant='subtitle1'>{orderDetail?.quotation?.quotation_no}</Typography>
        </Grid2>

        <Grid2 size={2}>
          <Typography variant='subtitle2' color={'grey'}>Machine Name</Typography>
          <Typography variant='subtitle1'>{orderDetail?.machine_name}</Typography>
        </Grid2>

        <Grid2 size={2}>
          <Typography variant='subtitle2' color={'grey'}>Customer Name</Typography>
          <Typography variant='subtitle1'>{orderDetail?.customer?.customer_name}</Typography>
        </Grid2>

        <Grid2 size={1}>
          <Typography variant='subtitle2' color={'grey'}>Qty</Typography>
          <Typography variant='subtitle1'>{orderDetail?.quotation?.qty}</Typography>
        </Grid2>

        <Grid2 size={12}>
          <Tabs value={currentTab} onChange={(e, newValue) => {
            setCurrentTab(newValue)
            if(newValue == 0){
              dispatch(getMachineSubAssembly({ machineId: state?.machine_id, orderId: state?.order_id })).unwrap().then((res: any) => {
                setSubAssemblies(res)
              })          
            }else if (newValue == 1) {
              dispatch(getMachineMainAssembly({ machineId: state?.machine_id, orderId: state?.order_id })).unwrap().then((res: any) => {
                setMainAssemblies(res)
              })
            } else if (newValue == 2) {
              dispatch(getMachineSectionAssembly({ machineId: state?.machine_id, orderId: state?.order_id })).unwrap().then((res: any) => {
                setSectionAssemblies(res)
              })
            }
          }} variant='fullWidth'>
            <Tab label="Sub Assembly" value={0} />
            <Tab label="Main Assembly" value={1} />
            <Tab label="Section Assebly" value={2} />
          </Tabs>
        </Grid2>

        {currentTab == 0 && <Grid2 size={12}>
          <MaterialReactTable table={table} />
        </Grid2>} 

        {currentTab == 1 && <Grid2 size={12}>
          <MaterialReactTable table={mainTable} />
        </Grid2>}

        {currentTab == 2 && <Grid2 size={12}>
          <MaterialReactTable table={sectionTable} />
        </Grid2>}
      </Grid2>
    </Box>
  );
}
