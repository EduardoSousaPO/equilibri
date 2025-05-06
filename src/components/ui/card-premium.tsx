import React from 'react';
import { cn } from '@/utils/cn';

interface CardPremiumProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardPremium({ className = "", children, ...props }: CardPremiumProps) {
  return (
    <div 
      className={cn(
        "card-premium p-4 rounded-lg relative overflow-hidden", 
        className || ""
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardPremiumHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardPremiumHeader({ className = "", children, ...props }: CardPremiumHeaderProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between mb-4 pb-2 border-b border-gold-500/20", 
        className || ""
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardPremiumTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function CardPremiumTitle({ className = "", children, ...props }: CardPremiumTitleProps) {
  return (
    <h3 
      className={cn(
        "font-serif text-lg font-bold text-forest-900", 
        className || ""
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

interface CardPremiumContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardPremiumContent({ className = "", children, ...props }: CardPremiumContentProps) {
  return (
    <div className={cn("", className || "")} {...props}>
      {children}
    </div>
  );
}

interface CardPremiumFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardPremiumFooter({ className = "", children, ...props }: CardPremiumFooterProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between mt-4 pt-2 border-t border-gold-500/20", 
        className || ""
      )}
      {...props}
    >
      {children}
    </div>
  );
} 