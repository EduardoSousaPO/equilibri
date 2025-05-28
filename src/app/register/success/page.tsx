'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RegistrationSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="border-2 border-emerald-500/20">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-emerald-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">
            Conta Criada com Sucesso!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Sua conta foi criada com sucesso. Enviamos um email de confirmação para o seu endereço.
            Por favor, verifique sua caixa de entrada e clique no link de confirmação.
          </p>
          
          <div className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-lg">
              <h2 className="font-medium text-emerald-800 mb-2">Próximos Passos:</h2>
              <ol className="list-decimal list-inside text-emerald-700 space-y-2">
                <li>Verifique seu email e confirme sua conta</li>
                <li>Faça login na plataforma</li>
                <li>Complete seu perfil</li>
                <li>Comece a usar o Equilibri!</li>
              </ol>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/login">
                  Fazer Login
                </Link>
              </Button>
              
              <Button asChild>
                <Link href="/">
                  Voltar para Home
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 