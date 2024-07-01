"use client";

import { KnockProvider } from "@knocklabs/react";
import ActivityFeed from "./ActivityFeed";

export default function FeedContainer() {
  return (
    <KnockProvider
      userId={process.env.NEXT_PUBLIC_KNOCK_USER_ID as string}
      apiKey={process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY as string}
    >
      <ActivityFeed></ActivityFeed>
    </KnockProvider>
  );
}
