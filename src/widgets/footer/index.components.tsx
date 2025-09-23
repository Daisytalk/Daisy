'use client'

import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'
import { NewsletterForm } from '@/features/newsletter-signup'

interface FooterSectionProps {
  onNewsletterSubmit?: (email: string) => Promise<void>
}

export function FooterSection({ onNewsletterSubmit }: FooterSectionProps) {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <img src="/images/logo-dark.svg" className="h-12 sm:h-16 w-auto" alt="Daisy logo" />
            </div>
            <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
              Your trusted partner in mental health and wellness.
              Connecting you with licensed professionals for quality care.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-[#7E9EC4] hover:text-white transition-colors">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-[#7E9EC4] hover:text-white transition-colors">
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-[#7E9EC4] hover:text-white transition-colors">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-[#7E9EC4] hover:text-white transition-colors">
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Services</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li><a href="#" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors">Individual Therapy</a></li>
              <li><a href="#" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors">Couples Therapy</a></li>
              <li><a href="#" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors">Family Therapy</a></li>
              <li><a href="#" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors">Group Sessions</a></li>
              <li><a href="#" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors">Crisis Support</a></li>
              <li><a href="#" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors">Psychiatric Care</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Resources</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li><a href="#" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors">Mental Health Blog</a></li>
              <li><a href="#" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors">Self-Help Tools</a></li>
              <li><a href="#" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors">Crisis Resources</a></li>
              <li><a href="#" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors">Insurance Guide</a></li>
              <li><a href="#" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors">FAQ</a></li>
              <li><a href="#" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors">Support Center</a></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Stay Connected</h3>

            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="text-sm sm:text-base">support@daisy.com</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="text-sm sm:text-base">+7-777-777-77-77</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="text-sm sm:text-base">Astana, Kazakhstan</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 sm:mb-3 text-gray-900 text-sm sm:text-base">Newsletter</h4>
              <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                Get mental health tips and updates delivered to your inbox.
              </p>
              <NewsletterForm onSubmit={onNewsletterSubmit} />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-6 sm:pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row flex-wrap items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-center">
              <p className="text-gray-600 text-xs sm:text-sm">
                © 2025 Daisy. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start space-x-4 sm:space-x-6">
                <a href="#" className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm transition-colors">HIPAA Notice</a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4 text-xs sm:text-sm text-gray-600 text-center">
              <span className="flex items-center">🔒 HIPAA Compliant</span>
              <span className="flex items-center">✓ Licensed Therapists</span>
              <span className="flex items-center">🛡️ Secure Platform</span>
            </div>
          </div>
        </div>
      </div>

      {/* Crisis Banner */}
      <div className="bg-red-600 text-white py-2 sm:py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs sm:text-sm leading-relaxed">
            <strong>Crisis Support:</strong> If you're in immediate danger, call 911 or text HOME to 741741 for 24/7 crisis support.
          </p>
        </div>
      </div>
    </footer>
  )
}