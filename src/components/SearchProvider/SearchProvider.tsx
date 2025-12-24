import React, { createContext, useContext, useMemo, useState } from 'react';

type SearchCtx = {
  query: string;
  setQuery: (q: string) => void;
};

const Ctx = createContext<SearchCtx | null>(null);

export const useSearch = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSearch must be used within <SearchProvider/>');
  return ctx;
};

export function norm(s: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [query, setQuery] = useState('');

  const value = useMemo(() => ({ query, setQuery }), [query]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
