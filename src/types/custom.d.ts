// Declarações de módulos com problemas de tipo
declare module 'mercadopago' {
  export class MercadoPagoConfig {
    constructor(options: { accessToken: string });
  }

  export class Payment {
    constructor(config: MercadoPagoConfig);
    get(options: { id: string }): Promise<any>;
  }
}

// Helper para resolver erros relacionados ao tipo any no JSX
declare module 'react' {
  interface HTMLAttributes<T> {
    className?: string;
  }
} 