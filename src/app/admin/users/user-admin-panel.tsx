"use client";
import type { Role } from "@/db/enums";
import type { IRegionConfig, IUser, IUserRole } from "@/types/map";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef, type GridRowId } from "@mui/x-data-grid";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

export interface IAddUserToRegionForm {
  userId: string;
  region: string;
  role: Role;
}

const availableUsers = (region: string, users: IUser[]): IUser[] =>
  users.filter((user) => user.roles.every((role) => role.region_id !== region));

const AddUserModal = (props: {
  region: string;
  users: IUser[];
  open: boolean;
  onClose: () => void;
  onSave: (request: IAddUserToRegionForm) => Promise<void>;
}) => {
  const router = useRouter();

  const { control, handleSubmit } = useForm<IAddUserToRegionForm>({
    defaultValues: {
      region: props.region,
      userId: "",
      role: "CONTRIBUTOR",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    await props.onSave(data);
    props.onClose();
    router.refresh();
  });

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>
        <Typography variant="h5">Add User To Region</Typography>
      </DialogTitle>
      <DialogContent>
        <Controller
          name="userId"
          control={control}
          render={({ field: { value, onChange } }) => (
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Region</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={value}
                label="User"
                onChange={onChange}
              >
                {availableUsers(props.region, props.users).map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={props.onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={onSubmit}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface ITableUser extends Omit<IUser, "roles"> {
  role: IUserRole;
}

const flattenUserRolesToRegion = (
  region: string,
  users: IUser[],
): ITableUser[] =>
  users
    .flatMap((user) => user.roles.map((role) => ({ ...user, role })))
    .filter((user) => user.role.region_id === region);

interface IUserAdminPanelProps {
  regionConfigs: IRegionConfig[];
  users: IUser[];
  addUserToRegionHandler: (request: IAddUserToRegionForm) => Promise<void>;
  deleteUserFromRegionHandler: (userId: string) => Promise<void>;
}

export const UserAdminPanel = (props: IUserAdminPanelProps) => {
  const router = useRouter();
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [selectedRegionID, setSelectedRegionID] = useState<string | null>(null);

  const tableUsers = selectedRegionID
    ? flattenUserRolesToRegion(selectedRegionID, props.users)
    : [];

  const deleteUserFromRegion = useCallback(
    (id: GridRowId) => async () => {
      const user = tableUsers.find((user) => user.id === id);
      if (user) await props.deleteUserFromRegionHandler(user.role.id);
      router.refresh();
    },
    [props.deleteUserFromRegionHandler, tableUsers, router],
  );

  const session = useSession();

  const columns = useMemo<GridColDef<ITableUser>[]>(
    () => [
      {
        field: "actions",
        type: "actions",
        getActions: (params) => [
          <IconButton
            disabled={params.row.id === session.data?.user.id}
            key={params.id}
            onClick={deleteUserFromRegion(params.id)}
          >
            <DeleteIcon />
          </IconButton>,
        ],
      },
      { field: "name", headerName: "Name", width: 200 },
      { field: "email", headerName: "Email", width: 300 },
      {
        field: "role",
        headerName: "Role",
        renderCell: (params) => params.row.role.role,
        width: 150,
      },
    ],
    [deleteUserFromRegion, session],
  );

  return (
    <>
      {selectedRegionID && addUserModalOpen && (
        <AddUserModal
          region={selectedRegionID}
          users={props.users}
          open={addUserModalOpen}
          onClose={() => setAddUserModalOpen(false)}
          onSave={props.addUserToRegionHandler}
        />
      )}
      <Stack spacing={2}>
        <Grid container>
          <Grid>
            <Button
              disabled={
                !selectedRegionID ||
                (!!selectedRegionID &&
                  availableUsers(selectedRegionID, props.users).length === 0)
              }
              onClick={() => setAddUserModalOpen(true)}
            >
              Add User
            </Button>
          </Grid>
        </Grid>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Region</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedRegionID}
            label="Region"
            onChange={(event) => setSelectedRegionID(event.target.value)}
          >
            {props.regionConfigs
              .filter((regionConfig) => !regionConfig.disabled)
              .map((regionConfig) => (
                <MenuItem key={regionConfig.region} value={regionConfig.region}>
                  {regionConfig.label}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <DataGrid
          columns={columns}
          rows={
            selectedRegionID
              ? flattenUserRolesToRegion(selectedRegionID, props.users)
              : []
          }
        />
      </Stack>
    </>
  );
};
