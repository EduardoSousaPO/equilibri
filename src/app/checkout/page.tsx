'use client';

import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';

// Componente para formulário de cartão de crédito
const CreditCardForm = ({ 
  onSubmit, 
  isProcessing 
}: { 
  onSubmit: () => void; 
  isProcessing: boolean 
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  const formatCardNumber = (value: string) => {
    // Remover espaços e caracteres não numéricos
    const cleanValue = value.replace(/\D/g, '');
    
    // Limitar a 16 dígitos
    const truncated = cleanValue.slice(0, 16);
    
    // Adicionar espaços a cada 4 dígitos
    return truncated
      .replace(/(\d{4})(?=\d)/g, '$1 ')
      .trim();
  };
  
  const formatExpiryDate = (value: string) => {
    // Remover caracteres não numéricos
    const cleanValue = value.replace(/\D/g, '');
    
    // Limitar a 4 dígitos
    const truncated = cleanValue.slice(0, 4);
    
    // Formatar como MM/YY
    if (truncated.length > 2) {
      return `${truncated.slice(0, 2)}/${truncated.slice(2)}`;
    }
    
    return truncated;
  };
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };
  
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiryDate(formatExpiryDate(e.target.value));
  };
  
  const isFormValid = () => {
    return (
      cardNumber.replace(/\s/g, '').length === 16 &&
      cardName.length > 3 &&
      expiryDate.length === 5 &&
      cvv.length === 3
    );
  };
  
  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm w-full max-w-md">
      <h2 className="text-xl font-semibold mb-6">Detalhes do Pagamento</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="card-number">
            Número do Cartão
          </label>
          <input
            id="card-number"
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder="0000 0000 0000 0000"
            className="w-full p-2 border rounded-md"
            disabled={isProcessing}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="card-name">
            Nome no Cartão
          </label>
          <input
            id="card-name"
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="Como aparece no cartão"
            className="w-full p-2 border rounded-md"
            disabled={isProcessing}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="expiry">
              Validade
            </label>
            <input
              id="expiry"
              type="text"
              value={expiryDate}
              onChange={handleExpiryDateChange}
              placeholder="MM/AA"
              className="w-full p-2 border rounded-md"
              disabled={isProcessing}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="cvv">
              CVV
            </label>
            <input
              id="cvv"
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
              placeholder="123"
              className="w-full p-2 border rounded-md"
              disabled={isProcessing}
            />
          </div>
        </div>
      </div>
      
      <Button
        onClick={onSubmit}
        disabled={!isFormValid() || isProcessing}
        className="w-full mt-6"
      >
        {isProcessing ? 'Processando...' : 'Confirmar Pagamento'}
      </Button>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>Ambiente de teste - Não serão feitas cobranças reais</p>
        <p className="mt-1">Use 4242 4242 4242 4242 com qualquer data futura e CVV</p>
      </div>
    </div>
  );
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }
        
        setUser(user);
        
        // Verificar se o plano é válido
        if (!planId || !['pro', 'clinical'].includes(planId)) {
          setError('Plano inválido selecionado');
        }
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        setError('Erro ao verificar sua sessão');
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [supabase, router, planId]);
  
  const handlePayment = async () => {
    if (!user || !planId) return;
    
    setIsProcessing(true);
    
    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Atualizar plano do usuário no banco
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          plan: planId,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Em um app real, aqui registraríamos a assinatura e
      // faríamos a integração com o gateway de pagamento
      
      setToastMessage('Upgrade realizado com sucesso!');
      setToastType('success');
      setShowToast(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      setToastMessage('Erro ao processar pagamento');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Determinar detalhes do plano
  const planDetails = {
    pro: {
      name: 'Premium',
      price: 'R$ 39,90',
      description: 'Chat ilimitado, relatórios PDF e análise de padrões emocionais'
    },
    clinical: {
      name: 'Premium Clínico',
      price: 'R$ 179,00',
      description: 'Todos os recursos Premium + 1 sessão mensal com psicóloga'
    }
  }[planId as 'pro' | 'clinical'] || { name: '', price: '', description: '' };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="text-center py-12">Carregando checkout...</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Upgrade para o Plano {planDetails.name}
      </h1>
      
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 max-w-md w-full">
          {error}
        </div>
      ) : (
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 items-start">
          {/* Resumo do pedido */}
          <div className="bg-white rounded-lg border p-6 shadow-sm w-full md:max-w-md">
            <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
            
            <div className="border-b pb-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Plano</span>
                <span>{planDetails.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Preço</span>
                <span>{planDetails.price}/mês</span>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {planDetails.description}
              </div>
            </div>
            
            <div className="text-lg font-semibold flex justify-between">
              <span>Total</span>
              <span>{planDetails.price}</span>
            </div>
          </div>
          
          {/* Formulário de cartão */}
          <CreditCardForm 
            onSubmit={handlePayment}
            isProcessing={isProcessing}
          />
        </div>
      )}
      
      <Button 
        variant="outline"
        className="mt-8"
        onClick={() => router.push('/settings')}
        disabled={isProcessing}
      >
        Voltar para Configurações
      </Button>
      
      {/* Toast de notificação */}
      {showToast && (
        <Toast 
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
} 