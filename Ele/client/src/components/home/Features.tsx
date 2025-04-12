import { Truck, ShieldCheck, RefreshCw } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free shipping on all orders above ₹1000 within India. Quick delivery within 2-5 business days."
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "All transactions are secure and encrypted. We accept various payment methods for your convenience."
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "Hassle-free return policy. Return or exchange products within 7 days of delivery."
  }
];

export default function Features() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
