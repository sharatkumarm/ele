import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

interface CompetitorPrice {
  retailer: string;
  price: number;
  link: string;
  inStock: boolean;
}

interface PriceComparisonProps {
  productId: number;
  productName: string;
  ourPrice: number;
}

export default function PriceComparison({ productId, productName, ourPrice }: PriceComparisonProps) {
  const { data: competitorPrices, isLoading, error } = useQuery<CompetitorPrice[]>({
    queryKey: [`/api/price-comparison/${productId}`],
    enabled: !!productId,
  });

  const [savingsPercentage, setSavingsPercentage] = useState<number | null>(null);
  const [lowestCompetitorPrice, setLowestCompetitorPrice] = useState<number | null>(null);

  useEffect(() => {
    if (competitorPrices && competitorPrices.length > 0) {
      // Find lowest competitor price from in-stock items
      const inStockPrices = competitorPrices
        .filter(p => p.inStock)
        .map(p => p.price);
      
      if (inStockPrices.length > 0) {
        const lowest = Math.min(...inStockPrices);
        setLowestCompetitorPrice(lowest);
        
        // Calculate savings percentage
        if (lowest > ourPrice) {
          const savingsPercent = ((lowest - ourPrice) / lowest) * 100;
          setSavingsPercentage(Math.round(savingsPercent));
        } else {
          setSavingsPercentage(null);
        }
      }
    }
  }, [competitorPrices, ourPrice]);

  if (isLoading) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">Price Comparison</h3>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (error || !competitorPrices || competitorPrices.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Price Comparison</h3>
        {savingsPercentage && (
          <Badge className="bg-green-500">Save up to {savingsPercentage}%</Badge>
        )}
      </div>

      <div className="space-y-3">
        {/* Our price card */}
        <Card className="border-2 border-primary">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <div className="font-bold text-lg">Vijay Electronics</div>
              <div className="text-sm text-green-600">Best Price Guaranteed</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-xl text-primary">{formatCurrency(ourPrice)}</div>
              <div className="text-sm text-green-600">In Stock</div>
            </div>
          </CardContent>
        </Card>
        
        {/* Competitor prices */}
        {competitorPrices.map((competitor, index) => (
          <a 
            key={index} 
            href={competitor.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block hover:no-underline"
          >
            <Card className={ourPrice < competitor.price ? "border-gray-200" : "border-gray-200 opacity-75"}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">{competitor.retailer}</div>
                  {ourPrice < competitor.price && (
                    <div className="text-sm text-red-500">
                      {Math.round(((competitor.price - ourPrice) / competitor.price) * 100)}% more expensive
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(competitor.price)}</div>
                  <div className="text-sm">
                    {competitor.inStock ? (
                      <span className="text-green-600">In Stock</span>
                    ) : (
                      <span className="text-red-500">Out of Stock</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
        
        <div className="text-xs text-center text-gray-500 mt-2">
          Prices last updated on {new Date().toLocaleDateString()}. Prices may vary.
        </div>
      </div>
    </div>
  );
}