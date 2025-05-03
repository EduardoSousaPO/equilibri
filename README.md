# DiarioTer - README

## Sobre o Projeto

DiarioTer é um aplicativo web de terapia que permite aos usuários registrar entradas de diário, fazer check-ins emocionais, gravar áudios e receber análises terapêuticas baseadas em abordagens validadas como TCC (Terapia Cognitivo-Comportamental), ACT (Terapia de Aceitação e Compromisso) e DBT (Terapia Comportamental Dialética).

## Tecnologias Utilizadas

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Autenticação e Banco de Dados)
- **Análise Terapêutica**: OpenAI GPT-4o e Whisper
- **Pagamentos**: Mercado Pago
- **Deploy**: Vercel

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
