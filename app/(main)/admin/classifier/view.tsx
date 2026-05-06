"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Wrench } from "lucide-react";

import { IncidentClassifierView } from "./incident-classifier-view";
import { RequestTypesView } from "./request-types-view";

export function ClassifierView() {
  return (
    <Tabs defaultValue="incidents" className="w-full">
      <TabsList className="grid w-full grid-cols-2 h-12 p-1 mb-6 bg-muted rounded-lg md:w-[480px] border">
        <TabsTrigger value="incidents" className="flex gap-2 data-[state=active]:bg-background">
          <AlertTriangle className="h-4 w-4" />
          <span>Категории НС</span>
        </TabsTrigger>
        <TabsTrigger value="requests" className="flex gap-2 data-[state=active]:bg-background">
          <Wrench className="h-4 w-4" />
          <span>Типы заявок</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="incidents" className="mt-0">
        <IncidentClassifierView />
      </TabsContent>

      <TabsContent value="requests" className="mt-0">
        <RequestTypesView />
      </TabsContent>
    </Tabs>
  );
}
