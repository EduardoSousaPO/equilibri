'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function TechniquesPage() {
  const [techniques, setTechniques] = useState([])
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Técnicas Terapêuticas</h1>
        <Link 
          href="/app/techniques/categories" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          Ver Categorias
        </Link>
      </div>
      
      {techniques.length === 0 ? (
        <div className="text-center py-10">
          <div className="mx-auto h-24 w-24 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium">Técnicas em desenvolvimento</h3>
          <p className="mt-1 text-slate-500">Em breve você terá acesso a técnicas terapêuticas baseadas em evidências.</p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-medium">Técnicas de TCC</h3>
              <p className="text-sm text-slate-500 mt-1">Técnicas cognitivo-comportamentais para modificar padrões de pensamento.</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-medium">Mindfulness</h3>
              <p className="text-sm text-slate-500 mt-1">Práticas de atenção plena para melhorar o bem-estar emocional.</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-medium">Técnicas de Regulação Emocional</h3>
              <p className="text-sm text-slate-500 mt-1">Estratégias para gerenciar emoções e reduzir o sofrimento.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Técnicas serão exibidas aqui */}
        </div>
      )}
    </div>
  )
}
