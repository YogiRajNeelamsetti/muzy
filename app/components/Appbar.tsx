"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Music } from "lucide-react"
export function Appbar() {
    const session = useSession()
    
    return <div className="flex justify-between px-20 pt-5">
        <div className="pt-2">
            <Link className="flex items-center justify-center" href="/">
            <Music className="h-8 w-8 text-purple-400" />
            <span className="ml-2 font-bold text-3xl text-purple-400">MUZY</span>
            </Link>
        </div>
        <div className="pt-1">

            {session.data?.user && 
            <Button 
            className="hover:bg-gradient-to-r hover:from-pink-600 hover:to-pink-700 hover:text-gray-900 transition-colors bg-gradient-to-r from-gray-900 to-gray-950 text-purple-400 shadow-lg hover:shadow-xl" 
            onClick= {() => signOut()}
            >
                Log Out
            </Button>}
            {!session.data?.user && 
            <Button 
            className="hover:bg-gradient-to-r hover:from-pink-600 hover:to-pink-700 hover:text-gray-900 transition-colors bg-gradient-to-r from-gray-900 to-gray-950 text-purple-400 shadow-lg hover:shadow-xl" onClick= {() => signIn()}
            >
                Sign in
            </Button>}
        </div>
    </div>
}