import { CheckIcon, XIcon } from 'lucide-react';

interface WhyNotGPTProps {
  variant?: 'sidebar' | 'card' | 'page';
  showTitle?: boolean;
}

export default function WhyNotGPT({ 
  variant = 'card',
  showTitle = true
}: WhyNotGPTProps) {
  const features = [
    {
      equilibriIA: 'IA empática + Plano Terapêutico Dinâmico',
      chatGPT: 'Prompt manual',
      equilibriHas: true,
      chatGPTHas: false
    },
    {
      equilibriIA: 'Registro de humor & gráfico',
      chatGPT: '',
      equilibriHas: true,
      chatGPTHas: false
    },
    {
      equilibriIA: 'PDF pronto p/ terapeuta',
      chatGPT: '',
      equilibriHas: true,
      chatGPTHas: false
    },
    {
      equilibriIA: 'Sessão mensal 1h com psicóloga',
      chatGPT: '',
      equilibriHas: true,
      chatGPTHas: false
    },
    {
      equilibriIA: 'Dados privados no Brasil',
      chatGPT: 'Armazenados fora',
      equilibriHas: true,
      chatGPTHas: false
    },
  ];
  
  // Classes especificas por variante
  const variantStyles = {
    card: {
      container: 'rounded-lg border bg-card p-6 shadow-sm',
      table: 'w-full',
      title: 'text-lg font-semibold mb-4',
      header: 'text-sm font-medium text-center border-b pb-2 mb-2',
      row: 'border-b last:border-b-0',
      cell: 'py-2 text-sm',
    },
    sidebar: {
      container: 'rounded-lg bg-muted/50 p-4',
      table: 'w-full',
      title: 'text-sm font-semibold mb-2',
      header: 'text-xs font-medium border-b pb-1 mb-1',
      row: 'border-b last:border-b-0',
      cell: 'py-1 text-xs',
    },
    page: {
      container: 'rounded-lg border bg-card p-8 shadow-sm max-w-2xl mx-auto',
      table: 'w-full',
      title: 'text-2xl font-bold mb-6 text-center',
      header: 'text-base font-semibold text-center border-b pb-3 mb-4',
      row: 'border-b last:border-b-0',
      cell: 'py-3',
    },
  };
  
  const styles = variantStyles[variant];
  
  return (
    <div className={styles.container}>
      {showTitle && (
        <h3 className={styles.title}>
          Por que escolher o Equilibri.IA?
        </h3>
      )}
      
      <table className={styles.table}>
        <thead>
          <tr className={styles.header}>
            <th className="text-left">Equilibri.IA</th>
            <th className="text-left">ChatGPT</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={index} className={styles.row}>
              <td className={`${styles.cell} flex items-start gap-2`}>
                <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature.equilibriIA}</span>
              </td>
              <td className={`${styles.cell} flex items-start gap-2`}>
                {feature.chatGPTHas ? (
                  <>
                    <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature.chatGPT}</span>
                  </>
                ) : (
                  <>
                    <XIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature.chatGPT || '✖'}</span>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 