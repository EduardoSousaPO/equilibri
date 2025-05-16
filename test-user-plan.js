// Script para verificar o plano do usuário
const { createClient } = require('@supabase/supabase-js');

// Configuração do cliente Supabase
const supabaseUrl = 'https://wazpvqchpwzhaynwujtf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhenB2cWNocHd6aGF5bnd1anRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI0MTUwNjAsImV4cCI6MjAyNzk5MTA2MH0.rzpKSTuHCRqwTp0XOh80oWDPAWw8-om69hDZU5Q8BdA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserPlan() {
  try {
    // Buscar perfil do usuário
    const { data, error } = await supabase
      .from('profiles')
      .select('plan, session_used')
      .eq('email', 'eduspires123@gmail.com')
      .single();
    
    if (error) {
      console.error('Erro ao buscar perfil:', error);
      return;
    }
    
    console.log('Informações do usuário:');
    console.log('Plano:', data.plan);
    console.log('Sessão já utilizada:', data.session_used);
    
    // Verificar se o plano é clinical
    if (data.plan === 'clinical') {
      console.log('✅ O usuário tem o plano Premium Clínico!');
    } else {
      console.log('❌ O usuário NÃO tem o plano Premium Clínico.');
      
      // Atualizar para o plano clinical
      console.log('Atualizando para o plano Premium Clínico...');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ plan: 'clinical', session_used: false })
        .eq('email', 'eduspires123@gmail.com');
      
      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
      } else {
        console.log('✅ Usuário atualizado para o plano Premium Clínico com sucesso!');
      }
    }
  } catch (err) {
    console.error('Erro:', err);
  }
}

checkUserPlan(); 