"use client"

import { motion } from "framer-motion"
import { Globe, Package, Terminal } from "lucide-react"
import SpotlightCard from "@/components/SpotlightCard"
import ShinyText from "@/components/ShinyText"

const downloadOptions = [
  {
    icon: Globe,
    title: "Web 版",
    description: "Linux 服务器、Docker、无桌面环境",
    format: "npm run build && npm run serve",
    href: "https://github.com/AI-Hub-Growth/linclaw",
    color: "from-violet-700 to-violet-800",
  },
  {
    icon: Package,
    title: "发布包",
    description: "macOS / Windows / Linux 多平台",
    format: "DMG · EXE · 跨平台包",
    href: "https://github.com/AI-Hub-Growth/linclaw/releases",
    color: "from-blue-700 to-blue-800",
  },
  {
    icon: Terminal,
    title: "一键部署",
    description: "远程服务器快速安装",
    format: "curl -fsSL deploy.sh | bash",
    href: "https://github.com/AI-Hub-Growth/linclaw",
    color: "from-emerald-700 to-emerald-800",
  },
]

export default function DownloadSection() {
  return (
    <section id="download" className="relative py-24 md:py-32 bg-[#0a0a0f]">
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
              text="立即开始"
              speed={3}
              color="#b5b5b5"
              shineColor="#ffffff"
              spread={100}
            />
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            多种安装方式，选择适合你的方案
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {downloadOptions.map((option, index) => (
            <motion.a
              key={option.title}
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <SpotlightCard
                className="h-full cursor-pointer group"
                spotlightColor="rgba(99, 102, 241, 0.2)"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {option.title}
                </h3>
                <p className="text-sm text-slate-400 mb-3">
                  {option.description}
                </p>
                <p className="text-xs text-violet-400 font-mono">
                  {option.format}
                </p>
              </SpotlightCard>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
