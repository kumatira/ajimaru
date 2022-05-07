import { asyncTabsQuery, asyncSetIcon } from '../../lib/asyncChrome';

chrome.tabs.onHighlighted.addListener((highlightInfo) => {
    updateStatus();
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.status === 'complete') { updateStatus(); }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
    // popupからのhandshakeを受け取り、resとしてtitleとurlを返す
    if (message === 'handshakeToBackgroundFromPopup') {
        sendResponse({title:currentTabTitle, url: currentTabUrl});
    }
    return true
});

let currentTabId;
let currentTabTitle;
let currentTabUrl;

const updateStatus = async () => {
    const newTabs: chrome.tabs.Tab[] = await asyncTabsQuery({active: true, currentWindow:true});
    currentTabId = newTabs[0].id;
    currentTabTitle = newTabs[0].title;
    currentTabUrl = newTabs[0].url;

    if (currentTabUrl !== undefined) {
        if (currentTabUrl.includes('youtube.com/watch')) { //youtubeのビデオ再生ページ
            await asyncSetIcon({path: "icon32_able.png", tabId: currentTabId});
        } else {
            await asyncSetIcon({path: "icon32_disable.png", tabId: currentTabId});
        }
    }
}

console.clear();
console.log("OK!reloaded.");

export {}