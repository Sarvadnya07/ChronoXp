/**
 * Knowledge Graph Engine
 * Builds and maintains a personal knowledge graph from user activities
 * Detects patterns, clusters, and suggests learning paths
 */

import {
    KnowledgeGraph,
    GraphNode,
    GraphEdge,
    GraphCluster,
    LearningPath,
    Task,
    JournalEntry
} from "@/lib/types"
import { GeminiService } from "./geminiService"

export const KnowledgeGraphEngine = {
    /**
     * Build a comprehensive knowledge graph from user data
     */
    async buildKnowledgeGraph(
        userId: string,
        tasks: Task[],
        journals: JournalEntry[],
        existingGraph?: KnowledgeGraph
    ): Promise<KnowledgeGraph> {
        const nodes: GraphNode[] = existingGraph?.nodes || []
        const edges: GraphEdge[] = existingGraph?.edges || []

        // Extract nodes from tasks (habits, skills, projects)
        tasks.forEach(task => {
            this.addNodeFromTask(task, nodes)
        })

        // Extract nodes from journal (interests, topics)
        for (const journal of journals) {
            await this.addNodesFromJournal(journal, nodes)
        }

        // Create edges based on co-occurrence and relationships
        this.createEdges(nodes, edges, tasks)

        // Update strengths based on recency and frequency
        this.updateNodeStrengths(nodes, tasks)

        return {
            userId,
            nodes,
            edges,
            lastUpdated: Date.now(),
            version: (existingGraph?.version || 0) + 1
        }
    },

    /**
     * Add or update node from task
     */
    addNodeFromTask(task: Task, nodes: GraphNode[]): void {
        // Create node for category
        const categoryNodeId = `category-${task.category}`
        let categoryNode = nodes.find(n => n.id === categoryNodeId)

        if (!categoryNode) {
            categoryNode = {
                id: categoryNodeId,
                type: "skill",
                label: task.category,
                strength: 10,
                category: task.category,
                metadata: { source: "task" },
                createdAt: Date.now(),
                lastUpdated: Date.now()
            }
            nodes.push(categoryNode)
        } else {
            categoryNode.strength = Math.min(100, categoryNode.strength + 2)
            categoryNode.lastUpdated = Date.now()
        }

        // If task is recurring, create habit node
        if (task.repeatRule !== "none") {
            const habitNodeId = `habit-${task.id}`
            let habitNode = nodes.find(n => n.id === habitNodeId)

            if (!habitNode) {
                habitNode = {
                    id: habitNodeId,
                    type: "habit",
                    label: task.title,
                    strength: 15,
                    category: task.category,
                    metadata: {
                        taskId: task.id,
                        duration: task.duration,
                        xp: task.xp
                    },
                    createdAt: Date.now(),
                    lastUpdated: Date.now()
                }
                nodes.push(habitNode)
            } else {
                habitNode.strength = Math.min(100, habitNode.strength + 5)
                habitNode.lastUpdated = Date.now()
            }
        }
    },

    /**
     * Extract topics from journal using AI
     */
    async addNodesFromJournal(journal: JournalEntry, nodes: GraphNode[]): Promise<void> {
        // Use existing tags
        journal.tags.forEach(tag => {
            const nodeId = `topic-${tag.toLowerCase()}`
            let node = nodes.find(n => n.id === nodeId)

            if (!node) {
                node = {
                    id: nodeId,
                    type: "topic",
                    label: tag,
                    strength: 8,
                    metadata: { source: "journal" },
                    createdAt: Date.now(),
                    lastUpdated: Date.now()
                }
                nodes.push(node)
            } else {
                node.strength = Math.min(100, node.strength + 3)
                node.lastUpdated = Date.now()
            }
        })

        // Extract additional keywords from text (simple approach)
        const keywords = this.extractKeywords(journal.text)
        keywords.forEach(keyword => {
            const nodeId = `interest-${keyword.toLowerCase()}`
            if (!nodes.find(n => n.id === nodeId)) {
                nodes.push({
                    id: nodeId,
                    type: "interest",
                    label: keyword,
                    strength: 5,
                    metadata: { source: "journal-ai" },
                    createdAt: Date.now(),
                    lastUpdated: Date.now()
                })
            }
        })
    },

    /**
     * Simple keyword extraction (can be enhanced with NLP)
     */
    extractKeywords(text: string): string[] {
        const commonWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by'])
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 4 && !commonWords.has(w))

        // Get top 5 most frequent words
        const freq: Map<string, number> = new Map()
        words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1))

        return Array.from(freq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word)
    },

    /**
     * Create edges between related nodes
     */
    createEdges(nodes: GraphNode[], edges: GraphEdge[], tasks: Task[]): void {
        // Create edges between habits and their categories
        nodes.forEach(node => {
            if (node.type === "habit" && node.category) {
                const categoryNode = nodes.find(n =>
                    n.type === "skill" && n.label === node.category
                )

                if (categoryNode) {
                    const edgeId = `${node.id}->${categoryNode.id}`
                    if (!edges.find(e => e.id === edgeId)) {
                        edges.push({
                            id: edgeId,
                            from: node.id,
                            to: categoryNode.id,
                            type: "related",
                            weight: 50,
                            createdAt: Date.now()
                        })
                    }
                }
            }
        })

        // Create edges between topics that appear together in journals
        // (Simplified - could be enhanced with co-occurrence analysis)
    },

    /**
     * Update node strengths based on recency and activity
     */
    updateNodeStrengths(nodes: GraphNode[], tasks: Task[]): void {
        const now = Date.now()
        const dayMs = 24 * 60 * 60 * 1000

        nodes.forEach(node => {
            const daysSinceUpdate = (now - node.lastUpdated) / dayMs

            // Decay strength over time (lose 1 point per week of inactivity)
            const decay = Math.floor(daysSinceUpdate / 7)
            node.strength = Math.max(0, node.strength - decay)
        })
    },

    /**
     * Detect clusters of related nodes
     */
    detectClusters(graph: KnowledgeGraph): GraphCluster[] {
        const clusters: GraphCluster[] = []

        // Group nodes by category
        const categoryGroups = new Map<string, string[]>()
        graph.nodes.forEach(node => {
            if (node.category) {
                if (!categoryGroups.has(node.category)) {
                    categoryGroups.set(node.category, [])
                }
                categoryGroups.get(node.category)!.push(node.id)
            }
        })

        // Create clusters from categories with high activity
        categoryGroups.forEach((nodeIds, category) => {
            const nodes = graph.nodes.filter(n => nodeIds.includes(n.id))
            const avgStrength = nodes.reduce((sum, n) => sum + n.strength, 0) / nodes.length

            if (avgStrength > 20) { // Only significant clusters
                clusters.push({
                    id: `cluster-${category}`,
                    nodes: nodeIds,
                    label: category,
                    intensity: Math.round(avgStrength)
                })
            }
        })

        return clusters.sort((a, b) => b.intensity - a.intensity)
    },

    /**
     * Suggest knowledge paths using AI
     */
    async suggestKnowledgePaths(graph: KnowledgeGraph): Promise<LearningPath[]> {
        const clusters = this.detectClusters(graph)

        if (clusters.length === 0) {
            return []
        }

        // Build prompt for AI
        const prompt = `
You are a learning path advisor. Based on the user's knowledge graph, suggest learning paths.

**Current Clusters** (areas of focus):
${clusters.map(c => `- ${c.label}: ${c.intensity}% intensity (${c.nodes.length} items)`).join('\n')}

**All Skills/Topics**:
${graph.nodes.filter(n => n.type === 'skill' || n.type === 'topic').map(n => `- ${n.label} (strength: ${n.strength})`).join('\n')}

Suggest 2-3 learning paths that:
1. Build on existing strengths
2. Fill knowledge gaps
3. Create synergies between different areas

Return ONLY JSON array (no markdown):
[
  {
    "name": "Path name",
    "description": "Description",
    "topics": ["topic1", "topic2", ...],
    "estimatedHours": 20,
    "difficulty": "beginner" | "intermediate" | "advanced"
  }
]
`

        try {
            const response = await GeminiService.askGemini(prompt)
            const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim()
            const paths = JSON.parse(cleaned)

            return paths.map((p: any, i: number) => ({
                id: `path-${Date.now()}-${i}`,
                name: p.name,
                description: p.description,
                nodes: p.topics.map((t: string) => `topic-${t.toLowerCase()}`),
                estimatedDuration: p.estimatedHours,
                difficulty: p.difficulty
            }))
        } catch (error) {
            console.error("Failed to generate learning paths:", error)
            return []
        }
    },

    /**
     * Detect missing links (topics that should be connected but aren't)
     */
    detectMissingLinks(graph: KnowledgeGraph): { from: string; to: string; reason: string }[] {
        const suggestions: { from: string; to: string; reason: string }[] = []

        // Find high-strength nodes in different categories that might be related
        const strongNodes = graph.nodes.filter(n => n.strength > 50)

        strongNodes.forEach(node1 => {
            strongNodes.forEach(node2 => {
                if (node1.id !== node2.id) {
                    // Check if edge exists
                    const edgeExists = graph.edges.some(e =>
                        (e.from === node1.id && e.to === node2.id) ||
                        (e.from === node2.id && e.to === node1.id)
                    )

                    if (!edgeExists && node1.category !== node2.category) {
                        suggestions.push({
                            from: node1.id,
                            to: node2.id,
                            reason: `${node1.label} and ${node2.label} are both strong areas - consider exploring connections`
                        })
                    }
                }
            })
        })

        return suggestions.slice(0, 5) // Top 5 suggestions
    }
}
