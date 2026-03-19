"use client"

import { useState, useEffect } from "react"
import { getCollection, addDocument, updateDocument, deleteDocument } from "@/lib/firestore"
import { deleteFile } from "@/lib/storage"
import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { StatusBadge } from "@/components/StatusBadge"
import { UploadField } from "@/components/UploadField"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { ColumnDef } from "@tanstack/react-table"
import { Plus, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ImageToVideo {
  id: string
  title: string
  prompt: string
  motion_style: string
  template: string
  order: number
  is_premium: boolean
  is_active: boolean
}

export default function ImageToVideoPage() {
  const [data, setData] = useState<ImageToVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ImageToVideo | null>(null)
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<ImageToVideo | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    prompt: "",
    motion_style: "",
    template: "",
    order: 1,
    is_premium: false,
    is_active: true
  })
  const [isSaving, setIsSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const items = await getCollection("image_to_video") as ImageToVideo[]
      setData(items)
    } catch (error) {
      console.error("Failed to load records", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenDialog = (item?: ImageToVideo) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        title: item.title || "",
        prompt: item.prompt || "",
        motion_style: item.motion_style || "",
        template: item.template || "",
        order: item.order || 1,
        is_premium: item.is_premium ?? false,
        is_active: item.is_active ?? true
      })
    } else {
      setEditingItem(null)
      const nextOrder = data.length > 0 ? Math.max(...data.map(d => Number(d.order) || 0)) + 1 : 1
      setFormData({ title: "", prompt: "", motion_style: "", template: "", order: nextOrder, is_premium: false, is_active: true })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      if (editingItem) {
        await updateDocument("image_to_video", editingItem.id, formData)
      } else {
        await addDocument("image_to_video", formData)
      }
      await loadData()
      setIsDialogOpen(false)
    } catch (error) {
         console.error("Error saving record:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (item: ImageToVideo) => {
    setDeletingItem(item)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    
    try {
      await deleteDocument("image_to_video", deletingItem.id)
      if (deletingItem.template) {
        await deleteFile(deletingItem.template)
      }
      await loadData()
    } catch (error) {
      console.error("Error deleting record:", error)
    } finally {
      setDeletingItem(null)
    }
  }

  const columns: ColumnDef<ImageToVideo>[] = [
    {
       accessorKey: "template",
       header: "Template",
       cell: ({ row }) => (
         <div className="w-16 h-16 rounded overflow-hidden bg-secondary flex items-center justify-center">
           {row.original.template ? (
             <img src={row.original.template} alt={row.original.title} className="w-full h-full object-cover" />
           ) : (
             <span className="text-xs text-muted-foreground">None</span>
           )}
         </div>
       )
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "order",
      header: "Order",
    },
    {
      accessorKey: "motion_style",
      header: "Motion Style",
      cell: ({ row }) => <span className="font-medium text-primary">{row.original.motion_style}</span>
    },
    {
      accessorKey: "prompt",
      header: "Prompt",
      cell: ({ row }) => <div className="max-w-[250px] truncate">{row.original.prompt}</div>
    },
    {
      accessorKey: "is_premium",
      header: "Premium",
      cell: ({ row }) => <StatusBadge active={row.original.is_premium} />
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
          <h2 className="text-3xl font-bold tracking-tight">Image to Video</h2>
          <p className="text-muted-foreground">Manage motion styles (e.g., Slow Zoom, Pan Right).</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="font-semibold shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Add Template
        </Button>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
         {loading ? (
             <div className="text-center p-8 text-muted-foreground">Loading templates...</div>
         ) : (
             <DataTable columns={columns} data={data} searchKey="title" />
         )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Template" : "Add Template"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                required 
                placeholder="e.g. Cinematic Zoom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motion_style">Motion Style</Label>
              <Input 
                id="motion_style" 
                value={formData.motion_style} 
                onChange={e => setFormData({...formData, motion_style: e.target.value})} 
                required 
                placeholder="e.g. Slow Zoom In"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt Prefix / Suffix</Label>
              <Input 
                id="prompt" 
                value={formData.prompt} 
                onChange={e => setFormData({...formData, prompt: e.target.value})} 
                required 
                placeholder="e.g. high quality, 4k, cinematic movement"
              />
            </div>
            <div className="space-y-2">
              <Label>Reference Template</Label>
              <UploadField 
                storagePath="image_to_video" 
                value={formData.template} 
                onChange={(url) => setFormData({...formData, template: url})} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Sort Order</Label>
              <Input 
                id="order" 
                type="number"
                value={formData.order} 
                disabled
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
            <div className="flex items-center space-x-2 py-2">
              <Switch 
                id="premium" 
                checked={formData.is_premium} 
                onCheckedChange={c => setFormData({...formData, is_premium: c})} 
              />
              <Label htmlFor="premium">Is Premium</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !formData.template}>
                {isSaving ? "Saving..." : "Save Template"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete Template"
        description="Are you sure you want to delete this template? This action cannot be undone and will delete the associated file from storage."
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
