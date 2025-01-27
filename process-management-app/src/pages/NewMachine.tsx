import { useState } from 'react';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { TextField, Button, Grid2, Container, Alert, Paper, Box, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Checkbox, ListItemText, SelectChangeEvent, Tabs, Tab, Card, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowBackIos, Save, Settings } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { addSubAssemblyToMachine, createMachine, fetchBoughtOutList, fetchPartsList, getMachineDetails } from '../slices/machineSlice';
import { checkAssemblyName, fetchSubAssemblByMachine, fetchSubAssembly } from '../slices/assemblySlice';
import { CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import { MdDeleteOutline, MdOutlineEdit } from 'react-icons/md';
import { IoMdCloseCircle } from "react-icons/io";
import { nav_machines } from '../constants';

export default function NewMachine() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const { state } = useLocation()

  const { parts, boughtOuts } = useAppSelector(
    (state) => state.machine
  );

  const { machineSubAssemblies } = useAppSelector(
    (state) => state.assembly
  );

  const [machineId, setMachineId] = useState("")
  const [editType, setEditType] = useState("")

  // Sub Assembly States Start
  const [subAssemblyList, setSubAssemblyList] = useState<Array<{ id: string, name: string, sub_assembly_id:string,qty: number }>>([]);
  const [subAssemblyDialog, setSubAssemblyDialog] = useState(false)
  const [selectedSubAssembly, setSelectedSubAssembly] = useState<{ id: string, sub_assembly_id:string, name: string, qty: number }>({ id: '', sub_assembly_id: '', name: '', qty: 0 });

  // Sub Assembly States End

  // Main Assembly States Start
  const [mainAssemblyList, setMainAssemblyList] = useState<Array<{ id: number, name: string, serial_no: string }>>([]);
  const [mainAssemblySub, setMainAssemblySub] = useState<Array<{ id: number, main_assembly_id: number, sub_assembly_id: number, sub_assembly_name: string, qty: number }>>([])
  const [mainAssemblyParts, setMainAssemblyParts] = useState<Array<{ id: number, main_assembly_id: number, part_id: string, part_name: string, qty: number }>>([])
  const [mainAssemblyBoughtouts, setMainAssemblyBoughtouts] = useState<Array<{ id: number, main_assembly_id: number, bought_out_id: string, bought_out_name: string, qty: number }>>([])

  const [selectedMainAssembly, setSelectedMainAssembly] = useState<{ id: number, name: string, serial_no: string }>({ id: 0, name: '', serial_no: '' });
  const [selectedMainAssemblySub, setSelectedMainAssemblySub] = useState<Array<{ id: number, main_assembly_id: number, sub_assembly_id: number, sub_assembly_name: string, qty: number }>>([])
  const [selectedMainAssemblyParts, setSelectedMainAssemblyParts] = useState<Array<{ id: number, main_assembly_id: number, part_id: string, part_name: string, qty: number }>>([])
  const [selectedMainAssemblyBoughtouts, setSelectedMainAssemblyBoughtouts] = useState<Array<{ id: number, main_assembly_id: number, bought_out_id: string, bought_out_name: string, qty: number }>>([])

  const [mainAssemblyDialog, setMainAssemblyDialog] = useState(false)
  // Main Assembly States End

  // Section Assembly States Start
  const [sectionAssemblyList, setSectionAssemblyList] = useState<Array<{ id: number, name: string, serial_no: string }>>([]);
  const [sectionAssemblySub, setSectionAssemblySub] = useState<Array<{ id: number, section_assembly_id: number, sub_assembly_id: number, sub_assembly_name: string, qty: number }>>([])
  const [sectionAssemblyParts, setSectionAssemblyParts] = useState<Array<{ id: number, section_assembly_id: number, part_id: string, part_name: string, qty: number }>>([])
  const [sectionAssemblyBoughtouts, setSectionAssemblyBoughtouts] = useState<Array<{ id: number, section_assembly_id: number, bought_out_id: string, bought_out_name: string, qty: number }>>([])
  const [sectionAssemblyMain, setSectionAssemblyMain] = useState<Array<{ id: number, section_assembly_id: number, main_assembly_id: number, main_assembly_name: string, qty: number }>>([])

  const [selectedSectionAssembly, setSelectedSectionAssembly] = useState<{ id: number, name: string, serial_no: string }>({ id: 0, name: '', serial_no: '' });
  const [selectedSectionAssemblySub, setSelectedSectionAssemblySub] = useState<Array<{ id: number, section_assembly_id: number, sub_assembly_id: number, sub_assembly_name: string, qty: number }>>([])
  const [selectedSectionAssemblyParts, setSelectedSectionAssemblyParts] = useState<Array<{ id: number, section_assembly_id: number, part_id: string, part_name: string, qty: number }>>([])
  const [selectedSectionAssemblyBoughtouts, setSelectedSectionAssemblyBoughtouts] = useState<Array<{ id: number, section_assembly_id: number, bought_out_id: string, bought_out_name: string, qty: number }>>([])
  const [selectedSectionAssemblyMain, setSelectedSectionAssemblyMain] = useState<Array<{ id: number, section_assembly_id: number, main_assembly_id: number, main_assembly_name: string, qty: number }>>([])

  const [sectionAssemblyDialog, setSectionAssemblyDialog] = useState(false)
  // Section Assembly States End

  const [formData, setFormData] = useState({
    model_no: '',
    machine_name: '',
    spindles: 0,
    side_type: '',
    max_spindles: 0,
    min_spindles: 0
  });

  useEffect(()=>{
    if(state?.id){
      setMachineId(state?.id)
      dispatch(fetchSubAssemblByMachine(state?.id))
      dispatch(getMachineDetails(state?.id)).unwrap()
        .then((res)=>{
          setFormData({
            model_no: res.model_no,
            machine_name: res.machine_name,
            spindles: res.spindles,
            side_type: res.side_type,
            max_spindles: res.max_spindles,
            min_spindles: res.min_spindles
          })
          res.machine_sub_assembly?.map((sub: any)=>{
            setSubAssemblyList([...subAssemblyList, { id:sub.id, sub_assembly_id: sub.sub_assembly.id, qty: sub.qty, name: sub.sub_assembly.sub_assembly_name }])
          })
          const ma_list: any =[]
          const ma_maps: any = []
          const ma_bos: any = []
          const ma_subs: any= []

          res.main_assembly?.map((main: any)=>{
            ma_list.push({id: main.id, name: main.main_assembly_name, serial_no: main.serial_no})
            main.main_assembly_detail?.map((detail: any) => {
              if(detail.part){
                ma_maps.push({
                  id: detail.id,
                  main_assembly_id: main.id,
                  part_id: detail.part.id,
                  part_name: detail.part.part_name,
                  qty: detail.qty
                })
              }else if(detail.bought_out){
                ma_bos.push({
                  id: detail.id,
                  main_assembly_id: main.id,
                  bought_out_id: detail.bought_out.id,
                  bought_out_name: detail.bought_out.bought_out_name,
                  qty: detail.qty
                })
              }else if(detail.sub_assembly){
                ma_subs.push({
                  id: detail.id,
                  main_assembly_id: main.id,
                  sub_assembly_id: detail.sub_assembly.id,
                  sub_assembly_name: detail.sub_assembly.sub_assembly_name,
                  qty: detail.qty
                })
              }
            })
          })
          setMainAssemblyList(ma_list)
          setMainAssemblyParts(ma_maps)
          setMainAssemblyBoughtouts(ma_bos)
          setMainAssemblySub(ma_subs)

          res.section_assembly?.map((section: any)=>{
            setSectionAssemblyList([...sectionAssemblyList, {id: section.id, name: section.section_assembly_name, serial_no: section.serial_no}])
            const maps: any = []
            const bos: any = []
            const subs: any= []
            const mains: any = []
            section.section_assembly_detail?.map((detail: any) => {
              if(detail.part){
                maps.push({
                  id: detail.id,
                  section_assembly_id: section.id,
                  part_id: detail.part.id,
                  part_name: detail.part.part_name,
                  qty: detail.qty
                })
              }else if(detail.bought_out){
                bos.push({
                  id: detail.id,
                  section_assembly_id: section.id,
                  bought_out_id: detail.bought_out.id,
                  bought_out_name: detail.bought_out.bought_out_name,
                  qty: detail.qty
                })
              }else if(detail.sub_assembly){
                subs.push({
                  id: detail.id,
                  section_assembly_id: section.id,
                  sub_assembly_id: detail.sub_assembly.id,
                  sub_assembly_name: detail.sub_assembly.sub_assembly_name,
                  qty: detail.qty
                })
              }else if(detail.main_assembly){
                mains.push({
                  id: detail.id,
                  section_assembly_id: section.id,
                  main_assembly_id: detail.main_assembly.id,
                  main_assembly_name: detail.main_assembly.main_assembly_name,
                  qty: detail.qty
                })
              }
            })
            setSectionAssemblyParts(maps)
            setSectionAssemblyBoughtouts(bos)
            setSectionAssemblySub(subs)
            setSectionAssemblyMain(mains)
          })
        })
    }
  }, [state])


  const [deleteDialog, setDeleteDialog] = useState({
    dialog: false,
    type: '',
    name: '',
    id: ''
  })

  const [isEdit, setIsEdit] = useState(false)

  const [errors, setErrors] = useState<any>();
  const [currentTab, setCurrentTab] = useState(1)

  useEffect(() => {
    dispatch(fetchPartsList())
    dispatch(fetchBoughtOutList())
    dispatch(fetchSubAssembly())
  }, [dispatch])

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.model_no) newErrors.model_no = 'Model no is required';
    if (!formData.machine_name) newErrors.machine_name = 'Machine name is required';
    if (!formData.side_type) newErrors.side_type = 'Side type is required';
    if (!formData.spindles || formData.spindles == 0) newErrors.spindles = 'Spindles is required';

    return newErrors;
  };

  const handleSubmit = (e: any) => {

    const validationErrors = validate();

    if (Object.keys(validationErrors).length === 0) {
      if (subAssemblyList.length == 0) {
        DisplaySnackbar('Sub Assembly is required', 'error', enqueueSnackbar)
      } else if (mainAssemblyList.length == 0) {
        DisplaySnackbar('Main Assembly is required', 'error', enqueueSnackbar)
      } else {

        let partsCheck = "" //subAssemblyList.filter((sub) => !subAssemblyParts.some((sap) => sub.id == sap.sub_assembly_id.toString()))
        let boughtOutsCheck = "" //subAssemblyList.filter((sub) => !subAssemblyBoughtouts.some((sab) => sub.id == sab.sub_assembly_id.toString()))

        if (partsCheck.length > 0 && boughtOutsCheck.length > 0) {
          DisplaySnackbar('Part or Boughout is required for Sub Assembly', 'error', enqueueSnackbar)
        } else {

          let partsMainCheck = mainAssemblyList.filter((sub) => !mainAssemblyParts.some((sap) => sub.id == sap.main_assembly_id))
          let boughtOutsMainCheck = mainAssemblyList.filter((sub) => !mainAssemblyBoughtouts.some((sab) => sub.id == sab.main_assembly_id))
          let subMainCheck = mainAssemblyList.filter((sub) => !mainAssemblySub.some((sab) => sub.id == sab.main_assembly_id))

          if (partsMainCheck.length > 0 && boughtOutsMainCheck.length > 0 && subMainCheck.length > 0) {
            DisplaySnackbar('Part / Boughout / Sub Assembly is required for Main Assembly', 'error', enqueueSnackbar)
          } else {

            let partsSectionCheck = sectionAssemblyList.filter((sub) => !sectionAssemblyParts.some((sap) => sub.id == sap.section_assembly_id))
            let boughtOutsSectionCheck = sectionAssemblyList.filter((sub) => !sectionAssemblyBoughtouts.some((sab) => sub.id == sab.section_assembly_id))
            let subSectionCheck = sectionAssemblyList.filter((sub) => !sectionAssemblySub.some((sab) => sub.id == sab.section_assembly_id))
            let mainSectionCheck = sectionAssemblyList.filter((sub) => !sectionAssemblyMain.some((main) => sub.id == main.section_assembly_id))

            if (partsSectionCheck.length > 0 && boughtOutsSectionCheck.length > 0 && subSectionCheck.length > 0 && mainSectionCheck.length > 0) {
              DisplaySnackbar('Part / Boughout / Sub Assembly / Main Assembly is required for Section Assembly', 'error', enqueueSnackbar)
            } else {
              const subAssemblies: any = []
              subAssemblyList.map((sal) => {
                subAssemblies.push({
                  sub_assembly_id: sal.id,
                  qty: sal.qty
                })
              })

              const mainAssemblies: any = []
              mainAssemblyList.map((sal) => {
                let main_assembly: any = {
                  main_assembly_name: sal.name,
                  serial_no: sal.serial_no
                }
                const mainAssemblyDetails: any = []
                mainAssemblyParts.filter((sap) => sap.main_assembly_id == sal.id).map((parts) => {
                  mainAssemblyDetails.push({
                    part_id: parts.part_id,
                    qty: parts.qty
                  })
                })
                mainAssemblyBoughtouts.filter((sap) => sap.main_assembly_id == sal.id).map((boughtouts) => {
                  mainAssemblyDetails.push({
                    bought_out_id: boughtouts.bought_out_id,
                    qty: boughtouts.qty
                  })
                })
                mainAssemblySub.filter((sap) => sap.main_assembly_id == sal.id).map((sub) => {
                  mainAssemblyDetails.push({
                    sub_assembly_id: sub.sub_assembly_id,
                    qty: sub.qty
                  })
                })
                main_assembly = { ...main_assembly, main_assembly_detail: mainAssemblyDetails }
                mainAssemblies.push(main_assembly)
              })

              const sectionAssemblies: any = []
              sectionAssemblyList.map((sal) => {
                let section_assembly: any = {
                  section_assembly_name: sal.name,
                  serial_no: sal.serial_no
                }
                const sectionAssemblyDetails: any = []
                sectionAssemblyParts.filter((sap) => sap.section_assembly_id == sal.id).map((parts) => {
                  sectionAssemblyDetails.push({
                    part_id: parts.part_id,
                    qty: parts.qty
                  })
                })
                sectionAssemblyBoughtouts.filter((sap) => sap.section_assembly_id == sal.id).map((boughtouts) => {
                  sectionAssemblyDetails.push({
                    bought_out_id: boughtouts.bought_out_id,
                    qty: boughtouts.qty
                  })
                })
                sectionAssemblySub.filter((sap) => sap.section_assembly_id == sal.id).map((sub) => {
                  sectionAssemblyDetails.push({
                    sub_assembly_id: sub.sub_assembly_id,
                    qty: sub.qty
                  })
                })
                sectionAssemblyMain.filter((sap) => sap.section_assembly_id == sal.id).map((main) => {
                  sectionAssemblyDetails.push({
                    main_assembly_name: main.main_assembly_name,
                    qty: main.qty
                  })
                })

                section_assembly = { ...section_assembly, section_assembly_detail: sectionAssemblyDetails }
                sectionAssemblies.push(section_assembly)
              })

              dispatch(createMachine({
                model_no: formData.model_no,
                machine_name: formData.machine_name,
                side_type: formData.side_type,
                spindles: formData.spindles,
                min_spindles: formData.min_spindles,
                max_spindles: formData.max_spindles,
                sub_assembly: subAssemblies,
                main_assembly: mainAssemblies,
                section_assembly: sectionAssemblies
              })).unwrap().then((res) => {
                DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
                if (res.includes('success')) {
                  navigate(-1)
                }
              }).catch((err) => {
                DisplaySnackbar(err.message, 'error', enqueueSnackbar)
              })
            }
          }
        }
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const handleAddSubAssembly = (id?: string) => {
    const subAssemblyError: any = {}
    setErrors({})
    if (!selectedSubAssembly.name || selectedSubAssembly.name?.trim().length == 0) subAssemblyError.name = 'Sub Assembly is required'
    if (!selectedSubAssembly.qty || selectedSubAssembly.qty?.toString().trim().length == 0) subAssemblyError.qty = 'Qty is required'

    if (Object.keys(subAssemblyError).length > 0 && !editType.includes('Delete')) {
      setErrors(subAssemblyError)
    }else{
      dispatch(addSubAssemblyToMachine(editType.includes('Add') ? {
        sub_assembly_id: selectedSubAssembly.sub_assembly_id,
        machine_id: machineId,
        qty: selectedSubAssembly.qty,
        type: 'Add'
      } : (editType.includes('Edit')) ? {
        id: selectedSubAssembly.id,
        qty: selectedSubAssembly.qty,
        type: editType
      } : {
        id: id,
        type: editType
      })).unwrap().then((res)=>{
        DisplaySnackbar(res.message , res.message.includes('success') ? "success" : "error", enqueueSnackbar)
        if(res.message.includes('success')){
          setEditType("")
          setSubAssemblyDialog(false)
          if(editType.includes("Add")){
            setSubAssemblyList([...subAssemblyList, {id: res.id, sub_assembly_id: selectedSubAssembly.sub_assembly_id, qty: selectedSubAssembly.qty, name: selectedSubAssembly.name}])
          }else if(editType.includes("Edit")){
            setSubAssemblyList(
              subAssemblyList.map((sl)=> { return (sl.id == selectedSubAssembly.id) ? {
                id: sl.id, 
                sub_assembly_id: selectedSubAssembly.sub_assembly_id, 
                qty: selectedSubAssembly.qty, 
                name: selectedSubAssembly.name    
              } : sl } )
            )
          }else if(editType.includes('Delete')){
            setSubAssemblyList(subAssemblyList.filter((sl) => sl.id != id))
          }
          setSelectedSubAssembly({ id: '', sub_assembly_id: '', name: '', qty: 0 })
        }
      }).catch((err)=>{
        DisplaySnackbar(err.message, 'error', enqueueSnackbar)
      })
    }
  }

  const handleMainAssemblyClick = () => {
    const mainAssemblyError: any = {}
    setErrors({})
    if (!selectedMainAssembly.name || selectedMainAssembly.name?.trim().length == 0) mainAssemblyError.name = 'Main Assembly Name is required'
    if (!selectedMainAssembly.serial_no || selectedMainAssembly.serial_no?.trim().length == 0) mainAssemblyError.serial_no = 'Serial No is required'

    if (Object.keys(mainAssemblyError).length > 0) {
      setErrors(mainAssemblyError)
    } else if (mainAssemblyParts.filter((sap) => sap.main_assembly_id == selectedMainAssembly.id).length == 0 &&
      mainAssemblyBoughtouts.filter((sab) => sab.main_assembly_id == selectedMainAssembly.id).length == 0 &&
      mainAssemblySub.filter((sab) => sab.main_assembly_id == selectedMainAssembly.id).length == 0) {
      DisplaySnackbar('Part / Boughtout / Sub Assembly is required', 'error', enqueueSnackbar)
    } else if (mainAssemblyParts.filter((sap) => sap.main_assembly_id == selectedMainAssembly.id)
      .filter((sap) => sap.part_id.length == 0).length > 0) {
      DisplaySnackbar('Select valid part', 'error', enqueueSnackbar)
    } else if (mainAssemblyBoughtouts.filter((sap) => sap.main_assembly_id == selectedMainAssembly.id)
      .filter((sab) => sab.bought_out_id.length == 0).length > 0) {
      DisplaySnackbar('Select valid boughtout', 'error', enqueueSnackbar)
    } else if (mainAssemblySub.filter((sap) => sap.main_assembly_id == selectedMainAssembly.id)
      .filter((sub) => sub.sub_assembly_id == 0).length > 0) {
      DisplaySnackbar('Select valid sub assembly', 'error', enqueueSnackbar)
    } else {
      if (mainAssemblyList.filter((main) => main.name == selectedMainAssembly.name).length > 0) {
        DisplaySnackbar('Main Assembly already exists', 'error', enqueueSnackbar)
      } else {
        dispatch(checkAssemblyName({ checkName: "", type: 'Main Assembly' })).unwrap()
          .then((res) => {
            if (res == 'Success') {
              setMainAssemblyDialog(false)
              if (!isEdit) {
                setMainAssemblyList([...mainAssemblyList, {
                  id: selectedMainAssembly.id,
                  name: selectedMainAssembly.name,
                  serial_no: selectedMainAssembly.serial_no
                }])
              } else {
                setIsEdit(false)
                setMainAssemblyList(
                  mainAssemblyList.map((sal) => {
                    return (sal.id == selectedMainAssembly.id ? {
                      id: selectedMainAssembly.id,
                      name: selectedMainAssembly.name,
                      serial_no: selectedMainAssembly.serial_no
                    } : sal)
                  })
                )
              }
            } else {
              DisplaySnackbar(res, 'error', enqueueSnackbar)
            }
          })
      }
    }
  }

  const handleSectionAssemblyClick = () => {
    const sectionAssemblyError: any = {}
    setErrors({})
    if (!selectedSectionAssembly.name || selectedSectionAssembly.name?.trim().length == 0) sectionAssemblyError.name = 'Section Assembly Name is required'
    if (!selectedSectionAssembly.serial_no || selectedSectionAssembly.serial_no?.trim().length == 0) sectionAssemblyError.serial_no = 'Serial No is required'

    if (Object.keys(sectionAssemblyError).length > 0) {
      setErrors(sectionAssemblyError)
    } else if (sectionAssemblyParts.filter((sap) => sap.section_assembly_id == selectedSectionAssembly.id).length == 0 &&
      sectionAssemblyBoughtouts.filter((sab) => sab.section_assembly_id == selectedSectionAssembly.id).length == 0 &&
      sectionAssemblySub.filter((sub) => sub.section_assembly_id == selectedSectionAssembly.id).length == 0 &&
      sectionAssemblyMain.filter((main) => main.section_assembly_id == selectedSectionAssembly.id).length == 0) {
      DisplaySnackbar('Part / Boughtout / Sub Assembly / Main Assembly is required', 'error', enqueueSnackbar)
    } else if (sectionAssemblyParts.filter((sap) => sap.section_assembly_id == selectedSectionAssembly.id)
      .filter((sap) => sap.part_id.length == 0).length > 0) {
      DisplaySnackbar('Select valid part', 'error', enqueueSnackbar)
    } else if (sectionAssemblyBoughtouts.filter((sap) => sap.section_assembly_id == selectedSectionAssembly.id)
      .filter((sab) => sab.bought_out_id.length == 0).length > 0) {
      DisplaySnackbar('Select valid boughtout', 'error', enqueueSnackbar)
    } else if (sectionAssemblySub.filter((sap) => sap.section_assembly_id == selectedSectionAssembly.id)
      .filter((sub) => sub.sub_assembly_id == 0).length > 0) {
      DisplaySnackbar('Select valid sub assembly', 'error', enqueueSnackbar)
    } else if (sectionAssemblyMain.filter((main) => main.section_assembly_id == selectedSectionAssembly.id)
      .filter((main) => main.main_assembly_id == 0).length > 0) {
      DisplaySnackbar('Select valid main assembly', 'error', enqueueSnackbar)
    } else {
      if (sectionAssemblyList.filter((main) => main.name == selectedSectionAssembly.name).length > 0) {
        DisplaySnackbar('Section Assembly already exists', 'error', enqueueSnackbar)
      } else {
        dispatch(checkAssemblyName({ checkName: selectedSectionAssembly.name, type: 'Section Assembly' })).unwrap()
          .then((res) => {
            if (res == 'Success') {
              setSectionAssemblyDialog(false)
              if (!isEdit) {
                setSectionAssemblyList([...sectionAssemblyList, {
                  id: selectedSectionAssembly.id,
                  name: selectedSectionAssembly.name,
                  serial_no: selectedSectionAssembly.serial_no
                }])
              } else {
                setIsEdit(false)
                setSectionAssemblyList(
                  sectionAssemblyList.map((sal) => {
                    return (sal.id == selectedSectionAssembly.id ? {
                      id: selectedSectionAssembly.id,
                      name: selectedSectionAssembly.name,
                      serial_no: selectedSectionAssembly.serial_no
                    } : sal)
                  })
                )
              }
            } else {
              DisplaySnackbar(res, 'error', enqueueSnackbar)
            }
          })
      }
    }
  }

  return (
    <Container sx={{ display: 'flex', direction: 'row', ml: 2, mr: 5 }} maxWidth={false}>
      <SidebarNav currentPage={nav_machines} />
      <Box sx={{ display: 'flex', flexDirection: 'column', mt: 10, alignItems: 'start' }}>
        <Button variant='text' color="primary" startIcon={<ArrowBackIos />} onClick={(e: any) => {
          navigate(-1)
        }}>
          Back
        </Button>
        <form noValidate>
          <Grid2 container spacing={2} sx={{ mt: 1 }}>
            <Grid2 size={2}>
              <Typography variant='subtitle2' color={'grey'}>Model No</Typography>
              <Typography variant='subtitle1'>{formData.model_no}</Typography>
              {/* <TextField
                size='small'
                variant="outlined"
                fullWidth
                label="Model No"
                name="model_no"
                required
                value={formData.model_no}
                onChange={handleChange}
                error={!!errors?.model_no}
                helperText={errors?.model_no}
              /> */}
            </Grid2>
            <Grid2 size={3}>
              <Typography variant='subtitle2' color={'grey'}>Machine Name</Typography>
              <Typography variant='subtitle1'>{formData.machine_name}</Typography>
              {/* <TextField
                size='small'
                variant="outlined"
                fullWidth
                label="Machine Name"
                name="machine_name"
                required
                value={formData.machine_name}
                onChange={handleChange}
                error={!!errors?.machine_name}
                helperText={errors?.machine_name}
              /> */}
            </Grid2>
            <Grid2 size={2}>
              <Typography variant='subtitle2' color={'grey'}>Side Type</Typography>
              <Typography variant='subtitle1'>{formData.side_type}</Typography>
              {/* <FormControl fullWidth
                error={!!errors?.side_type}>
                <InputLabel id="role-select-label">Side Type</InputLabel>
                <Select
                  size={'small'}
                  labelId="role-select-label"
                  id="role-select"
                  label="Side Type"
                  value={formData.side_type}
                  onChange={(e) => {
                    setFormData({ ...formData, side_type: e.target.value })
                  }}
                >
                  {["Single Side", "Double Side"].map((side) => {
                    return <MenuItem value={side}>{side}</MenuItem>
                  })}
                </Select>
              </FormControl> */}
            </Grid2>
            <Grid2 size={1}>
              <Typography variant='subtitle2' color={'grey'}>Spindles</Typography>
              <Typography variant='subtitle1'>{formData.spindles}</Typography>
              {/* <TextField
                size='small'
                variant="outlined"
                fullWidth
                required
                type={'number'}
                label="Spindles"
                name="spindles"
                error={!!errors?.spindles}
                helperText={errors?.spindles}
                inputProps={{ min: 0 }}
                value={formData.spindles}
                onChange={handleChange}
              /> */}
            </Grid2>
            <Grid2 size={2}>
              <Typography variant='subtitle2' color={'grey'}>Min. Spindles</Typography>
              <Typography variant='subtitle1'>{formData.min_spindles}</Typography>
              {/* <TextField
                size='small'
                variant="outlined"
                fullWidth
                required
                type={'number'}
                label="Min. Spindles"
                name="min_spindles"
                disabled={formData.spindles == 0}
                inputProps={{ min: formData.spindles, step: formData.spindles }}
                value={formData.min_spindles}
                onChange={handleChange}
              /> */}
            </Grid2>
            <Grid2 size={2}>
              <Typography variant='subtitle2' color={'grey'}>Max. Spindles</Typography>
              <Typography variant='subtitle1'>{formData.max_spindles}</Typography>
              {/* <TextField
                size='small'
                variant="outlined"
                fullWidth
                required
                type={'number'}
                label="Max. Spindles"
                name="max_spindles"
                disabled={formData.spindles == 0}
                inputProps={{ min: formData.spindles, step: formData.spindles }}
                value={formData.max_spindles}
                onChange={handleChange}
              /> */}
            </Grid2>
          </Grid2>

          <Tabs value={currentTab} sx={{width:'90vw'}} onChange={(e, newValue) => {
            setCurrentTab(newValue)
          }} variant='fullWidth'>
            {/* <Tab label="Sub Assembly" value={0} /> */}
            <Tab label="Main Assembly" value={1} />
            <Tab label="Section Assembly" value={2} />
          </Tabs>

          {/* Sub Assembly Tab */}
          {currentTab == 0 && <Box>
            {subAssemblyList && subAssemblyList.map((sa) => {
              return (
                <Grid2 container sx={{ mt: 2 }}>
                  <Grid2 size={3}>
                  <TextField
                      sx={{ ml: 1 }}
                      size='small'
                      variant="outlined"
                      fullWidth
                      required
                      label="Sub Assembly"
                      name="serial_no"
                      value={sa.name}
                    />
                  </Grid2>
                  <Grid2 size={3} sx={{ ml: 2 }}>
                    <TextField
                      sx={{ ml: 1 }}
                      size='small'
                      variant="outlined"
                      fullWidth
                      required
                      label="Qty"
                      name="serial_no"
                      value={sa.qty}
                    />
                  </Grid2>

                  <Grid2 size={3} sx={{ ml: 2 }}>
                    <MdOutlineEdit size={'25px'} style={{ marginLeft: '5px', cursor: 'pointer' }} onClick={() => {
                      setEditType('Edit')
                      setSelectedSubAssembly({id: sa.id, sub_assembly_id: sa.sub_assembly_id, name: sa.name, qty: sa.qty})
                      setSubAssemblyDialog(true)
                    }}
                    />
                    <MdDeleteOutline size={'25px'} style={{ marginLeft: '5px', cursor: 'pointer' }} onClick={() => {
                      setDeleteDialog({ dialog: true, type: 'Sub Assembly', name: sa.name, id: sa.id.toString() })
                    }}
                    />
                  </Grid2>
                </Grid2>
              )
            })}
            <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
              onClick={() => {
                setErrors({})
                setSubAssemblyDialog(true)
                setEditType('Add')
              }}>
              Add New Sub Assembly
            </Button>
          </Box>}

          {/* Main Assembly Tab */}
          {currentTab == 1 && <Box>
            {mainAssemblyList && mainAssemblyList.map((sa) => {
              return (
                <Card sx={{ padding: 3, mt: 1 }}>
                  <Grid2 container>
                    <Grid2 size={10}>
                      <Card sx={{ display: 'flex', flexDirection: 'row', padding: 1, backgroundColor: '#3A6D8C' }}>
                        <h6 style={{marginTop:'auto', marginBottom:'auto', color:'white'}}>Name: <b>{sa.name}</b></h6>
                        <h6 style={{ margin: 'auto', color: 'white' }}>Serial No: <b>{sa.serial_no}</b></h6>
                        {/* <MdOutlineEdit size={'25px'} style={{ cursor: 'pointer', marginLeft: 'auto', color: 'white' }} onClick={() => {
                          setMainAssemblyDialog(true)
                          setIsEdit(true)
                          setSelectedMainAssembly({ name: sa.name, serial_no: sa.serial_no, id: sa.id })
                          setSelectedMainAssemblySub(mainAssemblySub.filter((sub) => sub.main_assembly_id == sa.id))
                          setSelectedMainAssemblyParts(mainAssemblyParts.filter((sap) => sap.main_assembly_id == sa.id))
                          setSelectedMainAssemblyBoughtouts(mainAssemblyBoughtouts.filter((sab) => sab.main_assembly_id == sa.id))
                        }} />
                        <MdDeleteOutline size={'25px'} style={{ marginLeft: '5px', cursor: 'pointer', color: 'white' }} onClick={() => {
                          // setDeleteDialog({ dialog: true, type: 'Main Assembly', name: sa.name, id: sa.id })
                        }}
                        /> */}
                      </Card>
                    </Grid2>

                    <Grid2 size={10} sx={{mt: 1}}>
                      {mainAssemblyParts.filter((sap: any) => sap.main_assembly_id == sa.id)?.length > 0 &&
                        <CTable small striped>
                          <CTableHead color='primary'>
                            <CTableRow>
                              <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Part Name</CTableHeaderCell>
                              <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {mainAssemblyParts.filter((sap: any) => sap.main_assembly_id == sa.id)?.map((part) => {
                              return (<CTableRow>
                                <CTableDataCell style={{ fontWeight: 'initial', width: '80%' }}>{part.part_name}</CTableDataCell>
                                <CTableDataCell style={{ width: '20%' }}>{part.qty}</CTableDataCell>
                              </CTableRow>)
                            })}
                          </CTableBody>
                        </CTable>}
                    </Grid2>

                    <Grid2 size={10}>
                      {mainAssemblyBoughtouts.filter((sab: any) => sab.main_assembly_id == sa.id)?.length > 0 &&
                        <CTable small striped>
                          <CTableHead color='success'>
                            <CTableRow>
                              <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Boughtout Name</CTableHeaderCell>
                              <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {mainAssemblyBoughtouts.filter((sab: any) => sab.main_assembly_id == sa.id)?.map((boughtout) => {
                              return (<CTableRow>
                                <CTableDataCell style={{ fontWeight: 'initial', width: '80%' }}>{boughtout.bought_out_name}</CTableDataCell>
                                <CTableDataCell style={{ width: '20%' }}>{boughtout.qty}</CTableDataCell>
                              </CTableRow>)
                            })}
                          </CTableBody>
                        </CTable>}
                    </Grid2>

                    <Grid2 size={10}>
                      {mainAssemblySub.filter((sab: any) => sab.main_assembly_id == sa.id)?.length > 0 &&
                        <CTable small striped>
                          <CTableHead color='danger'>
                            <CTableRow>
                              <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Sub Assembly Name</CTableHeaderCell>
                              <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {mainAssemblySub.filter((sab: any) => sab.main_assembly_id == sa.id)?.map((sub) => {
                              return (<CTableRow>
                                <CTableDataCell style={{ fontWeight: 'initial', width: '80%' }}>{sub.sub_assembly_name}</CTableDataCell>
                                <CTableDataCell style={{ width: '20%' }}>{sub.qty}</CTableDataCell>
                              </CTableRow>)
                            })}
                          </CTableBody>
                        </CTable>}
                    </Grid2>

                    <Grid2 size={4} sx={{ ml: 3, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>

                    </Grid2>
                  </Grid2>
                </Card>)
            })}
            {/* <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
              onClick={() => {
                setErrors({})
                setMainAssemblyDialog(true)
                setSelectedMainAssembly({ name: "", serial_no: "", id: new Date().getTime() })
              }}>
              Add New Main Assembly
            </Button> */}
          </Box>}

          {/* Section Assembly Tab */}
          {currentTab == 2 && <Box>
            {sectionAssemblyList && sectionAssemblyList.map((sa) => {
              return (
                <Card sx={{ padding: 3, mt: 1 }}>
                  <Grid2 container>
                    <Grid2 size={10}>
                      <Card sx={{ display: 'flex', flexDirection: 'row', padding: 1, backgroundColor: '#664343' }}>
                        <h6 style={{ marginTop: 'auto', marginBottom: 'auto', color:'white' }}>Name: <b>{sa.name}</b></h6>
                        <h6 style={{ margin: 'auto', color:'white' }}>Serial No: <b>{sa.serial_no}</b></h6>
                        {/* <MdOutlineEdit size={'25px'} style={{ cursor: 'pointer', marginLeft: 'auto', color:'white' }} onClick={() => {
                          setSectionAssemblyDialog(true)
                          setIsEdit(true)
                          setSelectedSectionAssembly({ name: sa.name, serial_no: sa.serial_no, id: sa.id })
                          setSelectedSectionAssemblySub(sectionAssemblySub.filter((sub) => sub.section_assembly_id == sa.id))
                          setSelectedSectionAssemblyMain(sectionAssemblyMain.filter((main) => main.section_assembly_id == sa.id))
                          setSelectedSectionAssemblyParts(sectionAssemblyParts.filter((sap) => sap.section_assembly_id == sa.id))
                          setSelectedSectionAssemblyBoughtouts(sectionAssemblyBoughtouts.filter((sab) => sab.section_assembly_id == sa.id))
                        }} />
                        <MdDeleteOutline size={'25px'} style={{ marginLeft: '5px', cursor: 'pointer', color:'white' }} onClick={() => {
                          setDeleteDialog({ dialog: true, type: 'Section Assembly', name: sa.name, id: sa.id.toString() })
                        }}
                        /> */}
                      </Card>
                    </Grid2>

                    <Grid2 size={10} sx={{ mt: 1 }}>
                      {sectionAssemblyParts.filter((sap: any) => sap.section_assembly_id == sa.id)?.length > 0 &&
                        <CTable small striped>
                          <CTableHead color='primary'>
                            <CTableRow>
                              <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Part Name</CTableHeaderCell>
                              <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {sectionAssemblyParts.filter((sap: any) => sap.section_assembly_id == sa.id)?.map((part) => {
                              return (<CTableRow>
                                <CTableDataCell style={{ fontWeight: 'initial', width: '80%' }}>{part.part_name}</CTableDataCell>
                                <CTableDataCell style={{ width: '20%' }}>{part.qty}</CTableDataCell>
                              </CTableRow>)
                            })}
                          </CTableBody>
                        </CTable>}
                    </Grid2>

                    <Grid2 size={10}>
                      {sectionAssemblyBoughtouts.filter((sab: any) => sab.section_assembly_id == sa.id)?.length > 0 &&
                        <CTable small striped>
                          <CTableHead color='success'>
                            <CTableRow>
                              <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Boughtout Name</CTableHeaderCell>
                              <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {sectionAssemblyBoughtouts.filter((sab: any) => sab.section_assembly_id == sa.id)?.map((boughtout) => {
                              return (<CTableRow>
                                <CTableDataCell style={{ fontWeight: 'initial', width: '80%' }}>{boughtout.bought_out_name}</CTableDataCell>
                                <CTableDataCell style={{ width: '20%' }}>{boughtout.qty}</CTableDataCell>
                              </CTableRow>)
                            })}
                          </CTableBody>
                        </CTable>}
                    </Grid2>

                    <Grid2 size={10}>
                      {sectionAssemblySub.filter((sab: any) => sab.section_assembly_id == sa.id)?.length > 0 &&
                        <CTable small striped>
                          <CTableHead color='danger'>
                            <CTableRow>
                              <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Sub Assembly Name</CTableHeaderCell>
                              <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {sectionAssemblySub.filter((sab: any) => sab.section_assembly_id == sa.id)?.map((sub) => {
                              return (<CTableRow>
                                <CTableDataCell style={{ fontWeight: 'initial', width: '80%' }}>{sub.sub_assembly_name}</CTableDataCell>
                                <CTableDataCell style={{ width: '20%' }}>{sub.qty}</CTableDataCell>
                              </CTableRow>)
                            })}
                          </CTableBody>
                        </CTable>}
                    </Grid2>

                    <Grid2 size={10}>
                      {sectionAssemblyMain.filter((sab: any) => sab.section_assembly_id == sa.id)?.length > 0 &&
                        <CTable small striped>
                          <CTableHead color='warning'>
                            <CTableRow>
                              <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Main Assembly Name</CTableHeaderCell>
                              <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {sectionAssemblyMain.filter((sab: any) => sab.section_assembly_id == sa.id)?.map((main) => {
                              return (<CTableRow>
                                <CTableDataCell style={{ fontWeight: 'initial', width: '80%' }}>{main.main_assembly_name}</CTableDataCell>
                                <CTableDataCell style={{ width: '20%' }}>{main.qty}</CTableDataCell>
                              </CTableRow>)
                            })}
                          </CTableBody>
                        </CTable>}
                    </Grid2>
                  </Grid2>
                </Card>)
            })}
            {/* <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
              onClick={() => {
                setErrors({})
                setSectionAssemblyDialog(true)
                setSelectedSectionAssembly({ name: "", serial_no: "", id: new Date().getTime() })
              }}>
              Add New Section Assembly
            </Button> */}
          </Box>}

          {/* <Grid2 container justifyContent={'flex-end'}>
            <Grid2 size={2}>
              <Button variant='outlined' color="primary" fullWidth onClick={(e: any) => {
                navigate(-1)
              }}>
                Cancel
              </Button>
            </Grid2>
            <Grid2 size={2}>
              <Button variant="contained" color="secondary" fullWidth sx={{ ml: 2 }} onClick={(e: any) => {
                handleSubmit(e)
              }}>
                Submit
              </Button>
            </Grid2>
          </Grid2> */}
          
        </form>
      </Box>

      {/* Sub Assembly Dialog */}
      <Dialog
        fullWidth
        maxWidth={'md'}
        open={subAssemblyDialog}>
        <DialogTitle>Add Sub Assembly</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{mt:1}}>
                      <InputLabel id="role-select-label">Sub Assembly</InputLabel>
                      <Select
                        size={'small'}
                        labelId="role-select-label"
                        id="role-select"
                        label="Sub Assembly"
                        value={selectedSubAssembly.sub_assembly_id}
                        error={!!errors?.name}
                        onChange={(e: any) => {
                          setSelectedSubAssembly({...selectedSubAssembly, sub_assembly_id: e.target.value, name: machineSubAssemblies.find((sab) => sab.sub_assembly_id == e.target.value).sub_assembly_name, })
                          // setSubAssemblyList(
                          //   subAssemblyList.map((sub) => {
                          //     return (sub.id == selectedSubAssembly.id) ? {
                          //       id: e.target.value,
                          //       sub_assembly_id: e.target.value,
                          //       name: machineSubAssemblies.find((sab) => sab.sub_assembly_id == e.target.value).sub_assembly_name,
                          //       qty: sub.qty
                          //     } : sub
                          //   })
                          // )
                        }}
                      >
                        {machineSubAssemblies.map((sub) => {
                          return sub.sub_assembly_id == selectedSubAssembly.sub_assembly_id ? <MenuItem value={sub.sub_assembly_id}>{sub.sub_assembly_name}</MenuItem> :
                            subAssemblyList.filter((subs) => subs.sub_assembly_id == sub.sub_assembly_id).length == 0 &&
                            <MenuItem value={sub.sub_assembly_id}>{sub.sub_assembly_name}</MenuItem>
                        })}
                      </Select>
                    </FormControl>

                    <TextField
                      sx={{ mt: 2 }}
                      size='small'
                      variant="outlined"
                      fullWidth
                      required
                      label="Qty"
                      name="serial_no"
                      error={!!errors?.qty}
                      helperText={errors?.qty}
                      value={selectedSubAssembly.qty}
                      onChange={(e: any) => {
                        setSelectedSubAssembly({...selectedSubAssembly, qty: e.target.value })
                      }}
                    />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSubAssemblyDialog(false)
            setSelectedSubAssembly({ id: '', sub_assembly_id: '', name: '', qty: 0 })
            setErrors({})
          }} sx={{ color: '#bb0037' }}>Cancel</Button>
          <Button variant="contained" startIcon={<Save />} size="small" color='secondary'
            onClick={() => {
              handleAddSubAssembly()
            }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main Assembly Dialog */}

      <Dialog
        fullWidth
        maxWidth={'xl'}
        open={mainAssemblyDialog}>
        <DialogTitle>Add Main Assembly</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'row', mt: 1 }}>
            <TextField
              size='small'
              variant="outlined"
              fullWidth
              required
              label="Main Assembly Name"
              name="main_assembly_name"
              value={selectedMainAssembly?.name}
              error={!!errors?.name}
              helperText={errors?.name}
              onChange={(e: any) => {
                setSelectedMainAssembly({ ...selectedMainAssembly, name: e.target.value })
              }}
            />
            <TextField
              sx={{ ml: 1 }}
              size='small'
              variant="outlined"
              fullWidth
              required
              helperText={errors?.serial_no}
              error={!!errors?.serial_no}
              label="Serial No"
              name="serial_no"
              value={selectedMainAssembly?.serial_no}
              onChange={(e: any) => {
                setSelectedMainAssembly({ ...selectedMainAssembly, serial_no: e.target.value })
              }}
            />
          </Box>
          <Grid2 container>

            <Grid2 size={4}>
              <Card sx={{ padding: 2, mt: 1 }}>
                {mainAssemblyParts.map((sap, index) => {
                  return sap.main_assembly_id == selectedMainAssembly.id &&
                    (<Box sx={{ display: 'flex', flexDirection: 'row', mt: index == 0 ? 0 : 1 }}>
                      <FormControl fullWidth>
                        <InputLabel id="role-select-label">Part</InputLabel>
                        <Select
                          size={'small'}
                          labelId="role-select-label"
                          id="role-select"
                          label="Vendor"
                          value={sap.part_id}
                          onChange={(e: any) => {
                            setMainAssemblyParts(
                              mainAssemblyParts.map((sub) => {
                                return (sub.id == sap.id) ? {
                                  id: sub.id,
                                  main_assembly_id: selectedMainAssembly.id,
                                  part_id: e.target.value,
                                  part_name: parts.list.find((p) => p.id == e.target.value).part_name,
                                  qty: sub.qty
                                } : sub
                              })
                            )
                          }}
                        >
                          {parts.list.map((part) => {
                          return part.id == sap.part_id ? <MenuItem value={part.id}>{part.part_name}</MenuItem> :
                          mainAssemblyParts.filter((maps) => maps.part_id == part.id).length == 0 &&
                            <MenuItem value={part.id}>{part.part_name}</MenuItem>
                        })}
                        </Select>
                      </FormControl>
                      <TextField
                        sx={{ ml: 1 }}
                        size='small'
                        variant="outlined"
                        fullWidth
                        required
                        label="Qty"
                        name="serial_no"
                        value={sap.qty}
                        onChange={(e: any) => {
                          setMainAssemblyParts(
                            mainAssemblyParts.map((sub) => {
                              return (sub.id == sap.id) ? {
                                id: sub.id,
                                main_assembly_id: selectedMainAssembly.id,
                                part_id: sub.part_id,
                                part_name: sub.part_name,
                                qty: e.target.value
                              } : sub
                            })
                          )
                        }}
                      />
                      <IoMdCloseCircle style={{ color: 'red', marginLeft: '5px', verticalAlign: 'center', cursor: 'pointer' }} size={'40px'} onClick={() => {
                        setMainAssemblyParts(mainAssemblyParts.filter((map) => map.id != sap.id))
                      }} />
                    </Box>)
                })}
                <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                  onClick={() => {
                    setMainAssemblyParts([...mainAssemblyParts, { id: new Date().getTime(), main_assembly_id: selectedMainAssembly.id, part_id: "", part_name: "", qty: 0 }])
                  }}>
                  Add New Part
                </Button>
              </Card>
            </Grid2>

            <Grid2 size={4}>
              <Card sx={{ padding: 2, mt: 1, ml: 1 }}>
                {mainAssemblyBoughtouts.map((sab, index) => {
                  return sab.main_assembly_id == selectedMainAssembly.id &&
                    (<Box sx={{ display: 'flex', flexDirection: 'row', mt: index == 0 ? 0 : 1 }}>
                      <FormControl fullWidth>
                        <InputLabel id="role-select-label">Boughtout</InputLabel>
                        <Select
                          size={'small'}
                          labelId="role-select-label"
                          id="role-select"
                          label="Boughtout"
                          value={sab.bought_out_id}
                          onChange={(e: any) => {
                            setMainAssemblyBoughtouts(
                              mainAssemblyBoughtouts.map((sub) => {
                                return (sub.id == sab.id) ? {
                                  id: sub.id,
                                  main_assembly_id: selectedMainAssembly.id,
                                  bought_out_id: e.target.value,
                                  bought_out_name: boughtOuts.find((b) => b.id == e.target.value).bought_out_name,
                                  qty: sub.qty
                                } : sub
                              })
                            )
                          }}
                        >
                          {boughtOuts.map((bo) => {
                          return bo.id == sab.bought_out_id ? <MenuItem value={bo.id}>{bo.bought_out_name}</MenuItem> :
                          mainAssemblyBoughtouts.filter((mabs) => mabs.bought_out_id == bo.id).length == 0 &&
                            <MenuItem value={bo.id}>{bo.bought_out_name}</MenuItem>
                        })}
                        </Select>
                      </FormControl>

                      <TextField
                        sx={{ ml: 1 }}
                        size='small'
                        variant="outlined"
                        fullWidth
                        required
                        label="Qty"
                        name="serial_no"
                        value={sab.qty}
                        onChange={(e: any) => {
                          setMainAssemblyBoughtouts(
                            mainAssemblyBoughtouts.map((sub) => {
                              return (sub.id == sab.id) ? {
                                id: sub.id,
                                main_assembly_id: selectedMainAssembly.id,
                                bought_out_id: sub.bought_out_id,
                                bought_out_name: sub.bought_out_name,
                                qty: e.target.value
                              } : sub
                            })
                          )
                        }}
                      />
                      <IoMdCloseCircle style={{ color: 'red', marginLeft: '5px', verticalAlign: 'center', cursor: 'pointer' }} size={'40px'} onClick={() => {
                        setMainAssemblyBoughtouts(mainAssemblyBoughtouts.filter((sap) => sap.id != sab.id))
                      }} />
                    </Box>)
                })}
                <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                  onClick={() => {
                    setMainAssemblyBoughtouts([...mainAssemblyBoughtouts, { id: new Date().getTime(), main_assembly_id: selectedMainAssembly.id, bought_out_id: "", bought_out_name: "", qty: 0 }])
                  }}>
                  Add New Boughtout
                </Button>
              </Card>
            </Grid2>

            <Grid2 size={4}>
              <Card sx={{ padding: 2, mt: 1, ml: 1 }}>
                {mainAssemblySub.map((sab, index) => {
                  return sab.main_assembly_id == selectedMainAssembly.id &&
                    (<Box sx={{ display: 'flex', flexDirection: 'row', mt: index == 0 ? 0 : 1 }}>
                      <FormControl fullWidth>
                        <InputLabel id="role-select-label">Sub Assembly</InputLabel>
                        <Select
                          size={'small'}
                          labelId="role-select-label"
                          id="role-select"
                          label="Sub Assembly"
                          value={sab.sub_assembly_id}
                          onChange={(e: any) => {
                            setMainAssemblySub(
                              mainAssemblySub.map((sub) => {
                                return (sub.id == sab.id) ? {
                                  id: sub.id,
                                  main_assembly_id: selectedMainAssembly.id,
                                  sub_assembly_id: e.target.value,
                                  sub_assembly_name: machineSubAssemblies.find((b) => b.sub_assembly_id == e.target.value)?.sub_assembly_name || "",
                                  qty: sub.qty
                                } : sub
                              })
                            )
                          }}
                        >
                           {machineSubAssemblies.map((sabs) => {
                          return sabs.sub_assembly_id == sab.sub_assembly_id ? <MenuItem value={sabs.sub_assembly_id}>{sabs.sub_assembly_name}</MenuItem> :
                          mainAssemblySub.filter((mas) => mas.sub_assembly_id == sabs.sub_assembly_id).length == 0 &&
                            <MenuItem value={sabs.sub_assembly_id}>{sabs.sub_assembly_name}</MenuItem>
                        })}
                        </Select>
                      </FormControl>

                      <TextField
                        sx={{ ml: 1 }}
                        size='small'
                        variant="outlined"
                        fullWidth
                        required
                        label="Qty"
                        name="serial_no"
                        value={sab.qty}
                        onChange={(e: any) => {
                          setMainAssemblySub(
                            mainAssemblySub.map((sub) => {
                              return (sub.id == sab.id) ? {
                                id: sub.id,
                                main_assembly_id: selectedMainAssembly.id,
                                sub_assembly_id: sub.sub_assembly_id,
                                sub_assembly_name: sub.sub_assembly_name,
                                qty: e.target.value
                              } : sub
                            })
                          )
                        }}
                      />
                      <IoMdCloseCircle style={{ color: 'red', marginLeft: '5px', verticalAlign: 'center', cursor: 'pointer' }} size={'40px'} onClick={() => {
                        setMainAssemblySub(mainAssemblySub.filter((mas) => mas.id != sab.id))
                      }} />
                    </Box>)
                })}
                <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                  onClick={() => {
                    setMainAssemblySub([...mainAssemblySub, { id: new Date().getTime(), main_assembly_id: selectedMainAssembly.id, sub_assembly_id: 0, sub_assembly_name: "", qty: 0 }])
                  }}>
                  Add Sub Assembly
                </Button>
              </Card>
            </Grid2>

            <Grid2 size={4}>
              <Card sx={{ padding: 2, mt: 1 }}>
                <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                  onClick={() => {

                  }}>
                  Add Document
                </Button>
              </Card>
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setMainAssemblyDialog(false)
            setMainAssemblyParts(mainAssemblyParts.filter((sap) => sap.main_assembly_id != selectedMainAssembly.id))
            setMainAssemblyBoughtouts(mainAssemblyBoughtouts.filter((sab) => sab.main_assembly_id != selectedMainAssembly.id))
            setMainAssemblySub(mainAssemblySub.filter((sab) => sab.main_assembly_id != selectedMainAssembly.id))
            if (isEdit) {
              setMainAssemblyParts(selectedMainAssemblyParts.map((sap) => { return sap }))
              setMainAssemblyBoughtouts(selectedMainAssemblyBoughtouts.map((sab) => { return sab }))
              setMainAssemblySub(selectedMainAssemblySub.map((sab) => { return sab }))
            }
          }} sx={{ color: '#bb0037' }}>Cancel</Button>
          <Button variant="contained" startIcon={<Save />} size="small" color='secondary'
            onClick={() => {
              handleMainAssemblyClick()
            }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Section Assembly Dialog */}

      <Dialog
        fullWidth
        maxWidth={'xl'}
        open={sectionAssemblyDialog}>
        <DialogTitle>Add Section Assembly</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'row', mt: 1 }}>
            <TextField
              size='small'
              variant="outlined"
              fullWidth
              required
              label="Section Assembly Name"
              name="section_assembly_name"
              error={!!errors?.name}
              helperText={errors?.name}
              value={selectedSectionAssembly?.name}
              onChange={(e: any) => {
                setSelectedSectionAssembly({ ...selectedSectionAssembly, name: e.target.value })
              }}
            />
            <TextField
              sx={{ ml: 1 }}
              size='small'
              variant="outlined"
              fullWidth
              required
              label="Serial No"
              name="serial_no"
              error={!!errors?.serial_no}
              helperText={errors?.serial_no}
              value={selectedSectionAssembly?.serial_no}
              onChange={(e: any) => {
                setSelectedSectionAssembly({ ...selectedSectionAssembly, serial_no: e.target.value })
              }}
            />
          </Box>

          <Grid2 container>

            <Grid2 size={4}>
              <Card sx={{ padding: 2, mt: 1 }}>
                {sectionAssemblyParts.map((sap, index) => {
                  return sap.section_assembly_id == selectedSectionAssembly.id &&
                    (<Box sx={{ display: 'flex', flexDirection: 'row', mt: index == 0 ? 0 : 1 }}>
                      <FormControl fullWidth>
                        <InputLabel id="role-select-label">Part</InputLabel>
                        <Select
                          size={'small'}
                          labelId="role-select-label"
                          id="role-select"
                          label="Vendor"
                          value={sap.part_id}
                          onChange={(e: any) => {
                            setSectionAssemblyParts(
                              sectionAssemblyParts.map((sub) => {
                                return (sub.id == sap.id) ? {
                                  id: sub.id,
                                  section_assembly_id: selectedSectionAssembly.id,
                                  part_id: e.target.value,
                                  part_name: parts.list.find((p) => p.id == e.target.value).part_name,
                                  qty: sub.qty
                                } : sub
                              })
                            )
                          }}
                        >
                          {parts.list.map((part) => {
                          return part.id == sap.part_id ? <MenuItem value={part.id}>{part.part_name}</MenuItem> :
                          sectionAssemblyParts.filter((saps) => saps.part_id == part.id).length == 0 &&
                            <MenuItem value={part.id}>{part.part_name}</MenuItem>
                        })}

                        </Select>
                      </FormControl>
                      <TextField
                        sx={{ ml: 1 }}
                        size='small'
                        variant="outlined"
                        fullWidth
                        required
                        label="Qty"
                        name="serial_no"
                        value={sap.qty}
                        onChange={(e: any) => {
                          setSectionAssemblyParts(
                            sectionAssemblyParts.map((sub) => {
                              return (sub.id == sap.id) ? {
                                id: sub.id,
                                section_assembly_id: selectedSectionAssembly.id,
                                part_id: sub.part_id,
                                part_name: sub.part_name,
                                qty: e.target.value
                              } : sub
                            })
                          )
                        }}
                      />
                      <IoMdCloseCircle style={{ color: 'red', marginLeft: '5px', verticalAlign: 'center', cursor: 'pointer' }} size={'40px'} onClick={() => {
                        setSectionAssemblyParts(sectionAssemblyParts.filter((map) => map.id != sap.id))
                      }} />
                    </Box>)
                })}
                <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                  onClick={() => {
                    setSectionAssemblyParts([...sectionAssemblyParts, { id: new Date().getTime(), section_assembly_id: selectedSectionAssembly.id, part_id: "", part_name: "", qty: 0 }])
                  }}>
                  Add New Part
                </Button>
              </Card>
            </Grid2>

            <Grid2 size={4}>
              <Card sx={{ padding: 2, mt: 1, ml: 1 }}>
                {sectionAssemblyBoughtouts.map((sab, index) => {
                  return sab.section_assembly_id == selectedSectionAssembly.id &&
                    (<Box sx={{ display: 'flex', flexDirection: 'row', mt: index == 0 ? 0 : 1 }}>
                      <FormControl fullWidth>
                        <InputLabel id="role-select-label">Boughtout</InputLabel>
                        <Select
                          size={'small'}
                          labelId="role-select-label"
                          id="role-select"
                          label="Boughtout"
                          value={sab.bought_out_id}
                          onChange={(e: any) => {
                            setSectionAssemblyBoughtouts(
                              sectionAssemblyBoughtouts.map((sub) => {
                                return (sub.id == sab.id) ? {
                                  id: sub.id,
                                  section_assembly_id: selectedSectionAssembly.id,
                                  bought_out_id: e.target.value,
                                  bought_out_name: boughtOuts.find((b) => b.id == e.target.value).bought_out_name,
                                  qty: sub.qty
                                } : sub
                              })
                            )
                          }}
                        >
                          {boughtOuts.map((bo) => {
                          return bo.id == sab.bought_out_id ? <MenuItem value={bo.id}>{bo.bought_out_name}</MenuItem> :
                          sectionAssemblyBoughtouts.filter((sabs) => sabs.bought_out_id == bo.id).length == 0 &&
                            <MenuItem value={bo.id}>{bo.bought_out_name}</MenuItem>
                        })}
                        </Select>
                      </FormControl>

                      <TextField
                        sx={{ ml: 1 }}
                        size='small'
                        variant="outlined"
                        fullWidth
                        required
                        label="Qty"
                        name="serial_no"
                        value={sab.qty}
                        onChange={(e: any) => {
                          setSectionAssemblyBoughtouts(
                            sectionAssemblyBoughtouts.map((sub) => {
                              return (sub.id == sab.id) ? {
                                id: sub.id,
                                section_assembly_id: selectedSectionAssembly.id,
                                bought_out_id: sub.bought_out_id,
                                bought_out_name: sub.bought_out_name,
                                qty: e.target.value
                              } : sub
                            })
                          )
                        }}
                      />
                      <IoMdCloseCircle style={{ color: 'red', marginLeft: '5px', verticalAlign: 'center', cursor: 'pointer' }} size={'40px'} onClick={() => {
                        setSectionAssemblyBoughtouts(sectionAssemblyBoughtouts.filter((map) => map.id != sab.id))
                      }} />
                    </Box>)
                })}
                <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                  onClick={() => {
                    setSectionAssemblyBoughtouts([...sectionAssemblyBoughtouts, { id: new Date().getTime(), section_assembly_id: selectedSectionAssembly.id, bought_out_id: "", bought_out_name: "", qty: 0 }])
                  }}>
                  Add New Boughtout
                </Button>
              </Card>
            </Grid2>

            <Grid2 size={4}>
              <Card sx={{ padding: 2, mt: 1, ml: 1 }}>
                {sectionAssemblySub.map((sab, index) => {
                  return sab.section_assembly_id == selectedSectionAssembly.id &&
                    (<Box sx={{ display: 'flex', flexDirection: 'row', mt: index == 0 ? 0 : 1 }}>
                      <FormControl fullWidth>
                        <InputLabel id="role-select-label">Sub Assembly</InputLabel>
                        <Select
                          size={'small'}
                          labelId="role-select-label"
                          id="role-select"
                          label="Sub Assembly"
                          value={sab.sub_assembly_id}
                          onChange={(e: any) => {
                            setSectionAssemblySub(
                              sectionAssemblySub.map((sub) => {
                                return (sub.id == sab.id) ? {
                                  id: sub.id,
                                  section_assembly_id: selectedSectionAssembly.id,
                                  sub_assembly_id: e.target.value,
                                  sub_assembly_name: machineSubAssemblies.find((b) => b.sub_assembly_id == e.target.value)?.sub_assembly_name || "",
                                  qty: sub.qty
                                } : sub
                              })
                            )
                          }}
                        >
                          {machineSubAssemblies.map((sabs) => {
                          return sabs.sub_assembly_id == sab.sub_assembly_id ? <MenuItem value={sabs.sub_assembly_id}>{sabs.sub_assembly_name}</MenuItem> :
                          sectionAssemblySub.filter((sas) => sas.sub_assembly_id == sabs.sub_assembly_id).length == 0 &&
                            <MenuItem value={sabs.sub_assembly_id}>{sabs.sub_assembly_name}</MenuItem>
                        })}
                        </Select>
                      </FormControl>

                      <TextField
                        sx={{ ml: 1 }}
                        size='small'
                        variant="outlined"
                        fullWidth
                        required
                        label="Qty"
                        name="serial_no"
                        value={sab.qty}
                        onChange={(e: any) => {
                          setSectionAssemblySub(
                            sectionAssemblySub.map((sub) => {
                              return (sub.id == sab.id) ? {
                                id: sub.id,
                                section_assembly_id: selectedSectionAssembly.id,
                                sub_assembly_id: sub.sub_assembly_id,
                                sub_assembly_name: sub.sub_assembly_name,
                                qty: e.target.value
                              } : sub
                            })
                          )
                        }}
                      />
                      <IoMdCloseCircle style={{ color: 'red', marginLeft: '5px', verticalAlign: 'center', cursor: 'pointer' }} size={'40px'} onClick={() => {
                        setSectionAssemblySub(sectionAssemblySub.filter((map) => map.id != sab.id))
                      }} />
                    </Box>)
                })}
                <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                  onClick={() => {
                    setSectionAssemblySub([...sectionAssemblySub, { id: new Date().getTime(), section_assembly_id: selectedSectionAssembly.id, sub_assembly_id: 0, sub_assembly_name: "", qty: 0 }])
                  }}>
                  Add Sub Assembly
                </Button>
              </Card>
            </Grid2>

            <Grid2 size={4}>
              <Card sx={{ padding: 2, mt: 1 }}>
                {sectionAssemblyMain.map((sab, index) => {
                  return sab.section_assembly_id == selectedSectionAssembly.id &&
                    (<Box sx={{ display: 'flex', flexDirection: 'row', mt: index == 0 ? 0 : 1 }}>
                      <FormControl fullWidth>
                        <InputLabel id="role-select-label">Main Assembly</InputLabel>
                        <Select
                          size={'small'}
                          labelId="role-select-label"
                          id="role-select"
                          label="Main Assembly"
                          value={sab.main_assembly_id}
                          onChange={(e: any) => {
                            setSectionAssemblyMain(
                              sectionAssemblyMain.map((main) => {
                                return (main.id == sab.id) ? {
                                  id: main.id,
                                  section_assembly_id: selectedSectionAssembly.id,
                                  main_assembly_id: e.target.value,
                                  main_assembly_name: mainAssemblyList.find((b) => b.id == e.target.value)?.name || "",
                                  qty: main.qty
                                } : main
                              })
                            )
                          }}
                        >
                          {mainAssemblyList.map((mal) => {
                          return mal.id == sab.main_assembly_id ? <MenuItem value={mal.id}>{mal.name}</MenuItem> :
                          sectionAssemblyMain.filter((sam) => sam.main_assembly_id == mal.id).length == 0 &&
                            <MenuItem value={mal.id}>{mal.name}</MenuItem>
                        })}

                          {mainAssemblyList.map((main) => {
                            return <MenuItem value={main.id}>{main.name}</MenuItem>
                          })}
                        </Select>
                      </FormControl>

                      <TextField
                        sx={{ ml: 1 }}
                        size='small'
                        variant="outlined"
                        fullWidth
                        required
                        label="Qty"
                        name="serial_no"
                        value={sab.qty}
                        onChange={(e: any) => {
                          setSectionAssemblyMain(
                            sectionAssemblyMain.map((main) => {
                              return (main.id == sab.id) ? {
                                id: main.id,
                                section_assembly_id: selectedSectionAssembly.id,
                                main_assembly_id: main.main_assembly_id,
                                main_assembly_name: main.main_assembly_name,
                                qty: e.target.value
                              } : main
                            })
                          )
                        }}
                      />
                      <IoMdCloseCircle style={{ color: 'red', marginLeft: '5px', verticalAlign: 'center', cursor: 'pointer' }} size={'40px'} onClick={() => {
                        setSectionAssemblyMain(sectionAssemblyMain.filter((map) => map.id != sab.id))
                      }} />
                    </Box>)
                })}
                <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                  onClick={() => {
                    setSectionAssemblyMain([...sectionAssemblyMain, { id: new Date().getTime(), section_assembly_id: selectedSectionAssembly.id, main_assembly_id: 0, main_assembly_name: "", qty: 0 }])
                  }}>
                  Add Main Assembly
                </Button>
              </Card>
            </Grid2>

            <Grid2 size={3}>
              <Card sx={{ padding: 2, mt: 1, ml: 1 }}>
                <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                  onClick={() => {

                  }}>
                  Add Document
                </Button>
              </Card>
            </Grid2>
          </Grid2>

        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSectionAssemblyDialog(false)
            setSectionAssemblyParts(sectionAssemblyParts.filter((sap) => sap.section_assembly_id != selectedSectionAssembly.id))
            setSectionAssemblyBoughtouts(sectionAssemblyBoughtouts.filter((sab) => sab.section_assembly_id != selectedSectionAssembly.id))
            setSectionAssemblySub(sectionAssemblySub.filter((sub) => sub.section_assembly_id != selectedSectionAssembly.id))
            setSectionAssemblyMain(sectionAssemblyMain.filter((main) => main.section_assembly_id != selectedSectionAssembly.id))
            if (isEdit) {
              setSectionAssemblyParts(selectedSectionAssemblyParts.map((sap) => { return sap }))
              setSectionAssemblyBoughtouts(selectedSectionAssemblyBoughtouts.map((sab) => { return sab }))
              setSectionAssemblySub(selectedSectionAssemblySub.map((sub) => { return sub }))
              setSectionAssemblyMain(selectedSectionAssemblyMain.map((main) => { return main }))
            }
          }} sx={{ color: '#bb0037' }}>Cancel</Button>
          <Button variant="contained" startIcon={<Save />} size="small" color='secondary'
            onClick={() => {
              handleSectionAssemblyClick()
            }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        maxWidth={'sm'}
        open={deleteDialog.dialog}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <h6>Are you sure, you want to delete {deleteDialog.type} - {deleteDialog.name}?</h6>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteDialog({
              dialog: false, type: '', name: '', id: ''
            })
          }} sx={{ color: '#bb0037' }}>No</Button>
          <Button variant="contained" startIcon={<MdDeleteOutline />} size="small" color='secondary'
            onClick={() => {
              if (deleteDialog.type.includes("Sub Assembly")) {
                setEditType('Delete')
                handleAddSubAssembly(deleteDialog.id)
                setDeleteDialog({
                  dialog: false, type: '', name: '', id: ''
                })
              } else if (deleteDialog.type == "Section Assembly") {
                setSectionAssemblyParts(sectionAssemblyParts.filter((sap) => sap.section_assembly_id.toString() != deleteDialog.id))
                setSectionAssemblyBoughtouts(sectionAssemblyBoughtouts.filter((sab) => sab.section_assembly_id.toString() != deleteDialog.id))
                setSectionAssemblySub(sectionAssemblySub.filter((sal) => sal.section_assembly_id.toString() != deleteDialog.id))
                setSectionAssemblyList(sectionAssemblyList.filter((sal) => sal.id.toString() != deleteDialog.id))
                setDeleteDialog({
                  dialog: false, type: '', name: '', id: ''
                })
              }
            }}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
