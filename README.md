# Equilibri.IA - Seu terapeuta digital com um toque humano

## Sobre o Projeto

Equilibri.IA é um aplicativo web de terapia que proporciona uma experiência de chat acolhedora com a AI "Lari", permitindo aos usuários registrar entradas de diário, fazer check-ins emocionais, gravar áudios e receber análises terapêuticas baseadas em abordagens validadas como TCC (Terapia Cognitivo-Comportamental), ACT (Terapia de Aceitação e Compromisso) e DBT (Terapia Comportamental Dialética).

## Tecnologias Utilizadas

- **Frontend**: Next.js 13, TypeScript, Tailwind CSS
- **Backend**: Supabase (Autenticação e Banco de Dados)
- **AI Terapêutico**: OpenAI GPT-4o-mini
- **Pagamentos**: Mercado Pago
- **Deploy**: Vercel

## Funcionalidades Principais

- **Chat Terapêutico**: Converse com Lari, nossa IA empática e profissional
- **Diário Terapêutico**: Registro de pensamentos e emoções com análise terapêutica
- **Check-ins Emocionais**: Registro rápido de emoções, intensidade e gatilhos
- **Diário em Áudio**: Gravação e transcrição de áudio com análise terapêutica
- **Relatórios Semanais**: Análise de padrões emocionais e recomendações personalizadas
- **Técnicas Terapêuticas**: Biblioteca de técnicas baseadas em evidências
- **Plano Premium**: Acesso ilimitado a todas as funcionalidades

## Estrutura do Projeto

```
equilibri-ia/
├── migrations/              # Migrações do banco de dados
├── public/                  # Arquivos estáticos
│   ├── logo.svg             # Logo principal da Equilibri.IA
│   └── favicon.svg          # Favicon
├── src/
│   ├── app/                 # Páginas da aplicação (Next.js App Router)
│   │   ├── api/             # Rotas de API
│   │   │   └── chat/        # API para o chat com a Lari
│   │   ├── app/             # Área autenticada
│   │   ├── chat/            # Página de chat com a Lari
│   │   ├── login/           # Página de login
│   │   ├── register/        # Página de registro
│   │   └── page.tsx         # Página inicial (landing page)
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/              # Componentes de interface
│   │   ├── chat/            # Componentes específicos para o chat
│   │   └── layout/          # Componentes de layout (navbar, etc)
│   ├── hooks/               # Hooks personalizados
│   ├── lib/                 # Bibliotecas e utilitários
│   │   ├── lari.ts          # Serviço da IA terapeuta Lari
│   │   ├── openai.ts        # Integração com OpenAI
│   │   └── supabase/        # Integração com Supabase
│   └── types/               # Definições de tipos TypeScript
├── .env.local               # Variáveis de ambiente (não versionado)
├── next.config.js           # Configuração do Next.js
├── package.json             # Dependências e scripts
├── tailwind.config.js       # Configuração do Tailwind CSS
└── vercel.json              # Configuração de deploy na Vercel
```

## Instalação e Execução Local

1. Clone o repositório
   ```
   git clone https://github.com/EduardoSousaPO/equilibri.git
   cd equilibri
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

Para fazer o deploy do Equilibri.IA na Vercel:

1. Conecte seu repositório Git à Vercel
2. Configure as variáveis de ambiente mencionadas acima
3. A Vercel detectará automaticamente que é um projeto Next.js e o construirá adequadamente

## Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.
