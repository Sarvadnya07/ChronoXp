"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save, X } from "lucide-react"
import type { Task, TemplateType } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TemplateEditorProps {
    templateType: TemplateType
    initialTasks?: Omit<Task, "id" | "completed" | "completedAt" | "scheduledDate">[]
    onSave: (name: string, tasks: Omit<Task, "id" | "completed" | "completedAt" | "scheduledDate">[]) => void
    onCancel: () => void
}

export default function TemplateEditor({
    templateType,
    initialTasks = [],
    onSave,
    onCancel,
}: TemplateEditorProps) {
    const [templateName, setTemplateName] = useState("")
    const [tasks, setTasks] = useState<Omit<Task, "id" | "completed" | "completedAt" | "scheduledDate">[]>(
        initialTasks.length > 0 ? initialTasks : []
    )

    const addTask = () => {
        setTasks([
            ...tasks,
            {
                title: "",
                category: "Custom",
                xp: 10,
                duration: 30,
                priority: "medium",
                isCritical: false,
                repeatRule: "none",
                difficulty: "medium",
                isCore: false,
            },
        ])
    }

    const removeTask = (index: number) => {
        setTasks(tasks.filter((_, i) => i !== index))
    }

    const updateTask = (index: number, updates: Partial<typeof tasks[0]>) => {
        setTasks(tasks.map((task, i) => (i === index ? { ...task, ...updates } : task)))
    }

    const handleSave = () => {
        if (!templateName.trim()) {
            alert("Please enter a template name")
            return
        }
        if (tasks.length === 0) {
            alert("Please add at least one task")
            return
        }
        onSave(templateName, tasks)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Create {templateType.charAt(0).toUpperCase() + templateType.slice(1)} Template</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={onCancel}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Template
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Template Name */}
                <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                        id="template-name"
                        placeholder={`My ${templateType} routine`}
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                    />
                </div>

                {/* Tasks List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Tasks ({tasks.length})</Label>
                        <Button variant="outline" size="sm" onClick={addTask}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Task
                        </Button>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg">
                            <p className="text-sm text-muted-foreground mb-3">No tasks yet</p>
                            <Button variant="outline" size="sm" onClick={addTask}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Task
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tasks.map((task, index) => (
                                <Card key={index} className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1 grid grid-cols-2 gap-3">
                                                <div className="col-span-2">
                                                    <Label className="text-xs">Task Title</Label>
                                                    <Input
                                                        placeholder="Task name"
                                                        value={task.title}
                                                        onChange={(e) => updateTask(index, { title: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Start Time</Label>
                                                    <Input
                                                        type="time"
                                                        value={task.startTime || ""}
                                                        onChange={(e) => updateTask(index, { startTime: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Duration (min)</Label>
                                                    <Input
                                                        type="number"
                                                        value={task.duration}
                                                        onChange={(e) =>
                                                            updateTask(index, { duration: parseInt(e.target.value) || 30 })
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Category</Label>
                                                    <Select
                                                        value={task.category}
                                                        onValueChange={(value) => updateTask(index, { category: value as any })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="DSA">DSA</SelectItem>
                                                            <SelectItem value="AI/ML">AI/ML</SelectItem>
                                                            <SelectItem value="GATE">GATE</SelectItem>
                                                            <SelectItem value="Japanese">Japanese</SelectItem>
                                                            <SelectItem value="Exercise">Exercise</SelectItem>
                                                            <SelectItem value="Projects">Projects</SelectItem>
                                                            <SelectItem value="Study">Study</SelectItem>
                                                            <SelectItem value="Health">Health</SelectItem>
                                                            <SelectItem value="Sleep">Sleep</SelectItem>
                                                            <SelectItem value="Journal">Journal</SelectItem>
                                                            <SelectItem value="Break">Break</SelectItem>
                                                            <SelectItem value="Custom">Custom</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Priority</Label>
                                                    <Select
                                                        value={task.priority}
                                                        onValueChange={(value) => updateTask(index, { priority: value as any })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="low">Low</SelectItem>
                                                            <SelectItem value="medium">Medium</SelectItem>
                                                            <SelectItem value="high">High</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0"
                                                onClick={() => removeTask(index)}
                                            >
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
