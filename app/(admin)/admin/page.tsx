"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getCollection } from "@/lib/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Palette, Video, ImageIcon, Type, Activity, MessageSquare, Compass, House } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    homeDecoration: { total: 0, active: 0 },
    examplePhotos: { total: 0, active: 0 },
    colorPalettes: { total: 0, active: 0 },
    selectStyle: { total: 0, active: 0 },
    customPrompts: { total: 0, active: 0 },
    explore: { total: 0, active: 0 },
    roomTypes: { total: 0, active: 0 },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [homeDecoration, examplePhotos, colorPalettes, selectStyle, customPrompts, explore, roomTypes] = await Promise.all([
          getCollection("home_decoration"),
          getCollection("example_photos"),
          getCollection("color_palettes"),
          getCollection("select_style"),
          getCollection("custom_prompts"),
          getCollection("explore"),
          getCollection("room_types")
        ])

        setStats({
          homeDecoration: {
            total: homeDecoration.length,
            active: (homeDecoration as any[]).filter(i => i.is_active).length
          },
          examplePhotos: {
            total: examplePhotos.length,
            active: (examplePhotos as any[]).filter(i => i.is_active).length
          },
          colorPalettes: {
            total: colorPalettes.length,
            active: (colorPalettes as any[]).filter(i => i.is_active).length
          },
          selectStyle: {
            total: selectStyle.length,
            active: (selectStyle as any[]).filter(i => i.is_active).length
          },
          customPrompts: {
            total: customPrompts.length,
            active: (customPrompts as any[]).filter(i => i.is_active).length
          },
          explore: {
            total: explore.length,
            active: (explore as any[]).filter(i => i.is_active).length
          },
          roomTypes: {
            total: roomTypes.length,
            active: (roomTypes as any[]).filter(i => i.is_active).length
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
        <p className="text-muted-foreground">Overview of your Home Decoration resources.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Home Decoration" data={stats.homeDecoration} icon={Palette} />
        <StatCard title="Example Photos" data={stats.examplePhotos} icon={ImageIcon} />
        <StatCard title="Color Palettes" data={stats.colorPalettes} icon={Palette} />
        <StatCard title="Select Style" data={stats.selectStyle} icon={Palette} />
        <StatCard title="Custom Prompts" data={stats.customPrompts} icon={MessageSquare} />
        <StatCard title="Explore" data={stats.explore} icon={Compass} />
             <Link href="/admin/room-types">
               <div className="py-10 px-6 rounded-xl border border-border/60 bg-secondary/10 hover:bg-secondary/30 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 group">
                 <House className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                 <h3 className="font-semibold text-[15px] tracking-wide text-foreground">Room Types</h3>
               </div>
             </Link>
      </div>

      <div className="grid gap-4 w-full">
        <Card className="border-border">
          <CardHeader className="px-6 pt-6 pb-4">
            <CardTitle className="text-xl font-bold tracking-tight">Quick Links</CardTitle>
            <CardDescription className="text-[15px]">Manage your transformation content.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 pb-6 w-full">
             <Link href="/admin/home-decoration">
               <div className="py-10 px-6 rounded-xl border border-border/60 bg-secondary/10 hover:bg-secondary/30 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 group">
                 <Palette className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                 <h3 className="font-semibold text-[15px] tracking-wide text-foreground">Home Decoration</h3>
               </div>
             </Link>
             <Link href="/admin/example-photos">
               <div className="py-10 px-6 rounded-xl border border-border/60 bg-secondary/10 hover:bg-secondary/30 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 group">
                 <ImageIcon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                 <h3 className="font-semibold text-[15px] tracking-wide text-foreground">Example Photos</h3>
               </div>
             </Link>
             <Link href="/admin/color-palettes">
               <div className="py-10 px-6 rounded-xl border border-border/60 bg-secondary/10 hover:bg-secondary/30 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 group">
                 <Palette className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                 <h3 className="font-semibold text-[15px] tracking-wide text-foreground">Color Palettes</h3>
               </div>
             </Link>
             <Link href="/admin/select-style">
               <div className="py-10 px-6 rounded-xl border border-border/60 bg-secondary/10 hover:bg-secondary/30 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 group">
                 <Palette className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                 <h3 className="font-semibold text-[15px] tracking-wide text-foreground">Select Style</h3>
               </div>
             </Link>
             <Link href="/admin/custom-prompts">
               <div className="py-10 px-6 rounded-xl border border-border/60 bg-secondary/10 hover:bg-secondary/30 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 group">
                 <MessageSquare className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                 <h3 className="font-semibold text-[15px] tracking-wide text-foreground">Custom Prompts</h3>
               </div>
             </Link>
             <Link href="/admin/explore">
               <div className="py-10 px-6 rounded-xl border border-border/60 bg-secondary/10 hover:bg-secondary/30 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 group">
                 <Compass className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                 <h3 className="font-semibold text-[15px] tracking-wide text-foreground">Explore</h3>
               </div>
             </Link>
             <Link href="/admin/room-types">
               <div className="py-10 px-6 rounded-xl border border-border/60 bg-secondary/10 hover:bg-secondary/30 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 group">
                 <House className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                 <h3 className="font-semibold text-[15px] tracking-wide text-foreground">Room Types</h3>
               </div>
             </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
