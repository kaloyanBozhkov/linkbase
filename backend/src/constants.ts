type AppStoreConfig = {
    url: string;
};

type AppStoreUrls = {
    [key: string]: AppStoreConfig;
    default: AppStoreConfig;
};

export const APP_STORE_URLS: AppStoreUrls = {
    linkbase: {
        url: "https://apps.apple.com/app/linkbase/id123456789", // Placeholder - replace with actual URL
    },
    "task-manager": {
        url: "https://apps.apple.com/app/task-manager/id987654321", // Example app
    },
    "my-awesome-app": {
        url: "https://apps.apple.com/app/my-awesome-app/id555666777", // Example app
    },
    // Default fallback for any app not specifically configured
    default: {
        url: "https://apps.apple.com/developer/kaloyan-bozhkov/id123456789", // Placeholder - replace with developer URL
    },
}