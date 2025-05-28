import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

interface PlanBannerProps {
  plan: string;
  messageCount: number;
  limitReached?: boolean;
  onUpgrade?: () => void;
}

export default function PlanBanner({ plan, messageCount, limitReached = false, onUpgrade }: PlanBannerProps) {
  // Definir conteúdo com base no plano
  const getPlanContent = () => {
    switch (plan) {
      case 'free':
        return {
          title: 'Plano Gratuito',
          description: 'Você está usando o plano gratuito do Equilibri.IA',
          limit: 30,
          color: 'bg-blue-50 border-blue-200',
          badge: 'bg-blue-100 text-blue-800',
          badgeText: 'Gratuito',
          buttonText: 'Fazer Upgrade',
          buttonVariant: 'default',
          showUpgrade: true
        };
      case 'premium':
        return {
          title: 'Plano Premium',
          description: 'Aproveite mensagens ilimitadas e relatórios em PDF',
          limit: Infinity,
          color: 'bg-purple-50 border-purple-200',
          badge: 'bg-purple-100 text-purple-800',
          badgeText: 'Premium',
          buttonText: 'Gerenciar Assinatura',
          buttonVariant: 'outline',
          showUpgrade: false
        };
      case 'clinical':
        return {
          title: 'Plano Premium Clínico',
          description: 'Inclui uma sessão mensal com psicóloga',
          limit: Infinity,
          color: 'bg-emerald-50 border-emerald-200',
          badge: 'bg-emerald-100 text-emerald-800',
          badgeText: 'Premium Clínico',
          buttonText: 'Agendar Sessão',
          buttonVariant: 'outline',
          showUpgrade: false
        };
      default:
        return {
          title: 'Plano Gratuito',
          description: 'Você está usando o plano gratuito do Equilibri.IA',
          limit: 30,
          color: 'bg-blue-50 border-blue-200',
          badge: 'bg-blue-100 text-blue-800',
          badgeText: 'Gratuito',
          buttonText: 'Fazer Upgrade',
          buttonVariant: 'default',
          showUpgrade: true
        };
    }
  };

  const content = getPlanContent();
  const percentage = Math.min(Math.round((messageCount / content.limit) * 100), 100);
  const isInfinite = content.limit === Infinity;

  return (
    <Card className={`w-full mb-4 ${content.color} border-2 shadow-sm`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">{content.title}</CardTitle>
          <Badge className={content.badge}>{content.badgeText}</Badge>
        </div>
        <CardDescription>{content.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!isInfinite && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Mensagens utilizadas</span>
              <span className={limitReached ? "text-red-600 font-medium" : ""}>
                {messageCount} / {content.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${limitReached ? 'bg-red-600' : 'bg-blue-600'}`} 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            {limitReached && (
              <p className="text-red-600 text-sm mt-2">
                Você atingiu o limite de mensagens do plano gratuito.
              </p>
            )}
          </div>
        )}
        {isInfinite && (
          <div className="flex items-center space-x-2 py-2">
            <Avatar className="h-8 w-8 bg-purple-100">
              <span className="text-purple-800 text-xs">∞</span>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Mensagens ilimitadas</p>
              <p className="text-xs text-gray-500">Aproveite sem restrições</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {content.showUpgrade && (
          <Button 
            onClick={onUpgrade} 
            className="w-full"
            variant={limitReached ? "default" : "outline"}
          >
            {content.buttonText}
          </Button>
        )}
        {!content.showUpgrade && plan === 'clinical' && (
          <Button 
            onClick={onUpgrade} 
            className="w-full"
            variant="outline"
          >
            {content.buttonText}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
