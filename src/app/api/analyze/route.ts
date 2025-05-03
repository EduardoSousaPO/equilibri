import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';
import { analyzeJournalEntry } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    // Obter cliente Supabase
    const supabase = await createRouteClient();
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Obter dados da requisição
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: 'Conteúdo não fornecido' },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário é do plano gratuito e já atingiu o limite
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();
    
    if (profile?.subscription_tier === 'free') {
      // Contar entradas de diário do mês atual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count, error: countError } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());
      
      if (countError) {
        throw countError;
      }
      
      // Limite para plano gratuito: 50 entradas por mês
      if ((count || 0) >= 50) {
        return NextResponse.json(
          { error: 'Limite de entradas atingido', limitReached: true },
          { status: 403 }
        );
      }
    }
    
    // Analisar conteúdo com OpenAI
    const analysis = await analyzeJournalEntry(content);
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing content:', error);
    return NextResponse.json(
      { error: 'Erro ao analisar conteúdo' },
      { status: 500 }
    );
  }
}
