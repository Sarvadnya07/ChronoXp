import { Spinner } from "@/components/ui/spinner"

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Spinner className="w-12 h-12 text-primary mx-auto" />
        <h2 className="text-2xl font-bold glow-text">ChronoXP</h2>
        <p className="text-muted-foreground">Loading your productivity data...</p>
      </div>
    </div>
  )
}
