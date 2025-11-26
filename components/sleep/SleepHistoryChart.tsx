"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface SleepDataPoint {
    date: string
    hours: number
    quality: number
}

interface SleepHistoryChartProps {
    data: SleepDataPoint[]
}

export function SleepHistoryChart({ data }: SleepHistoryChartProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Sleep History</CardTitle>
                <CardDescription>Last 7 nights</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}h`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="flex flex-col">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                    {payload[0].payload.date}
                                                </span>
                                                <span className="font-bold">
                                                    {payload[0].value} hours
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    Quality: {payload[0].payload.quality}/5
                                                </span>
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Bar
                            dataKey="hours"
                            fill="var(--theme-primary)"
                            radius={[4, 4, 0, 0]}
                            opacity={0.8}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
