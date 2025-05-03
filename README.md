# DiarioTer - README

## Sobre o Projeto

DiarioTer é um aplicativo web de terapia que permite aos usuários registrar entradas de diário, fazer check-ins emocionais, gravar áudios e receber análises terapêuticas baseadas em abordagens validadas como TCC (Terapia Cognitivo-Comportamental), ACT (Terapia de Aceitação e Compromisso) e DBT (Terapia Comportamental Dialética).

## Tecnologias Utilizadas

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Autenticação e Banco de Dados)
- **Análise Terapêutica**: OpenAI GPT-4o e Whisper
- **Pagamentos**: Mercado Pago
- **Deploy**: Vercel

## Problemas Corrigidos na Versão Atual

Esta versão inclui correções importantes para problemas de autenticação que surgiram com a atualização para o Next.js 15:

1. **API cookies() assíncrona**: 
   - O Next.js 15 alterou a função `cookies()` de síncrona para assíncrona, o que quebrou toda a integração com Supabase
   - Refatoramos todos os clientes Supabase para trabalhar com cookies assíncronos

2. **Refatoração do Supabase Client**:
   - Atualização de `src/lib/supabase/server.ts` para tornar `createClient` e `createRouteClient` funções assíncronas
   - Atualização de `src/lib/supabase/server-queries.ts` para tornar `createServerSupabaseClient` assíncrono
   - Correção de rotas da API que usam esses clientes: analyze, auth/callback, reports/weekly, técnicas, etc.

3. **Problemas de tipagem MercadoPago**:
   - Adição de comentários `@ts-ignore` nos arquivos relacionados a pagamentos para suprimir erros de tipo com a integração MercadoPago
   - Arquivos corrigidos: webhook/route.ts, subscription/route.ts e create-preference/route.ts

4. **Correção de acesso a propriedades**:
   - Resolução de acesso incorreto às propriedades 'patterns' e 'effectiveness' em techniques/recommend/route.ts
   - Adição de verificação de tipo adequada
   - Renomeação de 'effectiveness' para 'effectiveness_rating'

5. **Dependências**:
   - Instalação do pacote `@web-std/file` para corrigir a transcrição de áudio em transcribe/route.ts

## Funcionalidades Principais

- **Diário Terapêutico**: Registro de pensamentos e emoções com análise terapêutica
- **Check-ins Emocionais**: Registro rápido de emoções, intensidade e gatilhos
- **Diário em Áudio**: Gravação e transcrição de áudio com análise terapêutica
- **Relatórios Semanais**: Análise de padrões emocionais e recomendações personalizadas
- **Técnicas Terapêuticas**: Biblioteca de técnicas baseadas em evidências
- **Plano Premium**: Acesso ilimitado a todas as funcionalidades

## Estrutura do Projeto

```
diarioter/
├── migrations/              # Migrações do banco de dados
├── public/                  # Arquivos estáticos
├── src/
│   ├── app/                 # Páginas da aplicação (Next.js App Router)
│   │   ├── api/             # Rotas de API
│   │   ├── app/             # Área autenticada
│   │   ├── login/           # Página de login
│   │   ├── register/        # Página de registro
│   │   └── page.tsx         # Página inicial (landing page)
│   ├── components/          # Componentes reutilizáveis
│   │   └── ui/              # Componentes de interface
│   ├── hooks/               # Hooks personalizados
│   ├── lib/                 # Bibliotecas e utilitários
│   │   ├── openai.ts        # Integração com OpenAI
│   │   └── supabase/        # Integração com Supabase
│   └── types/               # Definições de tipos TypeScript
├── .env.local               # Variáveis de ambiente (não versionado)
├── jest.config.js           # Configuração de testes
├── next.config.js           # Configuração do Next.js
├── package.json             # Dependências e scripts
├── tailwind.config.js       # Configuração do Tailwind CSS
└── vercel.json              # Configuração de deploy na Vercel
```

## Instalação e Execução Local

1. Clone o repositório
   ```
   git clone https://github.com/EduardoSousaPO/diario-ter.git
   cd diario-ter
   ```
2. Instale as dependências:
   ```
   npm install
   ```
3. Configure as variáveis de ambiente no arquivo `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua-url-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-supabase
   OPENAI_API_KEY=sua-chave-api-openai
   MERCADO_PAGO_ACCESS_TOKEN=seu-token-mercado-pago
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
4. Execute o servidor de desenvolvimento:
   ```
   npm run dev
   ```
5. Acesse `http://localhost:3000` no navegador

## Deploy

Para instruções detalhadas sobre como fazer o deploy do DiarioTer, consulte o arquivo [deploy-docs.md](./deploy-docs.md).

## Testes

Execute os testes automatizados:
```
npm test
```

## Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.
