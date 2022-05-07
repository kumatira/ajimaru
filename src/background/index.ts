const asyncTabsQuery = (queryInfo:chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> => {
    return new Promise((resolve, reject)=>{
        chrome.tabs.query(
            queryInfo,
            (tab)=>{resolve(tab)}
        )
    })
}

const asyncSetIcon = (details: chrome.action.TabIconDetails): Promise<void> => {
    return new Promise((resolve, reject) => {
        chrome.action.setIcon(
            details,
            ()=>{resolve}
        )
    })
}

chrome.tabs.onHighlighted.addListener((highlightInfo) => {
    updateStatus();
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.status === 'complete') { updateStatus(); }
});



const updateStatus = async () => {
    console.log(`tab has changed!`);
    const newTabs: chrome.tabs.Tab[] = await asyncTabsQuery({active: true, currentWindow:true});
    const currentTabId = newTabs[0].id;
    const currentTabURL = newTabs[0].url;
    console.log(currentTabURL);
    if (currentTabURL !== undefined) {
        if (currentTabURL.includes('youtube.com/watch')) { //youtubeのビデオ再生ページ
            await asyncSetIcon({path: "icon32_able.png", tabId: currentTabId});
        } else {
            await asyncSetIcon({path: "icon32_disable.png", tabId: currentTabId});
        }
    }
}

console.clear();
console.log("OK!reloaded.");

export {}