import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address"
      });
      return;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setEmail("");
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter"
      });
    }, 1000);
  };

  return (
    <section className="py-12 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Stay Updated</h2>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter to receive updates on new products, special offers, and tech tips.
          </p>
          <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="Your email address"
              className="flex-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-3">
            By subscribing, you agree to receive marketing communications from us. Don't worry, we hate spam too!
          </p>
        </div>
      </div>
    </section>
  );
}
