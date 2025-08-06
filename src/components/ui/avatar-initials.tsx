
import React from 'react';

interface AvatarInitialsProps {
  name: string;
}

export const AvatarInitials: React.FC<AvatarInitialsProps> = ({ name }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return <span>{getInitials(name)}</span>;
};
