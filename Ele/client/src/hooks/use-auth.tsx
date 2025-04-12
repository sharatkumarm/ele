import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ProductWithQuantity } from "@shared/schema";
import { createContext, ReactNode, useContext } from "react";

export interface User {
  id: number;
  username: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface SignupCredentials extends LoginCredentials {}

interface LoginResponse {
  id: number;
  username: string;
  message: string;
  cart?: {
    items: ProductWithQuantity[];
    total: number;
    count: number;
  };
}

interface GuestResponse {
  message: string;
  isGuest: boolean;
  cart: {
    items: ProductWithQuantity[];
    total: number;
    count: number;
  };
}

interface AuthState {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  signup: (credentials: SignupCredentials) => Promise<User>;
  loginAsGuest: () => Promise<GuestResponse>;
  logout: () => void;
}

// Create auth context
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authState = useAuthState();
  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Internal hook to handle auth state
function useAuthState(): AuthState {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get current user
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      try {
        // Fetch current user from session via Passport.js
        const response = await apiRequest("GET", "/api/auth/user");
        if (response.ok) {
          return await response.json();
        }
        return null;
      } catch (error) {
        console.error("Failed to get user:", error);
        return null;
      }
    }
  });
  
  // Check guest status
  const isGuest = localStorage.getItem("isGuest") === "true";
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      const data = await response.json();
      return data as LoginResponse;
    },
    onSuccess: (data) => {
      // Mark that we're not a guest
      localStorage.removeItem("isGuest");
      
      // Update cart if available in response
      if (data.cart) {
        // Update cart data in query client
        queryClient.setQueryData(['/api/cart'], data.cart);
      }
      
      // Update auth state - this will fetch the user from the session
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.username}!`,
        variant: "default"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive"
      });
      throw error;
    }
  });
  
  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async (credentials: SignupCredentials) => {
      const response = await apiRequest("POST", "/api/auth/register", credentials);
      const data = await response.json();
      return data as User;
    },
    onSuccess: (data) => {
      // With Passport.js, registration automatically logs in the user
      // so we need to update our state accordingly
      localStorage.removeItem("isGuest");
      
      // Update auth state
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      
      toast({
        title: "Account created",
        description: `Welcome, ${data.username}! Your account has been created successfully.`,
        variant: "default"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Signup failed",
        description: error.message || "Please try again with different credentials",
        variant: "destructive"
      });
      throw error;
    }
  });
  
  // Guest login mutation
  const guestLoginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/guest");
      const data = await response.json();
      return data as GuestResponse;
    },
    onSuccess: (data) => {
      // Mark as guest in localStorage - we use this flag since the session doesn't track guest status
      localStorage.setItem("isGuest", "true");
      
      // Update cart data in query client
      queryClient.setQueryData(['/api/cart'], data.cart);
      
      // Update auth state
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      
      toast({
        title: "Guest mode",
        description: "You are now browsing as a guest",
        variant: "default"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to create guest session",
        variant: "destructive"
      });
    }
  });
  
  // Clear cart (utility function for logout)
  const clearCartData = () => {
    queryClient.setQueryData(['/api/cart'], { items: [], total: 0, count: 0 });
  };
  
  // Logout function
  const logout = async () => {
    try {
      // Call the API to logout (Passport.js handles session clearing)
      await apiRequest("POST", "/api/auth/logout");
      
      // Clear local data - we don't need to remove "user" anymore since we rely on the session
      // but keeping it for backwards compatibility
      localStorage.removeItem("isGuest");
      clearCartData();
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
        variant: "default"
      });
    } catch (error) {
      console.error("Logout failed:", error);
      
      // Still clear local data even if API call fails
      localStorage.removeItem("isGuest");
      clearCartData();
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    }
  };
  
  return {
    user: user || null,
    isGuest,
    isLoading,
    isAuthenticated: !!user || isGuest,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    loginAsGuest: guestLoginMutation.mutateAsync,
    logout
  };
}