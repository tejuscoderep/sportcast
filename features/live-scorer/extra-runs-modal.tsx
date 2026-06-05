"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Minus, Plus, X } from "lucide-react"
import { useState } from "react"

interface ExtraRunsModalProps {
  type: string
  onConfirm: (type: string, runs: number) => void
  onCancel: () => void
}

export function ExtraRunsModal({ type, onConfirm, onCancel }: ExtraRunsModalProps) {
  const isWideOrNoBall = type === "wide" || type === "noBall"
  const defaultRuns = isWideOrNoBall ? 0 : 1
  const [runs, setRuns] = useState(defaultRuns)

  const label = type === "wide"
    ? "Wide runs"
    : type === "noBall"
    ? "No Ball runs"
    : type === "byes"
    ? "Byes runs"
    : "Leg Byes runs"

  const increment = () => setRuns((r) => Math.min(r + 1, 6))
  const decrement = () => setRuns((r) => Math.max(r - 1, isWideOrNoBall ? 0 : 1))

  return (
    <Card className="bg-card/80 border-emerald-500/30">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-emerald-400">{label}</p>
          <Button variant="ghost" size="xs" onClick={onCancel} className="text-muted-foreground">
            <X className="w-3 h-3" />
          </Button>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={decrement} className="h-8 w-8 p-0">
            <Minus className="w-4 h-4" />
          </Button>
          <span className="text-2xl font-bold tabular-nums text-foreground min-w-[2rem] text-center">{runs}</span>
          <Button variant="outline" size="sm" onClick={increment} className="h-8 w-8 p-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
          onClick={() => onConfirm(type, runs)}
        >
          Confirm
        </Button>
      </CardContent>
    </Card>
  )
}
