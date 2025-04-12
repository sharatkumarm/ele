import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilters from "@/components/products/ProductFilters";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

interface ProductFilterState {
  categories: string[];
  price: [number, number];
  rating: number | null;
  availability: boolean;
  sale: boolean;
}

export default function Products() {
  const [location] = useLocation();
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [sale, setSale] = useState<boolean | undefined>(undefined);
  const [filterState, setFilterState] = useState<ProductFilterState>({
    categories: [],
    price: [0, 350000],
    rating: null,
    availability: false,
    sale: false,
  });
  const [searchInput, setSearchInput] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Extract query parameters from the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category");
    const searchParam = params.get("search");
    const saleParam = params.get("sale");
    
    if (categoryParam) {
      setCategory(categoryParam);
      setFilterState(prev => ({
        ...prev,
        categories: [categoryParam]
      }));
    }
    
    if (searchParam) {
      setSearch(searchParam);
      setSearchInput(searchParam);
    }
    
    if (saleParam === "true") {
      setSale(true);
      setFilterState(prev => ({
        ...prev,
        sale: true
      }));
    }
    
    // Set document title
    const titleParts = [];
    if (categoryParam) titleParts.push(categoryParam);
    if (searchParam) titleParts.push(`Search: ${searchParam}`);
    if (saleParam === "true") titleParts.push("On Sale");
    
    const title = titleParts.length > 0 
      ? `${titleParts.join(" - ")} | Vijay Electronics` 
      : "All Products | Vijay Electronics";
      
    document.title = title;
  }, [location]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearch(searchInput.trim());
    }
  };

  const handleFilterChange = (filters: ProductFilterState) => {
    setFilterState(filters);
    
    if (filters.categories.length > 0) {
      setCategory(filters.categories[0]);
    } else {
      setCategory(undefined);
    }
    
    setSale(filters.sale);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/products">Products</BreadcrumbLink>
        </BreadcrumbItem>
        {category && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{category}</BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
        {search && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Search: {search}</BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
        {sale && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>On Sale</BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
      </Breadcrumb>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {category ? category : 
           search ? `Search Results: ${search}` : 
           sale ? "Products on Sale" : 
           "All Products"}
        </h1>
        <p className="text-gray-600">
          Browse our collection of premium electronics and tech accessories.
        </p>
      </div>

      {/* Search Bar and Filter Toggle for Mobile */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pr-10"
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
        
        <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
          <SheetTrigger asChild>
            <Button variant="outline" className="sm:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="h-full overflow-y-auto py-4 pr-4">
              <ProductFilters 
                onFilterChange={handleFilterChange}
                defaultCategory={category}
              />
            </div>
            <SheetClose asChild>
              <Button className="w-full mt-4">Apply Filters</Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="md:w-1/4 hidden sm:block">
          <ProductFilters 
            onFilterChange={handleFilterChange}
            defaultCategory={category}
          />
        </div>

        {/* Products Grid */}
        <div className="md:w-3/4">
          <ProductGrid 
            category={category} 
            search={search}
            sale={sale}
          />
        </div>
      </div>
    </div>
  );
}
