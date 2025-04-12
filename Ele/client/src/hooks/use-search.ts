import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";

export function useSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const {
    data: searchResults = [],
    isLoading,
    refetch,
  } = useQuery<Product[]>({
    queryKey: ['/api/search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: searchTerm.length >= 2,
  });
  
  const search = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);
  
  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);
  
  return {
    searchTerm,
    searchResults,
    isLoading,
    search,
    clearSearch,
    refetchSearch: refetch,
  };
}
