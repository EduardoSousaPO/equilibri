import { 
  listFreeSlots, 
  bookSlot, 
  listUserAppointments, 
  listTherapistSlots, 
  createSlots 
} from '../agenda';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

// Mock do Supabase
jest.mock('@supabase/supabase-js');
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => ({ value: 'test-cookie' })),
  })),
}));
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          gte: jest.fn(() => ({
            order: jest.fn(() => ({
              data: [
                {
                  id: 'slot-1',
                  therapist_id: 'therapist-1',
                  start_utc: '2023-12-01T10:00:00Z',
                  end_utc: '2023-12-01T11:00:00Z',
                  status: 'free',
                  therapists: { name: 'Dra. Silva' }
                }
              ],
              error: null
            }))
          }))
        })),
        eqSingle: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'slot-1',
                therapist_id: 'therapist-1',
                start_utc: '2023-12-01T10:00:00Z',
                end_utc: '2023-12-01T11:00:00Z',
                status: 'free'
              },
              error: null
            }))
          }))
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: null,
            error: null
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'appointment-1',
                slot_id: 'slot-1',
                user_id: 'user-1',
                meet_link: 'https://meet.google.com/test',
                notes: 'Sessão agendada',
                created_at: '2023-12-01T09:00:00Z'
              },
              error: null
            }))
          }))
        }))
      }))
    }))
  }))
}));

describe('Módulo Agenda', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve listar slots disponíveis', async () => {
    const slots = await listFreeSlots();
    
    expect(slots).toHaveLength(1);
    expect(slots[0].therapist_name).toBe('Dra. Silva');
    expect(slots[0].status).toBe('free');
  });

  test('deve reservar um slot disponível', async () => {
    const userId = 'user-1';
    const slotId = 'slot-1';
    
    // Mock manual mais completo do supabase para este teste específico
    const mockSupabase = {
      from: jest.fn((table) => {
        // Diferentes comportamentos para diferentes tabelas
        if (table === 'slots') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({
                    data: {
                      id: 'slot-1',
                      therapist_id: 'therapist-1',
                      start_utc: '2023-12-01T10:00:00Z',
                      end_utc: '2023-12-01T11:00:00Z',
                      status: 'free'
                    },
                    error: null
                  }))
                }))
              }))
            })),
            update: jest.fn(() => ({
              eq: jest.fn(() => ({
                data: null,
                error: null
              }))
            }))
          };
        } else if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => ({
                  data: { plan: 'clinical', session_used: false },
                  error: null
                }))
              }))
            })),
            update: jest.fn(() => ({
              eq: jest.fn(() => ({
                data: null,
                error: null
              }))
            }))
          };
        } else if (table === 'appointments') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => ({
                  data: {
                    id: 'appointment-1',
                    slot_id: 'slot-1',
                    user_id: 'user-1',
                    meet_link: 'https://meet.google.com/test',
                    notes: 'Sessão agendada',
                    created_at: '2023-12-01T09:00:00Z'
                  },
                  error: null
                }))
              }))
            }))
          };
        }
        return null;
      })
    };

    // Sobrescrever o mock do createServerClient para este teste
    (createServerClient as jest.Mock).mockImplementationOnce(() => mockSupabase);
    
    const appointment = await bookSlot(userId, slotId);
    
    expect(appointment).toBeDefined();
    expect(appointment.slot_id).toBe(slotId);
    expect(appointment.user_id).toBe(userId);
    expect(appointment.meet_link).toContain('https://meet.google.com/');
  });

  test('deve listar slots de um terapeuta', async () => {
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            data: [
              {
                id: 'slot-1',
                therapist_id: 'therapist-1',
                start_utc: '2023-12-01T10:00:00Z',
                end_utc: '2023-12-01T11:00:00Z',
                status: 'free'
              }
            ],
            error: null
          })
        })
      })
    });
    
    // @ts-ignore
    createServerClient.mockImplementationOnce(() => ({
      from: mockFrom
    }));
    
    const slots = await listTherapistSlots('therapist-1');
    
    expect(slots).toHaveLength(1);
    expect(slots[0].therapist_id).toBe('therapist-1');
  });

  test('deve criar múltiplos slots para um terapeuta', async () => {
    const mockFrom = jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          data: [
            {
              id: 'slot-new-1',
              therapist_id: 'therapist-1',
              start_utc: '2023-12-02T10:00:00Z',
              end_utc: '2023-12-02T11:00:00Z',
              status: 'free'
            },
            {
              id: 'slot-new-2',
              therapist_id: 'therapist-1',
              start_utc: '2023-12-02T11:00:00Z',
              end_utc: '2023-12-02T12:00:00Z',
              status: 'free'
            }
          ],
          error: null
        })
      })
    });
    
    // @ts-ignore
    createServerClient.mockImplementationOnce(() => ({
      from: mockFrom
    }));
    
    const startDate = new Date('2023-12-02T10:00:00Z');
    const endDate = new Date('2023-12-02T12:00:00Z');
    
    const slots = await createSlots('therapist-1', startDate, endDate);
    
    expect(slots).toHaveLength(2);
    expect(slots[0].start_utc).toBe('2023-12-02T10:00:00Z');
    expect(slots[1].end_utc).toBe('2023-12-02T12:00:00Z');
  });
}); 