# PR Summary: Refatoração Core e Unificação do Sistema

## Objetivo da refatoração
Este PR implementa a essencialização da navegação e a unificação do sistema Equilibri.IA, com foco em três objetivos principais:
1. Simplificar a navegação com rotas essenciais (/chat, /dashboard, /settings, /agenda)
2. Implementar sistema de planos claros (Free, Premium, Premium Clínico)
3. Criar sistema de agenda integrada para sessões com psicóloga

## Principais alterações

### 1. Novo sistema de rotas
- `/chat`: Centralização de toda interação com a Lari (texto/voz/check-in)
- `/dashboard`: Visualização de mood-chart, destaques e relatórios PDF
- `/settings`: Gerenciamento de plano, upgrade e configurações de privacidade
- `/agenda`: Reserva de sessões mensais (exclusivo para plano Premium Clínico)
- `/admin/agenda`: Gerenciamento de slots (apenas para usuários com role 'therapist')

### 2. Banco de dados
- Nova estrutura relacional para suportar sistema de agenda:
  - `therapists`: Registros das psicólogas cadastradas
  - `slots`: Horários disponibilizados para agendamento
  - `appointments`: Reservas de sessões
- Policies configuradas para garantir acesso seguro:
  - Usuários só veem slots disponíveis
  - Psicólogas só veem/gerenciam seus próprios slots

### 3. Sistema de planos
- **Free**:
  - 30 mensagens/mês
  - Plano terapêutico básico
- **Premium**:
  - Chat ilimitado
  - Relatórios PDF para terapeuta
- **Premium Clínico**:
  - Todos benefícios do Premium
  - 1 sessão mensal de 60 min com psicóloga

### 4. Limites e verificações
- Implementado contador de mensagens para plano Free
- Bloqueio de envio após 30 mensagens com modal para upgrade
- Função serverless para resetar limites mensalmente
- Verificação de uso da sessão mensal no plano Clinical

### 5. Agenda integrada
- Interface de usuário para reserva de horários
- Interface administrativa para psicólogas cadastrarem disponibilidade
- Integração com Google Calendar para criar evento e link do Meet

### 6. UI/UX
- Componente WhyNotGPT mostrando diferencial em relação ao ChatGPT
- Banners informativos sobre cada plano
- Indicadores de uso de recursos (mensagens utilizadas, sessão agendada)

## Testes pendentes
- [ ] Fluxo completo de criação de slots pela psicóloga
- [ ] Reserva de slots por usuários Premium Clínico
- [ ] Visibilidade correta dos slots entre diferentes usuários
- [ ] Funcionamento dos limites de chat (30 mensagens)
- [ ] Geração de PDF no plano Premium
- [ ] Reset de contadores mensais

## Notas técnicas
- A integração com Google Calendar está implementada conceitualmente, mas necessita das credenciais reais para funcionar
- O upgrade de plano está simulado, pendente de integração com gateway de pagamento

## Próximos passos
- Implementar testes automatizados para os novos componentes
- Refinamento visual da UI conforme feedback de usuários
- Melhorar experiência mobile
- Integração com gateway de pagamento para processamento real de assinaturas 