import React from 'react';
import logoUrl from '../../assets/sorting-algorithm-logo.svg';

interface AnimatedLogoProps {
  className?: string;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ className = '' }) => (
  <img src={logoUrl} className={`animated-logo ${className}`} alt="Sorting Algoritm Web App logo" />
);
