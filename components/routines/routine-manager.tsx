"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Play, Trash2, Save, Clock, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import type { Task } from "@/lib/types"

export default function RoutineManager() {
    const { routines, tasks, saveRoutine, applyRoutine, deleteRoutine } = useAppStore()
    const [newRoutineName, setNewRoutineName] = useState("")
    const [selectedTasks, setSelectedTasks] = useState<string[]>([])

    const handleSaveRoutine = async () => {
        if (!newRoutineName.trim()) {
            toast.error("Please enter a routine name")
            return
        }

        if (selectedTasks.length === 0) {
            toast.error("Please select at least one task")
            return
        }

        const tasksToSave = tasks.filter(t => selectedTasks.includes(t.id))
        await saveRoutine(newRoutineName, tasksToSave)
        toast.success("Routine saved successfully")
        setNewRoutineName("")
        setSelectedTasks([])
    }

    const handleApplyRoutine = async (id: string) => {
        await applyRoutine(id)
        toast.success("Routine applied successfully")
    }

    const handleDeleteRoutine = async (id: string) => {
        await deleteRoutine(id)
        toast.success("Routine deleted")
    }

    const toggleTaskSelection = (taskId: string) => {
        setSelectedTasks(prev =>
            prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        )
    }

    return (
        <div className="space-y-6 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Routine Templates</h2>
                    <p className="text-muted-foreground">Create and manage reusable task lists</p>
                </div>
            </div>

            <Tabs defaultValue="templates" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="templates">My Templates</TabsTrigger>
                    <TabsTrigger value="create">Create New</TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-4 mt-4">
                    {routines?.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Save className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No Templates Yet</h3>
                                <p className="text-muted-foreground max-w-sm mb-4">
                                    Create templates for your daily routines, workout plans, or study schedules.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {routines?.map((routine) => (
                                <Card key={routine.id} className="relative group">
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>{routine.name}</span>
                                            <Badge variant="outline">{routine.tasks.length} tasks</Badge>
                                        </CardTitle>
                                        <CardDescription>
                                            Created {new Date(parseInt(routine.id.split("-")[1])).toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-[100px] mb-4">
                                            <ul className="space-y-2 text-sm">
                                                {routine.tasks.map((task, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        {task.title}
                                                    </li>
                                                ))}
                                            </ul>
                                        </ScrollArea>
                                        <div className="flex gap-2">
                                            <Button
                                                className="flex-1 gap-2"
                                                onClick={() => handleApplyRoutine(routine.id)}
                                            >
                                                <Play className="w-4 h-4" />
                                                Apply Routine
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleDeleteRoutine(routine.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="create" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create from Current Tasks</CardTitle>
                            <CardDescription>
                                Select tasks from your current list to save as a template.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Routine Name</Label>
                                <Input
                                    placeholder="e.g., Morning Routine, Leg Day, Study Session"
                                    value={newRoutineName}
                                    onChange={(e) => setNewRoutineName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Select Tasks</Label>
                                <ScrollArea className="h-[300px] border rounded-md p-4">
                                    {tasks.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">
                                            No tasks available. Add tasks to your day first.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {tasks.map((task) => (
                                                <div
                                                    key={task.id}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedTasks.includes(task.id)
                                                            ? "bg-primary/10 border-primary"
                                                            : "hover:bg-accent"
                                                        }`}
                                                    onClick={() => toggleTaskSelection(task.id)}
                                                >
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedTasks.includes(task.id) ? "bg-primary border-primary" : "border-muted-foreground"
                                                        }`}>
                                                        {selectedTasks.includes(task.id) && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium">{task.title}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Badge variant="secondary" className="text-[10px] h-5">
                                                                {task.category}
                                                            </Badge>
                                                            {task.startTime && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {task.startTime}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>

                            <Button
                                className="w-full gap-2"
                                onClick={handleSaveRoutine}
                                disabled={!newRoutineName || selectedTasks.length === 0}
                            >
                                <Save className="w-4 h-4" />
                                Save Template
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
