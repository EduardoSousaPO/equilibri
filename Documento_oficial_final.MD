# Equilibri.IA

> **Seu terapeuta digital com um toque humano.**

O Equilibri.IA é um aplicativo de saúde emocional que une o poder da inteligência artificial empática com o acompanhamento humano de uma psicóloga real. Através de uma interface simples e unificada, o usuário pode registrar suas emoções, acompanhar seu progresso, receber planos terapêuticos personalizados e, no plano clínico, participar de uma sessão mensal com psicóloga parceira.

---

## 🧠 Funcionalidades Principais

### 1. Chat com a Lari (IA empática)
- Entrada de texto e voz em um único fluxo.
- Respostas humanizadas com base em TCC, ACT e DBT e logoterapia.
- Registro automático no histórico.
- Check-in emocional rápido por emojis.
- Zero-state amigável: primeiro contato guiado com a IA.

### 2. Plano Terapêutico Dinâmico
- Criado após 7 interações com a Lari.
- Duração de 4 semanas com 2 microtarefas diárias.
- Acompanhamento automático por semana.
- Interface com tarefas do dia e progresso visual.

### 3. Dashboard de Emoções
- Gráfico de humor dos últimos 30 dias.
- Destaques (dias mais positivos/negativos).
- Relatório em PDF (apenas Premium).
- Card de zero-state se não houver dados.

### 4. Sessão com Psicóloga (Premium Clínico)
- 1 sessão de 1 hora/mês via Google Meet.
- Acesso à **/agenda** para agendar horário disponível.
- Psicóloga acompanha interações do mês antes da consulta.
- Página **/admin/agenda** exclusiva para psicóloga cadastrar horários.

### 5. Gamificação e Limites
- Plano Free: 30 mensagens por mês.
- Plano Premium: ilimitado + exportação PDF.
- Plano Premium Clínico: tudo do Premium + 1 sessão de 1 hora/mês.
- Contador de mensagens e bloqueio automático no Free.
- Reset mensal automático dos contadores.
- Badges de progresso e streaks semanais.

---

## 📦 Pacotes e Planos

| Plano             | R$ Mensal | Recursos Inclusos                                                                 |
|-------------------|-----------|------------------------------------------------------------------------------------|
| **Free**          | R$ 0      | • 30 mensagens/mês<br>• Check-in emocional<br>• Plano Terapêutico<br>• Dashboard |
| **Premium**       | R$ 39,90  | Tudo do Free +<br>• Mensagens ilimitadas<br>• Relatório PDF                      |
| **Premium Clínico** | R$ 159,00 | Tudo do Premium +<br>• 1 sessão mensal de 1 hora com psicóloga via Google Meet   |

---

## 🔁 Fluxos do Usuário

### A. Primeira Experiência
1. Cadastro (nome, email, senha).
2. Check-in emocional rápido (emoji).
3. Acesso imediato ao chat com a Lari.
4. A cada interação, a Lari armazena emoções e conversa.

### B. Evolução
- Após 3 mensagens: Lari pergunta objetivo → gera plano de 4 semanas.
- Usuário recebe tarefas diárias.
- Dashboard começa a gerar insights visuais.
- Ao atingir 30 mensagens no plano Free → bloqueio + sugestão de upgrade.

### C. Sessão com Psicóloga (Premium Clínico)
1. Usuário acessa `/agenda`.
2. Escolhe horário disponível pré-definido pela profissional.
3. Recebe link Google Meet da sessão.
4. Sessão ocorre; psicóloga pode anotar insights para ajustar plano.
5. No próximo mês, novo agendamento disponível.

---

## 🔧 Stack Tecnológica

| Camada         | Tecnologia                   |
|----------------|------------------------------|
| **Front-end**  | Next.js 13 App Router + Tailwind CSS |
| **Back-end**   | Supabase (PostgreSQL + Auth + Edge Functions) |
| **IA (Lari)**  | OpenAI GPT-4o-mini ou LLM open-source (Mixtral / Llama 3 70B) |
| **Voz**        | `whisper.cpp` (transcrição local) |
| **Agenda**     | Tabelas Supabase `slots`, `appointments`, `therapists` |
| **Calendário** | Google Calendar API / Meet API |
| **PDF**        | `pdfkit` ou `puppeteer` para exportação de relatório |
| **Deploy**     | Vercel (front-end) + RunPod ou Brev.dev (LLM Inference) |

---

## 🔐 Segurança e Privacidade

- Dados armazenados em Supabase com criptografia.
- Sessões clínicas são confidenciais.
- Agenda visível apenas ao usuário autenticado e planos compatíveis.
- Política LGPD presente e destacada.

---

## 🔍 Comparativo com ChatGPT

| Recurso                                    | Equilibri.IA | ChatGPT |
|-------------------------------------------|--------------|---------|
| Memória emocional contínua                | ✔            | ✖       |
| Plano Terapêutico personalizado           | ✔            | ✖       |
| Gráfico de humor e relatório PDF          | ✔            | ✖       |
| Sessão mensal com psicólogo humano        | ✔            | ✖       |
| Rastreio automático de progresso          | ✔            | ✖       |
| Empatia afinada para saúde emocional      | ✔            | ✖       |

---

## 🚀 Projeção de Crescimento

- Capacidade atual (1 psicóloga): até 40 usuários no plano clínico.
- Estratégia de aquisição: marketing orgânico, reels semanais, indicações in-app.
- Upgrade de Free → Premium estimado: 5–8 % com fluxo atual.

---

## 📄 Futuras Expansões

- Abrir portal para psicólogos parceiros externos.
- Sessões sob demanda com fila de disponibilidade.
- Tradução e internacionalização.
- App mobile PWA e push diário nativo.

---

## 📥 Contato e Suporte

- Dúvidas ou feedback? Contate: suporte@equilibri.app  
- Termos e privacidade: [equilibri.app/termos](https://equilibri.app/termos)  

---

© 2025 Equilibri.IA – Tecnologia e empatia guiando sua jornada emocional.
