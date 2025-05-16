'use client'

import React from 'react'
import Link from 'next/link'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'
import { usePathname } from 'next/navigation'
import { EquilibriLogo } from '@/components/ui/logo'
import { useState, useEffect } from 'react'

export default function AppLayout({
  children,
}: {
  children: any
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const getUser = async () => {
      setLoading(true)
      const supabase = createClientSupabaseClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        setLoading(false)
        window.location.href = '/login'
        return
      }
      
      setUser(user)
      
      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profile)
      setLoading(false)
    }
    
    getUser()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClientSupabaseClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-l-2 border-primary"></div>
      </div>
    )
  }

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { label: 'Chat com Lari', path: '/app/chat', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    )},
    { label: 'Check-in', path: '/app/checkin', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { label: 'Agendar Sessão', path: '/agenda', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ), visibleForPlans: ['clinical'] },
    { label: 'Relatórios', path: '/app/reports', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { label: 'Configurações', path: '/app/settings', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )}
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-background border-r border-border">
        {/* Logo */}
        <div className="px-7 py-8 flex items-center justify-center">
          <Link href="/app/dashboard" className="block w-full">
            <EquilibriLogo className="mx-auto h-10 hover-lift transition-transform" textColor="text-primary" />
          </Link>
        </div>
        
        {/* Menu de Navegação */}
        <nav className="flex-1 pt-2 pb-8 overflow-y-auto px-4">
          <div className="divider mb-4 opacity-60"></div>
          <ul className="space-y-1">
            {navItems
              .filter(item => !item.visibleForPlans || !profile?.plan || item.visibleForPlans.includes(profile.plan))
              .map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-primary-ultra-light text-primary'
                      : 'text-text-primary hover:bg-background-secondary'
                  }`}
                >
                  <span className={`mr-3 transition-colors duration-300 ${isActive(item.path) ? 'text-primary' : 'text-text-secondary'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                  {item.label === 'Chat com Lari' && (
                    <span className="ml-auto px-2 py-0.5 text-xs rounded-md bg-brand/20 text-brand">Novo</span>
                  )}
                  {item.label === 'Agendar Sessão' && profile?.plan === 'clinical' && (
                    <span className="ml-auto px-2 py-0.5 text-xs rounded-md bg-primary/20 text-primary">Premium</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Perfil do usuário */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center px-4 py-3">
              <div className="h-8 w-8 rounded-full bg-primary text-background flex items-center justify-center text-sm font-medium">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-text-primary truncate">
                  {profile?.full_name || user?.email || 'Usuário'}
                </p>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-text-secondary hover:text-primary transition-colors duration-300"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </nav>
      </aside>
      
      {/* Cabeçalho móvel e Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-background border-b border-border py-2.5 px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/app/dashboard" className="flex items-center">
            <EquilibriLogo className="h-6" textColor="text-primary" />
          </Link>
          
          {/* Botão menu hambúrguer */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-text-primary hover:text-primary transition-colors duration-300"
            aria-label="Abrir menu"
          >
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Menu Mobile */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-10 bg-primary/10 backdrop-blur-sm transition-opacity duration-300">
          <div className="fixed right-0 top-0 bottom-0 w-64 bg-background shadow-xl transition-transform duration-300 ease-in-out overflow-y-auto">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-text-primary">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-text-primary hover:text-primary transition-colors duration-300"
                  aria-label="Fechar menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <nav>
                <ul className="space-y-1">
                  {navItems
                    .filter(item => !item.visibleForPlans || !profile?.plan || item.visibleForPlans.includes(profile.plan))
                    .map((item) => (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-300 ${
                          isActive(item.path)
                            ? 'bg-primary-ultra-light text-primary'
                            : 'text-text-primary hover:bg-background-secondary'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <span className={`mr-3 transition-colors duration-300 ${isActive(item.path) ? 'text-primary' : 'text-text-secondary'}`}>
                          {item.icon}
                        </span>
                        {item.label}
                        {item.label === 'Chat com Lari' && (
                          <span className="ml-auto px-2 py-0.5 text-xs rounded-md bg-brand/20 text-brand">Novo</span>
                        )}
                        {item.label === 'Agendar Sessão' && profile?.plan === 'clinical' && (
                          <span className="ml-auto px-2 py-0.5 text-xs rounded-md bg-primary/20 text-primary">Premium</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center px-4 py-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-background flex items-center justify-center text-sm font-medium">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {profile?.full_name || user?.email || 'Usuário'}
                    </p>
                    <button
                      onClick={handleSignOut}
                      className="text-xs text-text-secondary hover:text-primary transition-colors duration-300"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Conteúdo principal */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6 lg:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {pathname !== '/app/chat' && (
                <div className="bg-brand/10 border border-brand/20 rounded-lg p-4 mb-6 flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-10 w-10 rounded-full bg-brand/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-brand font-medium">Conheça Lari, sua terapeuta digital</h3>
                    <p className="text-sm text-text-primary mt-1">Precisa conversar? <Link href="/app/chat" className="text-brand underline">Bater um papo com a Lari</Link> pode ajudar você a processar suas emoções.</p>
                  </div>
                </div>
              )}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
