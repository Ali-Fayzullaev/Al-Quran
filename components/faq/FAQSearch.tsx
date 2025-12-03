// components/faq/FAQSearch.tsx
"use client";

import React from 'react';
import { Search, X } from 'lucide-react';

interface FAQSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
}

export default function FAQSearch({ searchTerm, onSearchChange, placeholder }: FAQSearchProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={20} className="text-gray-400" />
      </div>
      
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
        style={{ 
          backgroundColor: 'var(--color-background)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)'
        }}
      />
      
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500"
          title="Очистить поиск"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}