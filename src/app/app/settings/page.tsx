'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Perfil */}
        <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Perfil do Usuário</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Nome
              </label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                defaultValue="Usuário"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                defaultValue="usuario@exemplo.com"
                disabled={true}
              />
              <p className="mt-1 text-sm text-slate-500">O email não pode ser alterado.</p>
            </div>
            
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
        
        {/* Conta */}
        <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Conta</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-200">
              <div>
                <h3 className="font-medium">Plano atual</h3>
                <p className="text-sm text-slate-500">Plano Gratuito</p>
              </div>
              <Link
                href="/app/upgrade"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20"
              >
                Fazer Upgrade
              </Link>
            </div>
            
            <div className="py-2">
              <h3 className="font-medium mb-2">Alterar senha</h3>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
              >
                Redefinir senha
              </button>
            </div>
            
            <div className="py-2 border-t border-slate-200">
              <h3 className="font-medium text-red-600 mb-2">Zona de perigo</h3>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              >
                Excluir conta
              </button>
              <p className="mt-1 text-sm text-slate-500">Esta ação não pode ser desfeita.</p>
            </div>
          </div>
        </div>
        
        {/* Preferências */}
        <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Preferências</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="dark-mode"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-blue-500"
              />
              <label htmlFor="dark-mode" className="ml-2 block text-sm text-slate-700">
                Modo escuro
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="email-notifications"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-blue-500"
                defaultChecked
              />
              <label htmlFor="email-notifications" className="ml-2 block text-sm text-slate-700">
                Notificações por email
              </label>
            </div>
            
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-slate-700">
                Idioma
              </label>
              <select
                id="language"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>
            
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
            >
              Salvar Preferências
            </button>
          </div>
        </div>
        
        {/* Privacidade */}
        <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Privacidade e Segurança</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="data-sharing"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-blue-500"
              />
              <label htmlFor="data-sharing" className="ml-2 block text-sm text-slate-700">
                Compartilhar dados anônimos para melhorar o serviço
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="two-factor"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-blue-500"
              />
              <label htmlFor="two-factor" className="ml-2 block text-sm text-slate-700">
                Autenticação de dois fatores
              </label>
            </div>
            
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
            >
              Salvar Configurações
            </button>
            
            <div className="pt-2 border-t border-slate-200">
              <Link
                href="/privacy-policy"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Política de Privacidade
              </Link>
              <span className="mx-2 text-slate-300">•</span>
              <Link
                href="/terms-of-service"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Termos de Serviço
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
