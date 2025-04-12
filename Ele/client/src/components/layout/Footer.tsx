import { Link } from "wouter";
import { Facebook, Instagram, MapPin, Mail, Phone, Clock, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Vijay Electronics</h3>
            <p className="text-gray-400 mb-4">Your trusted destination for premium electronics and tech accessories since 1995.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Youtube size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link href="/products" className="text-gray-400 hover:text-white">Products</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Shipping Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Return Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Track Order</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                <span className="text-gray-400">123 Main Street, Mumbai, India 400001</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-gray-400">+91 9876543210</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-gray-400">info@vijayelectronics.com</span>
              </li>
              <li className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-gray-400">Mon-Sat: 10AM - 8PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} Vijay Electronics. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <div className="h-6 bg-gray-500 rounded-md px-2.5 py-1 text-xs text-white">VISA</div>
              <div className="h-6 bg-gray-500 rounded-md px-2.5 py-1 text-xs text-white">MC</div>
              <div className="h-6 bg-gray-500 rounded-md px-2.5 py-1 text-xs text-white">PAYPAL</div>
              <div className="h-6 bg-gray-500 rounded-md px-2.5 py-1 text-xs text-white">AMEX</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
