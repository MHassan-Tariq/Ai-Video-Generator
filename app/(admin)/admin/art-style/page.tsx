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

interface ArtStyle {
  id: string
  name: string
  prompt: string
  image: string
  order: number
  is_active: boolean
}

export default function ArtStylesPage() {
  const [data, setData] = useState<ArtStyle[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ArtStyle | null>(null)
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<ArtStyle | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    prompt: "",
    image: "",
    order: 1,
    is_active: true
  })
  const [isSaving, setIsSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const items = await getCollection("art_styles") as ArtStyle[]
      setData(items)
    } catch (error) {
      console.error("Failed to load art styles", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenDialog = (item?: ArtStyle) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name || "",
        prompt: item.prompt || "",
        image: item.image || "",
        order: item.order || 1,
        is_active: item.is_active ?? true
      })
    } else {
      setEditingItem(null)
      const nextOrder = data.length > 0 ? Math.max(...data.map(d => Number(d.order) || 0)) + 1 : 1
      setFormData({ name: "", prompt: "", image: "", order: nextOrder, is_active: true })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      if (editingItem) {
        await updateDocument("art_styles", editingItem.id, formData)
      } else {
        await addDocument("art_styles", formData)
      }
      await loadData()
      setIsDialogOpen(false)
    } catch (error) {
         console.error("Error saving style:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (item: ArtStyle) => {
    setDeletingItem(item)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    
    try {
      await deleteDocument("art_styles", deletingItem.id)
      if (deletingItem.image) {
        await deleteFile(deletingItem.image)
      }
      await loadData()
    } catch (error) {
      console.error("Error deleting style:", error)
    } finally {
      setDeletingItem(null)
    }
  }

  const columns: ColumnDef<ArtStyle>[] = [
    {
       accessorKey: "image",
       header: "Image",
       cell: ({ row }) => (
         <div className="w-16 h-16 rounded overflow-hidden bg-secondary">
           {row.original.image && (
             <img src={row.original.image} alt={row.original.name} className="w-full h-full object-cover" />
           )}
         </div>
       )
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "order",
      header: "Order",
    },
    {
      accessorKey: "prompt",
      header: "Prompt",
      cell: ({ row }) => <div className="max-w-[300px] truncate">{row.original.prompt}</div>
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
          <h2 className="text-3xl font-bold tracking-tight">Art Styles</h2>
          <p className="text-muted-foreground">Manage generative art styles (e.g., Anime, 3D, Ghibli).</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="font-semibold shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Add Style
        </Button>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
         {loading ? (
             <div className="text-center p-8 text-muted-foreground">Loading styles...</div>
         ) : (
             <DataTable columns={columns} data={data} searchKey="name" />
         )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Art Style" : "Add Art Style"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
                placeholder="e.g. Studio Ghibli"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt Prefix / Suffix</Label>
              <Input 
                id="prompt" 
                value={formData.prompt} 
                onChange={e => setFormData({...formData, prompt: e.target.value})} 
                required 
                placeholder="e.g. in the style of studio ghibli anime, masterpiece"
              />
            </div>
            <div className="space-y-2">
              <Label>Reference Image</Label>
              <UploadField 
                storagePath="art_styles" 
                value={formData.image} 
                onChange={(url) => setFormData({...formData, image: url})} 
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
            <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !formData.image}>
                {isSaving ? "Saving..." : "Save Style"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete Art Style"
        description="Are you sure you want to delete this art style? This action cannot be undone and will delete the associated image from storage."
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
