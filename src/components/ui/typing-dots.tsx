"use client"

import React from 'react'

export function TypingDots() {
  return (
    <div className="flex space-x-1 py-2">
      <div className="animate-pulse h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500"></div>
      <div className="animate-pulse delay-75 h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500"></div>
      <div className="animate-pulse delay-150 h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500"></div>
    </div>
  );
}

export default TypingDots; 