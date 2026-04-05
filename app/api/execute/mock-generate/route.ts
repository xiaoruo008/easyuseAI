import { NextRequest } from "next/server";
import { POST as generateHandler } from "../generate/route";

export async function POST(req: NextRequest) {
  return generateHandler(req);
}
