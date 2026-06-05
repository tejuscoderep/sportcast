"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import type { ScoringState, WicketType } from "@/types"
import { getDisplayName } from "@/services/cricket-scoring-engine"
import { X } from "lucide-react"
import { useState } from "react"

interface WicketModalProps {
  scoringState: ScoringState
  playerNames: Record<string, string>
  onConfirm: (wicketType: WicketType, fielder: string | null, newBatterName: string | null) => void
  onCancel: () => void
  onUpdatePlayerName: (playerId: string, name: string) => void
}

const WICKET_TYPES: { value: WicketType; label: string }[] = [
  { value: "bowled", label: "Bowled" },
  { value: "caught", label: "Caught" },
  { value: "runOut", label: "Run Out" },
  { value: "stumped", label: "Stumped" },
  { value: "other", label: "Other" },
]

const WICKET_TYPES_NEED_FIELDER: WicketType[] = ["caught", "runOut", "stumped"]

export function WicketModal({ scoringState, playerNames, onConfirm, onCancel, onUpdatePlayerName }: WicketModalProps) {
  const [wicketType, setWicketType] = useState<WicketType | null>(null)
  const [fielder, setFielder] = useState<string | null>(null)
  const [newBatter, setNewBatter] = useState<string | null>(null)
  const [fielderNameInput, setFielderNameInput] = useState("")
  const [batterNameInput, setBatterNameInput] = useState("")

  const needsFielder = wicketType && WICKET_TYPES_NEED_FIELDER.includes(wicketType)
  const isBowled = wicketType === "bowled"
  const isOther = wicketType === "other"

  // Available fielders from bowling team (for caught/stumped) or batting team (for run out)
  const fielderPlayers = wicketType === "runOut"
    ? scoringState.batters.filter((b) => !b.isOut && b.name !== scoringState.striker).map((b) => b.name)
    : scoringState.bowlers.map((b) => b.name)

  // Available new batters (not out, not already at crease)
  const availableBatters = scoringState.batters
    .filter((b) => !b.isOut && b.name !== scoringState.striker && b.name !== scoringState.runner)
    .map((b) => b.name)

  const handleFielderNameUpdate = () => {
    if (fielder && fielderNameInput.trim()) {
      onUpdatePlayerName(fielder, fielderNameInput.trim())
    }
  }

  const handleBatterNameUpdate = () => {
    if (newBatter && batterNameInput.trim()) {
      onUpdatePlayerName(newBatter, batterNameInput.trim())
    }
  }

  const handleConfirm = () => {
    if (!wicketType) return
    if (needsFielder && !fielder) return
    if (!isBowled && !isOther && !fielder) return
    onConfirm(wicketType, fielder, newBatter)
  }

  const canConfirm = wicketType && (!needsFielder || fielder)

  return (
    <Card className="bg-card/80 border-red-500/30">
      <CardContent className="p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-red-400">Wicket Type</p>
          <Button variant="ghost" size="xs" onClick={onCancel} className="text-muted-foreground">
            <X className="w-3 h-3" />
          </Button>
        </div>

        {/* Wicket type buttons */}
        <div className="grid grid-cols-3 gap-1.5">
          {WICKET_TYPES.map((wt) => (
            <Button
              key={wt.value}
              variant={wicketType === wt.value ? "default" : "outline"}
              size="sm"
              className={`text-xs h-8 ${wicketType === wt.value ? "bg-red-600 text-white hover:bg-red-700" : ""}`}
              onClick={() => { setWicketType(wt.value); setFielder(null) }}
            >
              {wt.label}
            </Button>
          ))}
        </div>

        {/* Fielder selection for caught/runOut/stumped */}
        {needsFielder && (
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">
              {wicketType === "runOut" ? "Run out player" : wicketType === "caught" ? "Caught by" : "Stumped by"}
            </label>
            <Select value={fielder ?? ""} onValueChange={setFielder}>
              <SelectTrigger className="w-full text-xs h-7">
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                {fielderPlayers.map((name) => (
                  <SelectItem key={name} value={name}>{getDisplayName(name, playerNames)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fielder && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{fielder}</span>
                <Input
                  className="h-6 text-xs flex-1"
                  placeholder="Player name"
                  value={fielderNameInput}
                  onChange={(e) => setFielderNameInput(e.target.value)}
                  onBlur={handleFielderNameUpdate}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleFielderNameUpdate() } }}
                />
              </div>
            )}
          </div>
        )}

        {/* Next batter selection */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Next Batter</label>
          <Select value={newBatter ?? ""} onValueChange={setNewBatter}>
            <SelectTrigger className="w-full text-xs h-7">
              <SelectValue placeholder="Select next batter" />
            </SelectTrigger>
            <SelectContent>
              {availableBatters.map((name) => (
                <SelectItem key={name} value={name}>{getDisplayName(name, playerNames)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {newBatter && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground whitespace-nowrap">{newBatter}</span>
              <Input
                className="h-6 text-xs flex-1"
                placeholder="Player name"
                value={batterNameInput}
                onChange={(e) => setBatterNameInput(e.target.value)}
                onBlur={handleBatterNameUpdate}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleBatterNameUpdate() } }}
              />
            </div>
          )}
        </div>

        {/* Update button */}
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white text-xs"
          disabled={!canConfirm}
          onClick={handleConfirm}
        >
          Update
        </Button>
      </CardContent>
    </Card>
  )
}
