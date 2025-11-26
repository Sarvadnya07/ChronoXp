"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { type Task, XP_REWARDS, type TaskCategory, type TaskPriority, type RepeatRule } from "@/lib/types"

interface TaskEditorProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    task?: Task | null
    onSave: (task: Partial<Task>) => Promise<void>
}

export function TaskEditor({ open, onOpenChange, task, onSave }: TaskEditorProps) {
    const [formData, setFormData] = useState<Partial<Task>>({
        title: "",
        category: "Custom",
        duration: 30,
        scheduledTime: "",
        difficulty: "medium",
        priority: "medium",
        isCore: false,
        isCritical: false,
        repeatRule: "none",
        notes: "",
    })

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                category: task.category,
                duration: task.duration,
                scheduledTime: task.scheduledTime || "",
                difficulty: task.difficulty,
                priority: task.priority || "medium",
                isCore: task.isCore,
                isCritical: task.isCritical || false,
                repeatRule: task.repeatRule || "none",
                notes: task.notes || "",
            })
        } else {
            setFormData({
                title: "",
                category: "Custom",
                duration: 30,
                scheduledTime: "",
                difficulty: "medium",
                priority: "medium",
                isCore: false,
                isCritical: false,
                repeatRule: "none",
                notes: "",
            })
        }
    }, [task, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSave({
            ...formData,
            xp: XP_REWARDS[formData.category as TaskCategory] || 10,
        })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Task Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value as TaskCategory })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(XP_REWARDS).map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat} (+{XP_REWARDS[cat as TaskCategory]} XP)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                                id="duration"
                                type="number"
                                min="5"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="scheduledTime">Time (optional)</Label>
                            <Input
                                id="scheduledTime"
                                type="time"
                                value={formData.scheduledTime}
                                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Select
                                value={formData.difficulty}
                                onValueChange={(value) => setFormData({ ...formData, difficulty: value as Task["difficulty"] })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy (1x XP)</SelectItem>
                                    <SelectItem value="medium">Medium (1.5x XP)</SelectItem>
                                    <SelectItem value="hard">Hard (2x XP)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
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

                        <div className="space-y-2">
                            <Label htmlFor="repeatRule">Repeat</Label>
                            <Select
                                value={formData.repeatRule}
                                onValueChange={(value) => setFormData({ ...formData, repeatRule: value as RepeatRule })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Repeat</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekdays">Weekdays (Mon-Fri)</SelectItem>
                                    <SelectItem value="weekends">Weekends (Sat-Sun)</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Add details, links, or subtasks..."
                        />
                    </div>

                    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isCore"
                                checked={formData.isCore}
                                onCheckedChange={(checked) => setFormData({ ...formData, isCore: checked as boolean })}
                            />
                            <Label htmlFor="isCore" className="cursor-pointer font-medium">
                                Core Task (Required for Streak)
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isCritical"
                                checked={formData.isCritical}
                                onCheckedChange={(checked) => setFormData({ ...formData, isCritical: checked as boolean })}
                            />
                            <Label htmlFor="isCritical" className="cursor-pointer font-medium text-destructive">
                                Critical Task (Must complete today)
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {task ? "Update Task" : "Create Task"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
