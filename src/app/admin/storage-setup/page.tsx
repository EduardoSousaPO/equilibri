'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function StorageSetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    details?: any;
  } | null>(null);

  async function createBucket() {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/storage/create-bucket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setResult({
          success: false,
          error: data.error || 'Erro ao criar bucket',
          details: data.details || data.message
        });
        return;
      }
      
      setResult({
        success: true,
        message: data.message || 'Bucket criado com sucesso'
      });
      
    } catch (error: any) {
      setResult({
        success: false,
        error: 'Falha ao processar solicitação',
        details: error.message
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Configuração de Storage</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Bucket de Audio</CardTitle>
          <CardDescription>
            Crie o bucket necessário para uploads de áudio no Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            O aplicativo Equilibri.IA requer um bucket chamado <code>audiouploads</code> para 
            armazenar os arquivos de áudio enviados pelos usuários para transcrição.
          </p>
          <p className="mb-4">
            Clique no botão abaixo para criar automaticamente este bucket com as 
            configurações e políticas necessárias.
          </p>
          
          {result && (
            <Alert className="mb-4" variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {result.success ? 'Sucesso' : 'Erro'}
              </AlertTitle>
              <AlertDescription>
                {result.success ? result.message : result.error}
                {result.details && (
                  <div className="mt-2 text-xs opacity-80">
                    <pre className="p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto">
                      {typeof result.details === 'object' 
                        ? JSON.stringify(result.details, null, 2)
                        : result.details}
                    </pre>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={createBucket} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Bucket de Audio
          </Button>
        </CardFooter>
      </Card>
      
      <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-700 dark:text-blue-300">Alternativas</h3>
            <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
              Você também pode criar o bucket manualmente através do painel de administração do Supabase:
            </p>
            <ol className="mt-2 text-sm text-blue-600 dark:text-blue-400 list-decimal list-inside ml-2">
              <li>Acesse o painel do Supabase</li>
              <li>Navegue até a seção Storage</li>
              <li>Clique em "New Bucket"</li>
              <li>Nomeie o bucket como "audiouploads"</li>
              <li>Configure as políticas de acesso RLS apropriadas</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 