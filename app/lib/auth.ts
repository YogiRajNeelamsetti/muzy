import GoogleProvider from "next-auth/providers/google";
import { DefaultSession, NextAuthOptions } from "next-auth"
import { prismaClient } from "@/app/lib/db";

declare module "next-auth" {
    interface Session {
        user: {
            id: string
        } & DefaultSession["user"]
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET ?? "secret",
    pages: {
        signIn: '/',
        error: '/api/auth/error',
    },
    session: {
        strategy: "jwt",
    },
    debug: process.env.NODE_ENV === 'development',
    callbacks: {
        async signIn(params) {
            if (!params.user.email) {
                console.error("Sign in failed: No email provided");
                return false;
            }
            try {
                const existingUser = await prismaClient.user.findUnique({
                    where: {
                        email: params.user.email
                    }
                })
                if (existingUser) {
                    return true
                }
                await prismaClient.user.create({
                    data: {
                        email: params.user.email,
                        provider: "Google"
                    }
                })
                return true;
            } catch (e) {
                console.error("Sign in error:", e);
                return false;
            }
        },
        async session({ session, token, user }) {
            const dbUser = await prismaClient.user.findUnique({
                where: {
                    email: session.user.email as string
                }
            })
            if (!dbUser) {
                return session;
            }
            return {
                ...session,
                user: {
                    ...session.user,
                    id: dbUser.id
                }
            }
        }
    }
}
