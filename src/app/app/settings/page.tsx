'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'

// Interface de perfil
interface ProfileType {
  id: string;
  name: string | null;
  email: string | null;
  plan: string;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
  therapist_id?: string | null;
  therapist_share?: boolean;
  language?: string;
  preferences?: {
    dark_mode?: boolean;
    email_notifications?: boolean;
    data_sharing?: boolean;
    two_factor?: boolean;
  };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    language: 'pt-BR',
    darkMode: false,
    emailNotifications: true,
    dataSharing: false,
    twoFactor: false
  })
  
  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClientSupabaseClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        window.location.href = '/login'
        return
      }
      
      setUser(user)
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileData) {
        const profile = profileData as ProfileType
        setProfile(profile)
        setFormData({
          ...formData,
          fullName: profile.full_name || profile.name || '',
          language: profile.language || 'pt-BR',
          darkMode: profile.preferences?.dark_mode || false,
          emailNotifications: profile.preferences?.email_notifications !== false,
          dataSharing: profile.preferences?.data_sharing || false,
          twoFactor: profile.preferences?.two_factor || false
        })
      }
    }
    
    fetchUserData()
  }, [])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    setFormData({
      ...formData,
      [id]: type === 'checkbox' ? checked : value
    })
  }
  
  const handleProfileUpdate = async () => {
    try {
      setLoading(true)
      const supabase = createClientSupabaseClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          language: formData.language,
          preferences: {
            dark_mode: formData.darkMode,
            email_notifications: formData.emailNotifications,
            data_sharing: formData.dataSharing,
            two_factor: formData.twoFactor
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (error) throw error
      
      alert('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      alert('Erro ao atualizar perfil. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleResetPassword = async () => {
    try {
      const supabase = createClientSupabaseClient()
      
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) throw error
      
      alert('Email de redefinição de senha enviado.')
    } catch (error) {
      console.error('Erro ao enviar email de redefinição:', error)
      alert('Erro ao enviar email de redefinição. Tente novamente.')
    }
  }
  
  const handleDeleteAccount = async () => {
    const confirmed = confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')
    
    if (!confirmed) return
    
    try {
      setLoading(true)
      // Implementar a exclusão da conta quando a API estiver disponível
      alert('Funcionalidade em desenvolvimento.')
    } catch (error) {
      console.error('Erro ao excluir conta:', error)
      alert('Erro ao excluir conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-georgia text-teal-900">Configurações</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Perfil */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gold-500/10 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-bold font-georgia text-teal-900 mb-4">Perfil do Usuário</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-teal-800">
                Nome
              </label>
              <input
                type="text"
                id="fullName"
                className="mt-1 block w-full rounded-lg border border-cream-100 bg-cream-50 px-3 py-2 shadow-sm focus:border-teal-900 focus:outline-none focus:ring-1 focus:ring-teal-900"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-teal-800">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full rounded-lg border border-cream-100 bg-cream-50 px-3 py-2 shadow-sm focus:border-teal-900 focus:outline-none focus:ring-1 focus:ring-teal-900 opacity-75"
                value={user?.email || ''}
                disabled={true}
              />
              <p className="mt-1 text-sm text-teal-800 opacity-70">O email não pode ser alterado.</p>
            </div>
            
            <button
              type="button"
              onClick={handleProfileUpdate}
              className="inline-flex items-center px-5 py-2.5 rounded-xl font-medium shadow-md text-white bg-teal-900 hover:bg-teal-800 border border-gold-500/20 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
        
        {/* Conta */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gold-500/10 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-bold font-georgia text-teal-900 mb-4">Conta</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-cream-100">
              <div>
                <h3 className="font-medium text-teal-900">Plano atual</h3>
                <p className="text-sm text-teal-800 opacity-70">
                  {profile?.plan === 'premium' ? 'Plano Premium' : 'Plano Gratuito'}
                </p>
              </div>
              {profile?.plan !== 'premium' && (
                <Link
                  href="/app/upgrade"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg font-medium text-teal-900 bg-gold-500 hover:bg-gold-400 transition-colors duration-300"
                >
                  <span className="mr-1">✨</span>
                  Fazer Upgrade
                </Link>
              )}
            </div>
            
            <div className="py-2">
              <h3 className="font-medium text-teal-900 mb-2">Alterar senha</h3>
              <button
                type="button"
                onClick={handleResetPassword}
                className="inline-flex items-center px-4 py-2 border border-teal-900/20 rounded-lg text-sm font-medium text-teal-900 bg-cream-50 hover:bg-cream-100 transition-colors duration-300"
              >
                Redefinir senha
              </button>
            </div>
            
            <div className="py-2 border-t border-cream-100">
              <h3 className="font-medium text-red-600 mb-2">Zona de perigo</h3>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors duration-300"
              >
                Excluir conta
              </button>
              <p className="mt-1 text-sm text-teal-800 opacity-70">Esta ação não pode ser desfeita.</p>
            </div>
          </div>
        </div>
        
        {/* Preferências */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gold-500/10 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-bold font-georgia text-teal-900 mb-4">Preferências</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="darkMode"
                type="checkbox"
                className="h-4 w-4 rounded border-cream-100 text-gold-500 focus:ring-gold-500"
                checked={formData.darkMode}
                onChange={handleChange}
              />
              <label htmlFor="darkMode" className="ml-2 block text-sm text-teal-800">
                Modo escuro
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="emailNotifications"
                type="checkbox"
                className="h-4 w-4 rounded border-cream-100 text-gold-500 focus:ring-gold-500"
                checked={formData.emailNotifications}
                onChange={handleChange}
              />
              <label htmlFor="emailNotifications" className="ml-2 block text-sm text-teal-800">
                Notificações por email
              </label>
            </div>
            
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-teal-800">
                Idioma
              </label>
              <select
                id="language"
                className="mt-1 block w-full rounded-lg border border-cream-100 bg-cream-50 px-3 py-2 shadow-sm focus:border-teal-900 focus:outline-none focus:ring-1 focus:ring-teal-900"
                value={formData.language}
                onChange={handleChange}
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>
            
            <button
              type="button"
              onClick={handleProfileUpdate}
              className="inline-flex items-center px-4 py-2 rounded-lg font-medium shadow-sm text-white bg-teal-900 hover:bg-teal-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
            >
              Salvar Preferências
            </button>
          </div>
        </div>
        
        {/* Privacidade */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gold-500/10 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-bold font-georgia text-teal-900 mb-4">Privacidade e Segurança</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="dataSharing"
                type="checkbox"
                className="h-4 w-4 rounded border-cream-100 text-gold-500 focus:ring-gold-500"
                checked={formData.dataSharing}
                onChange={handleChange}
              />
              <label htmlFor="dataSharing" className="ml-2 block text-sm text-teal-800">
                Compartilhar dados anônimos para melhorar o serviço
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="twoFactor"
                type="checkbox"
                className="h-4 w-4 rounded border-cream-100 text-gold-500 focus:ring-gold-500"
                checked={formData.twoFactor}
                onChange={handleChange}
              />
              <label htmlFor="twoFactor" className="ml-2 block text-sm text-teal-800">
                Autenticação de dois fatores
              </label>
            </div>
            
            <button
              type="button"
              onClick={handleProfileUpdate}
              className="inline-flex items-center px-4 py-2 rounded-lg font-medium shadow-sm text-white bg-teal-900 hover:bg-teal-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
            >
              Salvar Configurações
            </button>
            
            <div className="pt-2 border-t border-cream-100">
              <Link
                href="/privacy-policy"
                className="text-sm text-teal-900 hover:text-gold-500 transition-colors duration-300"
              >
                Política de Privacidade
              </Link>
              <span className="mx-2 text-cream-100">•</span>
              <Link
                href="/terms-of-service"
                className="text-sm text-teal-900 hover:text-gold-500 transition-colors duration-300"
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
