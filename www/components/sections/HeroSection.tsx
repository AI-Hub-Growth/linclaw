"use client"

import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import Image from "next/image"
import StarBorder from "@/components/StarBorder"

const Dither = dynamic(() => import("@/components/Dither"), { ssr: false })

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0f]">
      <div className="absolute inset-0 z-0">
        <Dither
          waveColor={[0.388, 0.4, 0.945]}
          waveSpeed={0.02}
          waveFrequency={3}
          waveAmplitude={0.3}
          colorNum={4}
          pixelSize={4}
          enableMouseInteraction={true}
          mouseRadius={1}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-[#0a0a0f]/40 to-[#0a0a0f]/80 pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-10rem)]">
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center lg:justify-start mb-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-violet-200">
                  七牛云 AI · OpenClaw 可视化管理面板
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-center lg:text-left text-white tracking-tight drop-shadow-2xl mb-6"
            >
              LinClaw
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center lg:text-left text-lg md:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 mb-4"
            >
              集成七牛云 AI 大模型广场，300 万 Token 免费额度
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center lg:text-left text-base text-slate-400 max-w-xl mx-auto lg:mx-0 mb-10"
            >
              模型配置 · Gateway 管理 · 消息渠道 · Agent 舰队 · 记忆系统
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
            >
              <StarBorder as="a" href="#download" className="cursor-pointer" color="#6366f1" speed="6s" thickness={1}>
                <span>立即下载</span>
              </StarBorder>
              <a
                href="https://github.com/AI-Hub-Growth/linclaw"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white transition-colors duration-300 backdrop-blur-sm bg-black/20"
              >
                GitHub 仓库
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative order-1 lg:order-2"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <Image
                src="/images/dashboard.png"
                alt="LinClaw 仪表盘 - OpenClaw 运行状态概览"
                width={800}
                height={500}
                className="w-full h-auto object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent z-20 pointer-events-none" />
    </section>
  )
}
