import { z } from "zod"

export const matchSetupSchema = z.object({
  venue: z.string({ error: "Venue is required" }).min(1, "Venue is required"),
  teamA: z.string({ error: "Team A name is required" }).min(1, "Team A name is required"),
  teamB: z.string({ error: "Team B name is required" }).min(1, "Team B name is required"),
  playersA: z.array(z.string().min(1)).min(11, "11 players required for Team A"),
  playersB: z.array(z.string().min(1)).min(11, "11 players required for Team B"),
  overs: z.number({ error: "Overs is required" }).min(1, "Minimum 1 over").max(50, "Maximum 50 overs"),
  tossWinner: z.enum(["Team A", "Team B", ""]),
  battingFirst: z.enum(["Team A", "Team B", ""]),
  playerNames: z.record(z.string(), z.string()).optional(),
})

export type MatchSetupFormValues = z.infer<typeof matchSetupSchema>
