"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getCollection } from "@/lib/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Palette, Video, ImageIcon, Type, Activity } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    textToImage: { total: 0, active: 0 },
    textToGif: { total: 0, active: 0 },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [txtToImg, txtToGif] = await Promise.all([
          getCollection("text_to_image"),
          getCollection("text_to_gif")
        ])

        setStats({
          textToImage: {
            total: txtToImg.length,
            active: (txtToImg as any[]).filter(i => i.is_active).length
          },
          textToGif: {
            total: txtToGif.length,
            active: (txtToGif as any[]).filter(i => i.is_active).length
          }
        })
      } catch (error) {
        console.error("Failed to load stats", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const StatCard = ({ title, data, icon: Icon }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="w-4 h-4 text-primary" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{data.total}</div>
            <p className="text-xs text-muted-foreground flex flex-row items-center gap-1 mt-1">
              <Activity className="w-3 h-3 text-green-500" />
              {data.active} active
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your AI generative resources.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <StatCard title="Sample Images" data={stats.textToImage} icon={ImageIcon} />
        <StatCard title="Text to GIF" data={stats.textToGif} icon={Video} />
      </div>

      <div className="grid gap-4 w-full">
        <Card className="border-border">
          <CardHeader className="px-6 pt-6 pb-4">
            <CardTitle className="text-xl font-bold tracking-tight">Quick Links</CardTitle>
            <CardDescription className="text-[15px]">Manage your generative content pipelines.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 px-6 pb-6 w-full">
             <Link href="/admin/txt-to-img">
               <div className="py-10 px-6 rounded-xl border border-border/60 bg-secondary/10 hover:bg-secondary/30 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 group">
                 <ImageIcon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                 <h3 className="font-semibold text-[15px] tracking-wide text-foreground">Manage Sample Images</h3>
               </div>
             </Link>
             <Link href="/admin/txt-to-gif">
               <div className="py-10 px-6 rounded-xl border border-border/60 bg-secondary/10 hover:bg-secondary/30 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 group">
                 <Video className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                 <h3 className="font-semibold text-[15px] tracking-wide text-foreground">Manage Text to GIF</h3>
               </div>
             </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
