import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <Badge className="mb-4 bg-primary text-white font-semibold px-3 py-1 text-sm">Limited Time Offer</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Smart Washing Machines</span> for Modern Homes
            </h1>
            <p className="text-lg mb-6 text-gray-700">Upgrade your laundry experience with our advanced washing machines. Energy-efficient, powerful cleaning technology, and smart features to make laundry day effortless.</p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
                <Link href="/products?category=Appliances">Shop Washing Machines</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#categories">Browse All Categories</Link>
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-x-6">
              <div className="flex items-center">
                <span className="text-primary font-bold text-2xl">40%</span>
                <span className="ml-2 text-sm text-gray-600">Upto 40% Off<br/>on select models</span>
              </div>
              <div className="flex items-center">
                <span className="text-primary font-bold text-2xl">5yr</span>
                <span className="ml-2 text-sm text-gray-600">Extended<br/>Warranty</span>
              </div>
              <div className="flex items-center">
                <span className="text-primary font-bold text-2xl">24hr</span>
                <span className="ml-2 text-sm text-gray-600">Service<br/>Support</span>
              </div>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&w=800&q=80" 
                alt="Smart Washing Machine" 
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-amber-500 text-white p-3 rounded-lg shadow-lg">
                <p className="text-sm font-semibold">Spring Sale</p>
                <p className="text-xl font-bold">Up to 40% Off</p>
              </div>
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg">
                <p className="text-xs font-semibold text-primary">Smart Home Integration</p>
                <p className="text-sm">Control with your phone</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
