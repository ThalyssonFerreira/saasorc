import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth"; 

// rotas de página protegidas
const PROTECTED_PAGES = ["/dashboard"];

// prefixos de APIs protegidas
const PROTECTED_API_PREFIXES = [
  "/api/summary",      // importante para o dashboard
  "/api/transactions",
  "/api/budgets",
  "/api/wallets",
  // "/api/categorias", // se quiser proteger categorias também, descomenta
];

// middleware
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // verifica se é página protegida
  const isProtectedPage = PROTECTED_PAGES.some((p) =>
    pathname.startsWith(p)
  );

  // verifica se é API protegida
  const isProtectedApi = PROTECTED_API_PREFIXES.some((p) =>
    pathname.startsWith(p)
  );

  // se não é rota protegida, só segue
  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  // pega token do cookie
  const token = req.cookies.get("token")?.value;

  // se não tem token, redireciona pro login
  if (!token) {
    const url = new URL("/login", req.url);
    const fromPath = pathname.startsWith("/api") ? "/dashboard" : pathname;
    url.searchParams.set("from", fromPath);
    return NextResponse.redirect(url);
  }

  // valida o token aqui; se for inválido/expirado, também manda pro login
  const payload = verifyJwt<{ sub: number }>(token);
  if (!payload) {
    const url = new URL("/login", req.url);
    const fromPath = pathname.startsWith("/api") ? "/dashboard" : pathname;
    url.searchParams.set("from", fromPath);
    return NextResponse.redirect(url);
  }

  // se tem token válido, deixa passar
  return NextResponse.next();
}

// diz pro Next em quais rotas esse middleware roda
export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
