"use client"

import { type ReactNode, useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { matchSetupSchema, type MatchSetupFormValues } from "@/lib/schemas/matchSetupSchema"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { PlayerEntry } from "./player-entry"
import { useDirectorStore } from "@/store"
import type { MatchSetupData } from "@/types"

function generateDefaultPlayers(prefix: string): string[] {
  return Array.from({ length: 11 }, (_, i) => `${prefix}P${String(i + 1).padStart(2, "0")}`)
}

interface MatchSetupModalProps {
  children: ReactNode
}

export function MatchSetupModal({ children }: MatchSetupModalProps) {
  const [open, setOpen] = useState(false)
  const matchSetup = useDirectorStore((s) => s.matchSetup)
  const saveSetup = useDirectorStore((s) => s.saveMatchSetupData)

  const defaultPlayersA = generateDefaultPlayers("TA")
  const defaultPlayersB = generateDefaultPlayers("TB")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MatchSetupFormValues>({
    resolver: zodResolver(matchSetupSchema),
    defaultValues: {
      venue: "",
      teamA: "",
      teamB: "",
      playersA: defaultPlayersA,
      playersB: defaultPlayersB,
      overs: 20,
      tossWinner: "",
      battingFirst: "",
    },
  })

  useEffect(() => {
    if (open && matchSetup) {
      reset({
        venue: matchSetup.venue,
        teamA: matchSetup.teamA,
        teamB: matchSetup.teamB,
        playersA: matchSetup.playersA,
        playersB: matchSetup.playersB,
        overs: matchSetup.overs,
        tossWinner: matchSetup.tossWinner,
        battingFirst: matchSetup.battingFirst,
      })
    } else if (open) {
      reset({
        venue: "",
        teamA: "",
        teamB: "",
        playersA: defaultPlayersA,
        playersB: defaultPlayersB,
        overs: 20,
        tossWinner: "",
        battingFirst: "",
      })
    }
  }, [open, matchSetup, reset])

  const playersA = watch("playersA")
  const playersB = watch("playersB")
  const tossWinner = watch("tossWinner")
  const battingFirst = watch("battingFirst")
  const teamAName = watch("teamA")
  const teamBName = watch("teamB")

  const onSubmit = (values: MatchSetupFormValues) => {
    const data: MatchSetupData = {
      venue: values.venue,
      teamA: values.teamA,
      teamB: values.teamB,
      playersA: values.playersA,
      playersB: values.playersB,
      overs: values.overs,
      tossWinner: values.tossWinner,
      battingFirst: values.battingFirst,
      playerNames: matchSetup?.playerNames ?? {},
    }
    saveSetup(data)
    setOpen(false)
  }

  const tossOptions = [
    { value: "Team A", label: teamAName || "Team A" },
    { value: "Team B", label: teamBName || "Team B" },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Live Scorer Setup</DialogTitle>
          <DialogDescription>
            Configure the match details before scoring begins.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Venue */}
          <div className="space-y-1.5">
            <label htmlFor="match-venue" className="text-sm font-medium text-foreground">Venue</label>
            <Input id="match-venue" placeholder="e.g. Allan Border Field" {...register("venue")} />
            {errors.venue && <p className="text-xs text-destructive" role="alert">{errors.venue.message}</p>}
          </div>

          {/* Team A Name */}
          <div className="space-y-1.5">
            <label htmlFor="team-a-name" className="text-sm font-medium text-foreground">Team A Name</label>
            <Input id="team-a-name" placeholder="e.g. Brisbane Tigers" {...register("teamA")} />
            {errors.teamA && <p className="text-xs text-destructive" role="alert">{errors.teamA.message}</p>}
          </div>

          {/* Team B Name */}
          <div className="space-y-1.5">
            <label htmlFor="team-b-name" className="text-sm font-medium text-foreground">Team B Name</label>
            <Input id="team-b-name" placeholder="e.g. Gold Coast Sharks" {...register("teamB")} />
            {errors.teamB && <p className="text-xs text-destructive" role="alert">{errors.teamB.message}</p>}
          </div>

          {/* Innings Overs */}
          <div className="space-y-1.5">
            <label htmlFor="innings-overs" className="text-sm font-medium text-foreground">Innings Overs</label>
            <Input id="innings-overs" type="number" min={1} max={50} {...register("overs", { valueAsNumber: true })} />
            {errors.overs && <p className="text-xs text-destructive" role="alert">{errors.overs.message}</p>}
          </div>

          {/* Toss Won By */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Toss Won By</label>
            <Select
              value={tossWinner}
              onValueChange={(val) => setValue("tossWinner", val as "Team A" | "Team B" | "", { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {tossOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Batting First */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Batting First</label>
            <Select
              value={battingFirst}
              onValueChange={(val) => setValue("battingFirst", val as "Team A" | "Team B" | "", { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {tossOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team A Players (at end) */}
          <PlayerEntry
            label="Team A Players"
            players={playersA}
            onChange={(p) => setValue("playersA", p, { shouldValidate: true })}
            maxPlayers={11}
            error={errors.playersA?.message}
          />

          {/* Team B Players (at end) */}
          <PlayerEntry
            label="Team B Players"
            players={playersB}
            onChange={(p) => setValue("playersB", p, { shouldValidate: true })}
            maxPlayers={11}
            error={errors.playersB?.message}
          />

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
