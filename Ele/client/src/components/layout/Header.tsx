import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, MenuIcon, Search, ShoppingCart, User } from "lucide-react";

interface HeaderProps {
  onSearchOpen: () => void;
  onCartOpen: () => void;
}

export default function Header({ onSearchOpen, onCartOpen }: HeaderProps) {
  const [location] = useLocation();
  const { cartCount } = useCart();
  const { user, isGuest, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold">
              <span className="text-primary">Vijay</span>
              <span className="text-dark">Electronics</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className={cn(
                "text-dark hover:text-primary font-medium",
                location === "/" && "text-primary"
              )}
            >
              Home
            </Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn(
                    "text-dark hover:text-primary font-medium bg-transparent",
                    location === "/products" && "text-primary"
                  )}>
                    Products
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/20 to-primary/5 p-6 no-underline outline-none focus:shadow-md"
                            href="/products"
                          >
                            <div className="mb-2 text-lg font-medium">
                              All Products
                            </div>
                            <p className="text-sm leading-tight text-gray-600">
                              Browse our complete collection of premium electronics
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <Link href="/products?category=Smartphones" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100">
                          <div className="text-sm font-medium leading-none">Smartphones</div>
                          <p className="line-clamp-2 text-sm leading-snug text-gray-500">
                            Latest mobile devices with cutting-edge technology
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?category=Laptops" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100">
                          <div className="text-sm font-medium leading-none">Laptops</div>
                          <p className="line-clamp-2 text-sm leading-snug text-gray-500">
                            Powerful computing for work and entertainment
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?category=Audio" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100">
                          <div className="text-sm font-medium leading-none">Audio</div>
                          <p className="line-clamp-2 text-sm leading-snug text-gray-500">
                            Premium sound experiences for audiophiles
                          </p>
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <Link 
              href="/products?sale=true" 
              className={cn(
                "text-dark hover:text-primary font-medium",
                location === "/products?sale=true" && "text-primary"
              )}
            >
              Deals
            </Link>
            
            <Link 
              href="/about" 
              className={cn(
                "text-dark hover:text-primary font-medium",
                location === "/about" && "text-primary"
              )}
            >
              About
            </Link>
            
            <Link 
              href="/contact" 
              className={cn(
                "text-dark hover:text-primary font-medium",
                location === "/contact" && "text-primary"
              )}
            >
              Contact
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-dark hover:text-primary"
              onClick={onSearchOpen}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    {user ? (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-200 text-gray-500">
                          G
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      {user ? (
                        <p className="text-sm font-medium leading-none">{user.username}</p>
                      ) : (
                        <p className="text-sm font-medium leading-none">Guest</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    logout();
                  }} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-dark hover:text-primary"
                asChild
              >
                <Link href="/auth">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-dark hover:text-primary relative"
              onClick={onCartOpen}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Button>
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden text-dark hover:text-primary"
                >
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link 
                    href="/" 
                    className="px-2 py-2 text-lg font-medium hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  
                  <div className="flex flex-col">
                    <Link 
                      href="/products" 
                      className="px-2 py-2 text-lg font-medium hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      All Products
                    </Link>
                    <Link 
                      href="/products?category=Smartphones" 
                      className="px-4 py-2 text-base hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Smartphones
                    </Link>
                    <Link 
                      href="/products?category=Laptops" 
                      className="px-4 py-2 text-base hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Laptops
                    </Link>
                    <Link 
                      href="/products?category=Audio" 
                      className="px-4 py-2 text-base hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Audio
                    </Link>
                    <Link 
                      href="/products?category=Televisions" 
                      className="px-4 py-2 text-base hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Televisions
                    </Link>
                    <Link 
                      href="/products?category=Accessories" 
                      className="px-4 py-2 text-base hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Accessories
                    </Link>
                  </div>
                  
                  <Link 
                    href="/products?sale=true" 
                    className="px-2 py-2 text-lg font-medium hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Deals
                  </Link>
                  
                  <Link 
                    href="/about" 
                    className="px-2 py-2 text-lg font-medium hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  
                  <Link 
                    href="/contact" 
                    className="px-2 py-2 text-lg font-medium hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>

                  {isAuthenticated ? (
                    <div className="px-2 py-2">
                      <div className="flex items-center space-x-2 mb-2">
                        {user ? (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gray-200 text-gray-500">
                              G
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <span className="text-base font-medium">
                          {user ? user.username : 'Guest'}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full flex items-center justify-center text-red-600"
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  ) : (
                    <Link 
                      href="/auth" 
                      className="px-2 py-2 text-lg font-medium hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login / Sign Up
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
