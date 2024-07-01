"use client";

import {
  useKnockClient,
  useNotificationStore,
  useNotifications,
} from "@knocklabs/react";
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
import { Toaster } from "@/components/ui/toaster";

import { FeedItemCard } from "./FeedItemCard";

import PreferenceCenter from "./PreferenceCenter";
import { useEffect } from "react";

export default function ActivityFeed() {
  const knockClient = useKnockClient();
  const knockFeed = useNotifications(
    knockClient,
    process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID as string
  );

  const { items, metadata, loading } = useNotificationStore(knockFeed);

  useEffect(() => {
    knockFeed.fetch();
  }, [knockFeed]);

  async function markAllAsRead() {
    await knockFeed.markAllAsRead();
  }

  async function markAllAsArchived() {
    knockFeed.markAllAsArchived();
  }

  return (
    <Tabs defaultValue="inbox" className="w-[600px]">
      <TabsList>
        <TabsTrigger value="inbox">
          Inbox{" "}
          {loading ? null : (
            <Badge className="ml-2" variant="secondary">
              {metadata?.unread_count}
            </Badge>
          )}
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
                <PreferenceCenter></PreferenceCenter>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </TabsList>
      <TabsContent value="inbox">
        <div className="my-6 flex">
          <Button
            variant="outline"
            onClick={() => markAllAsRead()}
            className="w-full mr-2"
          >
            Mark all as read
          </Button>
          <Button
            variant="outline"
            className="w-full ml-2"
            onClick={() => markAllAsArchived()}
          >
            Archive all
          </Button>
        </div>
        {items?.length > 0 ? (
          items?.map((item: FeedItem) => {
            return (
              <FeedItemCard
                key={item.id}
                item={item}
                knockFeed={knockFeed}
              ></FeedItemCard>
            );
          })
        ) : (
          <div className="flex flex-col items-center my-12 py-12 bg-slate-50 rounded-md">
            <Inbox className="w-16 h-16"></Inbox>
            <p className="mt-6">You&apos;re all caught up</p>
          </div>
        )}
      </TabsContent>
      <TabsContent value="archived">
        {/* {archivedItems?.map((item: FeedItem) => {
          return (
            <FeedItemCard
              key={item.id}
              item={item}
              knockFeed={knockFeed}
            ></FeedItemCard>
          );
        })}
      </TabsContent>
      <TabsContent value="all">
        {/* {feed.items?.map((item: FeedItem) => {
          return (
            <FeedItemCard
              key={item.id}
              item={item}
              knockFeed={knockFeed}
            ></FeedItemCard>
          );
        })} */}
      </TabsContent>
      <Toaster />
    </Tabs>
  );
}
