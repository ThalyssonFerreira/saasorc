# SaaSorc – Sistema de Controle Financeiro

Demo: https://saasorc.vercel.app/login

## 🏦 Visão geral

O **SaaSorc** é um sistema web de controle financeiro pessoal, onde o usuário pode:

- Registrar **receitas** e **despesas**;
- Visualizar **saldo do mês**, total de entradas e saídas;
- Acompanhar **gráfico de gastos por categoria**;
- Gerenciar **categorias personalizadas**;
- Visualizar a lista de transações do mês e **excluir lançamentos**.

O projeto foi desenvolvido com **Next.js (App Router)**, **Prisma** e **PostgreSQL**, usando **JWT** para autenticação e **Zod** para validação de dados.  
O frontend e as rotas de API rodam na **Vercel**, enquanto o banco de dados está hospedado no **Render**.

---

## ✨ Funcionalidades

- 🔐 **Autenticação com JWT**
  - Registro de usuário;
  - Login com geração de token;
  - Armazenamento do token em cookie (HTTP‑only);
  - Middleware protegendo rotas como `/dashboard`.

- 📊 **Dashboard financeiro**
  - Total de receitas (`income`);
  - Total de despesas (`expense`);
  - Saldo do mês (`balance`);
  - Lista de transações;
  - Gráfico de gastos por categoria (Recharts).

- 🏷️ **Categorias**
  - Categorias padrão (globais);
  - Categorias do próprio usuário;
  - Criação de novas categorias;
  - Exclusão de categorias do usuário (com remoção segura da referência nas transações).

- 💸 **Transações**
  - Criação de transações com:
    - tipo (`INCOME`, `EXPENSE`);
    - valor;
    - data;
    - descrição;
    - categoria;
    - carteira (wallet);
  - Atualização automática do saldo da carteira;
  - Exclusão de transações.

- ✅ **Validação com Zod**
  - Schemas de validação para login, registro, categorias e transações;
  - Validação **tanto no frontend quanto no backend**, evitando dados inválidos.

---

## 🧰 Tecnologias utilizadas

- **Frontend & Backend**
  - [Next.js](https://nextjs.org/) (App Router)
  - [React](https://react.dev/)
  - Rotas API internas (`src/app/api`)

- **Banco de dados & ORM**
  - [PostgreSQL](https://www.postgresql.org/)
  - [Prisma ORM](https://www.prisma.io/)

- **Autenticação & Segurança**
  - [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) (JWT)
  - [bcrypt](https://github.com/kelektiv/node.bcrypt.js) para hash de senhas
  - Cookies para persistir o token no navegador

- **Validação**
  - [Zod](https://zod.dev/) para validação de schemas (login, registro, categorias, transações)

- **UI & Gráficos**
  - [Tailwind CSS](https://tailwindcss.com/) para estilização
  - [Recharts](https://recharts.org/en-US/) para gráficos (pizza, etc.)

- **Infraestrutura**
  - [Vercel](https://vercel.com/) – deploy do Next.js (frontend + API)
  - [Render](https://render.com/) – hospedagem do banco PostgreSQL

---

## 📂 Estrutura básica do projeto

```bash
fintrack/ (ou saasorc/)
├─ prisma/
│  ├─ schema.prisma        # Definição do modelo de dados
│  └─ migrations/         # Migrations do Prisma
├─ src/
│  ├─ app/
│  │  ├─ api/
│  │  │  ├─ auth/
│  │  │  │  ├─ login/route.ts      # Login do usuário
│  │  │  │  ├─ register/route.ts   # Registro do usuário
│  │  │  ├─ summary/route.ts       # Resumo financeiro (income, expense, balance)
│  │  │  ├─ transactions/
│  │  │  │  ├─ route.ts            # Listar/criar transações
│  │  │  │  ├─ [id]/route.ts       # Deletar transação
│  │  │  ├─ categorias/
│  │  │  │  ├─ route.ts            # Listar/criar categorias
│  │  │  │  ├─ [id]/route.ts       # Deletar categoria
│  │  ├─ dashboard/page.tsx        # Página principal do usuário
│  │  ├─ login/page.tsx            # Tela de login
│  │  ├─ register/page.tsx         # Tela de registro
│  ├─ lib/
│  │  ├─ prisma.ts                 # Instância do PrismaClient
│  │  ├─ auth.ts                   # Funções de JWT e bcrypt
│  │  ├─ validators.ts             # Schemas Zod (login, registro, transações, categorias)
│  ├─ components/
│     ├─ transaction-form.tsx      # Formulário de criação de transação
├─ public/
├─ .env
├─ next.config.ts
├─ tailwind.config.js
├─ tsconfig.json
├─ package.json
└─ README.md
```

---

## 🚀 Como rodar o projeto localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo
```

### 2. Instalar dependências

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
DATABASE_URL="postgresql://usuario:senha@host:porta/nome_db"
JWT_SECRET="uma_chave_bem_aleatoria"
```

> **Importante:**  
> - Não commitar o arquivo `.env` no Git.  
> - Use uma `JWT_SECRET` forte em produção.

### 4. Rodar migrations do Prisma

```bash
npx prisma migrate dev
# ou, se o banco já existe em produção:
# npx prisma migrate deploy
```

### 5. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🌐 Deploy

### Vercel (Next.js)

1. Suba o código para um repositório no GitHub.
2. No painel da Vercel:
   - Clique em **New Project** e selecione o repositório.
   - Configure as variáveis de ambiente em **Settings → Environment Variables**:
     - `DATABASE_URL` → URL do PostgreSQL no Render
     - `JWT_SECRET` → chave secreta usada para assinar/verificar tokens JWT
3. Faça o deploy.

### Banco de dados (Render)

- Crie um banco **PostgreSQL** no Render.
- Copie a **External Database URL**.
- Use essa URL como valor de `DATABASE_URL` em:
  - `.env` local
  - Variáveis de ambiente da Vercel (produção)

---

## 🔐 Autenticação (JWT + cookies)

- Na API (`/api/auth/login` e `/api/auth/register`), ao autenticar o usuário:
  - É gerado um **JWT** com `jsonwebtoken` (`signJwt`).
  - O token é enviado como **cookie**.
- Em rotas protegidas (`/api/summary`, `/api/transactions`, etc.):
  - O token é lido do cookie;
  - Validado com `verifyJwt`;
  - O `userId` extraído do token é usado pelo Prisma para filtrar os dados do usuário.

---

## ✅ Validação com Zod

Os schemas Zod (em `lib/validators.ts`) garantem que os dados recebidos são válidos antes de serem processados:

- `loginSchema` — valida email e senha;
- `registerSchema` — valida nome, email, senha;
- `transactionSchema` — valida criação de transações;
- `categorySchema` — valida criação de categorias.

Essa validação é usada tanto no **frontend** (antes de chamar a API) quanto no **backend** (nas rotas `/api`), aumentando a segurança e robustez da aplicação.

---

## 📜 Licença

Este projeto pode ser usado como base de estudos ou como boilerplate para sistemas de controle financeiro em Next.js.  
Adapte, melhore e personalize conforme suas necessidades.

---
