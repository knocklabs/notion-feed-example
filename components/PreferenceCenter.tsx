import Knock, { PreferenceSet } from "@knocklabs/client";
import { useEffect, useState } from "react";

// Here we create a view config object, this helps us customize the interface
// and choose which preference options we want to display to the user
const PreferenceViewConfig: Record<string, any> = {
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
// The PrefereceSettingsRow component is what actually displays the UI to manipulate
function PreferenceSettingsRow({
  preferenceType,
  preferenceKey,
  channelTypeSettings,
  onChange,
}: {
  preferenceType: string;
  preferenceKey: string;
  channelTypeSettings: ChannelTypeSettings;
  onChange: Function;
}) {
  return (
    <div className="my-4">
      <h2 className="text-md font-semibold">
        {PreferenceViewConfig.RowSettings[preferenceKey].title}
      </h2>
      <p className="text-sm font-light">
        {PreferenceViewConfig.RowSettings[preferenceKey].description}
      </p>
      {Object.keys(PreferenceViewConfig.ChannelTypeLabels).map(
        (channelType) => {
          return (
            <div className="mt-2" key={`${preferenceKey}_${channelType}`}>
              <label htmlFor="">
                {PreferenceViewConfig.ChannelTypeLabels[channelType]}
              </label>
              <input
                className="ml-2"
                type="checkbox"
                checked={
                  channelTypeSettings[channelType as keyof ChannelTypeSettings]
                }
                disabled={
                  typeof channelTypeSettings[
                    channelType as keyof ChannelTypeSettings
                  ] === "undefined"
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
  );
}

export default function PreferenceCenter({
  knockClient,
}: {
  knockClient: Knock;
}) {
  //Create some local state to store the user's preferences
  const [localPreferences, setLocalPreferences] = useState<
    PreferenceSet | undefined
  >();

  //We load the current user's preferences from Knock, and set them to local preferences

  useEffect(() => {
    async function fetchPreferences() {
      const preferences = await knockClient.user.getPreferences();
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
    channelTypeSettings: object;
  }) => {
    //create a new preference set with local preferences as starting point
    const preferenceUpdate = {
      ...localPreferences,
    };

    //Here we'll make updates to the preference set based on the preferenceType
    // and override existing channelTypeSettings
    if (preferenceType === "category") {
      preferenceUpdate.categories[preferenceKey].channel_types =
        channelTypeSettings;
    }
    if (preferenceType === "workflow") {
      preferenceUpdate.workflows[preferenceKey].channel_types =
        channelTypeSettings;
    }
    //Next, we upload the new PreferenceSet to Knock for that user
    const preferences = await knockClient.user.setPreferences(preferenceUpdate);
    // Set the updated preferences in local state
    setLocalPreferences(preferences);
  };
  if (!localPreferences) {
    return null;
  }
  return (
    <div className="preferences">
      {Object.keys(localPreferences?.categories).map((category) => {
        return (
          <PreferenceSettingsRow
            key={category}
            preferenceType="category"
            preferenceKey={category}
            channelTypeSettings={
              localPreferences?.categories[category]?.channel_types
            }
            onChange={onPreferenceChange}
          ></PreferenceSettingsRow>
        );
      })}
      {Object.keys(localPreferences?.workflows).map((workflow) => {
        return (
          <PreferenceSettingsRow
            key={workflow}
            preferenceType="workflow"
            preferenceKey={workflow}
            channelTypeSettings={
              localPreferences?.workflows[workflow]?.channel_types
            }
            onChange={onPreferenceChange}
          ></PreferenceSettingsRow>
        );
      })}
    </div>
  );
}

interface ChannelTypeSettings {
  in_app_feed: boolean;
  email: boolean;
  http: boolean;
  push: boolean;
  sms: boolean;
  chat: boolean;
}
