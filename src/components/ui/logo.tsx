import React from 'react'

// Logo minimalista do Equilibri (versão anterior 1)
export const EquilibriLogoOld = ({ className = "w-auto h-10" }: { className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 180 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Marca E estilizada */}
        <path 
          d="M24 10C24 11.5 22.5 13 21 13H13V23H21C22.5 23 24 24.5 24 26C24 27.5 22.5 29 21 29H9C8.5 29 8 28.5 8 28V8C8 7.5 8.5 7 9 7H21C22.5 7 24 8.5 24 10Z" 
          fill="currentColor" 
          className="text-primary" 
        />
        {/* Linha horizontal */}
        <path 
          d="M33 40H160" 
          stroke="currentColor" 
          strokeWidth="2" 
          className="text-accent" 
        />
        {/* Texto Equilibri */}
        <text 
          x="43" 
          y="25" 
          className="text-primary" 
          fill="currentColor" 
          fontFamily="Georgia" 
          fontSize="20" 
          fontWeight="bold"
        >
          Equilibri
        </text>
      </svg>
    </div>
  )
}

// Versão antiga do ícone (versão anterior 1)
export const EquilibriIconOld = () => {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M24 10C24 11.5 22.5 13 21 13H13V23H21C22.5 23 24 24.5 24 26C24 27.5 22.5 29 21 29H9C8.5 29 8 28.5 8 28V8C8 7.5 8.5 7 9 7H21C22.5 7 24 8.5 24 10Z" 
        fill="currentColor" 
        className="text-primary" 
      />
    </svg>
  )
}

// Logo minimalista do Equilibri (versão anterior 2)
export const EquilibriLogoOld2 = () => {
  return (
    <svg width="180" height="45" viewBox="0 0 180 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M27.5 12.5C27.5 14.7 25.7 16.5 23.5 16.5H8.5V28.5H23.5C25.7 28.5 27.5 30.3 27.5 32.5C27.5 34.7 25.7 36.5 23.5 36.5H3.5C2.4 36.5 1.5 35.6 1.5 34.5V3.5C1.5 2.4 2.4 1.5 3.5 1.5H23.5C25.7 1.5 27.5 3.3 27.5 5.5C27.5 7.7 25.7 9.5 23.5 9.5H8.5V12.5H27.5Z" fill="#0A515F"/>
      <path d="M39.5 3.5V36.5H32.5V3.5H39.5Z" fill="#0A515F"/>
      <path d="M54.5034 10L60.5034 30H60.6034L66.6034 10H75.1034L64.1034 39H57.0034L46.0034 10H54.5034Z" fill="#0A515F"/>
      <path d="M92.8112 39.4C90.2779 39.4 87.9112 38.8333 85.7112 37.7C83.5112 36.5667 81.7779 34.9667 80.5112 32.9C79.2445 30.8 78.6112 28.4333 78.6112 25.8C78.6112 23.1667 79.2445 20.8 80.5112 18.7C81.7779 16.6 83.5112 15 85.7112 13.9C87.9112 12.7667 90.2779 12.2 92.8112 12.2C95.3446 12.2 97.7112 12.7667 99.9112 13.9C102.111 15 103.845 16.6 105.111 18.7C106.378 20.8 107.011 23.1667 107.011 25.8C107.011 28.4333 106.378 30.8 105.111 32.9C103.845 34.9667 102.111 36.5667 99.9112 37.7C97.7112 38.8333 95.3446 39.4 92.8112 39.4ZM92.8112 32.9C94.4779 32.9 95.9112 32.3 97.1112 31.1C98.3112 29.9 98.9112 28.1 98.9112 25.8C98.9112 23.5 98.3112 21.7 97.1112 20.5C95.9112 19.3 94.4779 18.7 92.8112 18.7C91.1446 18.7 89.7112 19.3 88.5112 20.5C87.3112 21.7 86.7112 23.5 86.7112 25.8C86.7112 28.1 87.3112 29.9 88.5112 31.1C89.7112 32.3 91.1446 32.9 92.8112 32.9Z" fill="#0A515F"/>
      <path d="M125.812 3.5V36.5H118.812V3.5H125.812Z" fill="#0A515F"/>
      <path d="M151.62 10V16.1H141.32V36.5H134.32V10H151.62Z" fill="#0A515F"/>
      <path d="M165.637 10V22.4H178.537V10H185.537V36.5H178.537V28.5H165.637V36.5H158.637V10H165.637Z" fill="#0A515F"/>
    </svg>
  );
};

// Versão antiga do ícone (versão anterior 2)
export const EquilibriIconOld2 = () => {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#0A515F"/>
      <path d="M20 9C20 10.1 19.1 11 18 11H10V17H18C19.1 17 20 17.9 20 19C20 20.1 19.1 21 18 21H8C7.4 21 7 20.6 7 20V6C7 5.4 7.4 5 8 5H18C19.1 5 20 5.9 20 7C20 8.1 19.1 9 18 9H10V9H20Z" fill="#F2ECD7"/>
      <path d="M26 6V20H24V6H26Z" fill="#F2ECD7"/>
    </svg>
  );
};

// Logo simples para uso em contextos menores
export const IconLogo = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="currentColor" className="text-primary" />
      <path 
        d="M24 10C24 11.5 22.5 13 21 13H13V17H21C22.5 17 24 18.5 24 20C24 21.5 22.5 23 21 23H9C8.5 23 8 22.5 8 22V10C8 9.5 8.5 9 9 9H21C22.5 9 24 8.5 24 10Z" 
        fill="currentColor"
        className="text-background"
      />
    </svg>
  )
}

// Nova logo Equilibri com escudo e símbolo de planta (versão atualizada)
export const EquilibriLogo = ({ className = 'h-12 w-auto' }: { className?: string }) => {
  return (
    <div className={`${className} relative logo-shadow`}>
      <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
        <g fill="#1D3C34">
          <path d="M400 142c-158.5 0-286.9 128.4-286.9 286.9 0 158.5 128.4 286.9 286.9 286.9s286.9-128.4 286.9-286.9C686.9 270.4 558.5 142 400 142zm0 524.6c-131 0-237.7-106.6-237.7-237.7 0-131 106.6-237.7 237.7-237.7 131 0 237.7 106.6 237.7 237.7 0 131-106.7 237.7-237.7 237.7z"/>
          <path d="M208.7 370.5h382.6v59H208.7z"/>
          <path d="M400 370.5c-32.6 0-59 26.4-59 59h118c0-32.6-26.4-59-59-59z"/>
          <ellipse cx="400" cy="488.5" rx="59" ry="59"/>
          <path d="M400 192.9c-32.6 0-59 26.4-59 59h118c0-32.6-26.4-59-59-59zM282 311.5c-32.6 0-59 26.4-59 59h118c0-32.6-26.4-59-59-59zM518 311.5c-32.6 0-59 26.4-59 59h118c0-32.6-26.4-59-59-59z"/>
        </g>
      </svg>
      <div className="mt-2 text-center">
        <h2 className="text-forest-900 font-serif font-bold text-2xl tracking-wider">Equilibri</h2>
        <p className="text-xs text-gray-600 tracking-wide">DIÁRIO TERAPÊUTICO DIGITAL</p>
      </div>
    </div>
  )
}

// Novo ícone Equilibri minimalista (versão atualizada)
export const EquilibriIcon = ({ className = 'h-10 w-10' }: { className?: string }) => {
  return (
    <div className={`${className} relative logo-shadow`}>
      <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
        <g fill="#1D3C34">
          <path d="M400 142c-158.5 0-286.9 128.4-286.9 286.9 0 158.5 128.4 286.9 286.9 286.9s286.9-128.4 286.9-286.9C686.9 270.4 558.5 142 400 142zm0 524.6c-131 0-237.7-106.6-237.7-237.7 0-131 106.6-237.7 237.7-237.7 131 0 237.7 106.6 237.7 237.7 0 131-106.7 237.7-237.7 237.7z"/>
          <path d="M208.7 370.5h382.6v59H208.7z"/>
          <path d="M400 370.5c-32.6 0-59 26.4-59 59h118c0-32.6-26.4-59-59-59z"/>
          <ellipse cx="400" cy="488.5" rx="59" ry="59"/>
          <path d="M400 192.9c-32.6 0-59 26.4-59 59h118c0-32.6-26.4-59-59-59zM282 311.5c-32.6 0-59 26.4-59 59h118c0-32.6-26.4-59-59-59zM518 311.5c-32.6 0-59 26.4-59 59h118c0-32.6-26.4-59-59-59z"/>
        </g>
      </svg>
    </div>
  )
}
