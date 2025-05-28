// Declare módulos sem tipos adequados
declare module 'class-variance-authority';
declare module '@supabase/postgrest-js';
declare module 'mercadopago';

// Declare o tipo ClassValue para o utilitário cn
declare module 'clsx' {
  export type ClassValue = string | number | boolean | undefined | null | Record<string, any> | ClassValue[];
  export default function clsx(...inputs: ClassValue[]): string;
}

// Estenda o JSX namespace para resolver problemas com elementos JSX
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Ajuda a resolver o problema do process no Node.js
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      MERCADO_PAGO_ACCESS_TOKEN: string;
      NEXT_PUBLIC_APP_URL: string;
      OPENAI_API_KEY: string;
      [key: string]: string | undefined;
    }
  }
  
  var process: {
    env: NodeJS.ProcessEnv;
  };
} 

export {}; 