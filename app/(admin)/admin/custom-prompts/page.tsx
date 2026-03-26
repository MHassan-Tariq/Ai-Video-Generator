"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { getCollection, addDocument, updateDocument, deleteDocument } from "@/lib/firestore"
import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { StatusBadge } from "@/components/StatusBadge"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { ColumnDef } from "@tanstack/react-table"
import { Plus, Edit, Trash2, MessageSquare, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface CustomPrompt {
  id: string
  title: string
  prompt_text: string
  category: string
  order: number
  is_active: boolean
}

export default function CustomPromptsPage() {
  const [data, setData] = useState<CustomPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CustomPrompt | null>(null)
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<CustomPrompt | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    prompt_text: "",
    category: "",
    order: 1,
    is_active: true
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const items = await getCollection("custom_prompts")
      setData(items as CustomPrompt[])
    } catch (error) {
      console.error("Failed to load records", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenDialog = (item?: CustomPrompt) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        title: item.title || "",
        prompt_text: item.prompt_text || "",
        category: item.category || "",
        order: item.order || 1,
        is_active: item.is_active ?? true
      })
    } else {
      setEditingItem(null)
      const nextOrder = data.length > 0 ? Math.max(...data.map(d => Number(d.order) || 0)) + 1 : 1
      setFormData({ 
        title: "", 
        prompt_text: "", 
        category: "",
        order: nextOrder, 
        is_active: true 
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      if (editingItem) {
        await updateDocument("custom_prompts", editingItem.id, formData)
      } else {
        await addDocument("custom_prompts", formData)
      }
      await loadData()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving record:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (item: CustomPrompt) => {
    setDeletingItem(item)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    
    try {
      setIsDeleting(true)
      await deleteDocument("custom_prompts", deletingItem.id)
      await loadData()
      setIsConfirmOpen(false)
    } catch (error) {
      console.error("Error deleting record:", error)
    } finally {
      setIsDeleting(false)
      setDeletingItem(null)
    }
  }

  const columns: ColumnDef<CustomPrompt>[] = [
    {
      accessorKey: "title",
      header: "Prompt Title",
    },
    {
      accessorKey: "prompt_text",
      header: "Prompt Text",
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate text-muted-foreground italic">
          "{row.original.prompt_text}"
        </div>
      )
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <span className="px-2 py-1 rounded bg-secondary/50 text-xs font-medium">{row.original.category || "General"}</span>
    },
    {
      accessorKey: "order",
      header: "Order",
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => <StatusBadge active={row.original.is_active} />
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(row.original)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(row.original)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Custom Prompts</h2>
          <p className="text-muted-foreground">Manage reusable AI prompts for decoration generation.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="font-semibold shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Add Prompt
        </Button>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
         {loading ? (
             <div className="text-center p-8 text-muted-foreground">Loading prompts...</div>
         ) : (
             <DataTable columns={columns} data={data} searchKey="title" />
         )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Prompt" : "Add Prompt"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, title: e.target.value})} 
                required 
                placeholder="e.g. Modern Living Room Transformation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input 
                id="category" 
                value={formData.category} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, category: e.target.value})} 
                placeholder="e.g. Living Room, Bedroom, Global"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt_text">Prompt Text</Label>
              <Textarea 
                id="prompt_text" 
                value={formData.prompt_text} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, prompt_text: e.target.value})} 
                required 
                placeholder="Describe the transformation in detail..."
                className="min-h-[150px] leading-relaxed"
              />
              <p className="text-xs text-muted-foreground italic">Use descriptive language for better AI results.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Sort Order</Label>
              <Input 
                id="order" 
                type="number"
                value={formData.order} 
                onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 1})}
                required
              />
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Switch 
                id="active" 
                checked={formData.is_active} 
                onCheckedChange={c => setFormData({...formData, is_active: c})} 
              />
              <Label htmlFor="active">Active</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !formData.prompt_text}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Prompt"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={isConfirmOpen}
        onOpenChange={(open) => !isDeleting && setIsConfirmOpen(open)}
        title="Delete Prompt"
        description="Are you sure you want to delete this prompt? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
