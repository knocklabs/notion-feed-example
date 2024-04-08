import {
  Archive,
  ArchiveRestore,
  BookmarkCheck,
  BookmarkX,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Feed, FeedItem } from "@knocklabs/client";

export function FeedItemCard({
  item,
  knockFeed,
}: {
  item: FeedItem;
  knockFeed: Feed;
}) {
  const content = item.blocks.filter((block) => block.name === "body")[0];
  return (
    <div
      className={`border-b border-[#333333] py-4 px-4 ${
        item.read_at ? "opacity-70" : ""
      } `}
    >
      <div className="flex items-center mb-2 relative">
        {item.read_at === null ? <NewIcon></NewIcon> : null}
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
        <div className="ml-16 place-self-end">
          {item.read_at === null ? (
            <Button
              variant="outline"
              size="icon"
              className="mx-1"
              onClick={() => {
                knockFeed.markAsRead(item);
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
                knockFeed.markAsUnread(item);
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
                knockFeed.markAsArchived(item);
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
                knockFeed.markAsUnarchived(item);
              }}
            >
              <ArchiveRestore className="h-4 w-4"></ArchiveRestore>
            </Button>
          )}
        </div>
      </div>
      <p
        className="text-sm mb-1 ml-[48px]"
        dangerouslySetInnerHTML={{ __html: content.rendered }}
      ></p>
    </div>
  );
}
function NewIcon() {
  return (
    <div
      role="img"
      aria-label="New"
      style={{
        height: "8px",
        width: "8px",
        background: "rgb(35, 131, 226)",
        position: "absolute",
        borderRadius: "100%",
        left: "-12px",
        top: "16px",
        opacity: "1",
      }}
    ></div>
  );
}
