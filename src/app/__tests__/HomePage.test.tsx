import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renderiza a página inicial corretamente', () => {
    render(<HomePage />);
    
    // Verificar se o título principal está presente
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    
    // Verificar se há uma seção de funcionalidades
    expect(screen.getByText(/funcionalidades/i)).toBeInTheDocument();
    
    // Verificar se há uma seção de abordagens terapêuticas
    expect(screen.getByText(/abordagens terapêuticas/i)).toBeInTheDocument();
    
    // Verificar se há uma seção de preços
    expect(screen.getByText(/planos/i)).toBeInTheDocument();
    
    // Verificar se há botões de ação
    expect(screen.getByRole('link', { name: /começar/i })).toBeInTheDocument();
  });
});
