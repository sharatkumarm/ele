import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Banner() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="bg-dark rounded-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <span className="text-amber-500 font-semibold mb-2">Limited Time Offer</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Up to 40% Off on Premium Audio</h2>
              <p className="text-gray-300 mb-6">Experience exceptional sound quality with our premium audio collection. Limited stock available.</p>
              <div>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white border-0" size="lg" asChild>
                  <Link href="/products?category=Audio">Shop Now</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80"
                alt="Premium Audio Collection" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
