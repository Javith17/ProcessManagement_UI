import { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { Box, Button, Card, Grid2, InputAdornment, Paper, TextField, FormControl, InputLabel, Checkbox, ListItemText, CircularProgress, Pagination, FormControlLabel, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { createNewRole, deleteRole, fetchRoles, updateRole } from '../../slices/adminSlice';
import { Add, Search } from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import DialogTitle from '@mui/material/DialogTitle';
import { page_limit } from '../../constants';
import RefreshButton from '../../components/RefreshButton';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../../utils/DisplaySnackbar';
import { screens } from '../../utils/Constants';
import V2PageShell from '../components/V2PageShell';
import V2Drawer from '../components/V2Drawer';
import { V2TableRowStyled } from '../components/v2Table';
import { v2Colors } from '../theme';

// Functional port of pages/Roles.tsx. Known bugs reproduced verbatim:
// - the screen-multiselect onChange filters selectedPermissions against the
//   raw `screens` object array (not the newly-selected string codes), so
//   deselecting a screen never actually strips its permissions
// - the "select permissions for screen" guard uses `> 1` instead of `> 0`
// - Pagination count is `roles.count / page_limit` (no Math.ceil)
// - delete's catch path uses a plain enqueueSnackbar, not DisplaySnackbar
export default function V2Roles() {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { roles, status } = useAppSelector((state) => state.admin);

  const [searchText, setSearchText] = useState("");
  const [createDialog, setCreateDialog] = useState(false);
  const [loadingDialog, setLoadingDialog] = useState(false);

  const [roleName, setRoleName] = useState("");
  const [roleCode, setRoleCode] = useState("");
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<any[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ dialog: false, id: '', name: '' });

  const screensList = screens;

  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchRoles({ limit: page_limit, page: pageNo })).unwrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(fetchRoles({ searchText })).unwrap();
  };

  const handleRefresh = () => {
    dispatch(fetchRoles({ limit: page_limit, page: pageNo, searchText })).unwrap();
  };

  useEffect(() => {
    setLoadingDialog(status.includes('loading'));
  }, [status]);

  const handlePermissionChange = (screenItem: any, action: string, checked: boolean) => {
    let updatedPermissions = [...selectedPermissions];
    const existingScreenIndex = updatedPermissions.findIndex((item) => item.screen === screenItem.screen);

    if (existingScreenIndex !== -1) {
      let existingScreen = updatedPermissions[existingScreenIndex];
      let permission: any = existingScreen.permission || [];
      if (checked) {
        permission = [...permission, action];
      } else {
        permission = permission.filter((a: string) => a !== action);
      }
      permission = Array.from(new Set(permission));
      if (permission.length === 0) {
        updatedPermissions.splice(existingScreenIndex, 1);
      } else {
        updatedPermissions[existingScreenIndex] = { ...existingScreen, permission };
      }
    } else if (checked) {
      updatedPermissions.push({ name: screenItem.name, type: screenItem.type, screen: screenItem.screen, permission: [action] });
    }

    setSelectedPermissions(updatedPermissions);
  };

  const handleSaveRole = () => {
    if (roleName?.trim().length === 0) {
      enqueueSnackbar("Enter Role name");
      return;
    }
    if (roleCode?.trim().length === 0) {
      enqueueSnackbar("Enter Role code");
      return;
    }
    if (selectedScreens.length === 0) {
      enqueueSnackbar("Select screens");
      return;
    }
    if (selectedPermissions?.filter((sp) => sp?.permission?.length === 0).length > 1) {
      enqueueSnackbar("Select permissions for screen");
      return;
    }
    if (selectedRole) {
      dispatch(updateRole({ id: selectedRole.id, role_name: roleName, role_code: roleCode, screens: selectedPermissions })).unwrap().then(() => {
        setCreateDialog(false);
        DisplaySnackbar('Role updated successfully', 'success', enqueueSnackbar);
        setRoleName("");
        setRoleCode("");
        setSelectedPermissions([]);
        setSelectedScreens([]);
        setSelectedRole("");
        dispatch(fetchRoles());
      }).catch((err) => {
        DisplaySnackbar(err.message, 'error', enqueueSnackbar);
      });
    } else {
      dispatch(createNewRole({ role_name: roleName, role_code: roleCode, screens: selectedPermissions })).unwrap().then(() => {
        setCreateDialog(false);
        DisplaySnackbar('Role created successfully', 'success', enqueueSnackbar);
        setRoleName("");
        setRoleCode("");
        setSelectedPermissions([]);
        setSelectedScreens([]);
        dispatch(fetchRoles());
      }).catch((err) => {
        DisplaySnackbar(err.message, 'error', enqueueSnackbar);
      });
    }
  };

  return (
    <V2PageShell currentPage="roles">
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='Search role'
            variant="outlined"
            size='small'
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(ev) => { if (ev.key === "Enter") handleSearch(); }}
            slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) } }}
          />
        </Grid2>
        <Grid2 size="grow" display="flex" alignItems="end" flexDirection="column">
          <Box sx={{ display: 'flex', gap: 1 }}>
            <RefreshButton onClick={handleRefresh} />
            <Button variant="contained" startIcon={<Add />} size="small" onClick={() => {
              setRoleName("");
              setRoleCode("");
              setSelectedRole(null);
              setSelectedPermissions([]);
              setSelectedScreens([]);
              setCreateDialog(true);
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
                  <TableCell>Role Code</TableCell>
                  <TableCell>Role Name</TableCell>
                  <TableCell>Screens</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.list?.length > 0 ? roles.list.map((row) => (
                  <V2TableRowStyled key={row.id}>
                    <TableCell>{row.role_code}</TableCell>
                    <TableCell>{row.role_name}</TableCell>
                    <TableCell>{row.screens.map((sc: any) => sc.name).join(" , ")}</TableCell>
                    <TableCell><MdOutlineEdit style={{ cursor: 'pointer' }} onClick={() => {
                      setSelectedRole(row);
                      setRoleName(row.role_name || "");
                      setRoleCode(row.role_code || "");
                      setSelectedScreens(row.screens.map((item: any) => item.screen));
                      setSelectedPermissions(row.screens.map((item: any) => ({
                        name: item.name,
                        type: item.type,
                        screen: item.screen,
                        actions: item.permission || item.actions || []
                      })));
                      setCreateDialog(true);
                    }} /></TableCell>
                    <TableCell><MdDeleteOutline style={{ cursor: 'pointer' }} onClick={() => {
                      setDeleteDialog({ dialog: true, id: row.id, name: row.role_name });
                    }} /></TableCell>
                  </V2TableRowStyled>
                )) : <TableRow key={0}>
                  <TableCell colSpan={4} align='center'>No Data</TableCell>
                </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination count={roles.count / page_limit} shape="rounded" sx={{ '& > .MuiPagination-ul': { justifyContent: 'center' }, mt: 2 }} onChange={(e: any, value: number) => {
            dispatch(fetchRoles({ limit: page_limit, page: value }));
          }} />
        </Grid2>
      </Grid2>

      <V2Drawer
        width={640}
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        title={selectedRole ? 'Update Role' : 'Add New Role'}
        actions={<>
          <Button variant='text' onClick={() => setCreateDialog(false)}>Close</Button>
          <Button variant="contained" onClick={handleSaveRole}>{selectedRole ? 'Update' : 'Save'}</Button>
        </>}
      >
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 6 }}>
              <TextField fullWidth label="Role Name" value={roleName} disabled={selectedRole} onChange={(e) => setRoleName(e.target.value)} />
            </Grid2>
            <Grid2 size={{ xs: 6 }}>
              <TextField fullWidth label="Role Code" value={roleCode} disabled={selectedRole} onChange={(e) => setRoleCode(e.target.value)} />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Screens</InputLabel>
                <Select
                  multiple
                  value={selectedScreens}
                  label="Select Screens"
                  onChange={(e) => {
                    setSelectedScreens(e.target.value as string[]);
                    setSelectedPermissions((prev: any[]) => prev.filter((item) => !screens.includes(item.screen as any)));
                  }}
                  renderValue={(selected) => screensList.filter((item) => selected.includes(item.screen)).map((item) => item.name).join(", ")}
                >
                  {screensList.map((item) => (
                    <MenuItem key={item.screen} value={item.screen}>
                      <Checkbox checked={selectedScreens.includes(item.screen)} />
                      <ListItemText primary={item.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Permissions</Typography>
              <Grid2 container spacing={1}>
                {screensList.filter((screenItem) => selectedScreens.includes(screenItem.screen)).map((screenItem, index) => {
                  const selectedScreenPermission = selectedPermissions.find((item) => item.screen === screenItem.screen);
                  const enabledPermissions = selectedScreenPermission?.actions || selectedScreenPermission?.permission || [];
                  return (
                    <Grid2 key={index} size={{ xs: 12, md: 6 }}>
                      <Card sx={{ p: 1.5, borderRadius: '5px' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>{screenItem.name}</Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {screenItem.actions.map((action, actionIndex) => (
                            <FormControlLabel
                              key={actionIndex}
                              sx={{ m: 0 }}
                              control={<Checkbox size="small" checked={enabledPermissions.includes(action)} onChange={(e) => handlePermissionChange(screenItem, action, e.target.checked)} />}
                              label={<Typography variant="caption">{action.toUpperCase()}</Typography>}
                            />
                          ))}
                        </Box>
                      </Card>
                    </Grid2>
                  );
                })}
              </Grid2>
            </Grid2>
          </Grid2>
      </V2Drawer>

      <Dialog maxWidth={'md'} open={loadingDialog}>
        <CircularProgress color='success' sx={{ m: 3 }} />
      </Dialog>

      <Dialog maxWidth={'sm'} open={deleteDialog.dialog}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>Are you sure you want to delete {deleteDialog.name}?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ dialog: false, id: '', name: '' })} sx={{ color: v2Colors.primary }}>No</Button>
          <Button variant="contained" size="small" onClick={() => {
            dispatch(deleteRole({ id: deleteDialog.id })).unwrap().then((res: any) => {
              setDeleteDialog({ dialog: false, id: '', name: '' });
              DisplaySnackbar(res, res.includes('success') ? 'success' : 'error', enqueueSnackbar);
              dispatch(fetchRoles({ limit: page_limit, page: pageNo }));
            }).catch(() => {
              enqueueSnackbar('Unable to delete role', { variant: 'error' });
            });
          }}>Yes</Button>
        </DialogActions>
      </Dialog>
    </V2PageShell>
  );
}
