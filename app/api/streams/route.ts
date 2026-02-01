import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { YT_REGEX } from "@/app/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string()
});

const MAX_QUEUE_LEN = 20;

// Helper function to extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
        /(?:youtu\.be\/)([^\?\s]+)/,
        /(?:youtube\.com\/embed\/)([^\?\s]+)/,
        /(?:youtube\.com\/v\/)([^\?\s]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Fetch video details using YouTube oEmbed API
async function getYouTubeVideoDetails(videoId: string) {
    try {
        const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const response = await fetch(oEmbedUrl);
        
        if (!response.ok) {
            throw new Error("Video not found or unavailable");
        }
        
        const data = await response.json();
        
        return {
            title: data.title || "Unknown Title",
            // YouTube thumbnail URLs follow a predictable pattern
            smallImg: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
            bigImg: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        };
    } catch (error) {
        // Fallback: try hqdefault if maxresdefault doesn't exist
        return {
            title: "Unknown Title",
            smallImg: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
            bigImg: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        };
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const user = await prismaClient.user.findFirst({
            where: {
                email: session?.user?.email ?? ""
            }
        });

        if (!user) {
            return NextResponse.json({
                message: "Unauthenticated"
            }, {
                status: 403
            });
        }

        const data = CreateStreamSchema.parse(await req.json());
        
        if (!data.url.trim()) {
            return NextResponse.json({
                message: "YouTube link cannot be empty"
            }, {
                status: 400
            });
        }

        const isYt = data.url.match(YT_REGEX)
        if (!isYt) {
            return NextResponse.json({
                message: "Invalid YouTube URL format"
            }, {
                status: 400
            });
        }

        const extractedId = extractVideoId(data.url);
        if (!extractedId) {
            return NextResponse.json({
                message: "Could not extract video ID from URL"
            }, {
                status: 400
            });
        }
        
        const videoDetails = await getYouTubeVideoDetails(extractedId);

        // Check if the user is not the creator
        if (user.id !== data.creatorId) {
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
            const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

            const userRecentStreams = await prismaClient.stream.count({
                where: {
                    userId: data.creatorId,
                    addedBy: user.id,
                    createAt: {
                        gte: tenMinutesAgo
                    }
                }
            });

            // Check for duplicate song in the last 10 minutes
            const duplicateSong = await prismaClient.stream.findFirst({
                where: {
                    userId: data.creatorId,
                    extractedId: extractedId,
                    createAt: {
                        gte: tenMinutesAgo
                    }
                }
            });
            if (duplicateSong) {
                return NextResponse.json({
                    message: "This song was already added in the last 10 minutes"
                }, {
                    status: 429
                });
            }

            // Rate limiting checks for non-creator users
            const streamsLastTwoMinutes = await prismaClient.stream.count({
                where: {
                    userId: data.creatorId,
                    addedBy: user.id,
                    createAt: {
                        gte: twoMinutesAgo
                    }
                }
            });

            if (streamsLastTwoMinutes >= 2) {
                return NextResponse.json({
                    message: "Rate limit exceeded: You can only add 2 songs per 2 minutes"
                }, {
                    status: 429
                });
            }

            if (userRecentStreams >= 5) {
                return NextResponse.json({
                    message: "Rate limit exceeded: You can only add 5 songs per 10 minutes"
                }, {
                    status: 429
                });
            }
        }

        const existingActiveStreams = await prismaClient.stream.count({
            where: {
                userId: data.creatorId,
                played: false
            }
        });

        if (existingActiveStreams >= MAX_QUEUE_LEN) {
            return NextResponse.json({
                message: "Queue is full"
            }, {
                status: 429
            });
        }

        const stream = await prismaClient.stream.create({
            data: {
                userId: data.creatorId,
                addedBy: user.id,
                url: data.url,
                extractedId,
                type: "Youtube",
                title: videoDetails.title,
                smallImg: videoDetails.smallImg,
                bigImg: videoDetails.bigImg
            }
        });

        return NextResponse.json({
            ...stream,
            hasUpvoted: false,
            upvotes: 0
        });
    } catch(e) {
        console.error(e);
        return NextResponse.json({
            message: "Error while adding a stream"
        }, {
            status: 500
        });
    }
}

export async function GET(req: NextRequest) {
    const creatorId = req.nextUrl.searchParams.get("creatorId");
    const session = await getServerSession(authOptions);
    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    });

    if (!user) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 403
        })
    }

    if (!creatorId) {
        return NextResponse.json({
            message: "Error"
        }, {
            status: 411
        })
    }

    const [streams, activeStream] = await Promise.all([
        prismaClient.stream.findMany({
            where: {
                userId: creatorId,
                played: false
            },
            include: {
                _count: {
                    select: {
                        upvotes: true
                    }
                },
                upvotes: {
                    where: {
                        userId: user.id
                    }
                }
            }
        }),
        prismaClient.currentStream.findFirst({
            where: {
                userId: creatorId
            },
            include: {
                stream: true
            }
        })
    ]);

    const isCreator = user.id === creatorId;

    return NextResponse.json({
        streams: streams.map(({_count, ...rest}) => ({
            ...rest,
            upvotes: _count.upvotes,
            haveUpvoted: rest.upvotes.length ? true : false
        })),
        activeStream,
        creatorId,
        isCreator
    });
}