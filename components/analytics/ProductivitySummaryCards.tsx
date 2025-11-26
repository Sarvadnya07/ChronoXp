"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, Zap, AlertTriangle } from "lucide-react"

interface ProductivitySummaryProps {
    mostProductiveDay: string
    leastProductiveDay: string
    mostConsistentBlock: string
    weakestBlock: string
}

export function ProductivitySummaryCards({ mostProductiveDay, leastProductiveDay, mostConsistentBlock, weakestBlock }: ProductivitySummaryProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Best Day</CardTitle>
                    <CalendarDays className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{mostProductiveDay}</div>
                    <p className="text-xs text-muted-foreground">
                        Highest completion rate
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Needs Focus</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{leastProductiveDay}</div>
                    <p className="text-xs text-muted-foreground">
                        Lowest completion rate
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Strongest Block</CardTitle>
                    <Zap className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold truncate" title={mostConsistentBlock}>{mostConsistentBlock}</div>
                    <p className="text-xs text-muted-foreground">
                        Most consistent
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Weakest Block</CardTitle>
                    <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold truncate" title={weakestBlock}>{weakestBlock}</div>
                    <p className="text-xs text-muted-foreground">
                        Lowest completion
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
