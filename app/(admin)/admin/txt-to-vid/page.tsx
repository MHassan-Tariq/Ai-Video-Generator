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
import { Select } from "@/components/ui/select"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { ColumnDef } from "@tanstack/react-table"
import { Plus, Edit, Trash2, ArrowUpCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TextToVideo {
  id: string
  title: string
  prompt: string
  style: string
  camera_motion: string
  template: string
  order: number
  is_active: boolean
}

const ART_STYLES = {
  'Cinematic': '🎬',
  'Anime': '🎨',
  'Realistic': '📸',
  'Fantasy': '🌌'
};

const CAMERA_MOTIONS = ['Static', 'Slow Zoom', 'Orbit', 'Tracking Shot'];

export default function TextToVideoPage() {
  const [data, setData] = useState<TextToVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TextToVideo | null>(null)
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<TextToVideo | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    prompt: "",
    style: "",
    camera_motion: "",
    template: "",
    order: 0,
    is_active: true
  })
  const [isSaving, setIsSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const items = await getCollection("text_to_video") as TextToVideo[]
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

  const handleOpenDialog = (item?: TextToVideo) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        title: item.title || "",
        prompt: item.prompt || "",
        style: item.style || "",
        camera_motion: item.camera_motion || "",
        template: item.template || "",
        order: item.order || 0,
        is_active: item.is_active ?? true
      })
    } else {
      setEditingItem(null)
      // Auto-increment order for new items
      const nextOrder = data.length > 0 ? Math.max(...data.map(d => d.order || 0)) + 1 : 1
      setFormData({ 
        title: "", 
        prompt: "", 
        style: Object.keys(ART_STYLES)[0], 
        camera_motion: CAMERA_MOTIONS[0], 
        template: "", 
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
        await updateDocument("text_to_video", editingItem.id, formData)
      } else {
        await addDocument("text_to_video", formData)
      }
      await loadData()
      setIsDialogOpen(false)
    } catch (error) {
         console.error("Error saving record:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (item: TextToVideo) => {
    setDeletingItem(item)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    
    try {
      await deleteDocument("text_to_video", deletingItem.id)
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

  const columns: ColumnDef<TextToVideo>[] = [
    {
       accessorKey: "order",
       header: "Order",
       cell: ({ row }) => (
         <div className="flex items-center text-muted-foreground font-mono">
           <ArrowUpCircle className="w-3 h-3 mr-1" />
           {row.original.order}
         </div>
       )
    },
    {
       accessorKey: "template",
       header: "Preview",
       cell: ({ row }) => (
         <div className="w-16 h-16 rounded overflow-hidden bg-secondary flex items-center justify-center">
           {row.original.template ? (
             row.original.template.match(/\.(mp4|webm|ogg)/i) ? (
               <video src={row.original.template} className="w-full h-full object-cover" muted loop playsInline />
             ) : (
               <img src={row.original.template} alt="Preview" className="w-full h-full object-cover" />
             )
           ) : (
             <span className="text-xs text-muted-foreground">None</span>
           )}
         </div>
       )
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <span className="font-semibold">{row.original.title}</span>
    },
    {
      accessorKey: "style",
      header: "Style",
      cell: ({ row }) => <span className="text-primary">{row.original.style}</span>
    },
    {
      accessorKey: "camera_motion",
      header: "Camera Motion",
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
          <h2 className="text-3xl font-bold tracking-tight">Text to Video</h2>
          <p className="text-muted-foreground">Manage full text-to-video prompt sequences and camera motions.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="font-semibold shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Add Video Sequence
        </Button>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
         {loading ? (
             <div className="text-center p-8 text-muted-foreground">Loading sequences...</div>
         ) : (
             <DataTable columns={columns} data={data} searchKey="title" />
         )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Video Sequence" : "Add Video Sequence"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  required 
                  placeholder="e.g. Cyberpunk Walkway"
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="order">Sort Order</Label>
                <Input 
                  id="order" 
                  type="number"
                  value={formData.order} 
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Art Style</Label>
              <Select 
                id="style" 
                value={formData.style} 
                onChange={e => setFormData({...formData, style: e.target.value})} 
                required
              >
                {Object.entries(ART_STYLES).map(([name, emoji]) => (
                  <option key={name} value={name}>
                    {emoji} {name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="camera_motion">Camera Motion</Label>
              <Select 
                id="camera_motion" 
                value={formData.camera_motion} 
                onChange={e => setFormData({...formData, camera_motion: e.target.value})} 
                required
              >
                {CAMERA_MOTIONS.map(motion => (
                  <option key={motion} value={motion}>
                    {motion}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Full Prompt</Label>
              <textarea 
                id="prompt" 
                value={formData.prompt} 
                onChange={e => setFormData({...formData, prompt: e.target.value})} 
                required 
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Detailed prompt description..."
              />
            </div>

            <div className="space-y-2">
              <Label>Video/Image Reference URL (Optional)</Label>
              <UploadField 
                storagePath="text_to_video" 
                accept="video/*,image/*"
                value={formData.template} 
                onChange={(url) => setFormData({...formData, template: url})} 
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
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Sequence"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete Sequence"
        description="Are you sure you want to delete this sequence? This action cannot be undone."
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
