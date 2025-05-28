'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminTherapistsPage() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [therapists, setTherapists] = useState<any[]>([]);

  // Estados para o formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [crp, setCrp] = useState('');

  // Carregar psicólogos existentes
  useEffect(() => {
    loadTherapists();
  }, []);

  const loadTherapists = async () => {
    try {
      const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTherapists(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar psicólogos:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true, // Já confirma o email
        user_metadata: {
          role: 'therapist',
          name
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Falha ao criar usuário');

      // 2. Criar perfil do terapeuta
      const { error: profileError } = await supabase
        .from('therapists')
        .insert({
          user_id: authData.user.id,
          name,
          email,
          crp,
          status: 'active' // Já ativa o perfil
        });

      if (profileError) throw profileError;

      // 3. Criar perfil básico
      const { error: basicProfileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name,
          email,
          role: 'therapist',
          plan: 'free'
        });

      if (basicProfileError) throw basicProfileError;

      setSuccess('Psicólogo cadastrado com sucesso!');
      setName('');
      setEmail('');
      setCrp('');
      loadTherapists(); // Recarrega a lista

    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      setError(err.message || 'Erro ao cadastrar psicólogo');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (therapist: any) => {
    try {
      const newStatus = therapist.status === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('therapists')
        .update({ status: newStatus })
        .eq('id', therapist.id);

      if (error) throw error;
      
      loadTherapists(); // Recarrega a lista
    } catch (err: any) {
      console.error('Erro ao atualizar status:', err);
      setError(err.message || 'Erro ao atualizar status');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gerenciar Psicólogos</h1>

      {/* Formulário de Cadastro */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cadastrar Novo Psicólogo</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-emerald-50 text-emerald-800 border-emerald-200">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <AlertTitle>Sucesso</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="crp">CRP</Label>
              <Input
                id="crp"
                value={crp}
                onChange={(e) => setCrp(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Cadastrar Psicólogo'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Psicólogos */}
      <Card>
        <CardHeader>
          <CardTitle>Psicólogos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {therapists.map((therapist) => (
              <div
                key={therapist.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{therapist.name}</h3>
                  <p className="text-sm text-gray-600">{therapist.email}</p>
                  <p className="text-sm text-gray-600">CRP: {therapist.crp}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={therapist.status === 'active' ? 'success' : 'destructive'}
                  >
                    {therapist.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(therapist)}
                  >
                    {therapist.status === 'active' ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Ativar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 