import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { projectFormSchema, type ProjectFormSchema } from "@/schema/projectFormSchema"
import { useCreateProject, useUpdateProject } from "@/hooks/useProject"
import { messageFromAxiosError } from "@/lib/barnickApiError"
import type { Project } from "@/interface/projectInterface"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Project | null
}

const ProjectMutateDialog = ({ open, onOpenChange, currentRow }: Props) => {
  const isUpdate = !!currentRow?.id
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()

  const form = useForm<ProjectFormSchema>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: { name: "", description: "" },
  })

  useEffect(() => {
    if (open && isUpdate && currentRow) {
      form.reset({
        name: currentRow.name,
        description: currentRow.description ?? "",
      })
    } else if (!open) {
      form.reset({ name: "", description: "" })
    }
  }, [open, isUpdate, currentRow, form])

  const onSubmit = (data: ProjectFormSchema) => {
    const payload = {
      name: data.name,
      description: data.description || null,
    }

    if (isUpdate && currentRow?.id) {
      updateMutation.mutate(
        { id: currentRow.id, data: payload },
        {
          onSuccess: () => {
            onOpenChange(false)
            toast.success("Project updated successfully.")
          },
          onError: (err: unknown) => {
            toast.error(messageFromAxiosError(err as AxiosError))
          },
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false)
          toast.success("Project created successfully.")
        },
        onError: (err: unknown) => {
          toast.error(messageFromAxiosError(err as AxiosError))
        },
      })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isUpdate ? "Edit Project" : "New Project"}</DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Update the project details below."
              : "Enter the details for the new project."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="project-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Bridge Construction" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Optional project description..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button form="project-form" type="submit" disabled={isPending}>
            {isUpdate ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ProjectMutateDialog
