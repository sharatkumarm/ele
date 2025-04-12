import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface FeaturedProductsProps {
  title: string;
  endpoint: string;
  viewAllLink: string;
}

export default function FeaturedProducts({ title, endpoint, viewAllLink }: FeaturedProductsProps) {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: [endpoint],
  });

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <Link 
            href={viewAllLink} 
            className="text-primary hover:text-primary/80 font-medium flex items-center"
          >
            View All
            <ChevronRight className="h-5 w-5 ml-1" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products && products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
