'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TherapistRegistrationPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para os campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [crp, setCrp] = useState('');
  const [bio, setBio] = useState('');
  const [specialty, setSpecialty] = useState<string[]>([]);
  const [education, setEducation] = useState<string[]>([]);
  const [experience, setExperience] = useState<string[]>([]);
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [sessionPrice, setSessionPrice] = useState('');
  const [sessionDuration, setSessionDuration] = useState('60');
  const [languages, setLanguages] = useState<string[]>(['Português']);
  const [approaches, setApproaches] = useState<string[]>([]);
  const [newEducation, setNewEducation] = useState('');
  const [newExperience, setNewExperience] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newApproach, setNewApproach] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  // Função para adicionar item a um array
  const addItem = (item: string, array: string[], setArray: (value: string[]) => void, setNew: (value: string) => void) => {
    if (item.trim()) {
      setArray([...array, item.trim()]);
      setNew('');
    }
  };

  // Função para remover item de um array
  const removeItem = (index: number, array: string[], setArray: (value: string[]) => void) => {
    setArray(array.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Criar conta do usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
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
          crp: crp || null,
          bio,
          specialty,
          education,
          experience: experience.length > 0 ? experience : null,
          website_url: website || null,
          instagram_url: instagram || null,
          linkedin_url: linkedin || null,
          session_price: sessionPrice ? parseFloat(sessionPrice) : null,
          session_duration: sessionDuration ? parseInt(sessionDuration) : null,
          languages: languages.length > 0 ? languages : ['Português'],
          approaches,
          status: 'pending'
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

      // Redirecionar para página de sucesso
      router.push('/register/therapist/success');

    } catch (err: any) {
      console.error('Erro no registro:', err);
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Cadastro de Psicólogo</h1>
      <p className="text-gray-600 mb-8">
        Preencha o formulário abaixo para se cadastrar como psicólogo no Equilibri.
      </p>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Informações Básicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="crp" className="flex items-center gap-2">
                CRP
                <span className="text-sm text-muted-foreground">(Opcional)</span>
              </Label>
              <Input
                id="crp"
                value={crp}
                onChange={(e) => setCrp(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
          </div>
        </div>

        {/* Biografia e Especialidades */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Biografia e Especialidades</h2>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Especialidades</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="Ex: Terapia Cognitivo-Comportamental"
              />
              <Button
                type="button"
                onClick={() => addItem(newSpecialty, specialty, setSpecialty, setNewSpecialty)}
              >
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {specialty.map((item, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeItem(index, specialty, setSpecialty)}
                >
                  {item} ×
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Formação e Experiência */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Formação e Experiência</h2>
          
          <div className="space-y-2">
            <Label>Formação Acadêmica</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newEducation}
                onChange={(e) => setNewEducation(e.target.value)}
                placeholder="Ex: Psicologia - USP (2015-2020)"
              />
              <Button
                type="button"
                onClick={() => addItem(newEducation, education, setEducation, setNewEducation)}
              >
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {education.map((item, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeItem(index, education, setEducation)}
                >
                  {item} ×
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Experiência Profissional
              <span className="text-sm text-muted-foreground">(Opcional)</span>
            </Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newExperience}
                onChange={(e) => setNewExperience(e.target.value)}
                placeholder="Ex: Clínica XYZ (2020-2023)"
              />
              <Button
                type="button"
                onClick={() => addItem(newExperience, experience, setExperience, setNewExperience)}
              >
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {experience.map((item, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeItem(index, experience, setExperience)}
                >
                  {item} ×
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Abordagens e Idiomas */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Abordagens e Idiomas</h2>
          
          <div className="space-y-2">
            <Label>Abordagens Terapêuticas</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newApproach}
                onChange={(e) => setNewApproach(e.target.value)}
                placeholder="Ex: TCC"
              />
              <Button
                type="button"
                onClick={() => addItem(newApproach, approaches, setApproaches, setNewApproach)}
              >
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {approaches.map((item, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeItem(index, approaches, setApproaches)}
                >
                  {item} ×
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Idiomas
              <span className="text-sm text-muted-foreground">(Opcional)</span>
            </Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Ex: Inglês"
              />
              <Button
                type="button"
                onClick={() => addItem(newLanguage, languages, setLanguages, setNewLanguage)}
              >
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map((item, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeItem(index, languages, setLanguages)}
                >
                  {item} ×
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Informações da Sessão */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Informações da Sessão
            <span className="text-sm text-muted-foreground ml-2">(Opcional)</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionPrice">Valor da Sessão (R$)</Label>
              <Input
                id="sessionPrice"
                type="number"
                min="0"
                step="0.01"
                value={sessionPrice}
                onChange={(e) => setSessionPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionDuration">Duração da Sessão (minutos)</Label>
              <Select value={sessionDuration} onValueChange={setSessionDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a duração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                  <SelectItem value="90">90 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Redes Sociais */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Redes Sociais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://seusite.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@seuinstagram"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/seuperfil"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            'Criar Conta'
          )}
        </Button>
      </form>
    </div>
  );
} 