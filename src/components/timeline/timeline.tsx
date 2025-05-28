import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interface para os dados de um item na linha do tempo
export interface TimelineItem {
  id: string;
  date: Date;
  type: 'chat' | 'emotion' | 'goal' | 'insight';
  title: string;
  content: string;
  emotion?: string;
  intensity?: number;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className = '' }: TimelineProps) {
  // Agrupar itens por data (formato dia)
  const groupedByDay = items.reduce((groups, item) => {
    const day = format(item.date, 'yyyy-MM-dd');
    if (!groups[day]) {
      groups[day] = [];
    }
    groups[day].push(item);
    return groups;
  }, {} as Record<string, TimelineItem[]>);

  // Ordenar dias em ordem decrescente (mais recente primeiro)
  const sortedDays = Object.keys(groupedByDay).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Função para renderizar o ícone com base no tipo de evento
  const renderIcon = (type: string, emotion?: string) => {
    switch(type) {
      case 'chat':
        return (
          <div className="h-8 w-8 rounded-full bg-primary-ultra-light text-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        );
      case 'emotion':
        // Ícones diferentes para cada emoção
        let iconClass = 'text-primary';
        if (emotion === 'happy') iconClass = 'text-success';
        if (emotion === 'sad') iconClass = 'text-primary-light';
        if (emotion === 'anxious') iconClass = 'text-warning';
        if (emotion === 'angry') iconClass = 'text-error';
        
        return (
          <div className={`h-8 w-8 rounded-full bg-primary-ultra-light flex items-center justify-center ${iconClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
        );
      case 'goal':
        return (
          <div className="h-8 w-8 rounded-full bg-accent-light text-accent flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8" />
              <path d="M8 12h8" />
            </svg>
          </div>
        );
      case 'insight':
        return (
          <div className="h-8 w-8 rounded-full bg-brand-light text-brand flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.59 11.59a9 9 0 0 1-13.37 8.1 9 9 0 0 1-2.8-2.8 9 9 0 0 1 8.1-13.37 9 9 0 0 1 8.07 8.07z" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
        );
    }
  };

  if (items.length === 0) {
    return (
      <div className={`p-4 border rounded-lg bg-card ${className}`}>
        <div className="text-center py-8 text-muted-foreground">
          <p>Ainda não há dados para mostrar na linha do tempo.</p>
          <p className="text-sm mt-2">Continue conversando com a Lari para criar sua jornada!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 border rounded-lg bg-card ${className}`}>
      <h3 className="text-xl font-semibold mb-6">Sua Jornada Terapêutica</h3>
      <div className="space-y-6">
        {sortedDays.map(day => (
          <div key={day} className="mb-8">
            <div className="flex items-center mb-4">
              <div className="h-1 flex-grow bg-muted"></div>
              <h4 className="px-4 font-medium">
                {format(new Date(day), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </h4>
              <div className="h-1 flex-grow bg-muted"></div>
            </div>
            
            <div className="space-y-4">
              {groupedByDay[day]
                .sort((a, b) => b.date.getTime() - a.date.getTime()) // Ordenar por horário decrescente
                .map(item => (
                  <div key={item.id} className="flex">
                    <div className="mr-4 flex-shrink-0 pt-1">
                      {renderIcon(item.type, item.emotion)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="font-medium">{item.title}</h5>
                        <span className="text-xs text-muted-foreground">
                          {format(item.date, 'HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-text-primary">
                        {item.content}
                      </p>
                      {item.intensity !== undefined && (
                        <div className="mt-1 flex items-center">
                          <span className="text-xs text-muted-foreground mr-2">Intensidade:</span>
                          <div className="flex space-x-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div 
                                key={i} 
                                className={`h-2 w-2 rounded-full ${i < item.intensity! ? 'bg-primary' : 'bg-muted'}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 