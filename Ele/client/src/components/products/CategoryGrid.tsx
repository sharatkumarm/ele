import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Laptop, Tv, Headphones, Camera, Package, WashingMachine, Plug, Refrigerator } from "lucide-react";

const categories = [
  {
    name: "Smartphones",
    icon: Smartphone,
    href: "/products?category=Smartphones"
  },
  {
    name: "Laptops",
    icon: Laptop,
    href: "/products?category=Laptops"
  },
  {
    name: "Televisions",
    icon: Tv,
    href: "/products?category=Televisions"
  },
  {
    name: "Washing Machines",
    icon: WashingMachine,
    href: "/products?category=Appliances&subcategory=WashingMachines"
  },
  {
    name: "Refrigerators",
    icon: Refrigerator,
    href: "/products?category=Appliances&subcategory=Refrigerators"
  },
  {
    name: "Audio",
    icon: Headphones,
    href: "/products?category=Audio"
  },
  {
    name: "Cameras",
    icon: Camera,
    href: "/products?category=Cameras"
  },
  {
    name: "Accessories",
    icon: Package,
    href: "/products?category=Accessories"
  },
  {
    name: "Smart Home",
    icon: Plug,
    href: "/products?category=SmartHome"
  }
];

export default function CategoryGrid() {
  return (
    <section className="py-12" id="categories">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link key={category.name} href={category.href}>
              <Card className="p-4 flex flex-col items-center text-center hover:border-primary hover:shadow-md transition-all group cursor-pointer h-full">
                <CardContent className="pt-6 pb-2 flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <category.icon className="text-primary text-xl md:text-2xl" />
                  </div>
                  <h3 className="font-medium">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
