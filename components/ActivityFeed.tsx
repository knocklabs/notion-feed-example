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
import { Toaster } from "@/components/ui/toaster";

import { FeedItemCard } from "./FeedItemCard";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import PreferenceCenter from "./PreferenceCenter";

const knockClient = new Knock(
  process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY as string
);

knockClient.authenticate(process.env.NEXT_PUBLIC_KNOCK_USER_ID as string);
const knockFeed = knockClient.feeds.initialize(
  process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID as string,
  {
    page_size: 20,
    archived: "include",
  }
);

export default function ActivityFeed() {
  const [feed, setFeed] = useState<FeedStoreState>({} as FeedStoreState);
  const { toast } = useToast();
  useEffect(() => {
    knockFeed.listenForUpdates();
    const fetchFeed = async () => {
      await knockFeed.fetch();
      const feedState = knockFeed.getState();
      setFeed(feedState);
    };
    fetchFeed();
    knockFeed.on(
      "items.received.realtime",
      ({ items }: { items: FeedItem[] }) => {
        items.forEach((item) => {
          if (item.data && item.data.showToast) {
            toast({
              title: `📨 New feed item at ${new Date(
                item.inserted_at
              ).toLocaleString()}`,
              description: "Snap! This real-time feed is mind-blowing 🤯",
            });
          }
        });
        setFeed(knockFeed.getState());
      }
    );

    knockFeed.on("items.*", () => {
      console.log("calling items.*");
      setFeed(knockFeed.getState());
    });
  }, []);

  const [feedItems, archivedItems] = useMemo(() => {
    const feedItems = feed?.items?.filter(
      (item: FeedItem) => !item.archived_at
    );
    const archivedItems = feed?.items?.filter(
      (item: FeedItem) => item.archived_at
    );
    return [feedItems, archivedItems];
  }, [feed]);
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
          {feed.loading ? null : (
            <Badge className="ml-2" variant="secondary">
              {feed?.metadata?.unread_count}
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
        {feedItems?.length > 0 ? (
          feedItems?.map((item: FeedItem) => {
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
        {archivedItems?.map((item: FeedItem) => {
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
        {feed.items?.map((item: FeedItem) => {
          return (
            <FeedItemCard
              key={item.id}
              item={item}
              knockFeed={knockFeed}
            ></FeedItemCard>
          );
        })}
      </TabsContent>
      <Toaster />
    </Tabs>
  );
}
