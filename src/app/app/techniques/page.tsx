'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'

interface Technique {
  id: string
  title: string
  description: string
  category: string
  content: any
  image_url?: string
  is_premium: boolean
}

export default function TechniquesPage() {
  const [techniques, setTechniques] = useState<Technique[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchTechniques = async () => {
      setLoading(true)
      
      // Mockup de técnicas para desenvolvimento
      setTimeout(() => {
        setTechniques([])
        setLoading(false)
      }, 1000)
      
      // Quando a API estiver pronta, descomentar abaixo:
      /*
      const supabase = createClientSupabaseClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }
      
      const { data } = await supabase
        .from('techniques')
        .select('*')
        .order('title', { ascending: true })
      
      if (data) {
        setTechniques(data as Technique[])
      }
      
      setLoading(false)
      */
    }
    
    fetchTechniques()
  }, [])
  
  const categories = [
    {
      title: "Técnicas de TCC",
      description: "Técnicas cognitivo-comportamentais para modificar padrões de pensamento."
    },
    {
      title: "Mindfulness",
      description: "Práticas de atenção plena para melhorar o bem-estar emocional."
    },
    {
      title: "Técnicas de Regulação Emocional",
      description: "Estratégias para gerenciar emoções e reduzir o sofrimento."
    }
  ]
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-georgia text-teal-900">Técnicas Terapêuticas</h1>
        <Link 
          href="/app/techniques/categories" 
          className="inline-flex items-center px-5 py-2.5 rounded-xl font-medium shadow-md text-white bg-teal-900 hover:bg-teal-800 border border-gold-500/20 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          Ver Categorias
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cream-100 border-t-teal-900"></div>
        </div>
      ) : techniques.length === 0 ? (
        <div className="bg-white rounded-xl p-10 shadow-md border border-gold-500/10 text-center">
          <div className="mx-auto h-24 w-24 text-teal-800 opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-bold font-georgia text-teal-900">Técnicas em desenvolvimento</h3>
          <p className="mt-2 text-teal-800 opacity-80">Em breve você terá acesso a técnicas terapêuticas baseadas em evidências.</p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <div 
                key={index} 
                className="bg-cream-50 rounded-xl p-6 shadow-md border border-gold-500/10 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <h3 className="text-lg font-bold font-georgia text-teal-900 mb-2">{category.title}</h3>
                <p className="text-teal-800 opacity-80">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techniques.map((technique) => (
            <Link 
              key={technique.id}
              href={`/app/techniques/${technique.id}`}
              className="block bg-white rounded-xl p-6 shadow-md border border-gold-500/10 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div>
                {technique.is_premium && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold-500 text-white mb-2">
                    Premium
                  </span>
                )}
                <h2 className="text-xl font-bold font-georgia text-teal-900 mb-2">{technique.title}</h2>
                <p className="text-teal-800 opacity-80 line-clamp-3 mb-3">{technique.description}</p>
                <div className="text-sm font-medium text-teal-900 inline-flex items-center">
                  <span>Saiba mais</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
