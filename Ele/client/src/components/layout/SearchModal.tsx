import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Product } from "@shared/schema";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [_, setLocation] = useLocation();

  const { data: searchResults, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: searchTerm.length >= 2
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchTerm)}`);
      onClose();
    }
  };

  const popularSearches = ["iPhone", "Samsung TV", "Headphones", "Laptop", "Speakers"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search Products</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <form onSubmit={handleSearch} className="relative">
          <Input 
            type="text" 
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          <Button type="submit" variant="ghost" size="icon" className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        
        {searchTerm.length >= 2 && searchResults && searchResults.length > 0 && (
          <div className="mt-4 max-h-80 overflow-auto">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Search Results</h4>
            <ul className="space-y-2">
              {searchResults.map((product) => (
                <li key={product.id} className="p-2 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => {
                  setLocation(`/products/${product.id}`);
                  onClose();
                }}>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-md mr-3 overflow-hidden">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">₹{product.price.toLocaleString()}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Popular Searches</h4>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((term) => (
              <span 
                key={term} 
                className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  setSearchTerm(term);
                }}
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
