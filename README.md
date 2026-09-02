# Grana+

Aplicação de finanças pessoais criada exclusivamente para o público brasileiro. O Grana+ reúne contas, cartões, parcelas, orçamento e metas em uma experiência clara, acessível e responsiva.

> Em desenvolvimento. Esta etapa contém a fundação técnica e visual; autenticação, banco de dados e funcionalidades financeiras serão adicionados nas próximas etapas.

## Princípios do produto

- Interface e conteúdo em português do Brasil
- Valores em Real (R$) e datas no padrão brasileiro
- Cadastro financeiro manual, com privacidade e controle do usuário
- Indicadores e ativos tradicionais brasileiros, sem criptoativos
- Acessibilidade, responsividade e segurança desde a fundação

## Stack atual

- Next.js 16 com App Router
- React 19
- TypeScript em modo estrito
- Tailwind CSS 4
- ESLint

## Executar localmente

Requisitos: Node.js 20.9 ou superior e npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse `http://localhost:3000`.

## Comandos

```bash
npm run dev       # ambiente local
npm run lint      # análise estática
npm run build     # build de produção
npm run start     # servidor de produção
```

## Próximas etapas

1. Supabase Auth, esquema Postgres e RLS
2. Onboarding e dashboard autenticado
3. Contas, cartões, faturas e parcelas
4. Orçamentos, metas e relatórios
5. Dados oficiais de mercado via backend
6. Testes, CI/CD e produção na Vercel

## Segurança

Não armazene segredos no repositório. Copie `.env.example` para `.env.local` e mantenha credenciais apenas no ambiente local ou na plataforma de deploy.

## Licença

[MIT](LICENSE) © 2026 Jackson Jean
