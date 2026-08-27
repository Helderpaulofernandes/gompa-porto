import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getAgendaEvents } from "@/lib/agenda";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get("teacherId") || undefined;
  const roomId = searchParams.get("roomId") || undefined;

  const events = await getAgendaEvents({ teacherId, roomId });
  return NextResponse.json({ events });
}
