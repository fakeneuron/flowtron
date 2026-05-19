import { createContext, useContext } from 'react';

const SearchContext = createContext('');

export const SearchProvider = SearchContext.Provider;

export const useSearchQuery = (): string => useContext(SearchContext);
