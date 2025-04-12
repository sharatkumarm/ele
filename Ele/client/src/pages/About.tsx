import { useEffect } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import Newsletter from "@/components/home/Newsletter";
import { Store, Users, Clock, Award, ShieldCheck, Truck } from "lucide-react";

export default function About() {
  // Set page title
  useEffect(() => {
    document.title = "About Us | Vijay Electronics";
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/about">About Us</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About Vijay Electronics</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your trusted destination for premium electronics and tech accessories since 1995.
        </p>
      </div>

      {/* Our Story */}
      <div className="mb-16">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80" 
              alt="Vijay Electronics Store" 
              className="rounded-lg shadow-md"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-700 mb-4">
              Vijay Electronics was founded in 1995 by Vijay Sharma with a simple mission: to provide high-quality electronics at competitive prices with exceptional customer service.
            </p>
            <p className="text-gray-700 mb-4">
              What started as a small shop in Mumbai has now grown into one of India's most trusted electronics retailers, with a strong online presence and thousands of satisfied customers nationwide.
            </p>
            <p className="text-gray-700">
              Our commitment to quality, authenticity, and customer satisfaction remains at the heart of everything we do. We carefully curate our product selection to ensure we only offer the best technology from trusted brands.
            </p>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="mb-16 bg-gray-50 py-12 px-4 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-10">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
              <p className="text-gray-600">
                We source products directly from authorized distributors and offer genuine warranty on all products.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Customer First</h3>
              <p className="text-gray-600">
                Our team is dedicated to providing exceptional service and technical support before and after purchase.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-600">
                We continuously update our inventory with the latest technology and trending products in the market.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">Our Leadership Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="rounded-full overflow-hidden w-32 h-32 mx-auto mb-4">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80" 
                alt="Vijay Sharma - Founder & CEO" 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold">Vijay Sharma</h3>
            <p className="text-gray-600">Founder & CEO</p>
          </div>
          
          <div className="text-center">
            <div className="rounded-full overflow-hidden w-32 h-32 mx-auto mb-4">
              <img 
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80" 
                alt="Priya Desai - COO" 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold">Priya Desai</h3>
            <p className="text-gray-600">Chief Operations Officer</p>
          </div>
          
          <div className="text-center">
            <div className="rounded-full overflow-hidden w-32 h-32 mx-auto mb-4">
              <img 
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80" 
                alt="Raj Mehta - CTO" 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold">Raj Mehta</h3>
            <p className="text-gray-600">Chief Technology Officer</p>
          </div>
          
          <div className="text-center">
            <div className="rounded-full overflow-hidden w-32 h-32 mx-auto mb-4">
              <img 
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80" 
                alt="Anjali Patel - CMO" 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold">Anjali Patel</h3>
            <p className="text-gray-600">Chief Marketing Officer</p>
          </div>
        </div>
      </div>

      {/* Store Information */}
      <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start">
              <Store className="h-6 w-6 text-primary mr-3 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Our Store</h3>
                <p className="text-gray-600">
                  123 Main Street, Mumbai, India 400001
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start">
              <Clock className="h-6 w-6 text-primary mr-3 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Opening Hours</h3>
                <p className="text-gray-600">
                  Monday - Saturday: 10AM - 8PM<br />
                  Sunday: 11AM - 6PM
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start">
              <Truck className="h-6 w-6 text-primary mr-3 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Shipping</h3>
                <p className="text-gray-600">
                  We ship across India<br />
                  Free shipping on orders above ₹1000
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
