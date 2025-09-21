chrome.webNavigation.onCompleted.addListener(async (details) => {
    if (details.frameId === 0) { // Only check the main frame
        const { lockedSites = [] } = await chrome.storage.local.get('lockedSites');
        const url = new URL(details.url);

        if (lockedSites.includes(url.hostname)) {
            // Found a locked site, sendss a message to the content script
            chrome.tabs.sendMessage(details.tabId, { action: "showLockScreen" });
        }
    }
});