# Grana+

Aplicação de finanças pessoais criada exclusivamente para o público brasileiro. O Grana+ reúne contas, cartões, parcelas, orçamento e metas em uma experiência clara, acessível e responsiva.

> Em desenvolvimento. A fundação técnica, o banco de dados e a infraestrutura de autenticação já estão configurados; as telas funcionais serão adicionadas nas próximas etapas.

## Princípios do produto

- Interface e conteúdo em português do Brasil
- Valores em Real (R$) e datas no padrão brasileiro
- Cadastro financeiro manual, com privacidade e controle do usuário
- Indicadores econômicos oficiais e ativos tradicionais brasileiros
- Acessibilidade, responsividade e segurança desde a fundação

## Stack atual

- Next.js 16 com App Router
- React 19
- TypeScript em modo estrito
- Tailwind CSS 4
- ESLint
- Supabase Auth, Postgres e Row Level Security
- Zod para validação de configuração e formulários

## Banco de dados

O schema financeiro é reproduzível pelas migrations em `supabase/migrations`. As 16 tabelas públicas usam RLS e chaves compostas de propriedade para impedir relações entre dados de usuários diferentes.

O cadastro de um usuário cria automaticamente seu perfil e 14 categorias brasileiras iniciais. Compras parceladas geram parcelas e faturas futuras de forma transacional, incluindo o ajuste de centavos na última parcela.

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

1. Telas de autenticação, onboarding e dashboard
2. Contas, cartões, faturas e parcelas
3. Orçamentos, metas e relatórios
4. Dados oficiais de mercado via backend
5. Testes, CI/CD e produção na Vercel

## Segurança

Não armazene segredos no repositório. Copie `.env.example` para `.env.local` e mantenha credenciais apenas no ambiente local ou na plataforma de deploy.

## Licença

[MIT](LICENSE) © 2026 Jackson Jean
