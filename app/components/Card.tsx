import React from 'react';

interface CardProps {
  top: React.ReactNode;
  middle: React.ReactNode;
  bottom: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ top, middle, bottom }) => {
  return (
    <div className="bg-black p-8 rounded-lg shadow-lg w-full max-w-lg border border-gray-700 flex flex-col h-[500px]">
      <div className="flex-1 flex flex-col justify-center">
        {top}
        {middle}
      </div>
      {bottom}
    </div>
  );
};

export default Card;