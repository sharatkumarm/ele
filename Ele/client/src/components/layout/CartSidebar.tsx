import { useCart } from "@/hooks/use-cart";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductWithQuantity } from "@shared/schema";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cartItems, cartTotal, cartCount, updateQuantity, removeItem } = useCart();
  const { toast } = useToast();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Cart is empty",
        description: "Add some items to your cart before checkout"
      });
      return;
    }
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex justify-between items-center">
            <span>Your Cart ({cartCount})</span>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </SheetTitle>
        </SheetHeader>
        
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6 text-center">Looks like you haven't added any products to your cart yet.</p>
            <SheetClose asChild>
              <Button asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cartItems.map((item: ProductWithQuantity) => (
                <div key={item.id} className="flex items-center space-x-4 pb-4 border-b">
                  <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="text-gray-500 text-sm">{item.category}</p>
                    <div className="flex items-center mt-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="px-2">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{Math.round(item.price).toLocaleString()}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 text-sm mt-1 h-6 px-2"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> 
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between text-lg font-semibold mb-4">
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <SheetClose asChild>
                <Button className="w-full mb-2" asChild>
                  <Link href="/checkout" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </SheetClose>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
