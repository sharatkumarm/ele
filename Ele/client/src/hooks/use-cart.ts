import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Product, ProductWithQuantity } from "@shared/schema";

interface CartResponse {
  items: ProductWithQuantity[];
  total: number;
  count: number;
}

export function useCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get cart data
  const { 
    data: cartData = { items: [], total: 0, count: 0 }, 
    isLoading,
    refetch 
  } = useQuery<CartResponse>({
    queryKey: ['/api/cart'],
  });
  
  // Add item to cart
  const addMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const res = await apiRequest('POST', '/api/cart', { productId, quantity });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/cart'], data);
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to add item",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  });
  
  // Update item quantity
  const updateMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const res = await apiRequest('PATCH', `/api/cart/${id}`, { quantity });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/cart'], data);
      toast({
        title: "Cart updated",
        description: "Item quantity has been updated",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update item",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  });
  
  // Remove item from cart
  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/cart/${id}`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/cart'], data);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to remove item",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  });
  
  // Clear cart
  const clearMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', '/api/cart');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/cart'], data);
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to clear cart",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  });
  
  // Add item to cart
  const addItem = (productId: number, quantity: number = 1) => {
    addMutation.mutate({ productId, quantity });
  };
  
  // Update item quantity
  const updateQuantity = (id: number, quantity: number) => {
    updateMutation.mutate({ id, quantity });
  };
  
  // Remove item from cart
  const removeItem = (id: number) => {
    removeMutation.mutate(id);
  };
  
  // Clear cart
  const clearCart = () => {
    clearMutation.mutate();
  };
  
  return {
    cartItems: cartData.items,
    cartTotal: cartData.total,
    cartCount: cartData.count,
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refetchCart: refetch,
  };
}
