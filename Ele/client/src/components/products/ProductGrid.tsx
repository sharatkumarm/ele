import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/products/ProductCard";
import { Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  category?: string;
  search?: string;
  sale?: boolean;
}

export default function ProductGrid({ category, search, sale }: ProductGridProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  useEffect(() => {
    if (!products) return;
    
    let filtered = [...products];
    
    if (category) {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower) || 
        p.category.toLowerCase().includes(searchLower)
      );
    }
    
    if (sale) {
      filtered = filtered.filter(p => p.oldPrice && p.oldPrice > p.price);
    }
    
    setFilteredProducts(filtered);
  }, [products, category, search, sale]);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden border shadow-sm">
            <Skeleton className="w-full h-48" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No products found</h3>
        <p className="text-gray-500">
          Try adjusting your search or filter criteria to find what you're looking for.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
