import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    id: 1,
    name: "Ravi Patel",
    title: "Satisfied Customer",
    quote: "I purchased a washing machine from Vijay Electronics and I'm extremely satisfied with the quality. The smart features and energy efficiency are exactly what I needed for my new apartment.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 2,
    name: "Ananya Singh",
    title: "Tech Enthusiast",
    quote: "The staff at Vijay Electronics was incredibly helpful and knowledgeable. They guided me to the perfect laptop that meets all my requirements for work and gaming.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 3,
    name: "Vikram Malhotra",
    title: "Home Theater Enthusiast",
    quote: "The home theater system I bought from Vijay Electronics transformed my living room into a mini cinema. The sound quality is exceptional and the setup was straightforward.",
    rating: 4,
    image: "https://randomuser.me/api/portraits/men/46.jpg"
  },
  {
    id: 4,
    name: "Priya Sharma",
    title: "Smart Home Adopter",
    quote: "Thanks to Vijay Electronics, I've been able to create a fully integrated smart home. Their range of smart appliances and helpful staff made the process smooth and enjoyable.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  {
    id: 5,
    name: "Karthik Iyer",
    title: "Photography Enthusiast",
    quote: "The camera I purchased from Vijay Electronics has exceptional quality. The team's expertise helped me choose a model that suits my photography style perfectly.",
    rating: 4,
    image: "https://randomuser.me/api/portraits/men/22.jpg"
  }
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Hear from our satisfied customers about their experiences with Vijay Electronics products and services.</p>
        </div>
        
        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent className="-ml-2 md:-ml-4">
            {testimonials.map((testimonial) => (
              <CarouselItem 
                key={testimonial.id} 
                className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <div className="h-full">
                  <Card className="h-full flex flex-col">
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center mb-4">
                        <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                          <img 
                            src={testimonial.image} 
                            alt={testimonial.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold">{testimonial.name}</h3>
                          <p className="text-sm text-gray-500">{testimonial.title}</p>
                        </div>
                      </div>
                      
                      <div className="flex mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      
                      <blockquote className="flex-1 italic text-gray-700 leading-relaxed">
                        "{testimonial.quote}"
                      </blockquote>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-8">
            <CarouselPrevious className="mr-2" />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    </section>
  );
}