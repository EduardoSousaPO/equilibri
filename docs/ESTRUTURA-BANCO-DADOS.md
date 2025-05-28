# Documentação do Banco de Dados - Equilibri.IA

Este documento detalha a estrutura completa do banco de dados usado pela aplicação Equilibri.IA, incluindo todas as tabelas, colunas, tipos de dados e relações.

## Índice de Tabelas

1. [appointments](#appointments) - Agendamentos de sessões terapêuticas
2. [audio_entries](#audio_entries) - Entradas de áudio gravadas pelos usuários
3. [audio_transcriptions](#audio_transcriptions) - Transcrições de arquivos de áudio
4. [chat_messages](#chat_messages) - Mensagens trocadas no chat com a IA
5. [emotion_checkins](#emotion_checkins) - Registros de emoções dos usuários
6. [journal_entries](#journal_entries) - Entradas de diário dos usuários
7. [payment_attempts](#payment_attempts) - Tentativas de pagamento
8. [payments](#payments) - Pagamentos realizados
9. [profiles](#profiles) - Perfis de usuários
10. [resource_usage](#resource_usage) - Uso de recursos por usuário
11. [slots](#slots) - Horários disponíveis para agendamento
12. [subscriptions](#subscriptions) - Assinaturas de usuários
13. [system_logs](#system_logs) - Logs do sistema
14. [task_completions](#task_completions) - Conclusões de tarefas terapêuticas
15. [therapists](#therapists) - Informações sobre terapeutas
16. [therapy_goals](#therapy_goals) - Metas terapêuticas
17. [therapy_plans](#therapy_plans) - Planos terapêuticos
18. [therapy_tasks](#therapy_tasks) - Tarefas terapêuticas
19. [therapy_techniques](#therapy_techniques) - Técnicas terapêuticas
20. [user_badges](#user_badges) - Conquistas dos usuários
21. [user_reports](#user_reports) - Relatórios gerados para usuários
22. [user_settings](#user_settings) - Configurações dos usuários
23. [user_streaks](#user_streaks) - Sequências de uso dos usuários
24. [user_techniques](#user_techniques) - Técnicas favoritas/usadas pelos usuários
25. [weekly_reports](#weekly_reports) - Relatórios semanais gerados

## Detalhamento das Tabelas

### appointments

Tabela de agendamentos de sessões terapêuticas entre usuários e terapeutas.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único do agendamento |
| slot_id | uuid | Referência ao slot (horário) agendado |
| user_id | uuid | Referência ao usuário que agendou |
| meet_link | text | Link para a reunião online |
| notes | text | Notas sobre o agendamento |
| created_at | timestamptz | Data e hora de criação do registro |
| updated_at | timestamptz | Data e hora da última atualização |

### audio_entries

Registros de áudio gravados pelos usuários.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único da entrada de áudio |
| user_id | uuid | Referência ao usuário que criou |
| audio_url | text | URL do arquivo de áudio armazenado |
| title | text | Título da entrada de áudio |
| duration | integer | Duração do áudio em segundos |
| transcription | text | Transcrição do conteúdo do áudio |
| created_at | timestamptz | Data e hora de criação |
| updated_at | timestamptz | Data e hora da última atualização |
| mood_score | integer | Pontuação de humor (1-10) |
| analysis | jsonb | Análise do conteúdo em formato JSON |
| is_favorite | boolean | Marcado como favorito pelo usuário |
| tags | array | Lista de tags associadas |

### audio_transcriptions

Tabela separada para transcrições de áudio.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único da transcrição |
| user_id | uuid | Referência ao usuário proprietário |
| audio_url | text | URL do arquivo de áudio original |
| transcription | text | Texto transcrito do áudio |
| created_at | timestamptz | Data e hora de criação |

### chat_messages

Mensagens trocadas entre usuários e a IA.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único da mensagem |
| user_id | uuid | Referência ao usuário da conversa |
| content | text | Conteúdo da mensagem |
| role | text | Papel do emissor (user/assistant) |
| created_at | timestamptz | Data e hora de criação |

### emotion_checkins

Registros de emoções e sentimentos dos usuários.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único do check-in |
| user_id | uuid | Referência ao usuário |
| emotion | text | Emoção registrada (ex: feliz, triste) |
| intensity | integer | Intensidade da emoção (1-10) |
| note | text | Nota ou comentário sobre a emoção |
| created_at | timestamptz | Data e hora do registro |
| triggers | array | Lista de gatilhos que causaram a emoção |

### journal_entries

Entradas de diário dos usuários.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único da entrada |
| user_id | uuid | Referência ao usuário |
| content | text | Conteúdo da entrada de diário |
| title | text | Título da entrada |
| created_at | timestamptz | Data e hora de criação |
| updated_at | timestamptz | Data e hora da última atualização |
| mood_score | integer | Pontuação de humor (1-10) |
| analysis | jsonb | Análise do conteúdo em formato JSON |
| is_favorite | boolean | Marcado como favorito pelo usuário |
| tags | array | Lista de tags associadas |

### payment_attempts

Tentativas de pagamento realizadas.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único da tentativa |
| user_id | uuid | Referência ao usuário |
| plan_id | text | ID do plano escolhido |
| amount | numeric | Valor da tentativa de pagamento |
| preference_id | text | ID da preferência no gateway de pagamento |
| payment_id | text | ID do pagamento no gateway |
| status | text | Status da tentativa (ex: pending, approved) |
| created_at | timestamptz | Data e hora da tentativa |
| updated_at | timestamptz | Data e hora da última atualização |

### payments

Pagamentos concluídos.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único do pagamento |
| user_id | uuid | Referência ao usuário |
| external_id | text | ID externo no gateway de pagamento |
| amount | numeric | Valor pago |
| currency | text | Moeda utilizada (ex: BRL) |
| status | text | Status do pagamento |
| payment_method | text | Método de pagamento utilizado |
| created_at | timestamptz | Data e hora do pagamento |
| updated_at | timestamptz | Data e hora da última atualização |
| subscription_id | uuid | Referência à assinatura relacionada |
| description | text | Descrição do pagamento |

### profiles

Perfis de usuários da plataforma.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único do perfil (igual ao auth.users) |
| name | text | Nome do usuário |
| email | text | Email do usuário |
| avatar_url | text | URL da imagem de perfil |
| plan | text | Plano atual (free, premium, clinical) |
| msg_count | integer | Contador de mensagens enviadas |
| created_at | timestamptz | Data e hora de criação da conta |
| updated_at | timestamptz | Data e hora da última atualização |

### resource_usage

Controle de uso de recursos por usuário.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único do registro |
| user_id | uuid | Referência ao usuário |
| resource_type | text | Tipo de recurso (ex: transcription, chat) |
| month | date | Mês de referência (YYYY-MM) |
| count | integer | Quantidade utilizada |
| created_at | timestamptz | Data e hora de criação |
| updated_at | timestamptz | Data e hora da última atualização |

### slots

Horários disponíveis para agendamento com terapeutas.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único do horário |
| therapist_id | uuid | Referência ao terapeuta |
| start_utc | timestamptz | Horário de início (UTC) |
| end_utc | timestamptz | Horário de término (UTC) |
| status | text | Status (available, booked, cancelled) |
| created_at | timestamptz | Data e hora de criação |
| updated_at | timestamptz | Data e hora da última atualização |

### subscriptions

Assinaturas de usuários.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único da assinatura |
| user_id | uuid | Referência ao usuário |
| external_id | text | ID externo no sistema de pagamento |
| plan | text | Tipo de plano assinado |
| status | text | Status da assinatura (active, cancelled, etc) |
| period | text | Período da assinatura (monthly, yearly) |
| created_at | timestamptz | Data e hora de criação |
| next_billing_date | timestamptz | Data da próxima cobrança |
| payment_method | text | Método de pagamento utilizado |
| metadata | jsonb | Metadados adicionais em formato JSON |

### system_logs

Registros de eventos do sistema.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único do log |
| event | text | Tipo de evento registrado |
| details | jsonb | Detalhes do evento em formato JSON |
| created_at | timestamptz | Data e hora do evento |

### task_completions

Registro de tarefas terapêuticas concluídas.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único do registro |
| task_id | uuid | Referência à tarefa concluída |
| user_id | uuid | Referência ao usuário |
| completed_at | timestamptz | Data e hora da conclusão |
| feedback | text | Feedback do usuário sobre a tarefa |
| difficulty_rating | integer | Avaliação de dificuldade (1-5) |
| effectiveness_rating | integer | Avaliação de eficácia (1-5) |
| notes | text | Notas adicionais do usuário |

### therapists

Informações sobre terapeutas da plataforma.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único do terapeuta |
| user_id | uuid | Referência ao usuário (se aplicável) |
| name | text | Nome do terapeuta |
| crp | text | Número de registro profissional |
| timezone | text | Fuso horário do terapeuta |
| calendar_credentials | jsonb | Credenciais de integração com calendário |
| created_at | timestamptz | Data e hora de criação |
| updated_at | timestamptz | Data e hora da última atualização |

### therapy_goals

Metas terapêuticas dos usuários.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único da meta |
| user_id | uuid | Referência ao usuário |
| title | text | Título da meta |
| description | text | Descrição detalhada |
| created_at | timestamptz | Data e hora de criação |
| updated_at | timestamptz | Data e hora da última atualização |
| status | text | Status da meta (active, completed, abandoned) |
| progress | integer | Progresso em porcentagem (0-100) |
| target_date | date | Data alvo para atingir a meta |
| completed_at | timestamptz | Data e hora da conclusão (se completa) |

### therapy_plans

Planos terapêuticos personalizados.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único do plano |
| user_id | uuid | Referência ao usuário |
| title | text | Título do plano |
| description | text | Descrição detalhada |
| start_date | date | Data de início |
| end_date | date | Data de término prevista |
| duration_weeks | integer | Duração em semanas |
| status | text | Status do plano (active, completed, abandoned) |
| progress | integer | Progresso em porcentagem (0-100) |
| created_at | timestamptz | Data e hora de criação |
| updated_at | timestamptz | Data e hora da última atualização |

### therapy_tasks

Tarefas terapêuticas associadas a planos.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único da tarefa |
| plan_id | uuid | Referência ao plano terapêutico |
| title | text | Título da tarefa |
| description | text | Descrição detalhada |
| task_type | text | Tipo de tarefa |
| week_number | integer | Semana do plano em que deve ser realizada |
| day_number | integer | Dia da semana em que deve ser realizada |
| estimated_minutes | integer | Tempo estimado para conclusão (min) |
| instructions | array | Lista de instruções para realização |
| created_at | timestamptz | Data e hora de criação |

### therapy_techniques

Catálogo de técnicas terapêuticas.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único da técnica |
| name | text | Nome da técnica |
| description | text | Descrição detalhada |
| category | text | Categoria (ex: CBT, mindfulness) |
| instructions | array | Lista de instruções de uso |
| benefits | array | Lista de benefícios |

### user_badges

Conquistas e badges dos usuários.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único do registro |
| user_id | uuid | Referência ao usuário |
| badge_type | text | Tipo de badge |
| badge_name | text | Nome da conquista |
| description | text | Descrição da conquista |
| earned_at | timestamptz | Data e hora em que foi conquistada |
| icon | text | Emoji ou código do ícone |

### user_reports

Relatórios gerados para usuários.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único do relatório |
| user_id | uuid | Referência ao usuário |
| title | text | Título do relatório |
| path | text | Caminho do arquivo (se exportado) |
| created_at | timestamptz | Data e hora de criação |

### user_settings

Configurações pessoais dos usuários.

| Nome | Tipo | Descrição |
|------|------|-----------|
| user_id | uuid | Referência ao usuário (chave primária) |
| theme | text | Tema preferido (light, dark) |
| notifications_enabled | boolean | Notificações habilitadas |
| email_notifications | boolean | Notificações por email habilitadas |
| reminder_time | time | Horário preferido para lembretes |
| reminder_days | array | Dias da semana para lembretes |
| language | text | Idioma preferido |
| created_at | timestamptz | Data e hora de criação |
| updated_at | timestamptz | Data e hora da última atualização |

### user_streaks

Sequências de uso e engajamento dos usuários.

| Nome | Tipo | Descrição |
|------|------|-----------|
| user_id | uuid | Referência ao usuário (chave primária) |
| current_checkin_streak | integer | Sequência atual de check-ins |
| longest_checkin_streak | integer | Sequência mais longa de check-ins |
| current_task_streak | integer | Sequência atual de tarefas |
| longest_task_streak | integer | Sequência mais longa de tarefas |
| last_checkin_date | date | Data do último check-in |
| last_task_date | date | Data da última tarefa completada |
| updated_at | timestamptz | Data e hora da última atualização |

### user_techniques

Relação entre usuários e técnicas terapêuticas.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único do registro |
| user_id | uuid | Referência ao usuário |
| technique_id | uuid | Referência à técnica |
| is_favorite | boolean | Marcada como favorita |
| times_used | integer | Número de vezes utilizada |
| last_used | timestamptz | Data e hora do último uso |
| effectiveness_rating | integer | Avaliação de eficácia (1-5) |
| notes | text | Notas pessoais do usuário |

### weekly_reports

Relatórios semanais gerados pelo sistema.

| Nome | Tipo | Descrição |
|------|------|-----------|
| id | uuid | Identificador único do relatório |
| user_id | uuid | Referência ao usuário |
| week_start | date | Data de início da semana |
| week_end | date | Data de fim da semana |
| created_at | timestamptz | Data e hora de criação |
| content | jsonb | Conteúdo do relatório em formato JSON |
| insights | array | Lista de insights principais |
| recommendations | array | Lista de recomendações |
| average_mood | numeric | Média de humor da semana |

## Possíveis Problemas de Autenticação

Analisando a estrutura de dados e o problema de autenticação relatado, é possível que existam divergências entre o esquema do banco de dados e o código da aplicação, principalmente nas seguintes áreas:

1. **Tabela profiles**: 
   - O código pode estar tentando acessar uma coluna `subscription_status` que não existe mais (foi removida conforme a migração mencionada anteriormente).
   - Pode haver incompatibilidade entre os tipos de dados esperados para o campo `plan`.

2. **Sessões de autenticação**: 
   - A configuração do Supabase para autenticação pode estar gerando tokens com tempo de expiração muito curto.
   - Pode haver problemas com os cookies de autenticação no navegador.

3. **Problemas de permissão**:
   - As políticas de segurança do Supabase (RLS - Row Level Security) podem estar impedindo o acesso aos dados após o login.

Recomendações para resolver o problema:

1. Verificar se todas as interfaces e tipos no código correspondem exatamente ao esquema do banco de dados
2. Confirmar se as funções `createServerSupabaseClient` e `createRouteClient` estão implementadas corretamente
3. Revisar as políticas de segurança (RLS) nas tabelas do Supabase
4. Verificar os logs do servidor para identificar erros específicos durante a autenticação
5. Implementar um mecanismo de renovação automática de tokens para evitar desconexões 