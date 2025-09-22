'use client'

import { motion } from 'framer-motion'

export function NeuroplasticitySection() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-8xl px-6 lg:px-8">

        <div className="relative isolate overflow-hidden transparent px-6 h-[600px] py-16 shadow-2xl rounded-3xl sm:px-16">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center"
              alt="Mountain landscape"
              className="w-full h-full object-cover"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative z-10 max-w-2xl h-full flex flex-col justify-between text-left"
          >
            <p className="text-base font-semibold uppercase tracking-wider text-gray-300">
              TRAIN YOUR BRAIN FOR A CALMER, HAPPIER LIFE
            </p>
            <div>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                Neuroplasticity means your brain <i>can</i> change.
              </h2>
              <h4 className="mt-6 text-base leading-8 text-gray-300">
                Practice changes pathways. Short, daily chats with Daisy rehearse calm, clear responses - until they become your default.
              </h4>
              <div className="mt-10">
                <a
                  href="#"
                  className="rounded-full bg-white px-6 py-3 text-base font-semibold text-black shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
                >
                  Get Help
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}