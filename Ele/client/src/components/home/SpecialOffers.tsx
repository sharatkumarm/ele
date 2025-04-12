import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Timer, Award, PercentCircle } from "lucide-react";

export default function SpecialOffers() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Special Offers</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Exclusive deals and limited-time offers on our most popular electronics. Don't miss out on these incredible savings!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Offer Card 1 - Flash Sale */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl overflow-hidden shadow-lg text-white">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Timer className="h-8 w-8 mr-3" />
                <h3 className="text-xl font-bold">Flash Sale</h3>
              </div>
              <p className="text-3xl font-bold mb-4">24 Hour Sale!</p>
              <p className="mb-6 text-white/90">Don't miss out on our 24-hour flash sale with up to 50% off on selected items. Limited stock available.</p>
              <Button 
                asChild 
                className="bg-white text-amber-600 hover:bg-white/90 hover:text-amber-700"
              >
                <Link href="/products?sale=true">
                  Shop Now
                </Link>
              </Button>
            </div>
            <div className="h-2 bg-white/20"></div>
            <div className="px-6 py-3 bg-white/10 text-sm">
              <p className="text-center">Ends in: <span className="font-semibold">12:24:36</span></p>
            </div>
          </div>
          
          {/* Offer Card 2 - Bundle Deals */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden shadow-lg text-white">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Award className="h-8 w-8 mr-3" />
                <h3 className="text-xl font-bold">Bundle Deals</h3>
              </div>
              <p className="text-3xl font-bold mb-4">Save 30%</p>
              <p className="mb-6 text-white/90">Purchase a smartphone with accessories and save 30%. Create your perfect tech bundle with these exclusive package offers.</p>
              <Button 
                asChild 
                className="bg-white text-indigo-600 hover:bg-white/90 hover:text-indigo-700"
              >
                <Link href="/products?category=Smartphones">
                  Explore Bundles
                </Link>
              </Button>
            </div>
            <div className="h-2 bg-white/20"></div>
            <div className="px-6 py-3 bg-white/10 text-sm">
              <p className="text-center">Free premium earbuds with select smartphones</p>
            </div>
          </div>
          
          {/* Offer Card 3 - Clearance */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl overflow-hidden shadow-lg text-white">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <PercentCircle className="h-8 w-8 mr-3" />
                <h3 className="text-xl font-bold">Clearance Sale</h3>
              </div>
              <p className="text-3xl font-bold mb-4">Up to 60% Off</p>
              <p className="mb-6 text-white/90">Massive discounts on last season's products. Limited quantities available on these end-of-line electronics.</p>
              <Button 
                asChild 
                className="bg-white text-teal-600 hover:bg-white/90 hover:text-teal-700"
              >
                <Link href="/products?clearance=true">
                  View Clearance
                </Link>
              </Button>
            </div>
            <div className="h-2 bg-white/20"></div>
            <div className="px-6 py-3 bg-white/10 text-sm">
              <p className="text-center">While stocks last - no rainchecks</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}