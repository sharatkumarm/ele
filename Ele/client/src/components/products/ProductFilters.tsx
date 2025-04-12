import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Product } from "@shared/schema";

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  defaultCategory?: string;
}

interface FilterState {
  categories: string[];
  price: [number, number];
  rating: number | null;
  availability: boolean;
  sale: boolean;
}

export default function ProductFilters({ onFilterChange, defaultCategory }: ProductFiltersProps) {
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  const [filters, setFilters] = useState<FilterState>({
    categories: defaultCategory ? [defaultCategory] : [],
    price: [0, 350000], // Default price range in INR
    rating: null,
    availability: false,
    sale: false,
  });
  
  const allCategories = products 
    ? [...new Set(products.map(product => product.category))]
    : [];
  
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);
  
  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };
  
  const handlePriceChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      price: [value[0], value[1]]
    }));
  };
  
  const handleRatingChange = (rating: number) => {
    setFilters(prev => ({
      ...prev,
      rating: prev.rating === rating ? null : rating
    }));
  };
  
  const handleAvailabilityChange = (checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      availability: checked
    }));
  };
  
  const handleSaleChange = (checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      sale: checked
    }));
  };
  
  const handleReset = () => {
    setFilters({
      categories: [],
      price: [0, 350000],
      rating: null,
      availability: false,
      sale: false,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReset}
          className="w-full"
        >
          Reset Filters
        </Button>
      </div>
      
      <Accordion type="multiple" defaultValue={["categories", "price", "rating"]}>
        {/* Categories */}
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {allCategories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category}`} 
                    checked={filters.categories.includes(category)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`category-${category}`}
                    className="text-sm cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 px-2">
              <Slider
                defaultValue={[0, 350000]}
                min={0}
                max={350000}
                step={1000}
                value={[filters.price[0], filters.price[1]]}
                onValueChange={handlePriceChange}
              />
              <div className="flex justify-between mt-2 text-sm">
                <span>₹{filters.price[0].toLocaleString()}</span>
                <span>₹{filters.price[1].toLocaleString()}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Rating */}
        <AccordionItem value="rating">
          <AccordionTrigger>Rating</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {[4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`rating-${rating}`} 
                    checked={filters.rating === rating}
                    onCheckedChange={(checked) => 
                      handleRatingChange(rating)
                    }
                  />
                  <Label 
                    htmlFor={`rating-${rating}`}
                    className="text-sm cursor-pointer flex items-center"
                  >
                    {rating}+ ★
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Additional Filters */}
        <AccordionItem value="additional">
          <AccordionTrigger>Additional Filters</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="availability" 
                  checked={filters.availability}
                  onCheckedChange={(checked) => 
                    handleAvailabilityChange(checked as boolean)
                  }
                />
                <Label 
                  htmlFor="availability"
                  className="text-sm cursor-pointer"
                >
                  In Stock Only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sale" 
                  checked={filters.sale}
                  onCheckedChange={(checked) => 
                    handleSaleChange(checked as boolean)
                  }
                />
                <Label 
                  htmlFor="sale"
                  className="text-sm cursor-pointer"
                >
                  On Sale
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
