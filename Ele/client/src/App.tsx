import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetails from "@/pages/ProductDetails";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Checkout from "@/pages/Checkout";
import Admin from "@/pages/Admin";
import Auth from "@/pages/Auth";
import SearchModal from "@/components/layout/SearchModal";
import CartSidebar from "@/components/layout/CartSidebar";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  const [location] = useLocation();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetails} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <ProtectedRoute path="/checkout" component={Checkout} />
      <ProtectedRoute path="/admin" component={Admin} />
      <Route path="/auth" component={Auth} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Initialize auth hook for the app
  const auth = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        onSearchOpen={() => setIsSearchOpen(true)} 
        onCartOpen={() => setIsCartOpen(true)} 
      />
      <main className="flex-grow">
        <Router />
      </main>
      <Footer />
      
      {/* Modals and sidebars */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
