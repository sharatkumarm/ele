import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CreditCard, Check, ShoppingBag, Truck, AlertCircle } from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProductWithQuantity } from "@shared/schema";

// Checkout form validation schema
const checkoutFormSchema = z.object({
  customerName: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  phone: z.string().min(10, { message: "Valid phone number is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  pincode: z.string().min(6, { message: "Valid pincode is required" }),
  paymentMethod: z.enum(["cod", "card", "upi"]).default("cod"),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function Checkout() {
  const [_, navigate] = useLocation();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const { isAuthenticated, isGuest } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Initialize form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      paymentMethod: "cod",
    },
  });

  // Set page title
  useEffect(() => {
    document.title = "Checkout | Vijay Electronics";
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !checkoutComplete) {
      toast({
        variant: "destructive",
        title: "Your cart is empty",
        description: "Please add some items to your cart before checkout.",
      });
      navigate("/products");
    }
  }, [cartItems, navigate, toast, checkoutComplete]);

  // Handle form submission
  const onSubmit = async (data: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Your cart is empty",
        description: "Please add some items to your cart before checkout.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        ...data,
        total: cartTotal,
        items: cartItems.map((item: ProductWithQuantity) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };

      // Submit order
      const res = await apiRequest("POST", "/api/checkout", orderData);
      const result = await res.json();

      setOrderId(result.orderId);
      setCheckoutComplete(true);
      clearCart();

      toast({
        title: "Order placed successfully!",
        description: `Your order #${result.orderId} has been confirmed.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "An error occurred during checkout.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is not authenticated, show login prompt
  if (!isAuthenticated && !isGuest) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Alert className="mb-8">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please log in or continue as a guest to complete your purchase.
          </AlertDescription>
        </Alert>
        
        <Card className="mb-8">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold">Sign in to continue checkout</h2>
              <p className="text-gray-600">Sign in to your account or continue as a guest</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <Button asChild className="w-full">
                <Link href="/auth">
                  Sign In
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth?guest=true">
                  Continue as Guest
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If checkout is complete, show success page
  if (checkoutComplete) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-8">
          <div className="bg-green-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order #{orderId} has been placed successfully.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Order Details</h3>
                <p className="text-gray-600">Order Number: #{orderId}</p>
                <p className="text-gray-600">
                  Order Date: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-gray-600 mt-2">
                  <span className="font-medium">Payment Method:</span> Cash on Delivery (COD)
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Shipping Information</h3>
                <p className="text-gray-600">
                  We'll send a confirmation when your order ships. Estimated delivery: 3-5 business days.
                </p>
                <p className="text-gray-600 mt-2">
                  <span className="font-medium">Note:</span> For Cash on Delivery orders, please keep the exact amount ready at the time of delivery.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
                <p className="text-gray-600">
                  If you have any questions about your order, please contact our customer service team.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between flex-wrap gap-4">
            <Button variant="outline" asChild>
              <Link href="/products">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
            <Button asChild>
              <Link href="/">
                <Truck className="mr-2 h-4 w-4" />
                Track Your Order
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-gray-600">Complete your order by providing your shipping and payment details</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Checkout Form */}
        <div className="lg:w-2/3">
          <Tabs defaultValue="shipping">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="shipping" className="flex-1">Shipping</TabsTrigger>
              <TabsTrigger value="payment" className="flex-1">Payment</TabsTrigger>
              <TabsTrigger value="review" className="flex-1">Review</TabsTrigger>
            </TabsList>

            <TabsContent value="shipping">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>

                  <Form {...form}>
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Street address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="City" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="State" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pincode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pincode</FormLabel>
                              <FormControl>
                                <Input placeholder="Pincode" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={() => {
                      // Validate shipping fields
                      form.trigger(["customerName", "email", "phone", "address", "city", "state", "pincode"]);
                      if (!form.formState.errors.customerName && 
                          !form.formState.errors.email && 
                          !form.formState.errors.phone && 
                          !form.formState.errors.address && 
                          !form.formState.errors.city && 
                          !form.formState.errors.state && 
                          !form.formState.errors.pincode) {
                        const paymentTab = document.querySelector('[data-value="payment"]');
                        if (paymentTab && paymentTab instanceof HTMLElement) {
                          paymentTab.click();
                        }
                      }
                    }}
                  >
                    Continue to Payment
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="payment">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center p-4 border rounded-md">
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <input
                                type="radio"
                                className="h-4 w-4"
                                id="cod"
                                value="cod"
                                checked={field.value === "cod"}
                                onChange={() => field.onChange("cod")}
                              />
                            </FormControl>
                            <FormLabel htmlFor="cod" className="font-normal cursor-pointer">
                              Cash on Delivery
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex items-center p-4 border rounded-md">
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <input
                                type="radio"
                                className="h-4 w-4"
                                id="card"
                                value="card"
                                checked={field.value === "card"}
                                onChange={() => field.onChange("card")}
                              />
                            </FormControl>
                            <FormLabel htmlFor="card" className="font-normal cursor-pointer flex items-center">
                              <CreditCard className="mr-2 h-5 w-5 text-primary" />
                              Credit / Debit Card
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {form.watch("paymentMethod") === "card" && (
                      <div className="p-4 border rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Card Number</label>
                            <Input placeholder="1234 5678 9012 3456" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Name on Card</label>
                            <Input placeholder="John Doe" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Expiry Date</label>
                            <Input placeholder="MM/YY" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">CVV</label>
                            <Input placeholder="123" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center p-4 border rounded-md">
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <input
                                type="radio"
                                className="h-4 w-4"
                                id="upi"
                                value="upi"
                                checked={field.value === "upi"}
                                onChange={() => field.onChange("upi")}
                              />
                            </FormControl>
                            <FormLabel htmlFor="upi" className="font-normal cursor-pointer">
                              UPI Payment
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const shippingTab = document.querySelector('[data-value="shipping"]');
                      if (shippingTab && shippingTab instanceof HTMLElement) {
                        shippingTab.click();
                      }
                    }}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => {
                      const reviewTab = document.querySelector('[data-value="review"]');
                      if (reviewTab && reviewTab instanceof HTMLElement) {
                        reviewTab.click();
                      }
                    }}
                  >
                    Review Order
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="review">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-6">Order Review</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Shipping Information</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="mb-1">{form.getValues("customerName")}</p>
                        <p className="mb-1">{form.getValues("email")}</p>
                        <p className="mb-1">{form.getValues("phone")}</p>
                        <p className="mb-1">{form.getValues("address")}</p>
                        <p>{form.getValues("city")}, {form.getValues("state")} - {form.getValues("pincode")}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Payment Method</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        {form.getValues("paymentMethod") === "cod" && (
                          <p>Cash on Delivery</p>
                        )}
                        {form.getValues("paymentMethod") === "card" && (
                          <p className="flex items-center">
                            <CreditCard className="mr-2 h-5 w-5 text-primary" />
                            Credit / Debit Card
                          </p>
                        )}
                        {form.getValues("paymentMethod") === "upi" && (
                          <p>UPI Payment</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Order Items</h3>
                      <div className="space-y-3">
                        {cartItems.map((item: ProductWithQuantity) => (
                          <div key={item.id} className="flex items-center py-3 border-b">
                            <div className="w-16 h-16 rounded overflow-hidden mr-4">
                              <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">₹{Math.round(item.price).toLocaleString()}</p>
                              <p className="text-sm text-gray-600">
                                ₹{Math.round(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between py-2">
                        <span>Subtotal</span>
                        <span>₹{Math.round(cartTotal).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between py-2 font-semibold">
                        <span>Total</span>
                        <span>₹{Math.round(cartTotal).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const paymentTab = document.querySelector('[data-value="payment"]');
                      if (paymentTab && paymentTab instanceof HTMLElement) {
                        paymentTab.click();
                      }
                    }}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={form.handleSubmit(onSubmit)} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Place Order"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="sticky top-24">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="max-h-96 overflow-auto mb-4">
                  {cartItems.map((item: ProductWithQuantity) => (
                    <div key={item.id} className="flex py-3 border-b last:border-0">
                      <div className="w-16 h-16 rounded overflow-hidden mr-3">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-1">{item.name}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="font-medium">₹{Math.round(item.price).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{Math.round(cartTotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Shipping</span>
                    <span>Free</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between py-2 text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{Math.round(cartTotal).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
