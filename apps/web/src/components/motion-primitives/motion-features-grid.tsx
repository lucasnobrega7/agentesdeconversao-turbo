"use client"

import { motion } from "motion/react"
import { InView } from "./in-view"
import { TextEffect } from "./text-effect"

export function MotionFeaturesGrid() {
  const features = [
    {
      title: "IA Avançada",
      description: "Agentes inteligentes powered by GPT-4 e Claude",
      icon: "🤖"
    },
    {
      title: "Multi-Canal",
      description: "WhatsApp, Telegram, webchat e mais",
      icon: "💬"
    },
    {
      title: "Analytics Real-time",
      description: "Dashboard completo com métricas de conversão",
      icon: "📊"
    },
    {
      title: "Fácil Integração",
      description: "APIs REST e webhooks para qualquer sistema",
      icon: "🔗"
    }
  ]

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <TextEffect 
            as="h2"
            className="text-4xl font-bold"
            preset="fade-in-blur"
            per="word"
          >
            Recursos que Fazem a Diferença
          </TextEffect>
        </motion.div>

        <InView
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
        >
          <motion.div 
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  y: -10, 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                }}
                className="text-center p-6 rounded-lg border bg-white cursor-pointer"
              >
                <motion.div 
                  className="text-4xl mb-4 inline-block"
                  whileHover={{ 
                    scale: 1.2,
                    rotate: [0, -10, 10, 0],
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                
                <TextEffect
                  as="h3"
                  className="text-xl font-semibold mb-2"
                  preset="slide"
                  per="word"
                  delay={index * 0.1}
                >
                  {feature.title}
                </TextEffect>
                
                <motion.p 
                  className="text-gray-600"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {feature.description}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </InView>
      </div>
    </section>
  )
}