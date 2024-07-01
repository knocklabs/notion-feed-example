import Knock from "@knocklabs/client";
import { useEffect, useState } from "react";
const knockClient = new Knock(process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY);
knockClient.authenticate(process.env.NEXT_PUBLIC_KNOCK_USER_ID);

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

function PreferenceSettingsRow({
  preferenceType,
  preferenceKey,
  channelTypeSettings,
  onChange,
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
            return (
              <div
                key={`${preferenceKey}_${channelType}`}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <label htmlFor={`${preferenceKey}_${channelType}`}>
                  {PreferenceViewConfig.ChannelTypeLabels[channelType]}
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
  const [localPreferences, setLocalPreferences] = useState();

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
  //If we haven't loaded preferences yet, maybe show a spinner
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
