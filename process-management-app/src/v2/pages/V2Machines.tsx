import { useState } from 'react';
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid2, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { useEffect } from 'react';
import { Add, Search } from '@mui/icons-material';
import { createAttachment, createNewMachine, deleteMachine, fetchMachineAttachmentLinks, fetchMachineList } from '../../slices/machineSlice';
import RefreshButton from '../../components/RefreshButton';
import { useLocation, useNavigate } from 'react-router-dom';
import DisplaySnackbar from '../../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';
import V2PageShell from '../components/V2PageShell';
import V2Drawer, { V2FormSection } from '../components/V2Drawer';
import { v2Colors, v2Fonts } from '../theme';

// Functional port of pages/Machines.tsx. Restyled to the ui-design-concept.html
// .machine-card grid instead of a table, and the create/edit form moved into a
// right-side V2Drawer instead of a centered Dialog.
export default function V2Machines() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { state } = useLocation()
  const { enqueueSnackbar } = useSnackbar()

  const { machines, machineStatus } = useAppSelector(
    (state) => state.machine
  );

  const [searchText, setSearchText] = useState("")
  const [errors, setErrors] = useState<any>();
  const [createDialog, setCreateDialog] = useState(false)
  const [machineId, setMachineId] = useState("")
  const [deleteDialog, setDeleteDialog] = useState({ dialog: false, id: '', name: '' })
  const [formData, setFormData] = useState({
    model_no: '',
    machine_name: '',
    spindles: 0,
    side_type: '',
    max_spindles: 0,
    min_spindles: 0
  });

  const [images, setImages] = useState<any>([]);
  const [urls, setUrls] = useState([""]);

  useEffect(() => {
    dispatch(fetchMachineList()).unwrap()
  }, [])

  useEffect(() => {
    if (state?.openCreate) {
      setErrors({})
      setCreateDialog(true)
      navigate('.', { replace: true, state: null })
    }
  }, [state])

  const handleSearch = () => {
    dispatch(fetchMachineList(searchText)).unwrap()
  }

  const handleRefresh = () => {
    dispatch(fetchMachineList(searchText)).unwrap()
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG and PNG images are allowed");
      return;
    }

    if (images.length >= 3) return;

    const preview = URL.createObjectURL(file);
    const name = file.name;

    setImages((prev: any) => [...prev, { type: 'new', file, preview, name }]);
  };

  const handleRemoveImage = (index: any) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const handleUrlChange = (index: any, value: any) => {
    const updated = [...urls];
    updated[index] = value;
    setUrls(updated);
  };

  const addUrlField = () => {
    if (urls.length < 3) {
      setUrls([...urls, ""]);
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.model_no) newErrors.model_no = 'Model no is required';
    if (!formData.machine_name) newErrors.machine_name = 'Machine name is required';
    if (!formData.side_type) newErrors.side_type = 'Side type is required';
    if (!formData.spindles || formData.spindles == 0) newErrors.spindles = 'Spindles is required';

    return newErrors;
  };

  const clearValues = () => {
    setFormData({
      model_no: '',
      machine_name: '',
      spindles: 0,
      side_type: '',
      max_spindles: 0,
      min_spindles: 0
    })
    setErrors({})
  }

  const handleNewMachineSubmit = () => {
    const validated = validate()
    if (Object.keys(validated).length == 0) {
      dispatch(createNewMachine({
        type: machineId.length == 0 ? 'Add' : 'Edit',
        id: machineId,
        model_no: formData.model_no,
        machine_name: formData.machine_name,
        side_type: formData.side_type,
        spindles: formData.spindles,
        min_spindles: formData.min_spindles,
        max_spindles: formData.max_spindles,
        video_urls: urls
      })).unwrap().then((res) => {
        DisplaySnackbar(res, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
        if (images?.filter((img: any) => img.type == 'new')?.length > 0) {
          uploadAttachments(res.id)
        }
        if (res.message.includes('success')) {
          setCreateDialog(false)
          clearValues()
          dispatch(fetchMachineList())
        }
      }).catch((err) => {
        DisplaySnackbar(err.message, 'error', enqueueSnackbar)
      })
    } else {
      setErrors(validated)
    }
  }

  const uploadAttachments = (id: string) => {
    const machineImages = images.filter((img: any) => img.type == 'new')?.map((img: any) => img.file);
    dispatch(createAttachment({
      files: machineImages, type: 'machine',
      type_id: id
    })).unwrap()
      .then((res: any) => {
        DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
        navigate(-1)
      })
      .catch((err: any) => {
        DisplaySnackbar(err.message, 'error', enqueueSnackbar)
        navigate(-1)
      })
  }

  const openEdit = (row: any) => {
    setCreateDialog(true)
    setMachineId(row.id)
    dispatch(fetchMachineAttachmentLinks(row.id)).unwrap().then((res: any) => {
      const videoLinks = res?.links?.filter((link: string) => link.includes("youtube.com") || link.includes("youtu.be"));
      setUrls(videoLinks);
      const imageUrls: any = [];
      res?.links?.filter((link: string) => !link.includes("youtube.com") && !link.includes("youtu.be"))?.map((link: any) => {
        imageUrls.push({
          type: 'existing',
          url: link
        })
      });
      setImages(imageUrls);
    })
    setFormData({
      model_no: row.model_no,
      machine_name: row.machine_name,
      side_type: row.side_type,
      spindles: row.spindles,
      min_spindles: row.min_spindles,
      max_spindles: row.max_spindles
    })
  }

  const dtSx = { fontSize: '10.5px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: v2Colors.faint };
  const ddSx = { m: 0, fontFamily: v2Fonts.mono, fontSize: '13px', fontWeight: 600 };

  return (
    <V2PageShell currentPage="machines">
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='Search machines'
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
              setErrors({})
              setCreateDialog(true)
            }}>
              Add New
            </Button>
          </Box>
        </Grid2>
        <Grid2 size={12}>
          {machines.length > 0 ? (
            <Grid2 container spacing={2}>
              {machines.map((row) => (
                <Grid2 key={row.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Box sx={{
                    backgroundColor: v2Colors.surface,
                    border: `1px solid ${v2Colors.line}`,
                    borderRadius: '8px',
                    padding: '16px',
                    height: '100%',
                  }}>
                    <Typography sx={{ fontFamily: v2Fonts.display, fontSize: 16, fontWeight: 700, mb: 0.25 }}>{row.machine_name}</Typography>
                    <Typography sx={{ fontFamily: v2Fonts.mono, fontSize: '11.5px', color: v2Colors.muted, mb: 1.5 }}>Model No · {row.model_no}</Typography>
                    <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 10px', margin: '0 0 14px' }}>
                      <Box component="dt" sx={dtSx}>Side Type</Box>
                      <Box component="dd" sx={ddSx}>{row.side_type}</Box>
                      <Box component="dt" sx={dtSx}>Spindles</Box>
                      <Box component="dd" sx={ddSx}>{row.spindles}</Box>
                      <Box component="dt" sx={dtSx}>Min. Spindles</Box>
                      <Box component="dd" sx={ddSx}>{row.min_spindles}</Box>
                      <Box component="dt" sx={dtSx}>Max. Spindles</Box>
                      <Box component="dd" sx={ddSx}>{row.max_spindles}</Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, borderTop: `1px dashed ${v2Colors.line}`, pt: 1.5 }}>
                      <Typography
                        onClick={() => {
                          navigate("/v2/machines/newMachine", { state: { id: row.id } })
                        }}
                        sx={{ color: v2Colors.primary, fontWeight: 600, fontSize: '12.5px', cursor: 'pointer' }}
                      >
                        View Assembly
                      </Typography>
                      <Typography
                        onClick={() => openEdit(row)}
                        sx={{ color: v2Colors.muted, fontWeight: 600, fontSize: '12.5px', cursor: 'pointer' }}
                      >
                        Edit
                      </Typography>
                      <Typography
                        onClick={() => setDeleteDialog({ dialog: true, id: row.id, name: row.machine_name })}
                        sx={{ color: v2Colors.muted, fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', ml: 'auto' }}
                      >
                        Delete
                      </Typography>
                    </Box>
                  </Box>
                </Grid2>
              ))}
            </Grid2>
          ) : (
            <Box sx={{ textAlign: 'center', color: v2Colors.muted, padding: '60px 20px', border: `1px solid ${v2Colors.line}`, borderRadius: '8px', backgroundColor: v2Colors.surface }}>
              No Data
            </Box>
          )}
        </Grid2>
      </Grid2>

      <V2Drawer
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        disableBackdropClose
        title={machineId.length > 0 ? 'Update Machine' : 'New Machine'}
        actions={<>
          <Button variant='text' onClick={() => {
            setCreateDialog(false)
            clearValues()
          }} sx={{ color: v2Colors.primary }}>Cancel</Button>
          <Button onClick={handleNewMachineSubmit} variant="contained">Save Machine</Button>
        </>}
      >
        <V2FormSection title="Machine Details">
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
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
              sx={{ gridColumn: '1 / -1' }}
            />

            <TextField
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
              sx={{ gridColumn: '1 / -1' }}
            />

            <FormControl fullWidth error={!!errors?.side_type}>
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
            </FormControl>

            <TextField
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
              onChange={(e: any) => {
                setFormData({ ...formData, spindles: e.target.value, min_spindles: e.target.value, max_spindles: e.target.value })
              }}
            />

            <TextField
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
            />

            <TextField
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
            />
          </Box>
        </V2FormSection>

        <V2FormSection title="Images (Max 3)">
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: 'wrap' }}>
            {images.map((img: any, index: any) => (
              <Box
                key={index}
                sx={{
                  width: 80,
                  height: 80,
                  border: `1px solid ${v2Colors.line}`,
                  borderRadius: '4px',
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <img
                  src={img.type === "existing" ? img.url : img.preview}
                  alt="preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveImage(index)}
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: "rgba(0,0,0,0.5)",
                    color: "#fff"
                  }}
                >
                  ✕
                </IconButton>
              </Box>
            ))}

            {images.length < 3 && (
              <label>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  hidden
                  onChange={handleImageChange}
                />
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    border: `2px dashed ${v2Colors.line}`,
                    borderRadius: '4px',
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: v2Colors.faint,
                  }}
                >
                  +
                </Box>
              </label>
            )}
          </Box>
        </V2FormSection>

        <V2FormSection title="Reference URLs (Max 3)">
          {urls.map((url, index) => (
            <TextField
              key={index}
              fullWidth
              size="small"
              placeholder="Enter URL"
              value={url}
              sx={{ mb: 1 }}
              onChange={(e) => handleUrlChange(index, e.target.value)}
            />
          ))}

          {urls.length < 3 && (
            <Button onClick={addUrlField} size="small" variant='outlined'>
              + Add URL
            </Button>
          )}
        </V2FormSection>
      </V2Drawer>

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
            dispatch(deleteMachine({ id: deleteDialog.id })).unwrap().then((res: any) => {
              setDeleteDialog({ dialog: false, id: '', name: '' })
              DisplaySnackbar(res, res.includes('success') ? 'success' : 'error', enqueueSnackbar)
              dispatch(fetchMachineList())
            }).catch((err: any) => {
              enqueueSnackbar('Unable to delete machine', { variant: 'error' });
            })
          }}>Yes</Button>
        </DialogActions>
      </Dialog>

      <Dialog maxWidth={'md'}
        open={machineStatus == 'loading'}>
        <CircularProgress color='success' sx={{ m: 3 }} />
      </Dialog>
    </V2PageShell>
  );
}
