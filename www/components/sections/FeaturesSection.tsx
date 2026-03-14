"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import ShinyText from "@/components/ShinyText"

const features = [
  {
    title: "仪表盘",
    description: "Gateway 状态、Agent 舰队、模型池、基础服务一目了然",
    image: "/images/dashboard.png",
    alt: "LinClaw 仪表盘",
  },
  {
    title: "消息渠道",
    description: "支持 QQ、Telegram、Discord、飞书、钉钉等平台一键接入",
    image: "/images/channels.png",
    alt: "LinClaw 消息渠道配置",
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 md:py-32 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            <ShinyText
              text="核心功能"
              speed={3}
              color="#b5b5b5"
              shineColor="#ffffff"
              spread={100}
            />
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            一站式 OpenClaw 管理，七牛云 AI 深度集成
          </p>
        </motion.div>

        <div className="space-y-24">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className={`relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                <Image
                  src={feature.image}
                  alt={feature.alt}
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
