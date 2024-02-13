import { promises as fs } from "fs";

export async function GET() {
  const file = await fs.readFile(process.cwd() + "/src/app/map.json", "utf8");

  return Response.json(JSON.parse(file));
}
