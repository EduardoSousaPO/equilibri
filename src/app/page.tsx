'use client'

import Link from 'next/link'
import Image from 'next/image'
import { EquilibriLogo } from '@/components/ui/logo'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumCard } from '@/components/ui/premium-card'
import { WhatsAppButton } from '@/components/ui/whatsapp-button'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <WhatsAppButton>{null}</WhatsAppButton>
      {/* Banner da nova funcionalidade com efeito de vidro */}
      <div className="glass-effect backdrop-blur-sm border-b border-white/10 text-foreground p-3 text-center">
        <p className="font-medium">
          🎉 <span className="font-bold metallic-text">Novidade:</span> Conheça Lari, sua nova terapeuta digital! <a href="/login?redirect=chat" className="text-primary hover:text-primary-light transition-colors font-semibold">Faça login para conversar</a>
        </p>
      </div>
      
      {/* Navbar premium */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <EquilibriLogo className="h-auto" imageSize="md">{null}</EquilibriLogo>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link href="#features" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
                Funcionalidades
              </Link>
              <Link href="#how-it-works" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
                Como Funciona
              </Link>
              <Link href="#pricing" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
                Planos
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" passHref legacyBehavior>
                <button type="button" className="ml-2 h-8 px-3 rounded-md bg-transparent hover:bg-accent/10 text-accent hover:text-accent-light text-sm font-medium transition-all">
                  Entrar
                </button>
              </Link>
              <Link href="/register" passHref legacyBehavior>
                <button type="button" className="h-10 px-4 py-2 border-2 border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-all">
                  Começar Grátis
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section premium */}
      <main className="flex-grow">
        <div className="bg-background-secondary">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-12">
                <EquilibriLogo className="h-auto" imageSize="xl">{null}</EquilibriLogo>
              </div>
              <h1 className="premium-heading text-4xl sm:text-5xl lg:text-6xl mb-6">
                Seu Companheiro Terapêutico<br/>
                <span className="metallic-text">Inteligente</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-text-primary">
                Converse com a Lari, nossa IA terapêutica que entende suas emoções e oferece suporte personalizado baseado em evidências científicas.
              </p>
              <div className="mt-10 flex justify-center gap-4">
                <Link href="/register" passHref legacyBehavior>
                  <button type="button" className="h-12 px-8 rounded-lg text-base font-medium bg-metallic-gold text-foreground shadow-metallic hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    Começar agora
                  </button>
                </Link>
                <Link href="/login?redirect=chat" passHref legacyBehavior>
                  <button type="button" className="h-12 px-8 rounded-lg text-base font-medium glass-effect text-foreground hover:bg-white/90 dark:hover:bg-background-secondary/90 transition-all">
                    Converse com Lari
                  </button>
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
                <h2 className="text-base font-semibold text-primary tracking-wide uppercase">O CORAÇÃO DO EQUILIBRI</h2>
                <p className="mt-2 text-3xl font-display font-bold text-foreground sm:text-4xl">
                  Conheça Lari, sua terapeuta digital
                </p>
                <p className="mt-4 text-lg text-text-primary">
                  Oi! Sou a Lari, uma companheira digital que une ciência e acolhimento para te ajudar em sua jornada de bem-estar emocional. 
                  Através de conversas significativas e técnicas comprovadas, posso te auxiliar a lidar melhor com pensamentos, 
                  emoções e desafios do dia a dia, sempre respeitando seu ritmo e suas necessidades únicas.
                </p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-text-primary">Especialista em TCC, ACT, DBT e logoterapia</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-text-primary">Memória contínua das suas conversas e emoções</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-text-primary">Acompanha seu progresso ao longo do tempo</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-text-primary">Disponível 24/7 para apoio emocional</p>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/login?redirect=chat" passHref legacyBehavior>
                    <button type="button" className="h-12 px-8 rounded-lg text-base font-medium bg-metallic-gold text-foreground shadow-metallic hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center">
                      Conversar com Lari
                      <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 -mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </Link>
                </div>
              </div>
              <div className="lg:w-5/12">
                <div className="premium-card glass-effect p-6 max-w-md mx-auto lg:mx-0 rounded-lg shadow-sm border border-border">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-xl font-medium">L</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-foreground text-lg">Lari</h3>
                      <p className="text-text-secondary text-sm">Terapeuta Digital</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="premium-card p-4 rounded-lg shadow-sm bg-white border border-border">
                      <p className="text-text-primary text-sm">
                        Olá! Sou Lari, sua terapeuta virtual. Estou aqui para conversar sobre suas emoções, ajudar com técnicas terapêuticas e acompanhar seu progresso emocional. Como está se sentindo hoje?
                      </p>
                    </div>
                    <div className="premium-card p-4 ml-auto mr-4 max-w-[80%] rounded-lg shadow-sm bg-metallic-gold/10 border border-gold-500/20">
                      <p className="text-text-primary text-sm">
                        Estou me sentindo um pouco ansioso hoje.
                      </p>
                    </div>
                    <div className="premium-card p-4 rounded-lg shadow-sm bg-white border border-border">
                      <p className="text-text-primary text-sm">
                        Obrigada por compartilhar. A ansiedade é uma resposta natural, mas pode ser desconfortável. Você gostaria de explorar o que está causando essa ansiedade ou prefere aprender uma técnica rápida de respiração que pode ajudar?
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex">
                    <div className="premium-input flex-1 text-sm">
                      <p className="text-text-secondary">Digite sua mensagem aqui...</p>
                    </div>
                    <button type="button" className="ml-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-transparent hover:bg-accent/10 text-accent hover:text-accent-light">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-4 text-center">
                    <Link href="/login?redirect=chat" className="text-primary hover:text-primary-light text-sm hover:underline transition-colors">
                      Fazer login para conversar →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Features Section com cards premium */}
      <div id="features" className="py-20 bg-background-secondary overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary tracking-wide uppercase">FUNCIONALIDADES</h2>
            <p className="mt-2 text-3xl font-display font-bold text-foreground sm:text-4xl">
              Uma nova abordagem para o<br/>
              <span className="metallic-text">bem-estar emocional</span>
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-text-primary">
              Combinamos tecnologia avançada com práticas terapêuticas cientificamente validadas.
            </p>
          </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
                {/* Feature Cards */}
                <div className="premium-card glass-effect p-6 hover:transform hover:-translate-y-1 transition-all duration-300 rounded-lg shadow-sm border border-border">
                  <div className="w-12 h-12 rounded-md flex items-center justify-center bg-primary/10 text-primary mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                    </svg>
                  </div>
                  <h3 className="premium-heading text-lg mb-2">Conversas Terapêuticas</h3>
                  <p className="text-text-primary">Diálogos significativos baseados em terapias cientificamente validadas.</p>
                </div>
                
                {/* Adicione mais feature cards aqui */}
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
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
              {/* Feature 1 */}
              <div className="border border-border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-md flex items-center justify-center bg-primary-ultra-light text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium font-georgia text-primary">Chat Terapêutico com Lari</h3>
                <p className="mt-2 text-base text-text-primary">
                  Converse com a Lari, nossa IA treinada em terapias baseadas em evidências, com suporte de texto e voz.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="border border-border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-md flex items-center justify-center bg-primary-ultra-light text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium font-georgia text-primary">Check-ins Emocionais</h3>
                <p className="mt-2 text-base text-text-primary">
                  Registre seu estado emocional diretamente no chat e acompanhe padrões ao longo do tempo.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="border border-border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-md flex items-center justify-center bg-primary-ultra-light text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium font-georgia text-primary">Dashboard Emocional</h3>
                <p className="mt-2 text-base text-text-primary">
                  Visualize sua jornada emocional com gráficos intuitivos e exporte relatórios em PDF (Premium).
                </p>
              </div>

              {/* Feature 4 */}
              <div className="border border-border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-md flex items-center justify-center bg-primary-ultra-light text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium font-georgia text-primary">Plano Terapêutico</h3>
                <p className="mt-2 text-base text-text-primary">
                  Receba um plano personalizado com tarefas práticas baseado em suas conversas com a Lari.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="border border-border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-md flex items-center justify-center bg-primary-ultra-light text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium font-georgia text-primary">Sessões com Psicóloga</h3>
                <p className="mt-2 text-base text-text-primary">
                  No plano Premium Clínico, agende uma sessão mensal de 60min com nossa psicóloga.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="border border-border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-md flex items-center justify-center bg-primary-ultra-light text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium font-georgia text-primary">Privacidade Garantida</h3>
                <p className="mt-2 text-base text-text-primary">
                  Proteção total de seus dados com criptografia e conformidade com a LGPD.
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
              Uma jornada terapêutica completa
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-text-primary">
              O Equilibri combina o melhor da IA com apoio humano para oferecer uma experiência terapêutica integrada
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
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
                  <strong>Aplicação no Equilibri:</strong> Sugestão de técnicas de autorregulação emocional, estratégias de tolerância ao estresse e práticas de mindfulness adaptadas às necessidades específicas.
                </p>
              </div>

              {/* Logoterapia */}
              <div className="border border-border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-primary">Logoterapia</h3>
                <p className="mt-2 text-base text-text-primary">
                  Abordagem centrada no sentido da vida, que ajuda as pessoas a descobrirem significado em suas experiências e desenvolverem um propósito autêntico.
                </p>
                <p className="mt-4 text-sm text-text-secondary">
                  <strong>Aplicação no Equilibri:</strong> Exploração de valores fundamentais, identificação de fontes de sentido, desenvolvimento de projetos significativos e técnicas de autotranscendência para conectar com propósitos maiores.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Por que Lari é diferente - Nova seção */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base font-semibold text-brand tracking-wide uppercase">POR QUE O EQUILIBRI É DIFERENTE</h2>
            <p className="mt-2 text-3xl font-georgia font-bold text-primary sm:text-4xl">
              Lari vs. Chatbots Genéricos
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-text-primary">
              Veja por que a Lari oferece uma experiência terapêutica superior a chatbots de IA genéricos
            </p>
          </div>

          <div className="overflow-hidden shadow rounded-lg border">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background-secondary">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-primary">
                    Recurso
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-brand">
                    Equilibri.IA
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-text-secondary">
                    ChatGPT / Outros
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    Memória emocional contínua
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <svg className="h-5 w-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <svg className="h-5 w-5 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    Plano terapêutico personalizado
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <svg className="h-5 w-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <svg className="h-5 w-5 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    Dashboard emocional e relatórios
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <svg className="h-5 w-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <svg className="h-5 w-5 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    Sessão mensal com psicóloga real
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <svg className="h-5 w-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <svg className="h-5 w-5 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    Especialização em saúde mental
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <svg className="h-5 w-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <svg className="h-5 w-5 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-10 text-center">
            <Link href="/register" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-light transition-colors">
              Experimente a diferença
            </Link>
          </div>
        </div>
      </div>

      {/* Planos e Preços */}
      <div id="pricing" className="py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-accent tracking-wide uppercase">PLANOS</h2>
            <p className="mt-2 text-3xl font-georgia font-bold text-primary sm:text-4xl">
              Escolha o plano ideal para sua jornada
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-text-primary">
              Comece gratuitamente ou desbloqueie todos os recursos com os planos premium
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Plano Gratuito */}
            <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="px-6 py-8">
                <h3 className="text-2xl font-medium text-primary">Plano Gratuito</h3>
                <p className="mt-2 text-text-primary">Para começar sua jornada</p>
                <p className="mt-8">
                  <span className="text-5xl font-bold text-primary">R$ 0</span>
                  <span className="text-text-secondary">/para sempre</span>
                </p>
                <button type="button" className="h-10 px-4 py-2 border-2 border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-all">
                  Começar Grátis
                </button>
              </div>
              <div className="border-t border-border px-6 py-8">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-text-primary">30 mensagens por mês com Lari</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-text-primary">Check-ins emocionais no chat</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-text-primary">Plano terapêutico básico</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-text-primary">Dashboard emocional</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="ml-3 text-text-secondary">Sem exportação de PDF</span>
                  </li>
                </ul>
              </div>
            </div>

              {/* Plano Premium */}
              <div className="bg-white rounded-lg shadow-lg border-2 border-primary overflow-hidden relative">
                <div className="absolute top-0 right-0 mr-4 mt-4 bg-accent text-primary text-xs font-bold uppercase py-1 px-2 rounded">
                  Recomendado
                </div>
                <div className="px-6 py-8">
                  <h3 className="text-2xl font-medium text-primary">Plano Premium</h3>
                  <p className="mt-2 text-text-primary">Para uma experiência completa</p>
                  <p className="mt-8">
                    <span className="text-5xl font-bold text-primary">R$ 39,90</span>
                    <span className="text-text-secondary">/por mês</span>
                  </p>
                  <button type="button" className="mt-8 w-full h-10 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/80 text-base font-medium transition-all">
                    Começar 14 dias Grátis
                  </button>
                  <p className="mt-2 text-center text-xs text-text-secondary">
                    Garantia de devolução do dinheiro em 14 dias
                  </p>
                </div>
                <div className="border-t border-border px-6 py-8">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-text-primary">Chat ilimitado com Lari</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-text-primary">Check-ins emocionais ilimitados</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-text-primary">Plano terapêutico avançado</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-text-primary">Análise avançada de padrões emocionais</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-text-primary">Exportação de relatórios em PDF</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-text-primary">Compartilhamento com terapeuta</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Plano Premium Clínico - NOVO */}
              <div className="bg-white rounded-lg shadow-lg border-2 border-brand overflow-hidden relative">
                <div className="absolute top-0 right-0 mr-4 mt-4 bg-brand text-white text-xs font-bold uppercase py-1 px-2 rounded">
                  Novo
                </div>
                <div className="px-6 py-8">
                  <h3 className="text-2xl font-medium text-primary">Premium Clínico</h3>
                  <p className="mt-2 text-text-primary">Suporte terapêutico completo</p>
                  <p className="mt-8">
                    <span className="text-5xl font-bold text-primary">R$ 179,00</span>
                    <span className="text-text-secondary">/por mês</span>
                  </p>
                  <button type="button" className="mt-8 w-full h-10 px-4 py-2 rounded-md bg-brand text-white hover:bg-brand/90 text-base font-medium transition-all">
                    Começar 7 dias Grátis
                  </button>
                  <p className="mt-2 text-center text-xs text-text-secondary">
                    Garantia de devolução do dinheiro em 7 dias
                  </p>
                </div>
                <div className="border-t border-border px-6 py-8">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-text-primary font-medium">Tudo do plano Premium</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 font-medium text-brand">1 sessão mensal com psicóloga</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-text-primary">Videochamada de 60 minutos</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-text-primary">Agendamento online fácil</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-text-primary">Continuidade terapêutica</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-text-primary">Acesso à agenda exclusiva</span>
                    </li>
                  </ul>
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
            <EquilibriLogo className="h-auto" imageSize="sm" showText={false}>{null}</EquilibriLogo>
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
