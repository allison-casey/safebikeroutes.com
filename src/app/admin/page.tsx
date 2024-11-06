import { getUsers } from "@/db/user";
import type { IUser } from "@/types/user";
import { Container } from "@mui/material";
import { DataGrid, type GridColDef, type GridRowsProp } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  { field: "name", headerName: "Name", width: 150 },
  { field: "email", headerName: "Email", width: 200 },
  { field: "region", headerName: "Region" },
  { field: "role", headerName: "Role", width: 200 },
];

const usersToRows = (users: IUser[]): GridRowsProp =>
  users.flatMap((user) =>
    user.roles.length
      ? user.roles.map(({ region, role }) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          region,
          role,
        }))
      : {
          id: user.id,
          name: user.name,
          email: user.email,
        },
  );

export default async function () {
  const users = await getUsers();

  return (
    <Container sx={{ height: "100vh", backgroundColor: "white" }}>
      <DataGrid rows={usersToRows(users)} columns={columns} />
    </Container>
  );
}
