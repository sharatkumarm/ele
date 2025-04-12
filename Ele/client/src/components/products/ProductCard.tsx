import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, StarHalf } from "lucide-react";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToCart(true);
    addItem(product.id, 1);
    
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 500);
  };
  
  // Render full and half stars
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="flex text-amber-500">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-3.5 w-3.5 fill-current" />
        ))}
        {halfStar && <StarHalf key="half" className="h-3.5 w-3.5 fill-current" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-3.5 w-3.5 text-gray-300" />
        ))}
      </div>
    );
  };
  
  return (
    <Card className="overflow-hidden group h-full hover:shadow-md transition-all">
      <Link href={`/products/${product.id}`}>
        <div className="relative">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-48 object-cover"
          />
          {product.badges && product.badges.length > 0 && (
            <div className="absolute top-2 left-2">
              {product.badges.map((badge) => {
                let badgeColor = "";
                
                switch (badge.toLowerCase()) {
                  case "new":
                    badgeColor = "bg-amber-500";
                    break;
                  case "sale":
                    badgeColor = "bg-red-500";
                    break;
                  case "popular":
                    badgeColor = "bg-green-500";
                    break;
                  default:
                    badgeColor = "bg-primary";
                }
                
                return (
                  <Badge 
                    key={badge} 
                    className={cn("mr-1 mb-1", badgeColor)}
                  >
                    {badge}
                  </Badge>
                );
              })}
            </div>
          )}
          <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-white text-gray-700 h-8 w-8 rounded-full shadow"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold mb-1 line-clamp-1">{product.name}</h3>
              <div className="flex items-center mb-2">
                {product.rating && (
                  <>
                    {renderRating(product.rating)}
                    <span className="text-xs text-gray-500 ml-1">
                      ({product.reviewCount || 0})
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">₹{Math.round(product.price).toLocaleString()}</p>
              {product.oldPrice && (
                <p className="text-xs text-gray-500 line-through">
                  ₹{Math.round(product.oldPrice).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
          <Button 
            className={cn(
              "w-full py-2 text-sm transition-transform", 
              isAddingToCart && "scale-105"
            )}
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
}
