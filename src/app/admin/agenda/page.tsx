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

export default function AdminAgendaPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Administração de Agenda</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <Tabs defaultValue="create">
          <TabsList className="mb-4">
            <TabsTrigger value="create">Criar Horários</TabsTrigger>
            <TabsTrigger value="manage">Gerenciar Agenda</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "d 'de' MMMM 'de' yyyy", { 
                            locale: ptBR 
                          })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
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
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração da Sessão</Label>
                  <Select
                    value={slotDuration}
                    onValueChange={setSlotDuration}
                  >
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
                
                <Button 
                  className="w-full" 
                  onClick={createNewSlots}
                  disabled={creatingSlots || !selectedDate}
                >
                  {creatingSlots ? 'Criando...' : 'Criar Horários'}
                </Button>
              </div>
              
              <div className="border p-4 rounded-lg">
                <h3 className="font-medium mb-2">Instruções:</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Selecione uma data futura para oferecer horários.</li>
                  <li>Defina um horário inicial e final para o dia (ex: 9h às 17h).</li>
                  <li>Escolha a duração de cada sessão (padrão: 60 minutos).</li>
                  <li>O sistema criará automaticamente slots dentro do período escolhido.</li>
                  <li>Slots já reservados não podem ser excluídos.</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="manage">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Horários Disponíveis</h2>
                {Object.entries(slotsByStatusAndDate.free).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(slotsByStatusAndDate.free).map(([date, dateSlots]) => (
                      <div key={date} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2 capitalize">
                          {formatDate(dateSlots[0].start_utc)}
                        </h3>
                        <div className="space-y-2">
                          {dateSlots.map(slot => (
                            <div key={slot.id} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4" />
                                <span>{formatTime(slot.start_utc)} - {formatTime(slot.end_utc)}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteSlot(slot.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum horário disponível.</p>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Horários Reservados</h2>
                {Object.entries(slotsByStatusAndDate.booked).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(slotsByStatusAndDate.booked).map(([date, dateSlots]) => (
                      <div key={date} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2 capitalize">
                          {formatDate(dateSlots[0].start_utc)}
                        </h3>
                        <div className="space-y-2">
                          {dateSlots.map(slot => (
                            <div key={slot.id} className="flex items-center">
                              <Clock className="mr-2 h-4 w-4" />
                              <span>{formatTime(slot.start_utc)} - {formatTime(slot.end_utc)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum horário reservado.</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 