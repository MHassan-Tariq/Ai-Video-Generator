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
import { Plus, Edit, Trash2, Image as ImageIcon, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface HomeDecoration {
  id: string
  title: string
  category: string
  description: string
  before_image: string
  after_image: string
  order: number
  is_active: boolean
}

export default function HomeDecorationPage() {
  const [data, setData] = useState<HomeDecoration[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<HomeDecoration | null>(null)
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<HomeDecoration | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    before_image: "",
    after_image: "",
    order: 1,
    is_active: true
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const items = await getCollection("home_decoration") as HomeDecoration[]
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

  const handleOpenDialog = (item?: HomeDecoration) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        title: item.title || "",
        category: item.category || "",
        description: item.description || "",
        before_image: item.before_image || "",
        after_image: item.after_image || "",
        order: item.order || 1,
        is_active: item.is_active ?? true
      })
    } else {
      setEditingItem(null)
      const nextOrder = data.length > 0 ? Math.max(...data.map(d => Number(d.order) || 0)) + 1 : 1
      setFormData({ 
        title: "", 
        category: "",
        description: "",
        before_image: "", 
        after_image: "", 
        order: nextOrder, 
        is_active: true 
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.before_image || !formData.after_image) {
      alert("Please upload both Before and After images.")
      return
    }

    setIsSaving(true)
    
    try {
      if (editingItem) {
        await updateDocument("home_decoration", editingItem.id, formData)
      } else {
        await addDocument("home_decoration", formData)
      }
      await loadData()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving record:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (item: HomeDecoration) => {
    setDeletingItem(item)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    
    try {
      setIsDeleting(true)
      await deleteDocument("home_decoration", deletingItem.id)
      if (deletingItem.before_image) await deleteFile(deletingItem.before_image)
      if (deletingItem.after_image) await deleteFile(deletingItem.after_image)
      await loadData()
      setIsConfirmOpen(false)
    } catch (error) {
      console.error("Error deleting record:", error)
    } finally {
      setIsDeleting(false)
      setDeletingItem(null)
    }
  }

  const columns: ColumnDef<HomeDecoration>[] = [
    {
      accessorKey: "before_image",
      header: "Before Image",
      cell: ({ row }) => (
        <div className="w-16 h-16 rounded overflow-hidden bg-secondary flex items-center justify-center">
          {row.original.before_image ? (
            <img src={row.original.before_image} alt="Before" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
      )
    },
    {
      accessorKey: "after_image",
      header: "After Image",
      cell: ({ row }) => (
        <div className="w-16 h-16 rounded overflow-hidden bg-secondary flex items-center justify-center">
          {row.original.after_image ? (
            <img src={row.original.after_image} alt="After" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
      )
    },
    {
      accessorKey: "title",
      header: "Title",
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
          <h2 className="text-3xl font-bold tracking-tight">Home Decoration</h2>
          <p className="text-muted-foreground">Manage before and after transformation images.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="font-semibold shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Add Transformation
        </Button>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
         {loading ? (
             <div className="text-center p-8 text-muted-foreground">Loading decorations...</div>
         ) : (
             <DataTable columns={columns} data={data} searchKey="title" />
         )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Transformation" : "Add Transformation"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                required 
                placeholder="e.g. Modern Living Room"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input 
                id="category" 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})} 
                placeholder="e.g. Living Room, Bedroom"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea 
                id="description" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="w-full min-h-[100px] rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30"
                placeholder="Describe the transformation..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Before Image</Label>
                <UploadField 
                  storagePath="home_decoration/before" 
                  value={formData.before_image} 
                  onChange={(url) => setFormData({...formData, before_image: url})} 
                />
              </div>
              <div className="space-y-2">
                <Label>After Image</Label>
                <UploadField 
                  storagePath="home_decoration/after" 
                  value={formData.after_image} 
                  onChange={(url) => setFormData({...formData, after_image: url})} 
                />
              </div>
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

            <div className="flex flex-col items-end gap-2 pt-4 border-t border-border mt-4">
              {(!formData.before_image || !formData.after_image) && (
                <p className="text-xs text-destructive font-medium">Both Before and After images are required to save.</p>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving || !formData.before_image || !formData.after_image}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Transformation"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={isConfirmOpen}
        onOpenChange={(open) => !isDeleting && setIsConfirmOpen(open)}
        title="Delete Transformation"
        description="Are you sure you want to delete this transformation? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
