import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import HomePage from '@/app/page';

// Estender o expect do Jest para incluir verificações de acessibilidade
expect.extend(toHaveNoViolations);

describe('Acessibilidade', () => {
  it('a página inicial não deve ter violações de acessibilidade', async () => {
    const { container } = render(<HomePage />);
    
    // Verificar se não há violações de acessibilidade
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('elementos importantes têm atributos de acessibilidade adequados', () => {
    render(<HomePage />);
    
    // Verificar se os botões têm texto acessível
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAccessibleName();
    });
    
    // Verificar se as imagens têm texto alternativo
    const images = screen.getAllByRole('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('alt');
    });
    
    // Verificar se os links têm texto acessível
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAccessibleName();
    });
  });
});
