import Knock, { PreferenceSet } from "@knocklabs/client";
import { useEffect, useState } from "react";
const knockClient = new Knock(
  process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY as string
);
knockClient.authenticate(process.env.NEXT_PUBLIC_KNOCK_USER_ID as string);

const PreferenceViewConfig = {
  RowSettings: {
    "new-asset": {
      title: "New Asset",
      description: "New file uploads in workspaces you're a part of",
    },
    "new-comment": {
      title: "Comments & mentions",
      description: "New comments and replies to threads.",
    },
    collaboration: {
      title: "In-app messages",
      description: "Messages from other users on the platform",
    },
  },
  ChannelTypeLabels: {
    in_app_feed: "In-app Feed",
    email: "Email",
    push: "Push",
  },
};
type preferenceViewLabels = "new-asset" | "new-comment" | "collaboration";
type channelTypeLabels = "in_app_feed" | "email" | "push";

function PreferenceSettingsRow({
  preferenceType,
  preferenceKey,
  channelTypeSettings,
  onChange,
}: {
  preferenceType: string;
  preferenceKey: preferenceViewLabels;
  channelTypeSettings: Record<string, boolean>;
  onChange: Function;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: ".75rem .25rem",
        gap: "1rem",
      }}
    >
      <div>
        <h2>{PreferenceViewConfig.RowSettings[preferenceKey].title}</h2>
        <p>{PreferenceViewConfig.RowSettings[preferenceKey].description}</p>
      </div>
      <div>
        {Object.keys(PreferenceViewConfig.ChannelTypeLabels).map(
          (channelType) => {
            console.log(channelType, channelTypeSettings[channelType]);
            const channelTypeLabel = channelType as channelTypeLabels;
            return (
              <div
                key={`${preferenceKey}_${channelType}`}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <label htmlFor={`${preferenceKey}_${channelType}`}>
                  {PreferenceViewConfig.ChannelTypeLabels[channelTypeLabel]}
                </label>
                &nbsp;
                <input
                  id={`${preferenceKey}_${channelType}`}
                  type="checkbox"
                  checked={channelTypeSettings[channelType]}
                  disabled={
                    typeof channelTypeSettings[channelType] === "undefined"
                  }
                  onChange={(e) => {
                    onChange({
                      preferenceKey,
                      preferenceType,
                      channelTypeSettings: {
                        ...channelTypeSettings,
                        [channelType]: e.target.checked,
                      },
                    });
                  }}
                />
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

export default function PreferenceCenter() {
  //Create some local state to store the user's preferences
  const [localPreferences, setLocalPreferences] = useState<PreferenceSet>({
    id: "default",
    categories: {
      collaboration: {
        channel_types: {
          email: true,
          in_app_feed: true,
        },
      },
      "new-asset": {
        channel_types: {
          email: false,
          in_app_feed: true,
        },
      },
    },
    workflows: {
      "new-comment": {
        channel_types: {
          email: true,
        },
      },
    },
    channel_types: {},
  });

  //We load the current user's preferences from Knock, and set them to local preferences

  useEffect(() => {
    async function fetchPreferences() {
      const preferences = await knockClient.user.getPreferences();
      console.log(preferences);
      setLocalPreferences(preferences);
    }
    fetchPreferences();
  }, [knockClient]);

  //When a preference setting is changed, we create a new PreferenceSet that
  //includes the change, update the preferences in Knock, and then update local state
  const onPreferenceChange = async ({
    preferenceKey,
    preferenceType,
    channelTypeSettings,
  }: {
    preferenceKey: string;
    preferenceType: string;
    channelTypeSettings: Record<string, boolean>;
  }) => {
    //create a new preference set with local preferences as starting point
    const preferenceUpdate: PreferenceSet = {
      ...localPreferences,
    };

    // Here we'll make updates to the preference set based on the preferenceType
    // and override existing channelTypeSettings
    // since Workflow and Category preferences can also be a Boolean,
    // we'll check if the preferenceKey contains an channel_types object
    if (
      preferenceType === "category" &&
      typeof preferenceUpdate.categories[preferenceKey] === "object"
    ) {
      console.log(typeof preferenceUpdate.categories[preferenceKey]);
      preferenceUpdate.categories[preferenceKey].channel_types =
        channelTypeSettings;
    }
    if (
      preferenceType === "workflow" &&
      typeof preferenceUpdate.workflows[preferenceKey] === "object"
    ) {
      preferenceUpdate.workflows[preferenceKey].channel_types =
        channelTypeSettings;
    }
    //Next, we upload the new PreferenceSet to Knock for that user
    const preferences = await knockClient.user.setPreferences(preferenceUpdate);
    // Set the updated preferences in local state
    setLocalPreferences(preferences);
  };
  //If we haven't loaded preferences yet, maybe show a spinner
  if (!localPreferences) {
    return null;
  }
  return (
    <div className="preferences">
      {Object.keys(localPreferences?.categories).map((category) => {
        const preferenceKey = category as preferenceViewLabels;
        return (
          <PreferenceSettingsRow
            key={category}
            preferenceType="category"
            preferenceKey={preferenceKey}
            channelTypeSettings={
              typeof localPreferences.categories[category] === "object"
                ? localPreferences?.categories[category]?.channel_types
                : {}
            }
            onChange={onPreferenceChange}
          ></PreferenceSettingsRow>
        );
      })}
      {Object.keys(localPreferences?.workflows).map((workflow) => {
        const preferenceKey = workflow as preferenceViewLabels;
        return (
          <PreferenceSettingsRow
            key={workflow}
            preferenceType="workflow"
            preferenceKey={preferenceKey}
            channelTypeSettings={
              typeof localPreferences?.workflows[workflow] === "object"
                ? localPreferences?.workflows[workflow]?.channel_types
                : {}
            }
            onChange={onPreferenceChange}
          ></PreferenceSettingsRow>
        );
      })}
    </div>
  );
}
