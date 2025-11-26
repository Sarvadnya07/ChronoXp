"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Repeat, AlertCircle } from "lucide-react"
import type { Task } from "@/lib/types"
import { TaskEditor } from "./task-editor"

export default function TasksView() {
  const { tasks, addTask, deleteTask, updateTask } = useAppStore()
  const [open, setOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const handleSave = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData)
      setEditingTask(null)
    } else {
      await addTask(taskData as any)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setOpen(true)
  }

  const handleAddNew = () => {
    setEditingTask(null)
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Task Manager</h2>
          <p className="text-sm text-muted-foreground">Create and manage your daily tasks</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      <TaskEditor
        open={open}
        onOpenChange={setOpen}
        task={editingTask}
        onSave={handleSave}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className={`hover:border-primary/50 transition-colors ${task.isCritical ? 'border-destructive/30 bg-destructive/5' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-start justify-between gap-2">
                <span className="text-balance line-clamp-1">{task.title}</span>
                <Badge variant="outline">{task.category}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {task.priority === 'high' && (
                  <Badge variant="destructive" className="text-[10px] h-5">High Priority</Badge>
                )}
                {task.repeatRule !== 'none' && (
                  <Badge variant="secondary" className="text-[10px] h-5 gap-1">
                    <Repeat className="w-3 h-3" />
                    {task.repeatRule}
                  </Badge>
                )}
                {task.isCore && (
                  <Badge variant="default" className="text-[10px] h-5">Core</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Duration</span>
                  <span className="font-medium">{task.duration} min</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Scheduled</span>
                  <span className="font-medium">{task.scheduledTime || "Anytime"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">XP Reward</span>
                  <span className="font-medium text-primary">+{task.xp} XP</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Difficulty</span>
                  <span className="font-medium capitalize">{task.difficulty}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2 bg-transparent"
                  onClick={() => handleEdit(task)}
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" className="gap-2" onClick={() => deleteTask(task.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No tasks yet. Create your first task to get started!</p>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Your First Task
          </Button>
        </Card>
      )}
    </div>
  )
}
