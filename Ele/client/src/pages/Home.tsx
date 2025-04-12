import { useEffect } from "react";
import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/products/CategoryGrid";
import FeaturedProducts from "@/components/products/FeaturedProducts";
import Banner from "@/components/home/Banner";
import Features from "@/components/home/Features";
import Newsletter from "@/components/home/Newsletter";
import Testimonials from "@/components/home/Testimonials";
import SpecialOffers from "@/components/home/SpecialOffers";

export default function Home() {
  // Page title
  useEffect(() => {
    document.title = "Vijay Electronics - Premium Electronics Store";
  }, []);

  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedProducts 
        title="Featured Products" 
        endpoint="/api/products/featured/all"
        viewAllLink="/products"
      />
      <SpecialOffers />
      <Banner />
      <FeaturedProducts 
        title="New Arrivals" 
        endpoint="/api/products/new/all"
        viewAllLink="/products?new=true"
      />
      <Testimonials />
      <Features />
      <Newsletter />
    </>
  );
}
