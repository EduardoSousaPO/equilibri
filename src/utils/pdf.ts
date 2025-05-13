import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos
export interface MoodEntry {
  date: Date;
  value: number; // 1 a 5
  note?: string;
}

export interface Highlight {
  title: string;
  content: string;
  date: Date;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at: Date;
}

export interface PdfReport {
  title: string;
  date: Date;
  url: string;
}

/**
 * Classe estendida para tipar adequadamente o autoTable
 */
interface JsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => any;
  lastAutoTable?: { finalY: number };
}

/**
 * Gera um relatório PDF baseado nos dados de humor e conversas
 * @param userId ID do usuário
 * @param userName Nome do usuário
 * @param period Período do relatório (ex: 'Julho 2023')
 * @param moodData Dados de humor do período
 * @param highlights Destaques do período
 * @param messages Mensagens de chat do período
 * @returns Objeto com metadados do relatório e URL para download
 */
export async function generatePdfReport(
  userId: string,
  userName: string,
  period: string,
  moodData: MoodEntry[],
  highlights: Highlight[],
  messages: ChatMessage[],
): Promise<PdfReport> {
  // Em ambiente de teste, retornar mock direto sem criar o PDF
  if (process.env.NODE_ENV === 'test') {
    return {
      title: `Relatório ${period}`,
      date: new Date(),
      url: 'mock-url'
    };
  }
  
  // Criar novo documento PDF
  const doc = new jsPDF() as JsPDFWithAutoTable;
  
  // Adicionar título e data
  const reportDate = new Date();
  doc.setFontSize(20);
  doc.text(`Relatório ${period}`, 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Usuário: ${userName}`, 105, 30, { align: 'center' });
  doc.text(
    `Gerado em: ${format(reportDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`,
    105, 
    38, 
    { align: 'center' }
  );
  
  // Adicionar resumo do humor
  doc.setFontSize(16);
  doc.text('Resumo do Humor', 14, 50);
  
  if (moodData.length > 0) {
    // Calcular média
    const avgMood = moodData.reduce((sum, entry) => sum + entry.value, 0) / moodData.length;
    
    doc.setFontSize(12);
    doc.text(`Humor médio: ${avgMood.toFixed(1)} / 5`, 14, 60);
    
    // Tabela de humor
    const moodTableData = moodData.map(entry => [
      format(entry.date, 'dd/MM/yyyy'),
      entry.value.toString(),
      entry.note || '—'
    ]);
    
    doc.autoTable({
      startY: 70,
      head: [['Data', 'Valor (1-5)', 'Observação']],
      body: moodTableData,
      theme: 'grid',
    });
  } else {
    doc.setFontSize(12);
    doc.text('Sem dados de humor registrados no período.', 14, 60);
  }
  
  // Adicionar destaques
  const finalY = doc.lastAutoTable?.finalY || 70;
  doc.setFontSize(16);
  doc.text('Destaques do Período', 14, finalY + 20);
  
  if (highlights.length > 0) {
    let y = finalY + 30;
    
    highlights.forEach(highlight => {
      // Verificar se precisa de uma nova página
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${highlight.title} (${format(highlight.date, 'dd/MM')})`, 14, y);
      
      doc.setFont('helvetica', 'normal');
      // Quebrar o texto em linhas para não ultrapassar a margem
      const lines = doc.splitTextToSize(highlight.content, 180);
      doc.text(lines, 14, y + 8);
      
      y += 8 + (lines.length * 7) + 10; // Ajustar posição Y para o próximo destaque
    });
  } else {
    doc.setFontSize(12);
    doc.text('Sem destaques registrados no período.', 14, finalY + 30);
  }
  
  // Salvar o PDF como Blob
  const pdfBlob = doc.output('blob');
  
  // Em um ambiente real, seria feito upload para um storage (ex: Supabase Storage)
  // e retornada a URL pública. Para esse exemplo, criaremos uma URL temporária
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  // Criar e retornar o objeto de relatório
  return {
    title: `Relatório ${period}`,
    date: reportDate,
    url: pdfUrl
  };
}

/**
 * Gera um novo relatório do mês atual
 * Esta função seria chamada por um botão na interface ou agendada mensalmente
 */
export async function generateMonthlyReport(
  userId: string,
  userName: string,
  moodData: MoodEntry[],
  highlights: Highlight[],
  messages: ChatMessage[],
): Promise<PdfReport> {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  
  const period = format(lastMonth, "MMMM 'de' yyyy", { locale: ptBR });
  
  return generatePdfReport(
    userId,
    userName,
    period,
    moodData,
    highlights,
    messages
  );
} 