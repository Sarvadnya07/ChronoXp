"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ReactFlow, {
    Node,
    Edge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { KnowledgeGraphEngine } from "@/services/knowledgeGraphEngine"
import { KnowledgeGraph, GraphCluster, LearningPath } from "@/lib/types"
import { Brain, Sparkles, Target, Zap } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/db"

// Node colors by type
const nodeColors = {
    habit: '#10b981',
    goal: '#3b82f6',
    task: '#f59e0b',
    project: '#8b5cf6',
    skill: '#ec4899',
    interest: '#06b6d4',
    topic: '#6366f1'
}

export default function KnowledgePage() {
    const { user } = useAuth()
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [graph, setGraph] = useState<KnowledgeGraph | null>(null)
    const [clusters, setClusters] = useState<GraphCluster[]>([])
    const [paths, setPaths] = useState<LearningPath[]>([])
    const [isBuilding, setIsBuilding] = useState(false)

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    )

    const buildGraph = async () => {
        if (!user) return
        setIsBuilding(true)

        try {
            const tasks = await db.getAll("tasks")
            const journals = await db.getAll("journals")

            const newGraph = await KnowledgeGraphEngine.buildKnowledgeGraph(
                user.uid,
                tasks,
                journals || []
            )

            setGraph(newGraph)

            // Convert graph nodes to ReactFlow format
            const flowNodes: Node[] = newGraph.nodes.map((node, i) => ({
                id: node.id,
                type: 'default',
                position: {
                    x: Math.random() * 800,
                    y: Math.random() * 600
                },
                data: {
                    label: (
                        <div className="p-2">
                            <div className="font-medium text-xs">{node.label}</div>
                            <div className="text-xs text-muted-foreground">{node.type}</div>
                        </div>
                    )
                },
                style: {
                    background: nodeColors[node.type],
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    padding: '8px',
                    width: 'auto'
                }
            }))

            const flowEdges: Edge[] = newGraph.edges.map(edge => ({
                id: edge.id,
                source: edge.from,
                target: edge.to,
                type: 'smoothstep',
                animated: edge.weight > 70,
                style: {
                    stroke: edge.weight > 70 ? '#8b5cf6' : '#94a3b8',
                    strokeWidth: 2
                }
            }))

            setNodes(flowNodes)
            setEdges(flowEdges)

            // Detect clusters
            const detectedClusters = KnowledgeGraphEngine.detectClusters(newGraph)
            setClusters(detectedClusters)

            // Generate learning paths
            const learningPaths = await KnowledgeGraphEngine.suggestKnowledgePaths(newGraph)
            setPaths(learningPaths)

        } catch (error) {
            console.error("Failed to build knowledge graph:", error)
        } finally {
            setIsBuilding(false)
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">🕸️ Knowledge Graph</h1>
                    <p className="text-muted-foreground">
                        Visual map of your habits, skills, and learning journey
                    </p>
                </div>
                <Button onClick={buildGraph} disabled={isBuilding}>
                    {isBuilding ? "Building..." : "Update Graph"}
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Graph Visualization */}
                <div className="lg:col-span-2">
                    <Card className="h-[600px]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5" />
                                Your Knowledge Network
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[500px]">
                            {nodes.length > 0 ? (
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    onConnect={onConnect}
                                    fitView
                                >
                                    <Background />
                                    <Controls />
                                    <MiniMap
                                        nodeColor={(node) => {
                                            const nodeType = graph?.nodes.find(n => n.id === node.id)?.type
                                            return nodeType ? nodeColors[nodeType] : '#94a3b8'
                                        }}
                                    />
                                </ReactFlow>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Click "Update Graph" to visualize your knowledge network</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Legend */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Node Types</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {Object.entries(nodeColors).map(([type, color]) => (
                                <div key={type} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ background: color }}
                                    />
                                    <span className="text-sm capitalize">{type}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Clusters */}
                    {clusters.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    Focus Clusters
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {clusters.map((cluster) => (
                                    <div
                                        key={cluster.id}
                                        className="p-2 rounded bg-primary/5 border"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm">{cluster.label}</span>
                                            <Badge variant="secondary">{cluster.intensity}%</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {cluster.nodes.length} connected items
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Learning Paths */}
                    {paths.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Target className="h-4 w-4" />
                                    Suggested Paths
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {paths.map((path) => (
                                    <div
                                        key={path.id}
                                        className="p-3 rounded border bg-card"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-sm">{path.name}</span>
                                            <Badge variant="outline">{path.difficulty}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            {path.description}
                                        </p>
                                        <div className="text-xs text-muted-foreground">
                                            ⏱️ {path.estimatedDuration}h · {path.nodes.length} topics
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Stats */}
            {graph && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{graph.nodes.length}</p>
                                <p className="text-sm text-muted-foreground">Total Nodes</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{graph.edges.length}</p>
                                <p className="text-sm text-muted-foreground">Connections</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{clusters.length}</p>
                                <p className="text-sm text-muted-foreground">Clusters</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{paths.length}</p>
                                <p className="text-sm text-muted-foreground">Paths</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
