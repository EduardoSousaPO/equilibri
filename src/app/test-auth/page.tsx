'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TestAuthPage() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, status: 'success' | 'error', message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, { test, status, message, data, timestamp }]);
  };

  const runTests = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      // Teste 1: Verificar sessão atual
      addResult('SESSION', 'success', 'Verificando sessão atual...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addResult('SESSION', 'error', `Erro: ${sessionError.message}`);
      } else if (session) {
        addResult('SESSION', 'success', `Usuário logado: ${session.user.email}`, { userId: session.user.id });
        
        // Teste 2: Verificar perfil
        addResult('PROFILE', 'success', 'Verificando perfil...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          addResult('PROFILE', 'error', `Erro ao buscar perfil: ${profileError.message}`, { 
            error: profileError,
            userId: session.user.id,
            suggestion: 'Talvez o perfil não tenha sido criado. Tente usar /quick-login para criar automaticamente.'
          });
        } else {
          addResult('PROFILE', 'success', 'Perfil encontrado', profile);
        }
        
        // Teste 3: Verificar uso de recursos
        addResult('RESOURCE_USAGE', 'success', 'Verificando uso de recursos...');
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: usage, error: usageError } = await supabase
          .from('resource_usage')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('resource_type', 'transcription')
          .eq('month', currentMonth)
          .single();
        
        if (usageError && !usageError.message.includes('No rows found')) {
          addResult('RESOURCE_USAGE', 'error', `Erro: ${usageError.message}`);
        } else {
          addResult('RESOURCE_USAGE', 'success', 'Uso de recursos verificado', usage || { count: 0, message: 'Nenhum uso ainda este mês' });
        }
        
        // Teste 4: Testar API de transcrição (simulado)
        addResult('API_TRANSCRIBE', 'success', 'Testando acesso à API de transcrição...');
        
        try {
          const response = await fetch('/api/transcribe', {
            method: 'GET' // Apenas para testar autenticação
          });
          
          if (response.status === 401) {
            addResult('API_TRANSCRIBE', 'error', 'API retorna 401 - problema de autenticação');
          } else if (response.status === 405) {
            addResult('API_TRANSCRIBE', 'success', 'API acessível (retorna 405 Method Not Allowed, o que é esperado para GET)');
          } else {
            addResult('API_TRANSCRIBE', 'success', `API responde com status: ${response.status}`);
          }
        } catch (error: any) {
          addResult('API_TRANSCRIBE', 'error', `Erro ao acessar API: ${error.message}`);
        }
        
      } else {
        addResult('SESSION', 'error', 'Usuário não está logado');
        
        // Teste 4a: Verificar se consegue criar usuário
        addResult('USER_CREATION', 'success', 'Testando criação de usuário...');
        try {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: 'teste@vercel.app',
            password: 'password123'
          });
          
          if (signUpError) {
            if (signUpError.message.includes('already registered')) {
              addResult('USER_CREATION', 'success', 'Email já registrado (usuário existe)', { email: 'teste@vercel.app' });
            } else if (signUpError.message.includes('invalid')) {
              addResult('USER_CREATION', 'error', `Problema com formato do email: ${signUpError.message}`, { 
                suggestion: 'Verifique as configurações de autenticação no Supabase' 
              });
            } else {
              addResult('USER_CREATION', 'error', `Erro na criação: ${signUpError.message}`);
            }
          } else {
            addResult('USER_CREATION', 'success', 'Usuário pode ser criado', signUpData);
          }
        } catch (error: any) {
          addResult('USER_CREATION', 'error', `Erro ao testar criação: ${error.message}`);
        }
        
        // Testar acesso à API sem autenticação
        addResult('API_NO_AUTH', 'success', 'Testando API sem autenticação...');
        try {
          const response = await fetch('/api/transcribe', {
            method: 'GET'
          });
          
          if (response.status === 401) {
            addResult('API_NO_AUTH', 'success', 'API corretamente bloqueia acesso não autenticado (401)');
          } else {
            addResult('API_NO_AUTH', 'error', `API não bloqueia acesso (status: ${response.status})`);
          }
        } catch (error: any) {
          addResult('API_NO_AUTH', 'error', `Erro: ${error.message}`);
        }
      }
      
      // Teste 5: Verificar variáveis de ambiente
      addResult('ENV_VARS', 'success', 'Verificando variáveis de ambiente...');
      const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
      const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      addResult('ENV_VARS', hasSupabaseUrl && hasSupabaseKey ? 'success' : 'error', 
        `Supabase URL: ${hasSupabaseUrl ? '✅' : '❌'}, Supabase Key: ${hasSupabaseKey ? '✅' : '❌'}`, {
          url: hasSupabaseUrl ? 'Configurada' : 'Não configurada',
          key: hasSupabaseKey ? 'Configurada' : 'Não configurada'
        });
      
      // Teste 6: Verificar configurações de auth do Supabase
      addResult('SUPABASE_CONFIG', 'success', 'Verificando configurações do Supabase...');
      
      try {
        // Tentar uma operação simples para verificar se a conexão funciona
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error) {
          if (error.message.includes('relation "profiles" does not exist')) {
            addResult('SUPABASE_CONFIG', 'error', 'Tabela profiles não existe no banco de dados', {
              suggestion: 'Execute as migrações SQL no Supabase SQL Editor'
            });
          } else if (error.message.includes('permission denied')) {
            addResult('SUPABASE_CONFIG', 'error', 'Problema de permissões RLS', {
              suggestion: 'Verifique as políticas RLS na tabela profiles'
            });
          } else {
            addResult('SUPABASE_CONFIG', 'error', `Erro de conexão: ${error.message}`);
          }
        } else {
          addResult('SUPABASE_CONFIG', 'success', 'Conexão com Supabase funcionando');
        }
      } catch (error: any) {
        addResult('SUPABASE_CONFIG', 'error', `Erro ao conectar: ${error.message}`);
      }
      
      // Teste 7: Verificar configurações de Auth do Supabase
      addResult('SUPABASE_AUTH_CONFIG', 'success', 'Verificando configurações de Auth...');
      
      try {
        // Testar a configuração de signup
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: 'config.teste@vercel.app',
          password: 'testpassword123',
          options: {
            data: {
              full_name: 'Test Config User',
            }
          }
        });
        
        if (authError) {
          if (authError.message.includes('Signups not allowed')) {
            addResult('SUPABASE_AUTH_CONFIG', 'error', 'Signups estão desabilitados no Supabase', {
              suggestion: 'Vá para Authentication > Settings no Supabase Dashboard e habilite signups'
            });
          } else if (authError.message.includes('email')) {
            addResult('SUPABASE_AUTH_CONFIG', 'error', `Problema com configuração de email: ${authError.message}`, {
              code: authError.name,
              suggestion: 'Verifique as configurações de SMTP no Supabase'
            });
          } else {
            addResult('SUPABASE_AUTH_CONFIG', 'error', `Erro de configuração: ${authError.message}`, {
              code: authError.name
            });
          }
        } else {
          addResult('SUPABASE_AUTH_CONFIG', 'success', 'Configurações de Auth funcionando corretamente', authData);
        }
      } catch (error: any) {
        addResult('SUPABASE_AUTH_CONFIG', 'error', `Erro ao testar Auth: ${error.message}`);
      }
      
      // Teste 8: Verificar configurações via SQL
      addResult('AUTH_SETTINGS_SQL', 'success', 'Verificando configurações via SQL...');
      
      try {
        const { data: settings, error: settingsError } = await supabase
          .from('auth.config')
          .select('*')
          .limit(1);
        
        if (settingsError) {
          // Se não conseguir acessar auth.config, tentar verificar politicas
          const { data: policies, error: policiesError } = await supabase.rpc('get_auth_settings');
          
          if (policiesError) {
            addResult('AUTH_SETTINGS_SQL', 'error', `Não consegue acessar configurações: ${settingsError.message}`, {
              suggestion: 'Verifique manualmente no Supabase Dashboard > Authentication > Settings'
            });
          } else {
            addResult('AUTH_SETTINGS_SQL', 'success', 'Configurações acessíveis via RPC', policies);
          }
        } else {
          addResult('AUTH_SETTINGS_SQL', 'success', 'Configurações de Auth obtidas', settings);
        }
      } catch (error: any) {
        addResult('AUTH_SETTINGS_SQL', 'error', `Erro ao verificar configurações: ${error.message}`, {
          suggestion: 'Acesse manualmente: Supabase Dashboard > Authentication > Settings'
        });
      }
      
      // Teste específico para debug do signup
      addResult('SIGNUP_DEBUG', 'success', 'Testando signup com detalhes completos...');
      
      try {
        const { data: debugSignup, error: debugError } = await supabase.auth.signUp({
          email: 'debug.teste@vercel.app',
          password: 'password123456',
          options: {
            emailRedirectTo: undefined,
            data: {
              full_name: 'Debug User'
            }
          }
        });
        
        if (debugError) {
          addResult('SIGNUP_DEBUG', 'error', `Erro detalhado no signup: ${debugError.message}`, {
            errorCode: debugError.name,
            errorDetails: debugError,
            possibleCauses: [
              'Email signups desabilitados no Supabase',
              'Confirmação de email obrigatória',
              'Política de domínio restritiva',
              'Rate limiting ativo'
            ]
          });
        } else {
          addResult('SIGNUP_DEBUG', 'success', 'Signup funcionou! Problema pode ser no login.', debugSignup);
        }
      } catch (error: any) {
        addResult('SIGNUP_DEBUG', 'error', `Erro de rede/configuração: ${error.message}`);
      }
      
    } catch (error: any) {
      addResult('GENERAL', 'error', `Erro geral: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🔐 Teste de Autenticação e Planos</h1>
      
      <div className="mb-6 space-x-4">
        <button
          onClick={runTests}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '⏳ Executando...' : '🧪 Executar Testes'}
        </button>
        
        <button
          onClick={clearResults}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          🗑️ Limpar Resultados
        </button>
        
        <a
          href="/quick-login"
          className="inline-block px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          🔑 Fazer Login
        </a>
      </div>
      
      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              result.status === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">
                {result.status === 'success' ? '✅' : '❌'} {result.test}
              </h3>
              <span className="text-xs opacity-70">{result.timestamp}</span>
            </div>
            
            <p className="mb-2">{result.message}</p>
            
            {result.data && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm opacity-70">Ver dados</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
      
      {results.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          <p>Nenhum teste executado ainda.</p>
          <p className="text-sm mt-2">Clique em "Executar Testes" para começar.</p>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">📋 O que estes testes verificam:</h3>
        <ul className="text-sm space-y-1">
          <li>• <strong>SESSION:</strong> Se o usuário está autenticado</li>
          <li>• <strong>PROFILE:</strong> Se o perfil do usuário existe e está configurado</li>
          <li>• <strong>RESOURCE_USAGE:</strong> Verificação do uso de recursos (transcrições)</li>
          <li>• <strong>API_TRANSCRIBE:</strong> Se a API de transcrição está protegida</li>
          <li>• <strong>ENV_VARS:</strong> Se as variáveis de ambiente estão configuradas</li>
          <li>• <strong>SUPABASE_CONFIG:</strong> Verificação da configuração do Supabase</li>
          <li>• <strong>SUPABASE_AUTH_CONFIG:</strong> Verificação das configurações de autenticação do Supabase</li>
          <li>• <strong>AUTH_SETTINGS_SQL:</strong> Verificação das configurações de autenticação via SQL</li>
        </ul>
      </div>
    </div>
  );
} 