import { NextRequest, NextResponse } from "next/server";

// rotas de página protegidas
const PROTECTED_PAGES = ["/dashboard"];

// prefixos de APIs protegidas
const PROTECTED_API_PREFIXES = [
  "/api/summary",      
  "/api/transactions",
  "/api/budgets",
  "/api/wallets",
  
];

// middleware
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // verifica se é página protegida
  const isProtectedPage = PROTECTED_PAGES.some((p) =>
    pathname.startsWith(p),
  );

  // verifica se é API protegida
  const isProtectedApi = PROTECTED_API_PREFIXES.some((p) =>
    pathname.startsWith(p),
  );

  // se não é rota protegida, só segue
  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  // pega token do cookie
  const token = req.cookies.get("token")?.value;

  // se não tem token:
  if (!token) {
    // se for API protegida → devolve 401 em vez de redirecionar
    if (isProtectedApi) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    // se for página protegida → redireciona para login
    const url = new URL("/login", req.url);
    const fromPath = pathname;
    url.searchParams.set("from", fromPath);
    return NextResponse.redirect(url);
  }


  return NextResponse.next();
}

// diz pro Next em quais rotas esse middleware roda
export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
