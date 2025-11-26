"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Clock, CheckCircle2 } from "lucide-react"
import type { WeeklyChallenge } from "@/lib/types"

interface WeeklyChallengeCardProps {
    challenge: WeeklyChallenge
}

export default function WeeklyChallengeCard({ challenge }: WeeklyChallengeCardProps) {
    const progress = Math.min(100, (challenge.current / challenge.target) * 100)

    const getIcon = () => {
        switch (challenge.type) {
            case "xp": return <Star className="w-5 h-5 text-yellow-500" />
            case "hours": return <Clock className="w-5 h-5 text-blue-500" />
            case "tasks": return <CheckCircle2 className="w-5 h-5 text-green-500" />
            default: return <Trophy className="w-5 h-5 text-primary" />
        }
    }

    return (
        <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
                <Trophy className="w-24 h-24" />
            </div>

            <CardContent className="p-4 relative z-10">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-background rounded-lg shadow-sm">
                        {getIcon()}
                    </div>

                    <div className="flex-1 space-y-2">
                        <div>
                            <h4 className="font-semibold text-sm">Weekly Challenge</h4>
                            <p className="text-xs text-muted-foreground">{challenge.description}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="font-medium">
                                    {challenge.current} / {challenge.target}
                                </span>
                                <span className="text-primary">+{challenge.rewardXp} XP</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
