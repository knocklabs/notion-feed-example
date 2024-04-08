"use client";
import Knock, { FeedItem, FeedStoreState } from "@knocklabs/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Inbox } from "lucide-react";

import { FeedItemCard } from "./FeedItemCard";

export default function ActivityFeed() {
  const feedItems = [];
  const archivedItems = [];
  return (
    <Tabs defaultValue="inbox" className="w-[600px]">
      <TabsList>
        <TabsTrigger value="inbox">
          Inbox{" "}
          <Badge className="ml-2" variant="secondary">
            0
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="archived">Archived</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
        <Separator orientation="vertical"></Separator>
        <Dialog>
          <DialogTrigger className="mx-6 text-xl">⚙️</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notification Preferences</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </TabsList>
      <TabsContent value="inbox">
        <div className="my-6 flex">
          <Button variant="outline" className="w-full mr-2">
            Mark all as read
          </Button>
          <Button variant="outline" className="w-full ml-2">
            Archive all
          </Button>
        </div>

        <div className="flex flex-col items-center my-12 py-12 bg-slate-50 rounded-md">
          <Inbox className="w-16 h-16"></Inbox>
          <p className="mt-6">You&apos;re all caught up</p>
        </div>
      </TabsContent>
      <TabsContent value="archived"></TabsContent>
      <TabsContent value="all"></TabsContent>
    </Tabs>
  );
}
