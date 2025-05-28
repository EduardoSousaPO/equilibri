// Declarações para pacotes do Supabase
declare module '@supabase/ssr' {
  export function createServerClient(url: string, key: string, options: any): any;
  export function createBrowserClient(url: string, key: string): any;
}

// Declarações para pacotes Next.js
declare module 'next/server' {
  export class NextRequest {
    url: string;
    nextUrl: { pathname: string };
    cookies: {
      get(name: string): { value?: string };
      set(options: any): void;
    };
    headers: Headers;
    json(): Promise<any>;
  }
  
  export class NextResponse {
    static json(body: any, options?: any): NextResponse;
    static next(options?: any): NextResponse;
    static redirect(url: URL | string, options?: any): NextResponse;
    cookies: {
      get(name: string): { value?: string };
      set(options: any): void;
    };
    headers: Headers;
    static rewrite(url: URL | string, options?: any): NextResponse;
  }
}

declare module 'next/headers' {
  export function cookies(): {
    get(name: string): { value?: string } | undefined;
    set(options: any): void;
  };
}

// Declarações para o OpenAI
declare module 'openai' {
  export default class OpenAI {
    constructor(options: { apiKey: string });
    chat: {
      completions: {
        create(options: any): Promise<any>;
      };
    };
    audio: {
      transcriptions: {
        create(options: any): Promise<any>;
      };
    };
  }
}

// Declarações para o Mercado Pago
declare module 'mercadopago' {
  export class MercadoPagoConfig {
    constructor(options: { accessToken: string });
  }
  
  export class Payment {
    constructor(config: MercadoPagoConfig);
    get(options: { id: string }): Promise<any>;
  }
  
  export class Preference {
    constructor(config: MercadoPagoConfig);
    create(options: { body: any }): Promise<any>;
  }
} 