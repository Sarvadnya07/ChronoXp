import { db } from "@/lib/db"
import { Memory, MemoryType } from "@/lib/types"

export const MemoryEngine = {
    async addMemory(type: MemoryType, key: string, value: any, strength: number = 0.5): Promise<void> {
        const memory: Memory = {
            id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            key,
            value,
            strength,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }
        await db.put("memory", memory)
    },

    async getMemories(type?: MemoryType): Promise<Memory[]> {
        const allMemories = await db.getAll("memory")
        if (type) {
            return allMemories.filter((m: Memory) => m.type === type)
        }
        return allMemories
    },

    async updateMemoryStrength(id: string, delta: number): Promise<void> {
        const memory = await db.get("memory", id)
        if (memory) {
            const newStrength = Math.min(1, Math.max(0, memory.strength + delta))
            await db.put("memory", { ...memory, strength: newStrength, updatedAt: Date.now() })
        }
    },

    async consolidateMemories(): Promise<void> {
        // Logic to decay weak memories or merge similar ones could go here
        // For now, just a stub
        const memories = await db.getAll("memory")
        for (const mem of memories) {
            if (mem.strength < 0.1) {
                // Forget weak memories
                await db.delete("memory", mem.id)
            }
        }
    }
}
