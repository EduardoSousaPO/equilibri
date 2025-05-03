'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">DiarioTer</h1>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link href="#features" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-700 hover:text-blue-600">
                Funcionalidades
              </Link>
              <Link href="#how-it-works" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-700 hover:text-blue-600">
                Como Funciona
              </Link>
              <Link href="#pricing" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-700 hover:text-blue-600">
                Planos
              </Link>
            </div>
            <div className="flex items-center">
              <Link href="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Entrar
              </Link>
              <Link href="/register" className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="bg-slate-50">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                Seu Companheiro Terapêutico Inteligente
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-500">
                Transforme seus pensamentos em insights terapêuticos com um diário que entende suas emoções e oferece suporte baseado em evidências científicas.
              </p>
              <div className="mt-10 flex justify-center">
                <Link href="/register" className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                  Comece sua jornada
                </Link>
                <Link href="#how-it-works" className="ml-4 px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-slate-50 md:py-4 md:text-lg md:px-10">
                  Saiba mais
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-16 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Funcionalidades</h2>
              <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Uma nova abordagem para o bem-estar emocional
              </p>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-500">
                Combinamos tecnologia avançada com práticas terapêuticas cientificamente validadas.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Feature 1 */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-md flex items-center justify-center bg-blue-100 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-slate-900">Diário Terapêutico Inteligente</h3>
                  <p className="mt-2 text-base text-slate-500">
                    Registre seus pensamentos e receba insights personalizados baseados em terapias com evidência científica.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-md flex items-center justify-center bg-blue-100 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-slate-900">Diário por Voz</h3>
                  <p className="mt-2 text-base text-slate-500">
                    Grave seus pensamentos em áudio e deixe nossa tecnologia transcrever e analisar para você.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-md flex items-center justify-center bg-blue-100 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-slate-900">Check-ins Emocionais</h3>
                  <p className="mt-2 text-base text-slate-500">
                    Registre seu estado emocional rapidamente e acompanhe padrões ao longo do tempo com visualizações intuitivas.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-md flex items-center justify-center bg-blue-100 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-slate-900">Relatórios Semanais</h3>
                  <p className="mt-2 text-base text-slate-500">
                    Receba análises semanais automatizadas com insights sobre seus padrões emocionais e progresso.
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-md flex items-center justify-center bg-blue-100 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-slate-900">Prontuário Terapêutico</h3>
                  <p className="mt-2 text-base text-slate-500">
                    Visualize sua jornada terapêutica com uma linha do tempo interativa e filtros personalizados.
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-md flex items-center justify-center bg-blue-100 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-slate-900">Compartilhamento com Terapeutas</h3>
                  <p className="mt-2 text-base text-slate-500">
                    Compartilhe seu prontuário com seu terapeuta de forma segura e controlada para otimizar suas sessões.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="py-16 bg-slate-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Como Funciona</h2>
              <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Baseado em abordagens terapêuticas comprovadas
              </p>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-500">
                O DiarioTer utiliza três abordagens terapêuticas cientificamente validadas para oferecer suporte personalizado.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* TCC */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium text-slate-900">Terapia Cognitivo-Comportamental (TCC)</h3>
                  <p className="mt-2 text-base text-slate-500">
                    Identifica e modifica padrões distorcidos de pensamento que influenciam comportamentos e emoções.
                  </p>
                  <p className="mt-4 text-sm text-slate-600">
                    <strong>Aplicação no DiarioTer:</strong> Análise automática de distorções cognitivas nos textos, sugestão de reestruturação cognitiva e técnicas de questionamento socrático.
                  </p>
                </div>

                {/* ACT */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium text-slate-900">Terapia de Aceitação e Compromisso (ACT)</h3>
                  <p className="mt-2 text-base text-slate-500">
                    Promove a flexibilidade psicológica através da aceitação de experiências internas e compromisso com ações alinhadas aos valores pessoais.
                  </p>
                  <p className="mt-4 text-sm text-slate-600">
                    <strong>Aplicação no DiarioTer:</strong> Identificação de tentativas de evitação experiencial, promoção de defusão cognitiva e exercícios de atenção plena contextualizados.
                  </p>
                </div>

                {/* DBT */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium text-slate-900">Terapia Comportamental Dialética (DBT)</h3>
                  <p className="mt-2 text-base text-slate-500">
                    Desenvolve habilidades para regulação emocional, tolerância ao desconforto, efetividade interpessoal e consciência plena.
                  </p>
                  <p className="mt-4 text-sm text-slate-600">
                    <strong>Aplicação no DiarioTer:</strong> Sugestão de técnicas de autorregulação emocional, estratégias de tolerância ao estresse e práticas de mindfulness adaptadas às necessidades específicas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Planos</h2>
              <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Escolha o plano ideal para sua jornada
              </p>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-500">
                Comece gratuitamente e evolua conforme suas necessidades.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-y-10 gap-x-8 lg:grid-cols-2">
              {/* Free Plan */}
              <div className="border border-slate-200 rounded-2xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-medium text-slate-900">Plano Gratuito</h3>
                <p className="mt-4 text-sm text-slate-500">Perfeito para começar sua jornada de autoconhecimento.</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-slate-900">R$0</span>
                  <span className="text-base font-medium text-slate-500">/mês</span>
                </p>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="ml-3 text-base text-slate-700">50 entradas de diário por mês</p>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="ml-3 text-base text-slate-700">2 entradas de áudio por mês</p>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="ml-3 text-base text-slate-700">Check-ins emocionais ilimitados</p>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="ml-3 text-base text-slate-700">Armazenamento de 4 relatórios semanais</p>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="ml-3 text-base text-slate-700">Insights básicos</p>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/register" className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Começar Grátis
                  </Link>
                </div>
              </div>

              {/* Premium Plan */}
              <div className="border-2 border-blue-500 rounded-2xl p-8 bg-white shadow-md hover:shadow-lg transition-shadow relative">
                <div className="absolute top-0 right-0 -mt-4 mr-4 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Recomendado
                </div>
                <h3 className="text-xl font-medium text-slate-900">Plano Premium</h3>
                <p className="mt-4 text-sm text-slate-500">Para uma experiência terapêutica completa e sem limitações.</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-slate-900">R$29,90</span>
                  <span className="text-base font-medium text-slate-500">/mês</span>
                </p>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="ml-3 text-base text-slate-700">Entradas de diário ilimitadas</p>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="ml-3 text-base text-slate-700">Entradas de áudio ilimitadas</p>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="ml-3 text-base text-slate-700">Check-ins emocionais ilimitados</p>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="ml-3 text-base text-slate-700">Armazenamento ilimitado de relatórios</p>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="ml-3 text-base text-slate-700">Insights avançados e personalizados</p>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="ml-3 text-base text-slate-700">Exportação CSV/PDF</p>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="ml-3 text-base text-slate-700">Chat com GPT-Therapist</p>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="ml-3 text-base text-slate-700">Prioridade no suporte</p>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/register" className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Começar com 7 dias grátis
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Pronto para começar sua jornada?</span>
              <span className="block text-blue-200">Comece a usar o DiarioTer hoje mesmo.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link href="/register" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50">
                  Começar Grátis
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link href="#how-it-works" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800">
                  Saiba mais
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <h2 className="text-2xl font-bold text-white">DiarioTer</h2>
              <p className="text-slate-300 text-base">
                Seu companheiro terapêutico inteligente, combinando tecnologia avançada com práticas terapêuticas cientificamente validadas.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-slate-400 hover:text-slate-300">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-slate-300">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-slate-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 tracking-wider uppercase">Produto</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#features" className="text-base text-slate-400 hover:text-slate-300">
                        Funcionalidades
                      </a>
                    </li>
                    <li>
                      <a href="#how-it-works" className="text-base text-slate-400 hover:text-slate-300">
                        Como Funciona
                      </a>
                    </li>
                    <li>
                      <a href="#pricing" className="text-base text-slate-400 hover:text-slate-300">
                        Planos
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-slate-300 tracking-wider uppercase">Suporte</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-slate-400 hover:text-slate-300">
                        FAQ
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-slate-400 hover:text-slate-300">
                        Contato
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-slate-400 hover:text-slate-300">
                        Ajuda
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 tracking-wider uppercase">Empresa</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-slate-400 hover:text-slate-300">
                        Sobre
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-slate-400 hover:text-slate-300">
                        Blog
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-slate-400 hover:text-slate-300">
                        Parceiros
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-slate-300 tracking-wider uppercase">Legal</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-slate-400 hover:text-slate-300">
                        Privacidade
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-slate-400 hover:text-slate-300">
                        Termos
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-700 pt-8">
            <p className="text-base text-slate-400 xl:text-center">
              &copy; 2025 DiarioTer. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
