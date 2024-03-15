"use client";
import Knock, { Feed, FeedItem } from "@knocklabs/client";
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
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage } from "./ui/avatar";
import {
  BookmarkCheck,
  BookmarkX,
  Archive,
  ArchiveRestore,
  Divide,
  Inbox,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
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
  const [feed, setFeed] = useState({});
  useEffect(() => {
    knockFeed.listenForUpdates();
    const fetchFeed = async () => {
      await knockFeed.fetch();
      const feedState = knockFeed.getState();
      console.log(feedState);
      setFeed(feedState);
    };
    fetchFeed();
    knockFeed.on("items.received.*", (data) => {
      setFeed(knockFeed.getState());
    });
  }, []);

  const [feedItems, archivedItems] = useMemo(() => {
    const feedItems = feed?.items?.filter((item) => !item.archived_at);
    const archivedItems = feed?.items?.filter((item) => item.archived_at);
    return [feedItems, archivedItems];
  }, [feed]);
  function markAllAsRead() {
    knockFeed.markAllAsRead();
    setFeed(knockFeed.getState());
    console.log(feed);
  }
  function markAsRead(item) {
    knockFeed.markAsRead(item);
    setFeed(knockFeed.getState());
  }
  function markAsUnread(item) {
    knockFeed.markAsUnread(item);
    setFeed(knockFeed.getState());
  }
  function markAsArchived(item) {
    knockFeed.markAsArchived(item);
    setFeed(knockFeed.getState());
  }
  function markAsUnarchived(item) {
    knockFeed.markAsUnarchived(item);
    setFeed(knockFeed.getState());
  }

  return (
    <Tabs defaultValue="inbox" className="w-[600px]">
      <TabsList>
        <TabsTrigger value="inbox">
          Inbox{" "}
          {feed.loading ? null : (
            <Badge className="ml-2" variant="destructive">
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
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
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
          <Button variant="outline" className="w-full ml-2">
            Archive all
          </Button>
        </div>
        {feedItems?.length > 1 ? (
          feedItems?.map((item: FeedItem) => {
            return (
              <FeedItemCard
                key={item.id}
                item={item}
                markAsRead={markAsRead}
                markAsUnread={markAsUnread}
                markAsArchived={markAsArchived}
              ></FeedItemCard>
            );
          })
        ) : (
          <div className="flex flex-col items-center my-12 py-12 bg-slate-50 rounded-md">
            <Inbox className="w-16 h-16"></Inbox>
            <p className="mt-6">You're all caught up</p>
          </div>
        )}
      </TabsContent>
      <TabsContent value="archived">
        {archivedItems?.map((item: FeedItem) => {
          return (
            <FeedItemCard
              key={item.id}
              item={item}
              markAsRead={markAsRead}
              markAsUnread={markAsUnread}
              markAsUnarchived={markAsUnarchived}
            ></FeedItemCard>
          );
        })}
      </TabsContent>
      <TabsContent value="all">Change your password here.</TabsContent>
    </Tabs>
  );
}

function FeedItemCard({
  item,
  markAsRead,
  markAsUnread,
  markAsArchived,
  markAsUnarchived,
}: {
  item: FeedItem;
  markAsRead: Function;
  markAsUnread: Function;
  markAsArchived?: Function;
  markAsUnarchived?: Function;
}) {
  const content = item.blocks.filter((block) => block.name === "body")[0];
  return (
    <div
      className={`border-b border-[#333333] py-4 ${
        item.read_at ? "opacity-70" : ""
      } `}
    >
      <div className="flex items-center mb-2">
        <Avatar>
          <AvatarImage
            alt="Colin White"
            src="https://v0.dev/placeholder.svg?height=40&width=40"
          />
        </Avatar>
        <div className="ml-2">
          <p className="font-semibold">
            {item.actors.map((actor) => actor.name).join(" &")} took an action{" "}
            <span className="text-sm text-[#BBBBBB]">
              {new Date(item.inserted_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </p>
        </div>
        <div className="ml-16">
          {item.read_at === null ? (
            <Button
              variant="outline"
              size="icon"
              className="mx-1"
              onClick={() => {
                markAsRead(item);
              }}
            >
              <BookmarkCheck className="h-4 w-4"></BookmarkCheck>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="mx-1"
              onClick={() => {
                markAsUnread(item);
              }}
            >
              <BookmarkX className="h-4 w-4"></BookmarkX>
            </Button>
          )}
          {item.archived_at === null ? (
            <Button
              variant="outline"
              size="icon"
              className="mx-1"
              onClick={() => {
                markAsArchived(item);
              }}
            >
              <Archive className="h-4 w-4"></Archive>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="mx-1"
              onClick={() => {
                markAsUnarchived(item);
              }}
            >
              <ArchiveRestore className="h-4 w-4"></ArchiveRestore>
            </Button>
          )}
        </div>
      </div>
      <p
        className="text-sm mb-1"
        dangerouslySetInnerHTML={{ __html: content.rendered }}
      ></p>
    </div>
  );
}
