"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Coffee, Sun, Zap, Plus, Check } from "lucide-react"
import { useAppStore } from "@/lib/store"
import type { TemplateType } from "@/lib/types"
import { cn } from "@/lib/utils"

const TEMPLATE_CONFIGS = {
    weekday: {
        icon: Calendar,
        label: "Weekday",
        description: "Monday - Friday routine",
        color: "bg-blue-500/10 border-blue-500/50 text-blue-400",
        iconColor: "text-blue-500",
    },
    saturday: {
        icon: Coffee,
        label: "Saturday",
        description: "Weekend productivity",
        color: "bg-purple-500/10 border-purple-500/50 text-purple-400",
        iconColor: "text-purple-500",
    },
    sunday: {
        icon: Sun,
        label: "Sunday",
        description: "Rest & planning",
        color: "bg-orange-500/10 border-orange-500/50 text-orange-400",
        iconColor: "text-orange-500",
    },
    cheatday: {
        icon: Zap,
        label: "Cheat Day",
        description: "Flexible schedule",
        color: "bg-green-500/10 border-green-500/50 text-green-400",
        iconColor: "text-green-500",
    },
    custom: {
        icon: Plus,
        label: "Custom",
        description: "Your own template",
        color: "bg-gray-500/10 border-gray-500/50 text-gray-400",
        iconColor: "text-gray-500",
    },
}

interface TemplateSelectorProps {
    onSelect: (templateId: string) => void
    onCreateNew: (type: TemplateType) => void
}

export default function TemplateSelector({ onSelect, onCreateNew }: TemplateSelectorProps) {
    const { routines } = useAppStore()
    const [selectedType, setSelectedType] = useState<TemplateType | null>(null)

    // Group templates by type
    const templatesByType = (routines || []).reduce((acc, template) => {
        const type = template.templateType || "custom"
        if (!acc[type]) acc[type] = []
        acc[type].push(template)
        return acc
    }, {} as Record<TemplateType, typeof routines>)

    // Get current day type
    const getCurrentDayType = (): TemplateType => {
        const day = new Date().getDay()
        if (day === 0) return "sunday"
        if (day === 6) return "saturday"
        return "weekday"
    }

    const suggestedType = getCurrentDayType()

    return (
        <div className="space-y-6">
            {/* Suggested Template */}
            <Card className="border-primary/50">
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        Suggested for Today
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {templatesByType[suggestedType]?.length > 0 ? (
                        <div className="space-y-2">
                            {templatesByType[suggestedType].map((template) => (
                                <Button
                                    key={template.id}
                                    variant="outline"
                                    className="w-full justify-between"
                                    onClick={() => onSelect(template.id)}
                                >
                                    <span>{template.name}</span>
                                    <Badge variant="secondary">{template.tasks.length} tasks</Badge>
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground mb-3">
                                No {TEMPLATE_CONFIGS[suggestedType].label} template yet
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onCreateNew(suggestedType)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create {TEMPLATE_CONFIGS[suggestedType].label} Template
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* All Templates by Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(TEMPLATE_CONFIGS) as TemplateType[]).map((type) => {
                    const config = TEMPLATE_CONFIGS[type]
                    const Icon = config.icon
                    const templates = templatesByType[type] || []

                    return (
                        <Card
                            key={type}
                            className={cn(
                                "cursor-pointer transition-all hover:shadow-md",
                                selectedType === type && "ring-2 ring-primary",
                                config.color
                            )}
                            onClick={() => setSelectedType(type)}
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon className={cn("w-5 h-5", config.iconColor)} />
                                        <CardTitle className="text-base">{config.label}</CardTitle>
                                    </div>
                                    <Badge variant="secondary">{templates.length}</Badge>
                                </div>
                                <CardDescription>{config.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {templates.length > 0 ? (
                                    <div className="space-y-2">
                                        {templates.map((template) => (
                                            <Button
                                                key={template.id}
                                                variant="ghost"
                                                size="sm"
                                                className="w-full justify-between"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onSelect(template.id)
                                                }}
                                            >
                                                <span className="truncate">{template.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">
                                                        {template.tasks.length} tasks
                                                    </span>
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onCreateNew(type)
                                        }}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Template
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
