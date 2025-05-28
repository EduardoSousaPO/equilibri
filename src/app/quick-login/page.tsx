'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginTestUser, checkAuthStatus, logoutUser } from './actions';

export default function QuickLoginPage() {
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setMessage('🔑 Fazendo login...');
    
    try {
      const result = await loginTestUser();
      
      if (result.success) {
        setMessage(`✅ Login realizado! Usuário: ${result.user.email}`);
        
        // Aguardar um pouco e redirecionar
        setTimeout(() => {
          setMessage('🚀 Redirecionando para o chat...');
          router.push('/chat');
          router.refresh();
        }, 1000);
      } else {
        setMessage(`❌ Erro: ${result.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Erro: ${error.message}`);
    }
  };

  const handleCheckStatus = async () => {
    setMessage('🔍 Verificando status...');
    
    try {
      const result = await checkAuthStatus();
      
      if (result.authenticated) {
        setMessage(`✅ Já está logado como: ${result.user.email}`);
      } else {
        setMessage('❌ Não está logado');
      }
    } catch (error: any) {
      setMessage(`❌ Erro: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    setMessage('🚪 Fazendo logout...');
    
    try {
      await logoutUser();
      setMessage('✅ Logout realizado');
      router.refresh();
    } catch (error: any) {
      setMessage(`❌ Erro: ${error.message}`);
    }
  };

  const goToChat = () => {
    router.push('/chat');
    router.refresh();
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">🚀 Login Rápido</h1>
      
      <div className="space-y-4">
        <button
          onClick={handleLogin}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🔑 Login com Usuário de Teste
        </button>
        
        <button
          onClick={handleCheckStatus}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          📋 Verificar Status de Login
        </button>

        {message.includes('✅ Já está logado') && (
          <button
            onClick={goToChat}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            🎯 Ir para o Chat
          </button>
        )}
        
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🚪 Logout
        </button>
      </div>
      
      {message && (
        <div className={`mt-4 p-3 rounded ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 
          message.includes('❌') ? 'bg-red-100 text-red-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          <div className="whitespace-pre-line">{message}</div>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">💡 Como usar:</h3>
        <ol className="text-sm space-y-1">
          <li>1. Clique em "Login com Usuário de Teste"</li>
          <li>2. Aguarde o processo terminar</li>
          <li>3. Clique em "Ir para o Chat"</li>
          <li>4. Agora todas as funcionalidades funcionarão!</li>
        </ol>
        
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-700">
            <strong>Plano de Teste:</strong> Premium (100 transcrições/mês)
          </p>
        </div>
      </div>
    </div>
  );
}