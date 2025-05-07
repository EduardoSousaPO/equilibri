import { NextResponse } from 'next/server';
import { lariChat, moderateContent, Message } from '@/lib/lari';
import { createServerSupabaseClient } from '@/lib/supabase/server-queries';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem não fornecida' },
        { status: 400 }
      );
    }
    
    // Verificar moderação de conteúdo
    const moderation = await moderateContent(message);
    if (moderation.flagged) {
      return NextResponse.json({ 
        message: moderation.message,
        flagged: true,
        reason: moderation.reason
      });
    }
    
    // Supabase client para salvar mensagem
    const supabase = await createServerSupabaseClient();
    
    // Get user information if logged in
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // Format messages for API
    const formattedHistory: Message[] = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Add the current message
    formattedHistory.push({
      role: 'user',
      content: message
    });
    
    // Get response from Lari
    const response = await lariChat(formattedHistory);
    
    // If user is logged in, save conversation to database
    if (userId) {
      const timestamp = new Date().toISOString();
      
      // Save user message
      await supabase.from('chat_messages').insert({
        user_id: userId,
        content: message,
        role: 'user',
        created_at: timestamp
      });
      
      // Save assistant response
      await supabase.from('chat_messages').insert({
        user_id: userId,
        content: response,
        role: 'assistant',
        created_at: timestamp
      });
      
      // If conversation is getting long, summarize for memory
      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (count && count > 0 && count % 25 === 0) {
        // This would be a good place to implement summarization
        // for long-term memory, but we'll leave it for future implementation
        console.log('Chat reached 25 messages milestone');
      }
    }
    
    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a mensagem' },
      { status: 500 }
    );
  }
} 