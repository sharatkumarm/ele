import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Minus, ShoppingCart, ChevronLeft, Star, StarHalf, Heart } from "lucide-react";
import FeaturedProducts from "@/components/products/FeaturedProducts";
import PriceComparison from "@/components/products/PriceComparison";
import { useCart } from "@/hooks/use-cart";
import { Product } from "@shared/schema";
import { cn, formatCurrency } from "@/lib/utils";

export default function ProductDetails() {
  const [matched, params] = useRoute<{ id: string }>("/products/:id");
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${params?.id}`],
    enabled: !!params?.id,
  });
  
  // Update title when product loads
  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Vijay Electronics`;
    }
  }, [product]);
  
  if (!matched) return null;
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <Skeleton className="w-full aspect-square rounded-lg" />
          </div>
          <div className="md:w-1/2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-1/3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="space-y-4 pt-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }
  
  const handleAddToCart = () => {
    addItem(product.id, quantity);
  };
  
  // Render full and half stars
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="flex text-amber-500">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-5 w-5 fill-current" />
        ))}
        {halfStar && <StarHalf key="half" className="h-5 w-5 fill-current" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
        ))}
      </div>
    );
  };
  
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="pl-0">
            <Link href="/products">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
      
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Product Image */}
          <div className="md:w-1/2">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full object-contain rounded-md"
                style={{ maxHeight: '500px' }}
              />
            </div>
          </div>
          
          {/* Product Info */}
          <div className="md:w-1/2">
            <div className="flex flex-wrap gap-2 mb-4">
              {product.badges && product.badges.map(badge => {
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
                  <Badge key={badge} className={badgeColor}>
                    {badge}
                  </Badge>
                );
              })}
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              {product.rating && (
                <>
                  {renderRating(product.rating)}
                  <span className="text-gray-500">
                    ({product.reviewCount || 0} reviews)
                  </span>
                </>
              )}
            </div>
            
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold">
                {formatCurrency(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-gray-500 line-through">
                  {formatCurrency(product.oldPrice)}
                </span>
              )}
              {product.oldPrice && (
                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                  Save {formatCurrency(product.oldPrice - product.price)}
                </Badge>
              )}
            </div>
            
            <p className="text-gray-700 mb-6">{product.description}</p>
            
            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Key Features:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-gray-700">{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <Separator className="my-6" />
            
            {/* Quantity Selector */}
            <div className="flex items-center mb-6">
              <span className="mr-4">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= (product.stock || 10)}
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="ml-4 text-sm text-gray-500">
                {product.stock && product.stock > 0 
                  ? `${product.stock} available` 
                  : 'Out of stock'}
              </span>
            </div>
            
            {/* Add to Cart Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!product.stock || product.stock <= 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                <Heart className="mr-2 h-5 w-5" />
                Add to Wishlist
              </Button>
            </div>
            
            {/* Price Comparison */}
            <PriceComparison
              productId={product.id}
              productName={product.name}
              ourPrice={product.price}
            />
          </div>
        </div>
        
        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="w-full grid grid-cols-3 max-w-2xl mb-6">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="bg-white p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-4">Product Description</h3>
            <p className="text-gray-700 mb-4">{product.description}</p>
            {product.features && product.features.length > 0 && (
              <>
                <h4 className="font-semibold mt-6 mb-2">Features:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-gray-700">{feature}</li>
                  ))}
                </ul>
              </>
            )}
          </TabsContent>
          <TabsContent value="specifications" className="bg-white p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Model</span>
                  <span>{product.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Category</span>
                  <span>{product.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">In Stock</span>
                  <span>{product.stock || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Warranty</span>
                  <span>1 Year</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Rating</span>
                  <span>{product.rating}/5 ({product.reviewCount} reviews)</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Shipping</span>
                  <span>Free for orders above ₹1000</span>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="bg-white p-6 rounded-lg border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Customer Reviews</h3>
              <Button>Write a Review</Button>
            </div>
            
            <div className="space-y-6">
              {/* Sample reviews - in a real app, these would come from the API */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Excellent product!</h4>
                      <div className="flex text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                    <span className="text-gray-500 text-sm">3 days ago</span>
                  </div>
                  <p className="text-gray-700">
                    This product exceeded my expectations. The quality is outstanding and it works perfectly.
                    Would definitely recommend to others!
                  </p>
                  <div className="mt-2 text-sm text-gray-500">Rahul S. - Verified Purchase</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Great value for money</h4>
                      <div className="flex text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 text-gray-300" />
                      </div>
                    </div>
                    <span className="text-gray-500 text-sm">1 week ago</span>
                  </div>
                  <p className="text-gray-700">
                    I'm very happy with my purchase. The product is well made and the delivery was quick.
                    Only giving 4 stars because the manual could be more detailed.
                  </p>
                  <div className="mt-2 text-sm text-gray-500">Priya M. - Verified Purchase</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Related Products */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* This would be fetched from an API in a real app */}
            {/* For now, we'll reuse the FeaturedProducts component */}
          </div>
        </div>
      </div>
      
      <FeaturedProducts 
        title="Related Products" 
        endpoint="/api/products" 
        viewAllLink="/products" 
      />
    </>
  );
}
