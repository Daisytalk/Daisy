'use client'

import { Mail, MapPin } from 'lucide-react'
import { FaTiktok, FaInstagram } from 'react-icons/fa'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { NewsletterForm } from '@/features/newsletter-signup'

interface FooterSectionProps {
  onNewsletterSubmit?: (email: string) => Promise<void>
}

export function FooterSection({ onNewsletterSubmit }: FooterSectionProps) {
  const t = useTranslations('footer')
  const locale = useLocale()
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <img src="/images/logo-dark.svg" className="h-10 sm:h-12 lg:h-16 w-auto" alt="Daisy logo" />
            </div>
            <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
              {t('tagline')}
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="https://www.tiktok.com/@talk.to.daisy2?_t=ZN-90KL5339oGc&_r=1" className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-[#7E9EC4] hover:text-white transition-colors">
                <FaTiktok className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="https://www.instagram.com/talk_to_daisy?igsh=cGdkeW5nYmtuZDlh" className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-[#7E9EC4] hover:text-white transition-colors">
                <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="sm:col-span-1">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4 lg:mb-6"></h3>
            <ul className="space-y-2 sm:space-y-3">
              <li><a href="#" className="text-xs sm:text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors"></a></li>
              <li><a href="#" className="text-xs sm:text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors"></a></li>
              <li><a href="#" className="text-xs sm:text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors"></a></li>
              <li><a href="#" className="text-xs sm:text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors"></a></li>
              <li><a href="#" className="text-xs sm:text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors"></a></li>
              <li><a href="#" className="text-xs sm:text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors"></a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="sm:col-span-1">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4 lg:mb-6">{t('resources')}</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li><a href="#" className="text-xs sm:text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors">{t('crisisResources')}</a></li>
              <li><Link href={`/${locale}#faq`} className="text-xs sm:text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors">{t('faq')}</Link></li>
              <li><Link href={`/${locale}/resources`} className="text-xs sm:text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors">{t('trustSafetyTitle')}</Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4 lg:mb-6">{t('stayConnected')}</h3>

            <div className="space-y-2 sm:space-y-3 lg:space-y-4 mb-4 sm:mb-6">
              <div className="flex items-center text-gray-600">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="text-xs sm:text-sm lg:text-base break-all">{t('email')}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="text-xs sm:text-sm lg:text-base">{t('location')}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 sm:mb-3 text-gray-900 text-xs sm:text-sm lg:text-base">{t('newsletter')}</h4>
              <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                {t('newsletterDesc')}
              </p>
              <NewsletterForm onSubmit={onNewsletterSubmit} />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-4 sm:pt-6 lg:pt-8">
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center">
            <div className="flex flex-col items-center lg:items-start space-y-2 sm:space-y-3 text-center lg:text-left">
              <p className="text-gray-600 text-xs sm:text-sm">
                {t('copyright')}
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 lg:gap-6">
                <a href="#" className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm transition-colors">{t('privacyPolicy')}</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm transition-colors">{t('termsOfService')}</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm transition-colors">{t('hipaaNotice')}</a>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-3 gap-y-2 text-[10px] sm:text-xs text-gray-600 text-center">
              <span className="flex items-center whitespace-nowrap">🇪🇺 Соответствие GDPR</span>
              <span className="flex items-center whitespace-nowrap">🔒 HIPAA-aligned</span>
              <span className="flex items-center whitespace-nowrap">🛡 SOC 2 Type II</span>
              <span className="flex items-center whitespace-nowrap">🧠 OECD/EU AI Act</span>
              <span className="flex items-center whitespace-nowrap">🚫 Без передачи третьим лицам</span>
            </div>
          </div>
        </div>
      </div>

      {/* Crisis Banner */}
      {/* <div className="bg-red-600 text-white py-2 sm:py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs sm:text-sm leading-relaxed">
            <strong>Crisis Support:</strong> If you're in immediate danger, call 911 or text HOME to 741741 for 24/7 crisis support.
          </p>
        </div>
      </div> */}
    </footer>
  )
}