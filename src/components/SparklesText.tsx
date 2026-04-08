import React from 'react';

export default function SparklesText({ children }: { children: React.ReactNode }) {
  return (
    <span 
      className="relative inline-block"
      style={{
        textShadow: "0px 0px 15px rgba(0,0,0,0.9), 0px 0px 30px rgba(0,0,0,0.7), 0px 0px 45px rgba(0,0,0,0.5)"
      }}
    >
      {children}
    </span>
  );
}
