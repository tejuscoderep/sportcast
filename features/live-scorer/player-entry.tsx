"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus } from "lucide-react"

interface PlayerEntryProps {
  players: string[]
  onChange: (players: string[]) => void
  maxPlayers: number
  disabled?: boolean
  label: string
  error?: string
}

export function PlayerEntry({ players, onChange, maxPlayers, disabled, label, error }: PlayerEntryProps) {
  const [newPlayer, setNewPlayer] = useState("")

  const addPlayer = () => {
    const name = newPlayer.trim()
    if (!name || players.length >= maxPlayers || players.includes(name)) return
    onChange([...players, name])
    setNewPlayer("")
  }

  const removePlayer = (name: string) => {
    onChange(players.filter((p) => p !== name))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addPlayer()
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>

      {/* Player capsules */}
      <div className="flex flex-wrap gap-1.5">
        {players.map((player) => (
          <span
            key={player}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-sm text-foreground"
          >
            {player}
            {!disabled && (
              <button
                type="button"
                onClick={() => removePlayer(player)}
                className="ml-0.5 text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${player}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Add player input */}
      {players.length < maxPlayers && !disabled && (
        <div className="flex gap-1.5">
          <Input
            placeholder={`Add player (${players.length}/${maxPlayers})`}
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-7 text-xs flex-1"
          />
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={addPlayer}
            disabled={!newPlayer.trim()}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
    </div>
  )
}
