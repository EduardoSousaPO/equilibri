'use client'

import React from 'react'
import { DiarioTerLogo } from '@/components/ui/logo'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { 
  JournalIcon, 
  CheckInIcon, 
  ReportIcon, 
  AudioIcon, 
  TherapistIcon 
} from '@/components/ui/illustrations'

interface SidebarProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: SidebarProps) {
  const pathname = usePathname()
  
  const menuItems = [
    {
      name: 'Diário',
      href: '/app/journal',
      icon: JournalIcon
    },
    {
      name: 'Check-in',
      href: '/app/checkin',
      icon: CheckInIcon
    },
    {
      name: 'Áudio',
      href: '/app/audio',
      icon: AudioIcon
    },
    {
      name: 'Relatórios',
      href: '/app/reports',
      icon: ReportIcon
    },
    {
      name: 'Técnicas',
      href: '/app/techniques',
      icon: TherapistIcon
    }
  ]
  
  return (
    <div className="flex h-screen bg-background-secondary">
      {/* Sidebar para desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-background border-r border-border">
        <div className="p-4 border-b border-border">
          <Link href="/app/dashboard">
            <div className="flex items-center justify-center">
              <DiarioTerLogo />
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'
                }`}
              >
                <span className="mr-3">
                  <item.icon />
                </span>
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <Link
            href="/app/settings"
            className={`flex items-center px-4 py-3 rounded-md transition-colors ${
              pathname.startsWith('/app/settings') 
                ? 'bg-primary text-white' 
                : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">Configurações</span>
          </Link>
          
          <div className="mt-2 px-4 py-3">
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-8 w-8",
                  userButtonBox: "flex items-center w-full"
                }
              }}
            />
          </div>
        </div>
      </aside>
      
      {/* Conteúdo principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Barra superior para mobile */}
        <header className="md:hidden flex items-center justify-between p-4 bg-background border-b border-border">
          <Link href="/app/dashboard">
            <div className="flex items-center">
              <DiarioTerLogo />
            </div>
          </Link>
          
          <div className="flex items-center space-x-2">
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-8 w-8"
                }
              }}
            />
            <button
              type="button"
              className="p-2 rounded-md text-text-secondary hover:bg-background-secondary hover:text-text-primary transition-colors"
              onClick={() => {
                const mobileMenu = document.getElementById('mobile-menu')
                if (mobileMenu) {
                  mobileMenu.classList.toggle('hidden')
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>
        
        {/* Menu mobile */}
        <div id="mobile-menu" className="hidden md:hidden bg-background border-b border-border">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'
                  }`}
                  onClick={() => {
                    const mobileMenu = document.getElementById('mobile-menu')
                    if (mobileMenu) {
                      mobileMenu.classList.add('hidden')
                    }
                  }}
                >
                  <span className="mr-3">
                    <item.icon />
                  </span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
            
            <Link
              href="/app/settings"
              className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                pathname.startsWith('/app/settings') 
                  ? 'bg-primary text-white' 
                  : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'
              }`}
              onClick={() => {
                const mobileMenu = document.getElementById('mobile-menu')
                if (mobileMenu) {
                  mobileMenu.classList.add('hidden')
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">Configurações</span>
            </Link>
          </nav>
        </div>
        
        {/* Conteúdo da página */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
