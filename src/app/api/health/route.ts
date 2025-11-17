export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type HealthResponse =
  | { ok: true; users: number }
  | { ok: false; error: string };

export async function GET() {
  try {
    const count = await prisma.user.count();

    return NextResponse.json<HealthResponse>({
      ok: true,
      users: count,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro interno no servidor";

    return NextResponse.json<HealthResponse>(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}
