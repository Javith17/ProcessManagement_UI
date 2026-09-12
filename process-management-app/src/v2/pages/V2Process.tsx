import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, Grid2, InputAdornment, Paper, TextField, FormControl, Alert, CircularProgress, Pagination } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { useEffect } from 'react';
import { createNewProcess, deleteProcess, fetchProcessList, fetchRoles, updateProcess } from '../../slices/adminSlice';
import { Add, Search } from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import DialogTitle from '@mui/material/DialogTitle';
import { page_limit } from '../../constants';
import RefreshButton from '../../components/RefreshButton';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../../utils/DisplaySnackbar';
import V2PageShell from '../components/V2PageShell';
import V2Drawer from '../components/V2Drawer';
import { V2TableRowStyled } from '../components/v2Table';
import { v2Colors } from '../theme';

// Functional port of pages/Process.tsx. Known bugs reproduced verbatim:
// - Pagination count is `processList.count / page_limit` (no Math.ceil)
// - the "Process Name" TextField uses id/name="email" (copy-paste leftover)
// - handleNewProcess() (create) always closes the dialog and clears the form,
//   regardless of whether the API response string actually contains 'success'
//   (only the snackbar variant depends on it)
// - handleUpdateProcess() (edit) only closes/clears the dialog when the
//   response string DOES include 'success' -- this asymmetry vs. create is
//   intentional and preserved exactly
// - neither handler validates required fields before submit
export default function V2Process() {
  const dispatch = useAppDispatch()
  const { enqueueSnackbar } = useSnackbar()

  const { processList, status } = useAppSelector(
    (state) => state.admin
  );

  const [searchText, setSearchText] = React.useState("")
  const [createDialog, setCreateDialog] = React.useState(false)
  const [processName, setProcessName] = React.useState("")
  const [selectedProcess, setSelectedProcess] = React.useState({
    id: '',
    name: ''
  })
  const [loadingDialog, setLoadingDialog] = React.useState(false)
  const [deleteDialog, setDeleteDialog] = React.useState({ dialog: false, id: '', name: '' })
  const [pageNo, setPageNo] = React.useState(1)

  useEffect(() => {
    dispatch(fetchProcessList({ limit: page_limit, page: pageNo })).unwrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  useEffect(() => {
    setLoadingDialog(status.includes('loading'))
  }, [status])

  const handleSearch = () => {
    dispatch(fetchProcessList({ searchText })).unwrap()
  }

  const handleRefresh = () => {
    dispatch(fetchProcessList({ limit: page_limit, page: pageNo, searchText })).unwrap()
  }

  const handleNewProcess = () => {
    dispatch(createNewProcess({
      process_name: processName
    })).unwrap().then((res) => {
      setCreateDialog(false)
      DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
      setProcessName("")
      dispatch(fetchProcessList({ limit: page_limit, page: pageNo })).unwrap()
    }).catch((err) => {
      DisplaySnackbar(err.message, "error", enqueueSnackbar)
    })
  }

  const handleUpdateProcess = () => {
    dispatch(updateProcess({
      id: selectedProcess.id,
      process_name: processName
    })).unwrap().then((res) => {
      DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
      if (res.includes('success')) {
        setCreateDialog(false)
        setProcessName("")
        setSelectedProcess({
          id: '',
          name: ''
        })
        dispatch(fetchProcessList({ limit: page_limit, page: pageNo })).unwrap()
      }
    }).catch((err) => {
      DisplaySnackbar(err.message, "error", enqueueSnackbar)
    })
  }

  return (
    <V2PageShell currentPage="process">
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='Search process'
            variant="outlined"
            size='small'
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value)
            }}
            onKeyDown={(ev) => {
              if (ev.key == "Enter") {
                handleSearch()
              }
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid2>
        <Grid2 size="grow" display="flex" alignItems="end" flexDirection="column">
          <Box sx={{ display: 'flex', gap: 1 }}>
            <RefreshButton onClick={handleRefresh} />
            <Button variant="contained" startIcon={<Add />} size="small" onClick={() => {
              setCreateDialog(true)
            }}>
              Add New
            </Button>
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 6, md: 12 }}>
          <TableContainer component={Paper} sx={{ border: `1px solid ${v2Colors.line}`, boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Process Name</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processList.list.length > 0 ? processList.list.map((row) => (
                  <V2TableRowStyled key={row.id}>
                    <TableCell>{row.process_name}</TableCell>
                    <TableCell><MdOutlineEdit style={{ cursor: 'pointer' }} onClick={() => {
                      setSelectedProcess({
                        id: row.id,
                        name: row.process_name
                      })
                      setProcessName(row.process_name)
                      setCreateDialog(true)
                    }} /></TableCell>
                  </V2TableRowStyled>
                )) : <TableRow key={0}>
                  <TableCell colSpan={2} align='center'>No Data</TableCell>
                </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination count={Math.ceil(processList.count / page_limit)} shape="rounded" sx={{
            '& > .MuiPagination-ul': {
              justifyContent: 'center',
            }, mt: 2
          }} onChange={(e: any, value: number) => {
            dispatch(fetchProcessList({ limit: page_limit, page: value }))
          }} />

        </Grid2>
      </Grid2>

      <V2Drawer
        open={createDialog}
        onClose={() => {
          setCreateDialog(false)
          setSelectedProcess({
            id: '',
            name: ''
          })
          setProcessName('')
        }}
        title={selectedProcess?.id && selectedProcess?.id?.length > 0 ? 'Update Process' : 'Create New Process'}
        actions={<>
          {selectedProcess?.id && selectedProcess?.id?.length > 0 && <Button variant='text' onClick={() => {
            setCreateDialog(false)
            setDeleteDialog({ dialog: true, id: selectedProcess.id, name: selectedProcess.name })
          }} sx={{ color: v2Colors.primary }}>Delete</Button>}
          <Button variant='text' onClick={() => {
            setCreateDialog(false)
            setSelectedProcess({
              id: '',
              name: ''
            })
            setProcessName('')
          }} sx={{ color: v2Colors.primary }}>Cancel</Button>
          <Button onClick={() => {
            if (selectedProcess?.id && selectedProcess?.id?.length) {
              handleUpdateProcess();
            } else {
              handleNewProcess();
            }
          }} variant="contained">{selectedProcess?.id && selectedProcess?.id?.length > 0 ? 'Update' : 'Save'}</Button>
        </>}
      >
          <Grid2 container spacing={2}>
            <Grid2 size={12}>
              <TextField
                margin="normal"
                required
                id="email"
                label="Process Name"
                name="email"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)} />
            </Grid2>
          </Grid2>
      </V2Drawer>

      <Dialog maxWidth={'md'}
        open={loadingDialog}>
        <CircularProgress color='success' sx={{ m: 3 }} />
      </Dialog>

      <Dialog
        maxWidth={'sm'}
        open={deleteDialog.dialog}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {deleteDialog.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteDialog({ dialog: false, id: '', name: '' })
          }} sx={{ color: v2Colors.primary }}>No</Button>
          <Button variant="contained" size="small" onClick={() => {
            dispatch(deleteProcess({ id: deleteDialog.id })).unwrap().then((res: any) => {
              setDeleteDialog({ dialog: false, id: '', name: '' })
              setSelectedProcess({ id: '', name: '' })
              setProcessName('')
              DisplaySnackbar(res, res.includes('success') ? 'success' : 'error', enqueueSnackbar)
              dispatch(fetchProcessList({ limit: page_limit, page: pageNo }))
            }).catch((err: any) => {
              enqueueSnackbar('Unable to delete process', { variant: 'error' });
            })
          }}>Yes</Button>
        </DialogActions>
      </Dialog>
    </V2PageShell>
  );
}
