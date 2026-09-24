"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MemberCotisationTabContent } from "@/components/custom/member-cotisation/member-cotisation-tab-content"
import { TarifGridTabContent } from "@/components/custom/tarif-grid/tarif-grid-tab-content"

export default function ClubDuesPage() {
  return (
    <Tabs defaultValue="dues">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Cotisations</h1>
          <TabsList>
            <TabsTrigger value="dues">Cotisations</TabsTrigger>
            <TabsTrigger value="tarif-grid">Grille tarifaire</TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent value="dues" className="mt-6">
        <MemberCotisationTabContent />
      </TabsContent>

      <TabsContent value="tarif-grid" className="mt-6">
        <TarifGridTabContent />
      </TabsContent>
    </Tabs>
  )
}
