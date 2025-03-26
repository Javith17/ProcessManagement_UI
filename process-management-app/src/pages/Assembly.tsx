import { useMemo, useState } from 'react';
import { Box, Button, Card, CircularProgress, Dialog, DialogContent, DialogTitle, Grid2, InputAdornment, Pagination, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { nav_assembly, nav_customers, page_limit, TableRowStyled } from '../constants';
import { getAssemblyImage, getMachineMainAssembly, getMachineSectionAssembly, getMachineSubAssembly, getOrderDetail, updateAssemblyStatus } from '../slices/assemblySlice';
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from 'material-react-table';
import { CloseSharp } from '@mui/icons-material';

export default function Assembly() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [subAssemblies, setSubAssemblies] = useState<any[]>([])
  const [mainAssemblies, setMainAssemblies] = useState<any[]>([])
  const [sectionAssemblies, setSectionAssemblies] = useState<any[]>([])
  const [orderDetail, setOrderDetail] = useState<any>()
  const [currentTab, setCurrentTab] = useState(0)
  const [imageDialog, setImageDialog] = useState({
    isOpen: false,
    imageUrl: '',
    name: ''
  })

  const statusColor = (status: string) => {
    if (status == 'Pending') {
      return '#98817B'
    } else if (status == 'Assembly In-Progress') {
      return '#006BFF'
    } else if (status == 'Ready to Assemble') {
      return '#993300'
    } else if (status == 'Assembly Completed') {
      return '#00563B'
    }
  }

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
              borderColor: statusColor(row?.row?.original?.status ? row?.row?.original?.status : 'Pending'),
              color: statusColor(row?.row?.original?.status ? row?.row?.original?.status : 'Pending'),
              borderStyle: 'solid', borderWidth: 'thin',
              textAlign: 'center',
              borderRadius: '4px',
              cursor: !row?.row?.original?.status ? 'default' : 'pointer',
              ":hover": {
                backgroundColor: !row?.row?.original?.status ? 'transparent' : statusColor(row?.row?.original?.status),
                color: !row?.row?.original?.status ? statusColor('Pending') : 'white',
              }
            }}
            onClick={() => {
              if (row?.row?.original?.status == 'Ready to Assembly') {
                dispatch(updateAssemblyStatus({
                  id: row?.row?.original?.id,
                  assembly_type: 'sub_assembly',
                  status: 'Assembly In-Progress',
                  assembly_id: row?.row?.original?.sub_assembly_id,
                  order_id: state?.order_id
                })).unwrap().then((res: any) => {
                  if (res.message.includes('success')) {
                    dispatch(getMachineSubAssembly({ machineId: state?.machine_id, orderId: state?.order_id })).unwrap().then((res: any) => {
                      setSubAssemblies(res)
                    })
                  }
                })
              } else if (row?.row?.original?.status == "Assembly In-Progress") {
                dispatch(updateAssemblyStatus({
                  id: row?.row?.original?.id,
                  assembly_type: 'sub_assembly',
                  status: 'Assembly Completed',
                  assembly_id: row?.row?.original?.sub_assembly_id,
                  order_id: state?.order_id,
                  name: row?.row?.original?.part_name ? row?.row?.original?.part_name : row?.row?.original?.bought_out_name
                })).unwrap().then((res: any) => {
                  if (res.message.includes('success')) {
                    dispatch(getMachineSubAssembly({ machineId: state?.machine_id, orderId: state?.order_id })).unwrap().then((res: any) => {
                      setSubAssemblies(res)
                    })
                  }
                })
              }
            }}>{row?.row?.original?.status ? row?.row?.original?.status : 'Pending'}</Box>
        )
      },
      {
        header: 'Image',
        accessorKey: 'id',
        Cell: (row: any) => (
          <p style={{ textAlign: 'center', color: 'blue', cursor: 'pointer' }} onClick={() => {
            setImageDialog({
              isOpen: true,
              imageUrl: `http://localhost:3000/machine/viewImage/${row?.row?.original?.part_name ? 'part' : 'bought_out'}/${row?.row?.original?.part_id ? row?.row?.original?.part_id : row?.row?.original?.bought_out_id}`,
              name: row?.row?.original?.part_name ? row?.row?.original?.part_name : row?.row?.original?.bought_out_name
            })
          }}><u>View Image</u></p>
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
              borderColor: statusColor(row?.row?.original?.status ? row?.row?.original?.status : 'Pending'),
              color: statusColor(row?.row?.original?.status ? row?.row?.original?.status : 'Pending'),
              borderStyle: 'solid', borderWidth: 'thin',
              textAlign: 'center',
              borderRadius: '4px',
              cursor: (!row?.row?.original?.status) ?
                'default' : 'pointer',
              ":hover": {
                backgroundColor:
                  (!row?.row?.original?.status) ? 'transparent' :
                    statusColor(row?.row?.original?.status),
                color: !row?.row?.original?.status ?
                  statusColor('Pending') : 'white'
              }
            }}
            onClick={() => {
              if (row?.row?.original?.status == "Ready to Assemble") {
                dispatch(updateAssemblyStatus({
                  id: row?.row?.original?.id,
                  assembly_type: 'main_assembly',
                  status: 'Assembly In-Progress',
                  assembly_id: row?.row?.original?.main_assembly_id,
                  order_id: state?.order_id
                })).unwrap().then((res: any) => {
                  if (res.message.includes('success')) {
                    dispatch(getMachineMainAssembly({ machineId: state?.machine_id, orderId: state?.order_id })).unwrap().then((res: any) => {
                      setMainAssemblies(res)
                    })
                  }
                })
              } else if (row?.row?.original?.status == "Assembly In-Progress") {
                dispatch(updateAssemblyStatus({
                  id: row?.row?.original?.id,
                  assembly_type: 'main_assembly',
                  status: 'Assembly Completed',
                  assembly_id: row?.row?.original?.main_assembly_id,
                  order_id: state?.order_id,
                  name: row?.row?.original?.part_name ? row?.row?.original?.part_name :
                    row?.row?.original?.bought_out_name ? row?.row?.original?.bought_out_name :
                      row?.row?.original?.sub_assembly_name
                })).unwrap().then((res: any) => {
                  if (res.message.includes('success')) {
                    dispatch(getMachineMainAssembly({ machineId: state?.machine_id, orderId: state?.order_id })).unwrap().then((res: any) => {
                      setMainAssemblies(res)
                    })
                  }
                })
              }
            }}>{row?.row?.original?.status ? row?.row?.original?.status : 'Pending'}</Box>
        )
      },
      {
        header: 'Image',
        accessorKey: 'id',
        Cell: (row: any) => (
          <p style={{ textAlign: 'center', color: 'blue', cursor: 'pointer' }} onClick={() => {
            setImageDialog({
              isOpen: true,
              imageUrl: `http://localhost:3000/machine/viewImage/${row?.row?.original?.part_name ? 'part' :
                row?.row?.original?.bought_out_name ? 'bought_out' :
                  'sub_assembly'}/${row?.row?.original?.part_id ? row?.row?.original?.part_id :
                    row?.row?.original?.bought_out_id ? row?.row?.original?.bought_out_id :
                      row?.row?.original?.sub_assembly_id}`,
              name: row?.row?.original?.part_name ? row?.row?.original?.part_name :
                row?.row?.original?.bought_out_name ? row?.row?.original?.bought_out_name :
                row?.row?.original?.sub_assembly_name
            })
          }}><u>View Image</u></p>
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
              borderColor: statusColor(row?.row?.original?.status ? row?.row?.original?.status : 'Pending'),
              color: statusColor(row?.row?.original?.status ? row?.row?.original?.status : 'Pending'),
              borderStyle: 'solid', borderWidth: 'thin',
              textAlign: 'center',
              borderRadius: '4px',
              cursor: (!row?.row?.original?.status) ?
                'default' : 'pointer',
              ":hover": {
                backgroundColor:
                  !row?.row?.original?.status ? 'transparent' :
                    statusColor(row?.row?.original?.status),
                color: !row?.row?.original?.status ?
                  statusColor('Pending') : 'white'
              }
            }}
            onClick={() => {
              if (row?.row?.original?.status == "Ready to Assemble") {
                dispatch(updateAssemblyStatus({
                  id: row?.row?.original?.id,
                  assembly_type: 'section_assembly',
                  status: 'Assembly In-Progress',
                  assembly_id: row?.row?.original?.section_assembly_id,
                  order_id: state?.order_id,
                  name: row?.row?.original?.part_name ? row?.row?.original?.part_name :
                    row?.row?.original?.bought_out_name ? row?.row?.original?.bought_out_name :
                      row?.row?.original?.sub_assembly_name ? row?.row?.original?.sub_assembly_name :
                        row?.row?.original?.main_assembly_name
                })).unwrap().then((res: any) => {
                  if (res.message.includes('success')) {
                    dispatch(getMachineSectionAssembly({ machineId: state?.machine_id, orderId: state?.order_id })).unwrap().then((res: any) => {
                      setSectionAssemblies(res)
                    })
                  }
                })
              } else if (row?.row?.original?.status == "Assembly In-Progress") {
                dispatch(updateAssemblyStatus({
                  id: row?.row?.original?.id,
                  assembly_type: 'sectioni_assembly',
                  status: 'Assembly Completed',
                  assembly_id: row?.row?.original?.section_assembly_id,
                  order_id: state?.order_id,
                  name: row?.row?.original?.part_name ? row?.row?.original?.part_name :
                    row?.row?.original?.bought_out_name ? row?.row?.original?.bought_out_name :
                      row?.row?.original?.sub_assembly_name ? row?.row?.original?.sub_assembly_name :
                        row?.row?.original?.main_assembly_name
                })).unwrap().then((res: any) => {
                  if (res.message.includes('success')) {
                    dispatch(getMachineSectionAssembly({ machineId: state?.machine_id, orderId: state?.order_id })).unwrap().then((res: any) => {
                      setSectionAssemblies(res)
                    })
                  }
                })
              }
            }}>{row?.row?.original?.status ? row?.row?.original?.status : 'Pending'}</Box>
        )
      },
      {
        header: 'Image',
        accessorKey: 'id',
        Cell: (row: any) => (
          <p style={{ textAlign: 'center', color: 'blue', cursor: 'pointer' }} onClick={() => {
            setImageDialog({
              isOpen: true,
              imageUrl: `${process.env.REACT_APP_API_URL}/machine/viewImage/${row?.row?.original?.part_name ? 'part' :
                row?.row?.original?.bought_out_name ? 'bought_out' :
                  row?.row?.original?.sub_assembly_name ? 'sub_assembly' :
                    'main_assembly'}/${row?.row?.original?.part_id ? row?.row?.original?.part_id :
                    row?.row?.original?.bought_out_id ? row?.row?.original?.bought_out_id :
                      row?.row?.original?.sub_assembly_id ? row?.row?.original?.sub_assembly_id :
                        row?.row?.original?.main_assembly_id}`,
              name: row?.row?.original?.part_name ? row?.row?.original?.part_name :
              row?.row?.original?.bought_out_name ? row?.row?.original?.bought_out_name :
                row?.row?.original?.sub_assembly_name ? row?.row?.original?.sub_assembly_name :
                  row?.row?.original?.main_assembly_name
            })
          }}><u>View Image</u></p>
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
            if (newValue == 0) {
              // dispatch(getMachineSubAssembly({ machineId: state?.machine_id, orderId: state?.order_id })).unwrap().then((res: any) => {
              //   setSubAssemblies(res)
              // })          
            } else if (newValue == 1) {
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

      {/* Verification Dialog for spares quotation */}

      <Dialog
        maxWidth={'xl'}
        open={imageDialog.isOpen}
        onClose={(event, reason) => {
          if (reason == "backdropClick") {
            return
          }
          setImageDialog({
            isOpen: false,
            imageUrl: '',
            name: ''
          })
        }}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <h5 style={{ flexGrow: '1' }}>{imageDialog.name}</h5>
            <CloseSharp style={{ cursor: 'pointer' }} onClick={() => {
              setImageDialog({
                isOpen: false,
                imageUrl: '',
                name: ''
              })
            }} />
          </Box>
        </DialogTitle>
        <DialogContent>
            <img src={imageDialog.imageUrl} style={{height:'500px', width:'800px', objectFit: 'contain'}} />
        </DialogContent>
      </Dialog>

    </Box>
  );
}
