import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid2, InputAdornment, InputLabel, MenuItem, Paper, Select, Tab, Tabs, TextField } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { fetchCustomers, fetchRoles } from '../slices/adminSlice';
import { Add, Save, Search, Settings } from '@mui/icons-material';
import { ImCheckboxChecked } from "react-icons/im";
import { IoMdClose } from "react-icons/io";
import { useLocation, useNavigate } from 'react-router-dom';
import { nav_customers, nav_subassembly, TableRowStyled, VisuallyHiddenInput } from '../constants';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';
import { IoMdCloseCircle } from "react-icons/io";
import { fetchMainAssembly, fetchSectionAssembly, fetchSubAssembly } from '../slices/assemblySlice';

export default function SubAssembly() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { state } = useLocation()

  const { subAssemblies, mainAssemblies, sectionAssemblies } = useAppSelector(
    (state) => state.assembly
  );

  const [searchText, setSearchText] = useState("")
  const [currentTab, setCurrentTab] = useState(0)

  useEffect(() => {
    dispatch(fetchSubAssembly()).unwrap()
  }, [dispatch])

  useEffect(() => {
    if (currentTab == 0) {
      dispatch(fetchSubAssembly()).unwrap()
    } else if (currentTab == 1) {
      dispatch(fetchMainAssembly()).unwrap()
    } else if (currentTab == 2) {
      dispatch(fetchSectionAssembly()).unwrap()
    }
  }, [currentTab])

  useEffect(()=>{
    if(state?.from){
      if(state?.from.includes('Section')){
        setCurrentTab(2)
      }else if(state?.from.includes('Main')){
        setCurrentTab(1)
      }else if(state?.from.includes('Sub')){
        setCurrentTab(0)
      }
    }
  }, [state])
  
  const handleSearch = () => {
    if (currentTab == 0) {
      dispatch(fetchSubAssembly(searchText)).unwrap()
    } else if (currentTab == 1) {
      dispatch(fetchMainAssembly(searchText)).unwrap()
    } else if (currentTab == 2) {
      dispatch(fetchSectionAssembly(searchText)).unwrap()
    }
  }

  const getMainAssemblyDays = (sub: any) => {
    const mainAssemblyParts : Array<{id: string, days: number}> = []
    sub.map((s:any)=>{
      if(s.part){
        if(mainAssemblyParts.filter((mp: any) => mp.id == s.part.id).length == 0){
          mainAssemblyParts.push({id: s.part.id, days: s.part.days})
        }
      }else if(s.sub_assembly){
        s.sub_assembly.sub_assembly_detail.map((sab: any) => {
          if(sab.part){
            if(mainAssemblyParts.filter((mp: any) => mp.id == sab.part.id).length == 0){
              mainAssemblyParts.push({id: sab.part.id, days: sab.part.days})
            } 
          }
        })
      }
    })
    return mainAssemblyParts.reduce((n: any, vl: any) => n + vl.days, 0)
  }

  const getSectionAssemblyDays = (sub: any) => {
    const sectionAssemblyParts : Array<{id: string, days: number}> = []
    sub.map((s:any)=>{
      if(s.part){
        if(sectionAssemblyParts.filter((mp: any) => mp.id == s.part.id).length == 0){
          sectionAssemblyParts.push({id: s.part.id, days: s.part.days})
        }
      }else if(s.sub_assembly){
        s.sub_assembly.sub_assembly_detail.map((sab: any) => {
          if(sab.part){
            if(sectionAssemblyParts.filter((mp: any) => mp.id == sab.part.id).length == 0){
              sectionAssemblyParts.push({id: sab.part.id, days: sab.part.days})
            } 
          }
        })
      }else if(s.main_assembly){
        s.main_assembly.main_assembly_detail.map((mad: any) => {
          if(mad.part){
            if(sectionAssemblyParts.filter((sp: any) => sp.id == mad.part.id).length == 0){
              sectionAssemblyParts.push({id: mad.part.id, days: mad.part.days})
            }
          }else if(mad.sub_assembly){
            mad.sub_assembly.sub_assembly_detail.map((sad: any) => {
              if(sad.part){
                if(sectionAssemblyParts.filter((sp:any) => sp.id == sad.part.id).length == 0){
                  sectionAssemblyParts.push({id: sad.part.id, days: sad.part.days})
                }
              }
            })
          }
        })
      }
    })
    return sectionAssemblyParts.reduce((n: any, vl: any) => n + vl.days, 0)
  }

  return (
    <Box sx={{ display: 'flex', direction: 'column' }}>
      <SidebarNav currentPage={nav_subassembly} />

      <Grid2 container spacing={2} padding={2} sx={{ mt: 10, flexGrow: 1 }}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='Search sub assembly'
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
          <Button variant="contained" startIcon={<Add />} size="small" onClick={() => {
            if (currentTab == 0)
              navigate('/subAssembly/newSubAssembly')
            else if (currentTab == 1)
              navigate('/subAssembly/newMainAssembly')
            else if (currentTab == 2)
              navigate('/subAssembly/newSectionAssembly')
          }}>
            Add New
          </Button>
        </Grid2>
        <Grid2 size={{ xs: 6, md: 12 }}>
          <Tabs value={currentTab} onChange={(e, newValue) => {
            setCurrentTab(newValue)
          }} variant='fullWidth'>
            <Tab label="Sub Assembly" value={0} />
            <Tab label="Main Assembly" value={1} />
            <Tab label="Section Assembly" value={2} />
          </Tabs>
          <TableContainer component={Paper} sx={{ mt: 1 }}>
            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda" } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Serial No</TableCell>
                  <TableCell>Assembly Name</TableCell>
                  <TableCell>Parts</TableCell>
                  <TableCell>Boughtouts</TableCell>
                  {currentTab > 0 && <TableCell>Sub Assembly</TableCell>}
                  {currentTab == 2 && <TableCell>Main Assembly</TableCell>}
                  {currentTab > 0 && <TableCell>Machine</TableCell>}
                  <TableCell>Days</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentTab == 0 ? subAssemblies.length > 0 ? subAssemblies.map((row) => (
                  <TableRowStyled key={row.id}>
                    <TableCell>{row.serial_no}</TableCell>
                    <TableCell>{row.sub_assembly_name}</TableCell>
                    <TableCell>{row.sub_assembly_detail?.filter((sub: any) => sub.part != null)?.length || 0}</TableCell>
                    <TableCell>{row.sub_assembly_detail.filter((sub: any) => sub.bought_out != null)?.length || 0}</TableCell>
                    <TableCell>{row.sub_assembly_detail.filter((sub: any) => sub.part != null).reduce((n: any, vl: any) => n + vl?.part?.days, 0) +
                    row.sub_assembly_detail.filter((sub: any) => sub.bought_out != null).reduce((n: any, vl: any) => n + vl?.bought_out?.days, 0)}</TableCell>
                    <TableCell><MdOutlineEdit style={{ cursor: 'pointer' }} onClick={() => {
                      console.log("00000000", row.id)
                      navigate('/subAssembly/editSubAssembly', {
                        state: {
                          id: row.id
                        }
                      })
                    }} /></TableCell>
                  </TableRowStyled>
                )) : <TableRow key={0}>
                  <TableCell colSpan={5} align='center'>No Data</TableCell>
                </TableRow> : currentTab == 1 ? mainAssemblies.length > 0 ? mainAssemblies.map((row) => (
                  <TableRowStyled key={row.id}>
                    <TableCell>{row.serial_no}</TableCell>
                    <TableCell>{row.main_assembly_name}</TableCell>
                    <TableCell>{row.main_assembly_detail?.filter((sub: any) => sub.part != null)?.length || 0}</TableCell>
                    <TableCell>{row.main_assembly_detail.filter((sub: any) => sub.bought_out != null)?.length || 0}</TableCell>
                    <TableCell>{row.main_assembly_detail.filter((sub: any) => sub.sub_assembly != null)?.length || 0}</TableCell>
                    <TableCell>{row.machine.machine_name}</TableCell>
                    <TableCell>{getMainAssemblyDays(row.main_assembly_detail)}</TableCell>
                    <TableCell><MdOutlineEdit style={{ cursor: 'pointer' }} onClick={() => {
                      navigate('/subAssembly/editMainAssembly', {
                        state: {
                          id: row.id
                        }
                      })
                    }} /></TableCell>
                  </TableRowStyled>
                )) : <TableRow key={0}>
                  <TableCell colSpan={7} align='center'>No Data</TableCell>
                </TableRow> : currentTab == 2 ? sectionAssemblies.length > 0 ? sectionAssemblies.map((row) => (
                  <TableRowStyled key={row.id}>
                    <TableCell>{row.serial_no}</TableCell>
                    <TableCell>{row.section_assembly_name}</TableCell>
                    <TableCell>{row.section_assembly_detail?.filter((sub: any) => sub.part != null)?.length || 0}</TableCell>
                    <TableCell>{row.section_assembly_detail.filter((sub: any) => sub.bought_out != null)?.length || 0}</TableCell>
                    <TableCell>{row.section_assembly_detail.filter((sub: any) => sub.sub_assembly != null)?.length || 0}</TableCell>
                    <TableCell>{row.section_assembly_detail.filter((sub: any) => sub.main_assembly != null)?.length || 0}</TableCell>
                    <TableCell>{row.machine.machine_name}</TableCell>
                    <TableCell>{getSectionAssemblyDays(row.section_assembly_detail)}</TableCell>
                    <TableCell><MdOutlineEdit style={{ cursor: 'pointer' }} onClick={() => {
                      navigate('/subAssembly/editSectionAssembly', {
                        state: {
                          id: row.id
                        }
                      })
                    }}/></TableCell>
                  </TableRowStyled>
                )) : <TableRow key={0}>
                  <TableCell colSpan={8} align='center'>No Data</TableCell>
                </TableRow> : <TableRow key={0}>
                  <TableCell colSpan={8} align='center'>No Data</TableCell>
                </TableRow>}

              </TableBody>
            </Table>
          </TableContainer>
        </Grid2>
      </Grid2>
    </Box>
  );
}
