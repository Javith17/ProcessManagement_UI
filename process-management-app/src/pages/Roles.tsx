import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, Grid2, InputAdornment, Paper, TextField, FormControl, InputLabel, OutlinedInput, Checkbox, ListItemText, Alert, CircularProgress, Pagination, FormControlLabel, Typography } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { createNewRole, fetchRoles, updateRole } from '../slices/adminSlice';
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
import { screens } from '../utils/Constants';

export default function Roles() {
  const dispatch = useAppDispatch()
  const { enqueueSnackbar } = useSnackbar()

  const { roles, status } = useAppSelector(
    (state) => state.admin
  );

  const [searchText, setSearchText] = useState("")
  const [createDialog, setCreateDialog] = useState(false)
  const [loadingDialog, setLoadingDialog] = useState(false)

  const [roleName, setRoleName] = useState("")
  const [roleCode, setRoleCode] = useState("")
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<any[]>([]);
  const [pageNo, setPageNo] = useState(1)

  const screensList = screens;

  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchRoles({ limit: page_limit, page: pageNo })).unwrap()
  }, [dispatch])

  const handleSearch = () => {
    dispatch(fetchRoles({ searchText })).unwrap()
  }

  useEffect(() => {
    setLoadingDialog(status.includes('loading'))
  }, [status])

  const handlePermissionChange = (
    screenItem: any,
    action: string,
    checked: boolean
  ) => {

    let updatedPermissions = [...selectedPermissions];

    const existingScreenIndex = updatedPermissions.findIndex(
      (item) => item.screen === screenItem.screen
    );

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
        updatedPermissions[existingScreenIndex] = {
          ...existingScreen,
          permission
        };
      }

    } else if (checked) {

      updatedPermissions.push({
        name: screenItem.name,
        type: screenItem.type,
        screen: screenItem.screen,
        permission: [action]
      });

    }

    setSelectedPermissions(updatedPermissions);
  };

  const isActionSelected = (
    screen: string,
    action: string
  ) => {

    const screenData = selectedPermissions.find(
      (item) => item.screen === screen
    );

    return screenData?.permission?.includes(action);
  };

  const handleSaveRole = () => {
    if (roleName?.trim().length == 0) {
      enqueueSnackbar("Enter Role name")
      return;
    }
    if (roleCode?.trim().length == 0) {
      enqueueSnackbar("Enter Role code")
      return;
    }
    if (selectedScreens.length == 0) {
      enqueueSnackbar("Select screens")
      return;
    }
    if (selectedPermissions?.filter((sp) => sp?.permission?.length == 0).length > 1) {
      enqueueSnackbar("Select permissions for screen")
      return;
    }
    if (selectedRole) {
      dispatch(updateRole({
        id: selectedRole.id,
        role_name: roleName,
        role_code: roleCode,
        screens: selectedPermissions
      })).unwrap().then((res) => {
        setCreateDialog(false)
        DisplaySnackbar('Role updated successfully', 'success', enqueueSnackbar)
        setRoleName("")
        setRoleCode("")
        setSelectedPermissions([]);
        setSelectedScreens([]);
        setSelectedRole("")
        dispatch(fetchRoles())
      }).catch((err) => {
        DisplaySnackbar(err.message, 'error', enqueueSnackbar)
      })
    } else {
      dispatch(createNewRole({
        role_name: roleName,
        role_code: roleCode,
        screens: selectedPermissions
      })).unwrap().then((res) => {
        setCreateDialog(false)
        DisplaySnackbar('Role created successfully', 'success', enqueueSnackbar)
        setRoleName("")
        setRoleCode("")
        setSelectedPermissions([]);
        setSelectedScreens([]);
        dispatch(fetchRoles())
      }).catch((err) => {
        DisplaySnackbar(err.message, 'error', enqueueSnackbar)
      })
    }
  };

  return (
    <Box sx={{ display: 'flex', direction: 'column' }}>
      <SidebarNav currentPage={nav_roles} />

      <Grid2 container spacing={2} padding={2} sx={{ mt: 10, flexGrow: 1 }}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='Search role'
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
            setRoleName("")
            setRoleCode("")
            setSelectedRole(null)
            setSelectedPermissions([]);
            setSelectedScreens([]);
            setCreateDialog(true);
          }}>
            Add New
          </Button>
        </Grid2>
        <Grid2 size={{ xs: 6, md: 12 }}>
          <TableContainer component={Paper}>
            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight: 'bold' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Role Code</TableCell>
                  <TableCell>Role Name</TableCell>
                  <TableCell>Screens</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.list?.length > 0 ? roles.list.map((row) => (
                  <TableRowStyled key={row.id}>
                    <TableCell>{row.role_code}</TableCell>
                    <TableCell>{row.role_name}</TableCell>
                    <TableCell>{row.screens.map((sc: any) => sc.name).join(" , ")}</TableCell>
                    <TableCell><MdOutlineEdit onClick={() => {
                      setSelectedRole(row);

                      // Role Name
                      setRoleName(row.role_name || "");
                      setRoleCode(row.role_code || "");

                      // Selected Screens
                      setSelectedScreens(
                        row.screens.map((item: any) => item.screen)
                      );

                      // Selected Permissions
                      setSelectedPermissions(
                        row.screens.map((item: any) => ({
                          name: item.name,
                          type: item.type,
                          screen: item.screen,
                          actions: item.permission || item.actions || []
                        }))
                      );

                      setCreateDialog(true);
                    }} /></TableCell>
                  </TableRowStyled>
                )) : <TableRow key={0}>
                  <TableCell colSpan={4} align='center'>No Data</TableCell>
                </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination count={roles.count / page_limit} shape="rounded" sx={{
            '& > .MuiPagination-ul': {
              justifyContent: 'center',
            }, mt: 2
          }} onChange={(e: any, value: number) => {
            dispatch(fetchRoles({ limit: page_limit, page: value }))
          }} />

        </Grid2>
      </Grid2>

      <Dialog
        open={createDialog}
        onClose={(event, reason) => {
          if (reason === "backdropClick") {
            return;
          }

          setCreateDialog(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedRole ? 'Update Role' : 'Add New Role'}
        </DialogTitle>

        <DialogContent>

          <Grid2 container spacing={2} sx={{ mt: 1 }}>

            {/* Role Name */}
            <Grid2 size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Role Name"
                value={roleName}
                disabled={selectedRole}
                onChange={(e) => {
                  setRoleName(e.target.value);
                }}
              />
            </Grid2>

            <Grid2 size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Role Code"
                value={roleCode}
                disabled={selectedRole}
                onChange={(e) => {
                  setRoleCode(e.target.value);
                }}
              />
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
                    setSelectedPermissions((prev: any[]) =>
                      prev.filter((item) =>
                        !screens.includes(item.screen)
                      )
                    );
                  }}

                  renderValue={(selected) =>
                    screensList
                      .filter((item) =>
                        selected.includes(item.screen)
                      )
                      .map((item) => item.name)
                      .join(", ")
                  }
                >

                  {screensList.map((item) => (
                    <MenuItem
                      key={item.screen}
                      value={item.screen}
                    >
                      <Checkbox
                        checked={selectedScreens.includes(item.screen)}
                      />

                      <ListItemText primary={item.name} />
                    </MenuItem>
                  ))}

                </Select>

              </FormControl>

            </Grid2>

            <Grid2 size={{ xs: 12 }}>

              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1,
                  fontWeight: 600
                }}
              >
                Permissions
              </Typography>

              <Grid2 container spacing={1}>

                {screensList
                  .filter((screenItem) =>
                    selectedScreens.includes(screenItem.screen)
                  )
                  .map((screenItem, index) => {

                    // Get existing selected permission
                    const selectedScreenPermission =
                      selectedPermissions.find(
                        (item) =>
                          item.screen === screenItem.screen
                      );

                    const enabledPermissions =
                      selectedScreenPermission?.actions ||
                      selectedScreenPermission?.permission ||
                      [];

                    return (

                      <Grid2
                        key={index}
                        size={{
                          xs: 12,
                          md: 6
                        }}
                      >

                        <Card
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            boxShadow: 1
                          }}
                        >

                          {/* Screen Name */}
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              mb: 1
                            }}
                          >
                            {screenItem.name}
                          </Typography>

                          {/* Actions */}
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 1
                            }}
                          >

                            {screenItem.actions.map(
                              (action, actionIndex) => (

                                <FormControlLabel
                                  key={actionIndex}
                                  sx={{ m: 0 }}

                                  control={
                                    <Checkbox
                                      size="small"

                                      checked={enabledPermissions.includes(
                                        action
                                      )}

                                      onChange={(e) => {

                                        handlePermissionChange(
                                          screenItem,
                                          action,
                                          e.target.checked
                                        );

                                      }}
                                    />
                                  }

                                  label={
                                    <Typography
                                      variant="caption"
                                    >
                                      {action.toUpperCase()}
                                    </Typography>
                                  }
                                />

                              )
                            )}

                          </Box>

                        </Card>

                      </Grid2>

                    );
                  })}

              </Grid2>

            </Grid2>

          </Grid2>

        </DialogContent>

        <DialogActions>

          <Button
            onClick={() => {
              setCreateDialog(false);
            }}
          >
            Close
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveRole}
          >
            {selectedRole ? 'Update' : 'Save'}
          </Button>

        </DialogActions>
      </Dialog>

      <Dialog maxWidth={'md'}
        open={loadingDialog}>
        <CircularProgress color='success' sx={{ m: 3 }} />
        {/* <img src={loader} style={{margin:'5px'}} /> */}
      </Dialog>
    </Box>
  );
}
