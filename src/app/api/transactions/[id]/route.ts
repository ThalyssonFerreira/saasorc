
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";

// lógica de pegar userId 
function getUserId(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  const payload = verifyJwt<{ sub: number }>(token);
  return payload?.sub ?? null;
}
// tipagem dos params da rota dinâmica
type Params = {
  id: string;
};

// DELETE /api/transactions/[id]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<Params> },
) {
  //  await context.params
  const { id } = await context.params;

  const userId = getUserId(req);

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
// transforma o id em número
  const txId = Number(id);

  if (!txId || Number.isNaN(txId)) {
    return NextResponse.json(
      { ok: false, error: "ID inválido" },
      { status: 400 },
    );
  }
// busca a transação e garante que é do usuário logado
  const existing = await prisma.transaction.findFirst({
    where: { id: txId, userId },
  });

  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "Transação não encontrada" },
      { status: 404 },
    );
  }

  try {
    await prisma.$transaction(async (trx) => {
      // reverte o impacto da transação no saldo
      const diff =
        existing.type === "INCOME"
          ? -existing.amount
          : existing.type === "EXPENSE"
          ? existing.amount
          : 0;
// deleta a transação
      await trx.transaction.delete({
        where: { id: existing.id },
      });
// atualiza o saldo da carteira
      if (diff !== 0) {
        await trx.wallet.update({
          where: { id: existing.walletId },
          data: {
            balance: { increment: diff },
          },
        });
      }
    });
// retorna sucesso
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro interno no servidor";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}
