'use client'

import Link from 'next/link'
import Image from 'next/image'
import { EquilibriLogo } from '@/components/ui/logo'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Banner da nova funcionalidade */}
      <div className="bg-brand text-white p-3 text-center">
        <p className="font-medium">
          🎉 <span className="font-bold">Novidade:</span> Conheça Lari, sua nova terapeuta digital! <a href="/login?redirect=chat" className="underline font-semibold hover:text-brandSecondary transition-colors">Faça login para conversar</a>
        </p>
      </div>
      
      {/* Navbar mais minimalista */}
      <header className="bg-primary shadow-sm text-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <EquilibriLogo className="h-9" textColor="text-background" />
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link href="#features" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-background hover:text-accent-light transition-colors">
                Funcionalidades
              </Link>
              <Link href="#how-it-works" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-background hover:text-accent-light transition-colors">
                Como Funciona
              </Link>
              <Link href="#pricing" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-background hover:text-accent-light transition-colors">
                Planos
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="inline-flex items-center px-4 py-2 border border-accent text-sm font-medium rounded-md text-accent bg-transparent hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors">
                Entrar
              </Link>
              <Link href="/register" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors">
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section com design mais limpo */}
      <main className="flex-grow">
        <div className="bg-background-secondary">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-georgia font-bold text-primary sm:text-5xl sm:tracking-tight lg:text-6xl">
                Seu Companheiro Terapêutico<br/>Inteligente
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-text-primary">
                Transforme seus pensamentos em insights terapêuticos com um diário que entende suas emoções e oferece suporte baseado em evidências científicas.
              </p>
              <div className="mt-10 flex justify-center gap-4">
                <Link href="/register" className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-background bg-primary hover:bg-primary-light md:py-4 md:text-lg md:px-10 transition-colors">
                  Comece seu diário
                </Link>
                <Link href="/login?redirect=chat" className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-accent hover:opacity-90 md:py-4 md:text-lg md:px-10 transition-colors">
                  Converse com Lari
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Seção de destaque para Lari */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="lg:w-1/2 mb-10 lg:mb-0">
                <h2 className="text-base font-semibold text-brand tracking-wide uppercase">NOVIDADE EXCLUSIVA</h2>
                <p className="mt-2 text-3xl font-georgia font-bold text-primary sm:text-4xl">
                  Conheça Lari, sua terapeuta digital
                </p>
                <p className="mt-4 text-lg text-text-primary">
                  Lari é uma inteligência artificial especializada em apoio terapêutico, desenvolvida para oferecer suporte emocional e insights terapêuticos com um toque humano.
                </p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-text-primary">Especialista em TCC, ACT, DBT e logoterapia</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-text-primary">Conversa empática e acolhedora</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-text-primary">Perguntas reflexivas que estimulam autoconhecimento</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-text-primary">Disponível 24/7 para apoio emocional</p>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/login?redirect=chat" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-brand hover:bg-brand/90 transition-colors">
                    Fazer login para conversar
                    <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 -mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="lg:w-5/12">
                <div className="bg-brand/10 rounded-xl p-6 border border-brand/20 shadow-lg max-w-md mx-auto lg:mx-0">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-brand/20 flex items-center justify-center">
                      <span className="text-brand text-xl font-medium">L</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-primary text-lg">Lari</h3>
                      <p className="text-text-secondary text-sm">Terapeuta Digital</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-text-primary text-sm">
                      Olá! Sou Lari, sua terapeuta virtual. Como posso ajudar você hoje? Estou aqui para conversar sobre qualquer coisa que esteja em sua mente.
                    </p>
                  </div>
                  <div className="mt-4 flex">
                    <div className="bg-background-secondary rounded-lg p-3 flex-1 text-sm">
                      <p className="text-text-secondary">Digite sua mensagem aqui...</p>
                    </div>
                    <button className="ml-2 rounded-full bg-brand/20 p-3 text-brand hover:bg-brand/30 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-4 text-center">
                    <Link href="/login?redirect=chat" className="text-brand text-sm hover:underline">
                      Fazer login para conversar →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section com aparência mais minimalista */}
        <div id="features" className="py-20 bg-background-secondary overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-accent tracking-wide uppercase">FUNCIONALIDADES</h2>
              <p className="mt-2 text-3xl font-georgia font-bold text-primary sm:text-4xl">
                Uma nova abordagem para o bem-estar emocional
              </p>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-text-primary">
                Combinamos tecnologia avançada com práticas terapêuticas cientificamente validadas.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Feature 1 */}
                <div className="border border-border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-md flex items-center justify-center bg-primary-ultra-light text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium font-georgia text-primary">Diário Terapêutico Inteligente</h3>
                  <p className="mt-2 text-base text-text-primary">
                    Registre seus pensamentos e receba insights personalizados baseados em terapias com evidência científica.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="border border-border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-md flex items-center justify-center bg-primary-ultra-light text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium font-georgia text-primary">Diário por Voz</h3>
                  <p className="mt-2 text-base text-text-primary">
                    Grave seus pensamentos em áudio e deixe nossa tecnologia transcrever e analisar para você.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="border border-border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-md flex items-center justify-center bg-primary-ultra-light text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium font-georgia text-primary">Check-ins Emocionais</h3>
                  <p className="mt-2 text-base text-text-primary">
                    Registre seu estado emocional rapidamente e acompanhe padrões ao longo do tempo com visualizações intuitivas.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="border border-border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-md flex items-center justify-center bg-primary-ultra-light text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium font-georgia text-primary">Relatórios Semanais</h3>
                  <p className="mt-2 text-base text-text-primary">
                    Receba análises semanais automatizadas com insights sobre seus padrões emocionais e progresso.
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="border border-border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-md flex items-center justify-center bg-primary-ultra-light text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium font-georgia text-primary">Prontuário Terapêutico</h3>
                  <p className="mt-2 text-base text-text-primary">
                    Visualize sua jornada terapêutica com uma linha do tempo interativa e filtros personalizados.
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="border border-border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-md flex items-center justify-center bg-primary-ultra-light text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium font-georgia text-primary">Compartilhamento com Terapeutas</h3>
                  <p className="mt-2 text-base text-text-primary">
                    Compartilhe seu prontuário com seu terapeuta de forma segura e controlada para otimizar suas sessões.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section - Mantendo o mesmo conteúdo com estilo atualizado */}
        <div id="how-it-works" className="py-16 bg-background-secondary overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-accent tracking-wide uppercase">Como Funciona</h2>
              <p className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
                Baseado em abordagens terapêuticas comprovadas
              </p>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-text-primary">
                O Equilibri utiliza três abordagens terapêuticas cientificamente validadas para oferecer suporte personalizado.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* TCC */}
                <div className="border border-border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium text-primary">Terapia Cognitivo-Comportamental (TCC)</h3>
                  <p className="mt-2 text-base text-text-primary">
                    Identifica e modifica padrões distorcidos de pensamento que influenciam comportamentos e emoções.
                  </p>
                  <p className="mt-4 text-sm text-text-secondary">
                    <strong>Aplicação no Equilibri:</strong> Análise automática de distorções cognitivas nos textos, sugestão de reestruturação cognitiva e técnicas de questionamento socrático.
                  </p>
                </div>

                {/* ACT */}
                <div className="border border-border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium text-primary">Terapia de Aceitação e Compromisso (ACT)</h3>
                  <p className="mt-2 text-base text-text-primary">
                    Promove a flexibilidade psicológica através da aceitação de experiências internas e compromisso com ações alinhadas aos valores pessoais.
                  </p>
                  <p className="mt-4 text-sm text-text-secondary">
                    <strong>Aplicação no Equilibri:</strong> Identificação de tentativas de evitação experiencial, promoção de defusão cognitiva e exercícios de atenção plena contextualizados.
                  </p>
                </div>

                {/* DBT */}
                <div className="border border-border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium text-primary">Terapia Comportamental Dialética (DBT)</h3>
                  <p className="mt-2 text-base text-text-primary">
                    Desenvolve habilidades para regulação emocional, tolerância ao desconforto, efetividade interpessoal e consciência plena.
                  </p>
                  <p className="mt-4 text-sm text-text-secondary">
                    <strong>Aplicação no Equilibri.IA:</strong> Sugestão de técnicas de autorregulação emocional, estratégias de tolerância ao estresse e práticas de mindfulness adaptadas às necessidades específicas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Planos e Preços */}
        <div id="pricing" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-base font-semibold text-accent tracking-wide uppercase">PLANOS</h2>
              <p className="mt-2 text-3xl font-georgia font-bold text-primary sm:text-4xl">
                Escolha o plano ideal para sua jornada
              </p>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-text-primary">
                Comece gratuitamente ou desbloqueie todos os recursos com o plano premium
              </p>
            </div>

            <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-8">
              {/* Plano Gratuito */}
              <div className="border border-border rounded-xl p-8 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-primary">Plano Gratuito</h3>
                    <p className="mt-2 text-text-secondary">Para começar sua jornada</p>
                  </div>
                  <div className="ml-4">
                    <p className="text-3xl font-bold text-primary">R$ 0</p>
                    <p className="text-text-secondary text-sm">para sempre</p>
                  </div>
                </div>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success flex-shrink-0 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-text-primary">Até 50 entradas de diário por mês</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success flex-shrink-0 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-text-primary">Até 2 entradas de áudio por mês</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success flex-shrink-0 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-text-primary">Até 4 relatórios semanais</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success flex-shrink-0 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-text-primary">Check-ins emocionais ilimitados</span>
                  </li>
                  <li className="flex items-start opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-error flex-shrink-0 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-text-secondary">Sem análise avançada de padrões</span>
                  </li>
                </ul>

                <div className="mt-8">
                  <Link href="/register" className="w-full inline-flex justify-center py-3 px-5 border border-primary text-base font-medium rounded-md text-primary bg-white hover:bg-primary-ultra-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                    Começar Grátis
                  </Link>
                </div>
              </div>

              {/* Plano Premium */}
              <div className="border-2 border-primary rounded-xl p-8 bg-white shadow-md relative">
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                    Recomendado
                  </span>
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-primary">Plano Premium</h3>
                    <p className="mt-2 text-text-secondary">Para uma experiência completa</p>
                  </div>
                  <div className="ml-4">
                    <p className="text-3xl font-bold text-primary">R$ 39,90</p>
                    <p className="text-text-secondary text-sm">por mês</p>
                  </div>
                </div>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success flex-shrink-0 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-text-primary font-medium">Entradas de diário ilimitadas</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success flex-shrink-0 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-text-primary font-medium">Entradas de áudio ilimitadas</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success flex-shrink-0 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-text-primary font-medium">Relatórios semanais ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success flex-shrink-0 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-text-primary font-medium">Análise avançada de padrões emocionais</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success flex-shrink-0 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-text-primary font-medium">Exportação de dados em PDF</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success flex-shrink-0 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-text-primary font-medium">Compartilhamento com terapeuta</span>
                  </li>
                </ul>

                <div className="mt-8">
                  <Link href="/register?plan=premium" className="w-full inline-flex justify-center py-3 px-5 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                    Começar 14 dias Grátis
                  </Link>
                  <p className="text-center text-sm text-text-secondary mt-2">
                    Garantia de devolução do dinheiro em 14 dias
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action - Design mais minimalista */}
        <div className="bg-primary">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-background sm:text-4xl">
              <span className="block">Pronto para começar sua jornada?</span>
              <span className="block text-accent-light">Comece a usar o Equilibri.IA hoje mesmo.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 gap-4">
              <Link href="/register" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-accent hover:opacity-90 transition-colors">
                Começar Grátis
              </Link>
              <Link href="#how-it-works" className="inline-flex items-center justify-center px-5 py-3 border border-accent text-base font-medium rounded-md text-accent bg-transparent hover:bg-primary-light transition-colors">
                Saiba mais
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer com estilo minimalista */}
      <footer className="bg-background-secondary border-t border-border">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <EquilibriLogo className="h-6" textColor="text-text-secondary" />
              <p className="mt-2 text-sm text-text-secondary">
                &copy; {new Date().getFullYear()} Equilibri.IA. Todos os direitos reservados.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                Privacidade
              </a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                Contato
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
