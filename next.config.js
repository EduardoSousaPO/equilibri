/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  eslint: {
    // Desabilitar a verificação do ESLint durante o build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Desabilitar a verificação de tipos para o Typescript durante o build
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Resolver problema com mercadopago
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false, 
    };
    return config;
  },
};

module.exports = nextConfig;
