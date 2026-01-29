"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface SearchContextValue {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

const defaultSearchValue: SearchContextValue = {
  searchQuery: "",
  setSearchQuery: () => {},
};

export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext);
  return context ?? defaultSearchValue;
}
