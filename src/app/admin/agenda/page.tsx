'use client';

// Página de administração de agenda atualizada em 2025-05-12
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format, parseISO, addHours, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Slot } from '@/lib/agenda';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Calendar as CalendarIcon, Clock, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminAgendaPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [therapistId, setTherapistId] = useState<string | null>(null);
  const [isTherapist, setIsTherapist] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  
  // Form states
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState('60');
  const [creatingSlots, setCreatingSlots] = useState(false);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Verificar se o usuário é um terapeuta
  useEffect(() => {
    async function checkTherapistRole() {
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }
        
        // Verificar se o usuário tem registro como terapeuta
        const { data: therapist, error: therapistError } = await supabase
          .from('therapists')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (therapistError && therapistError.code !== 'PGRST116') {
          // PGRST116 é "no rows returned" - esperado se não for terapeuta
          console.error('Erro ao verificar terapeuta:', therapistError);
          setError('Erro ao verificar suas credenciais');
          setLoading(false);
          return;
        }
        
        if (!therapist) {
          setIsTherapist(false);
          setLoading(false);
          return;
        }
        
        setIsTherapist(true);
        setTherapistId(therapist.id);
        
        // Buscar slots existentes
        await fetchSlots(therapist.id);
        
      } catch (err) {
        console.error('Erro na verificação:', err);
        setError('Erro ao verificar suas informações');
      } finally {
        setLoading(false);
      }
    }
    
    checkTherapistRole();
  }, [supabase, router]);

  // Buscar slots do terapeuta
  const fetchSlots = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('slots')
        .select('*')
        .eq('therapist_id', id)
        .order('start_utc', { ascending: true });
        
      if (error) throw error;
      
      setSlots(data || []);
      
    } catch (err) {
      console.error('Erro ao buscar slots:', err);
      setError('Erro ao buscar seus horários');
    }
  };

  // Agrupar slots por status e data
  const slotsByStatusAndDate = slots.reduce((acc, slot) => {
    const status = slot.status;
    const date = format(parseISO(slot.start_utc), 'yyyy-MM-dd');
    
    if (!acc[status]) {
      acc[status] = {};
    }
    
    if (!acc[status][date]) {
      acc[status][date] = [];
    }
    
    acc[status][date].push(slot);
    return acc;
  }, { free: {}, booked: {} } as Record<string, Record<string, Slot[]>>);

  // Função para formatar horário
  const formatTime = (isoString: string) => {
    return format(parseISO(isoString), 'HH:mm', { locale: ptBR });
  };

  // Função para formatar data
  const formatDate = (isoString: string) => {
    return format(parseISO(isoString), "d 'de' MMMM", { locale: ptBR });
  };

  // Criar slots
  const createNewSlots = async () => {
    if (!selectedDate || !therapistId) return;
    
    try {
      setCreatingSlots(true);
      
      // Criar datas com os horários selecionados
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(startHour, startMinute, 0, 0);
      
      const endDateTime = new Date(selectedDate);
      endDateTime.setHours(endHour, endMinute, 0, 0);
      
      // Verificar se os horários são válidos
      if (!isAfter(endDateTime, startDateTime)) {
        throw new Error('O horário de término deve ser após o horário de início');
      }
      
      // Verificar se não está no passado
      if (!isAfter(startDateTime, new Date())) {
        throw new Error('Não é possível criar slots no passado');
      }
      
      // Criar array de slots
      const duration = parseInt(slotDuration, 10);
      const slots = [];
      let currentTime = new Date(startDateTime);
      
      while (currentTime < endDateTime) {
        const slotEndTime = new Date(currentTime);
        slotEndTime.setMinutes(currentTime.getMinutes() + duration);
        
        // Parar se passar do horário final
        if (slotEndTime > endDateTime) break;
        
        slots.push({
          therapist_id: therapistId,
          start_utc: currentTime.toISOString(),
          end_utc: slotEndTime.toISOString(),
          status: 'free'
        });
        
        // Avançar para o próximo slot
        currentTime = new Date(slotEndTime);
      }
      
      if (slots.length === 0) {
        throw new Error('Nenhum slot foi gerado com os horários informados');
      }
      
      // Inserir no banco
      const { data, error } = await supabase
        .from('slots')
        .insert(slots)
        .select();
        
      if (error) throw error;
      
      // Atualizar a lista de slots
      await fetchSlots(therapistId);
      
      // Resetar formulário
      setStartTime('09:00');
      setEndTime('17:00');
      
    } catch (err: any) {
      console.error('Erro ao criar slots:', err);
      setError(err.message || 'Erro ao criar horários');
    } finally {
      setCreatingSlots(false);
    }
  };

  // Deletar slot
  const deleteSlot = async (slotId: string) => {
    if (!therapistId) return;
    
    try {
      const { error } = await supabase
        .from('slots')
        .delete()
        .eq('id', slotId)
        .eq('status', 'free'); // Apenas slots livres podem ser excluídos
        
      if (error) throw error;
      
      // Atualizar lista
      await fetchSlots(therapistId);
      
    } catch (err) {
      console.error('Erro ao excluir slot:', err);
      setError('Erro ao excluir horário');
    }
  };

  // Criar slots para o dia selecionado
  const createSlots = async () => {
    if (!selectedDate) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: therapistData, error: therapistError } = await supabase
        .from('therapists')
        .select('id')
        .single();

      if (therapistError) throw therapistError;

      // Criar slots de 1 hora entre o horário inicial e final
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      const slots = [];
      const currentDate = new Date(selectedDate);
      currentDate.setHours(startHour, startMinute, 0, 0);

      const endDate = new Date(selectedDate);
      endDate.setHours(endHour, endMinute, 0, 0);

      while (currentDate < endDate) {
        const slotEnd = new Date(currentDate);
        slotEnd.setHours(currentDate.getHours() + 1);

        slots.push({
          therapist_id: therapistData.id,
          start_time: currentDate.toISOString(),
          end_time: slotEnd.toISOString(),
          status: 'available'
        });

        currentDate.setHours(currentDate.getHours() + 1);
      }

      const { error } = await supabase
        .from('slots')
        .insert(slots);

      if (error) throw error;

      setSuccess('Horários criados com sucesso!');
      fetchSlots(therapistData.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isTherapist && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Administração de Agenda</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Restrito</AlertTitle>
          <AlertDescription>
            Esta página é exclusiva para terapeutas cadastrados no sistema.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciar Agenda</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Definir Horários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Horário Inicial</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">Horário Final</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={createSlots}
                disabled={loading || !selectedDate}
                className="w-full"
              >
                {loading ? 'Criando...' : 'Criar Horários'}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Horários Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando...</p>
          ) : slots.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3 border rounded-md text-center"
                >
                  <p className="font-medium">
                    {format(new Date(slot.start_time), 'HH:mm')} - {format(new Date(slot.end_time), 'HH:mm')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {slot.status === 'available' ? 'Disponível' : 'Reservado'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Nenhum horário disponível para esta data.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 