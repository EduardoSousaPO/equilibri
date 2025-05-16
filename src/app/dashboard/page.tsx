'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { generateMonthlyReport, PdfReport } from '@/utils/pdf';
import { MoodEntry, Highlight, ChatMessage } from '@/utils/pdf';
import { Timeline, TimelineItem } from '@/components/timeline/timeline';
import { fetchTimelineData } from '@/lib/timeline';

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

const PdfReports = ({ reports, onGenerateReport, isGenerating, isUserAllowed }: { 
  reports: PdfReport[]; 
  onGenerateReport: () => void;
  isGenerating: boolean;
  isUserAllowed: boolean;
}) => (
  <div className="rounded-lg border p-4 bg-card">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold">Relatórios PDF</h3>
      {isUserAllowed && (
        <Button 
          onClick={onGenerateReport} 
          disabled={isGenerating}
          size="sm"
        >
          {isGenerating ? 'Gerando...' : 'Exportar PDF'}
        </Button>
      )}
    </div>
    
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
        {!isUserAllowed && (
        <p className="mt-2 text-sm">
          Assine o plano Premium para gerar relatórios PDF para seu terapeuta.
        </p>
        )}
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
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  // Dados simulados para os componentes
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [reports, setReports] = useState<PdfReport[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }
        
        setUserId(user.id);
        
        // Buscar perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plan, name')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        setUserPlan(profile.plan);
        setUserName(profile.name || 'Usuário');
        
        // Gerar dados simulados para os componentes
        await fetchDashboardData(user.id);
        
        // Buscar dados da linha do tempo
        const timeline = await fetchTimelineData(user.id);
        setTimelineItems(timeline);
        
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar seus dados');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, [supabase, router]);

  const fetchDashboardData = async (userId: string) => {
    try {
      // Buscar dados de humor (emotion_checkins)
      const { data: emotionData } = await supabase
        .from('emotion_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(14);
      
      if (emotionData && emotionData.length > 0) {
        // Converter dados do banco para o formato esperado
        const moodEntries: MoodEntry[] = emotionData.map(entry => ({
          date: new Date(entry.created_at),
          value: entry.intensity,
          note: entry.note
        }));
        
        setMoodData(moodEntries);
      } else {
        // Gerar dados mock se não houver dados reais
        generateMockMoodData();
      }
      
      // Buscar mensagens relevantes do chat
      const { data: chatMessages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (chatMessages) {
        // Extrair possíveis destaques das mensagens
        const processedHighlights = processMessagesForHighlights(chatMessages);
        setHighlights(processedHighlights);
        
        // Armazenar mensagens para o relatório
        setMessages(chatMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at)
        })));
      } else {
        // Gerar destaques mock
        generateMockHighlights();
      }
      
      // Buscar relatórios existentes
      const { data: existingReports } = await supabase
        .from('user_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (existingReports && existingReports.length > 0) {
        setReports(existingReports.map(report => ({
          title: report.title,
          date: new Date(report.created_at),
          url: report.file_url
        })));
      }
      
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    }
  };

  const processMessagesForHighlights = (messages: any[]): Highlight[] => {
    // Lógica para extrair destaques das mensagens
    // Este é um exemplo simplificado
    const highlights: Highlight[] = [];
    
    for (const msg of messages) {
      // Apenas mensagens do assistente que parecem conter informações importantes
      if (msg.role === 'assistant' && 
          (msg.content.includes('importante') || 
           msg.content.includes('progresso') || 
           msg.content.includes('conseguiu'))) {
        
        // Extrai uma parte relevante da mensagem
        const content = msg.content.length > 120 
          ? msg.content.substring(0, 120) + '...' 
          : msg.content;
          
        highlights.push({
          title: 'Destaque da conversa',
          content,
          date: new Date(msg.created_at)
        });
        
        // Limitar a quantidade de destaques
        if (highlights.length >= 3) break;
      }
    }
    
    return highlights;
  };

  // Função para gerar dados de humor mock
  const generateMockMoodData = () => {
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
  };
    
  // Gerar destaques mock
  const generateMockHighlights = () => {
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
  };

  // Gerar e salvar relatório PDF
  const handleGenerateReport = async () => {
    if (!userId || !userName) {
      setToastMessage('Erro: Dados do usuário não disponíveis');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    setIsGeneratingPdf(true);
    
    try {
      // Gerar o relatório
      const report = await generateMonthlyReport(
        userId,
        userName,
        moodData,
        highlights,
        messages
      );
      
      // Em produção, aqui seria feito o upload do PDF para o Supabase Storage
      // e salvo o registro na tabela user_reports
      
      // Para este exemplo, apenas adicionamos ao estado local
      setReports(prev => [report, ...prev]);
      
      setToastMessage('Relatório gerado com sucesso!');
      setToastType('success');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      setToastMessage('Erro ao gerar relatório');
      setToastType('error');
    } finally {
      setIsGeneratingPdf(false);
      setShowToast(true);
      
      // Esconder o toast após 3 segundos
      setTimeout(() => setShowToast(false), 3000);
    }
  };
  
  // Verificar se o usuário pode gerar relatórios
  const canGenerateReports = userPlan === 'pro' || userPlan === 'clinical';

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
        <Timeline items={timelineItems} />
      </div>
      
      <div className="mb-6">
        <PdfReports 
          reports={reports} 
          onGenerateReport={handleGenerateReport}
          isGenerating={isGeneratingPdf}
          isUserAllowed={canGenerateReports}
        />
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
      
      {/* Toast de notificação */}
      {showToast && (
        <Toast 
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
} 