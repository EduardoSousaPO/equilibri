import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface AnalysisProgressProps {
  totalInteractions: number;
  canCreatePlan: boolean;
  onCreatePlan?: () => void;
}

export function AnalysisProgress({ 
  totalInteractions, 
  canCreatePlan,
  onCreatePlan 
}: AnalysisProgressProps) {
  const router = useRouter();
  const progress = Math.min((totalInteractions / 7) * 100, 100);
  
  return (
    <div className="w-full p-4 bg-background rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">
          Análise Terapêutica
        </h3>
        <span className="text-xs text-muted-foreground">
          {totalInteractions}/7 interações
        </span>
      </div>
      
      <Progress value={progress} className="h-2 mb-4" />
      
      {totalInteractions < 7 ? (
        <p className="text-xs text-muted-foreground">
          Faltam {7 - totalInteractions} interações para gerar seu plano personalizado
        </p>
      ) : canCreatePlan ? (
        <div className="space-y-2">
          <p className="text-sm text-primary">
            Análise completa! Você já pode criar seu plano terapêutico personalizado.
          </p>
          <Button
            onClick={() => onCreatePlan?.() || router.push('/app/therapy-plan/create')}
            className="w-full"
          >
            Criar Plano Terapêutico
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Continue interagindo para refinar sua análise
        </p>
      )}
    </div>
  );
} 