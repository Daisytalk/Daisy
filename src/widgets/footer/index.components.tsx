'use client'

import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'
import { NewsletterForm } from '@/features/newsletter-signup'

interface FooterSectionProps {
  onNewsletterSubmit?: (email: string) => Promise<void>
}

export function FooterSection({ onNewsletterSubmit }: FooterSectionProps) {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-8xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <img src="/images/logo-dark.svg" className="h-16 w-auto" alt="Daisy logo" />
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your trusted partner in mental health and wellness.
              Connecting you with licensed professionals for quality care.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-[#7E9EC4] hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-[#7E9EC4] hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-[#7E9EC4] hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-[#7E9EC4] hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Individual Therapy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Couples Therapy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Family Therapy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Group Sessions</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Crisis Support</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Psychiatric Care</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Mental Health Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Self-Help Tools</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Crisis Resources</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Insurance Guide</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Support Center</a></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Stay Connected</h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-gray-600">
                <Mail className="w-5 h-5 mr-3" />
                <span>support@daisy.com</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-5 h-5 mr-3" />
                <span>+7-777-777-77-77</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-3" />
                <span>Astana, Kazakhstan</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-gray-900">Newsletter</h4>
              <p className="text-gray-600 text-sm mb-4">
                Get mental health tips and updates delivered to your inbox.
              </p>
              <NewsletterForm onSubmit={onNewsletterSubmit} />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-wrap items-center space-x-6 mb-4 md:mb-0">
              <p className="text-gray-600 text-sm">
                © 2025 Daisy. All rights reserved.
              </p>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">HIPAA Notice</a>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>🔒 HIPAA Compliant</span>
              <span>✓ Licensed Therapists</span>
              <span>🛡️ Secure Platform</span>
            </div>
          </div>
        </div>
      </div>

      {/* Crisis Banner */}
      <div className="bg-red-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm">
            <strong>Crisis Support:</strong> If you're in immediate danger, call 911 or text HOME to 741741 for 24/7 crisis support.
          </p>
        </div>
      </div>
    </footer>
  )
}