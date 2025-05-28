-- Criar tabela para armazenar análises de interações
CREATE TABLE interaction_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_id UUID NOT NULL,
    cognitive_automatic_thoughts TEXT[],
    cognitive_distortions TEXT[],
    cognitive_core_beliefs TEXT[],
    values_areas TEXT[],
    values_conflicts TEXT[],
    values_purpose_crisis BOOLEAN,
    emotional_intensity INTEGER CHECK (emotional_intensity BETWEEN 1 AND 5),
    emotional_coping_strategies TEXT[],
    emotional_triggers TEXT[],
    behavioral_avoidance TEXT[],
    behavioral_functional TEXT[],
    behavioral_dysfunctional TEXT[],
    behavioral_context TEXT[],
    engagement_insight INTEGER CHECK (engagement_insight BETWEEN 1 AND 5),
    engagement_motivation INTEGER CHECK (engagement_motivation BETWEEN 1 AND 5),
    engagement_interventions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_message FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX idx_interaction_analyses_user_id ON interaction_analyses(user_id);
CREATE INDEX idx_interaction_analyses_message_id ON interaction_analyses(message_id);
CREATE INDEX idx_interaction_analyses_created_at ON interaction_analyses(created_at);

-- Criar view para facilitar análises agregadas
CREATE VIEW interaction_analyses_summary AS
SELECT 
    user_id,
    COUNT(*) as total_interactions,
    AVG(emotional_intensity) as avg_emotional_intensity,
    AVG(engagement_insight) as avg_insight_level,
    AVG(engagement_motivation) as avg_motivation,
    COUNT(*) FILTER (WHERE values_purpose_crisis) as purpose_crisis_count,
    array_agg(DISTINCT unnest(cognitive_distortions)) as all_distortions,
    array_agg(DISTINCT unnest(emotional_triggers)) as all_triggers,
    array_agg(DISTINCT unnest(values_areas)) as all_valued_areas
FROM interaction_analyses
GROUP BY user_id; 