import z from "zod"

export const projectFormSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().nullable().optional(),
})

export type ProjectFormSchema = z.output<typeof projectFormSchema>
