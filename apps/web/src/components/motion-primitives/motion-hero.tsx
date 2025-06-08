"use client"

import { motion } from "motion/react"
import { TextEffect } from "./text-effect"
import { motion as MotionButton } from "./motion-button"
import { AnimatedBackground } from "./animated-background"

interface MotionHeroProps {
  title: string
  subtitle: string
  primaryAction?: {
    text: string
    href: string
  }
  secondaryAction?: {
    text: string
    href: string
  }
}

export function MotionHero({ 
  title, 
  subtitle, 
  primaryAction, 
  secondaryAction 
}: MotionHeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <AnimatedBackground className="absolute inset-0 opacity-20" />
      
      <div className="container mx-auto px-4 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <TextEffect
            as="h1"
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent"
            preset="fade-in-blur"
            per="word"
            delay={0.2}
          >
            {title}
          </TextEffect>

          <TextEffect
            as="p"
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
            preset="slide"
            per="word"
            delay={0.8}
          >
            {subtitle}
          </TextEffect>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {primaryAction && (
              <MotionButton
                size="lg"
                className="text-lg px-8 py-6"
                glowEffect
                hoverAnimation
                pressAnimation
              >
                {primaryAction.text}
              </MotionButton>
            )}
            
            {secondaryAction && (
              <MotionButton
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6"
                hoverAnimation
                pressAnimation
              >
                {secondaryAction.text}
              </MotionButton>
            )}
          </motion.div>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-xl"
          animate={{
            y: [0, 20, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>
    </section>
  )
}