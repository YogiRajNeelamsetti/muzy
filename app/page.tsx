'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Music, Users, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Appbar } from "./components/Appbar"
import useRedirect from "./hooks/useRedirect"
import { useRouter } from "next/navigation"
import { DashboardButton } from "@/components/ui/DashboardButton"

export default function LandingPage() {
  useRedirect();
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter();
  const { status, goToDashboard } = useRedirect();
  useEffect(() => {
    setIsLoaded(true)
  }, [])
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Appbar />
      <main className="flex-1">
        <section className="w-full pt-12 md:py-24 lg:py-32 xl:pt-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Let Your Fans Choose the Beat
              </h1>
              <p className="mx-auto max-w-[600px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Muzy: Where creators and fans curate the perfect streaming soundtrack together.
              </p>
              <div className="space-x-4 pt-2">
                {/* {status === "authenticated" && (
                  <Button onClick={ goToDashboard } className="bg-purple-600 text-white hover:bg-purple-700">Enter Dashboard
                  </Button>)
                } */}
                {status == "authenticated" && (<DashboardButton />)}
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-12 text-purple-300">Key Features</h2>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              {[
                { icon: Users, title: "Fan Interaction", description: "Let fans vote on and request songs for your stream." },
                { icon: Zap, title: "Real-time Updates", description: "See live song requests and votes during your stream." },
                { icon: Music, title: "Vast Music Library", description: "Access millions of tracks for the perfect soundtrack." }
              ].map((feature, index) => (
                <div key={index} className={`flex flex-col items-center space-y-4 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${index * 200}ms` }}>
                  <feature.icon className="h-12 w-12 text-purple-400" />
                  <h3 className="text-2xl font-bold text-center text-gray-100">{feature.title}</h3>
                  <p className="text-gray-400 text-center">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Amplify Your Stream?
              </h2>
              <p className="mx-auto max-w-[600px] text-purple-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join Muzy today and create unforgettable, interactive streaming experiences.
              </p>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input className="max-w-lg flex-1 bg-purple-800 text-white placeholder-purple-300 border-purple-700" placeholder="Enter your email" type="email" />
                  <Button type="submit" className="bg-pink-600 text-white hover:bg-pink-700">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col  sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 ">
        <p className="text-xs text-gray-400">© 2024 Muzy. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-gray-400" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-gray-400" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}