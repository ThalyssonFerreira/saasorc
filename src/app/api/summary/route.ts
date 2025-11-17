export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";

// pega o token no cookie e devolve o id do usuário (sub), se o token for válido
function getUserId(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  const payload = verifyJwt<{ sub: number }>(token);
  return payload?.sub ?? null;
}

export async function GET(req: NextRequest) {
  // identifica o usuário logado
  const userId = getUserId(req);

  // se não estiver logado, bloqueia
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // lê os parâmetros month e year da URL (?month=11&year=2025)
  const url = new URL(req.url);
  const month = Number(url.searchParams.get("month"));
  const year = Number(url.searchParams.get("year"));

  // valida se month e year foram enviados e são válidos
  if (!month || !year) {
    return NextResponse.json(
      { ok: false, error: "month e year são obrigatórios" },
      { status: 400 }
    );
  }

  // calcula o intervalo do mês (início e fim em UTC)
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  // busca todas as transações do usuário nesse mês, já trazendo a categoria
  const txs = await prisma.transaction.findMany({
    where: {
      userId,
      occurredAt: { gte: start, lt: end },
    },
    include: {
      category: true,
    },
    orderBy: { occurredAt: "asc" },
  });

  // soma todas as receitas (INCOME)
  const income = txs
    .filter((t) => t.type === "INCOME")
    .reduce((a, b) => a + Number(b.amount), 0);

  // soma todas as despesas (EXPENSE)
  const expense = txs
    .filter((t) => t.type === "EXPENSE")
    .reduce((a, b) => a + Number(b.amount), 0);

  // calcula o saldo do mês
  const balance = income - expense;

  // mapa para somar despesas por categoria
  const byCategory = new Map<string, number>();
  txs
    .filter((t) => t.type === "EXPENSE")
    .forEach((t) => {
      const key = t.category?.name ?? "Sem categoria";
      byCategory.set(key, (byCategory.get(key) ?? 0) + Number(t.amount));
    });

  // monta dados para gráfico de pizza/barras por categoria
  const categoriesChart = Array.from(byCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // mapa para somar o saldo diário (entrada positiva, saída negativa)
  const byDay = new Map<number, number>();
  txs.forEach((t) => {
    const day = new Date(t.occurredAt).getUTCDate();
    const val =
      t.type === "INCOME" ? Number(t.amount) : -Number(t.amount);
    byDay.set(day, (byDay.get(day) ?? 0) + val);
  });

  // monta dados para gráfico de linha por dia do mês
  const dailyChart = Array.from(byDay)
    .sort((a, b) => a[0] - b[0])
    .map(([day, value]) => ({ day, value }));

  // transforma as transações em um formato "limpo" para o front
  const plainTxs = txs.map((t) => ({
    id: t.id,
    type: t.type,
    amount: Number(t.amount),
    occurredAt: t.occurredAt.toISOString(),
    description: t.description,
    walletId: t.walletId,
    category: t.category
      ? { id: t.category.id, name: t.category.name }
      : null,
  }));

  // devolve o resumo completo para o dashboard
  return NextResponse.json({
    ok: true,
    income,
    expense,
    balance,
    categoriesChart,
    dailyChart,
    transactions: plainTxs,
  });
}
