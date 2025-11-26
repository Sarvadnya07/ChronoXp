"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Lightbulb, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Insight } from "@/services/insightsEngine"

interface InsightsPanelProps {
    insights: Insight[]
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-500" />
            case "success": return <CheckCircle2 className="w-5 h-5 text-green-500" />
            default: return <Lightbulb className="w-5 h-5 text-blue-500" />
        }
    }

    return (
        <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    AI Insights
                </CardTitle>
                <CardDescription>Smart observations about your productivity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {insights.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No insights available yet. Keep tracking!</p>
                ) : (
                    insights.map((insight, i) => (
                        <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-muted/50">
                            {getIcon(insight.type)}
                            <div className="space-y-1">
                                <p className="text-sm font-medium">{insight.message}</p>
                                {insight.metric && (
                                    <p className="text-xs text-muted-foreground font-mono">{insight.metric}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
