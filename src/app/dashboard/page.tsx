'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componentes mock (a serem substituídos pelos reais)
const MoodChart = ({ moodData }: { moodData: any[] }) => (
  <div className="rounded-lg border p-4 bg-card">
    <h3 className="text-xl font-semibold mb-4">Seu Humor</h3>
    <div className="h-64 flex items-end space-x-2">
      {moodData.map((day, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div 
            className="w-full bg-primary rounded-t" 
            style={{ 
              height: `${day.value * 12}px`,
              backgroundColor: day.value > 3 ? 'rgba(74, 222, 128, 0.5)' : 'rgba(248, 113, 113, 0.5)'
            }}
          ></div>
          <div className="text-xs mt-1 text-muted-foreground">
            {format(day.date, 'dd/MM')}
          </div>
        </div>
      ))}
    </div>
    <div className="flex justify-between mt-4 text-sm">
      <div>Baixo</div>
      <div>Alto</div>
    </div>
  </div>
);

const Highlights = ({ highlights }: { highlights: any[] }) => (
  <div className="rounded-lg border p-4 bg-card">
    <h3 className="text-xl font-semibold mb-4">Destaques</h3>
    <div className="space-y-3">
      {highlights.map((highlight, i) => (
        <div key={i} className="border-b pb-3 last:border-b-0 last:pb-0">
          <div className="flex justify-between items-start">
            <h4 className="font-medium">{highlight.title}</h4>
            <span className="text-xs text-muted-foreground">
              {format(highlight.date, "d 'de' MMMM", { locale: ptBR })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{highlight.content}</p>
        </div>
      ))}
    </div>
  </div>
);

const PdfReports = ({ reports }: { reports: any[] }) => (
  <div className="rounded-lg border p-4 bg-card">
    <h3 className="text-xl font-semibold mb-4">Relatórios PDF</h3>
    {reports.length > 0 ? (
      <div className="space-y-2">
        {reports.map((report, i) => (
          <a 
            key={i}
            href={report.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border rounded-md hover:bg-muted transition-colors"
          >
            <div>
              <div className="font-medium">{report.title}</div>
              <div className="text-xs text-muted-foreground">
                {format(report.date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
            </div>
            <div className="flex items-center text-sm text-primary">
              <span>Baixar</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>
          </a>
        ))}
      </div>
    ) : (
      <div className="text-center py-6 text-muted-foreground">
        <p>Nenhum relatório disponível</p>
        {/* Se não for premium, mostrar mensagem sobre upgrade */}
        <p className="mt-2 text-sm">
          Assine o plano Premium para gerar relatórios PDF para seu terapeuta.
        </p>
      </div>
    )}
  </div>
);

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>('free');
  
  // Dados simulados para os componentes
  const [moodData, setMoodData] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }
        
        // Buscar plano do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        setUserPlan(profile.plan);
        
        // Gerar dados simulados para os componentes
        // Em um app real, esses dados viriam do banco
        generateMockData();
        
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar seus dados');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, [supabase, router]);

  // Função para gerar dados de teste
  const generateMockData = () => {
    // Gerar dados de humor para os últimos 14 dias
    const moodEntries = Array.from({ length: 14 }, (_, i) => {
      // Gerar valores entre 1 e 5, com tendência a melhorar com o tempo
      // para simular progresso terapêutico
      const baseValue = i < 7 ? 2 : 3.5;
      const randomVariation = Math.random() * 2 - 1; // -1 a 1
      let value = baseValue + randomVariation;
      value = Math.max(1, Math.min(5, value)); // Limitar entre 1 e 5
      
      return {
        date: subDays(new Date(), 13 - i),
        value: Math.round(value * 10) / 10, // Arredondar para 1 casa decimal
      };
    });
    
    setMoodData(moodEntries);
    
    // Gerar destaques
    setHighlights([
      {
        title: 'Progresso na ansiedade social',
        content: 'Consegui participar de uma reunião de trabalho sem sentir o coração acelerado.',
        date: subDays(new Date(), 2),
      },
      {
        title: 'Técnica de respiração eficaz',
        content: 'A técnica de respiração 4-7-8 tem ajudado muito nos momentos de tensão.',
        date: subDays(new Date(), 5),
      },
      {
        title: 'Novo hobby',
        content: 'Comecei a praticar jardinagem e tenho me sentido mais relaxado e conectado com a natureza.',
        date: subDays(new Date(), 8),
      },
    ]);
    
    // Relatórios PDF (apenas para planos premium)
    if (userPlan === 'pro' || userPlan === 'clinical') {
      setReports([
        {
          title: 'Relatório Mensal - Julho 2023',
          date: new Date(2023, 6, 30), // Julho (0-indexed)
          url: '#', // Seria um link real para o PDF
        },
        {
          title: 'Relatório Mensal - Junho 2023',
          date: new Date(2023, 5, 30), // Junho
          url: '#',
        },
      ]);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Carregando seu dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Seu Dashboard</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <MoodChart moodData={moodData} />
        <Highlights highlights={highlights} />
      </div>
      
      <div className="mb-6">
        <PdfReports reports={userPlan === 'free' ? [] : reports} />
      </div>
      
      {userPlan === 'free' && (
        <div className="rounded-lg border p-4 bg-primary/10 text-center">
          <h3 className="font-semibold mb-2">Desbloqueie Relatórios PDF</h3>
          <p className="text-sm mb-4">
            Assine o plano Premium para gerar relatórios detalhados para compartilhar com seu terapeuta.
          </p>
          <button 
            onClick={() => router.push('/settings')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Fazer Upgrade
          </button>
        </div>
      )}
    </div>
  );
} 