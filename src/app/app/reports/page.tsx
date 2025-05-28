'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'

interface Report {
  id: string
  title: string
  period: string
  created_at: string
  user_id: string
  report_type: string
  data: any
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      
      // Mockup para desenvolvimento
      setTimeout(() => {
        setReports([])
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
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (data) {
        setReports(data as Report[])
      }
      
      setLoading(false)
      */
    }
    
    fetchReports()
  }, [])
  
  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-georgia text-teal-900">Relatórios</h1>
        <Link 
          href="/app/reports/new" 
          className="inline-flex items-center px-5 py-2.5 rounded-xl font-medium shadow-md text-white bg-teal-900 hover:bg-teal-800 border border-gold-500/20 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
          </svg>
          Gerar Relatório
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cream-100 border-t-teal-900"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl p-10 shadow-md border border-gold-500/10 text-center">
          <div className="mx-auto h-24 w-24 text-teal-800 opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-bold font-georgia text-teal-900">Nenhum relatório disponível</h3>
          <p className="mt-2 text-teal-800 opacity-80">Os relatórios são gerados automaticamente ou sob demanda.</p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-cream-50 rounded-xl p-6 shadow-md border border-gold-500/10 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-lg font-bold font-georgia text-teal-900 mb-2">Relatório Semanal</h3>
              <p className="text-teal-800 opacity-80 mb-4">Resumo dos seus padrões emocionais e insights da semana.</p>
              <Link
                href="/app/reports/new?type=weekly"
                className="text-sm font-medium text-teal-900 inline-flex items-center"
              >
                <span>Gerar relatório</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            
            <div className="bg-cream-50 rounded-xl p-6 shadow-md border border-gold-500/10 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-lg font-bold font-georgia text-teal-900 mb-2">Relatório Mensal</h3>
              <p className="text-teal-800 opacity-80 mb-4">Análise completa do seu progresso e padrões emocionais do mês.</p>
              <Link
                href="/app/reports/new?type=monthly"
                className="text-sm font-medium text-teal-900 inline-flex items-center"
              >
                <span>Gerar relatório</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Link 
              key={report.id}
              href={`/app/reports/${report.id}`}
              className="block bg-white rounded-xl p-6 shadow-md border border-gold-500/10 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold font-georgia text-teal-900 mb-2">{report.title}</h2>
                  <p className="text-teal-800 opacity-80 mb-3">Período: {report.period}</p>
                  <div className="text-sm text-teal-800 opacity-70">
                    Gerado em: {formatDate(report.created_at)}
                  </div>
                </div>
                <div className="text-teal-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
