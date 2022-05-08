import { asyncTabsQuery, asyncSetIcon, asyncTabsGet } from '../lib/asyncChrome';

// 初期化
(async() => {
    await chrome.action.disable(); //初期は無効にする
})();
let currentTabId: number = NaN;
let currentTabTitle: string = '';
let currentTabUrl: string = '';
let currentVideoState: 'notYouTube' | 'vgetNotFound' | 'vgetDoesntHaveStartTime' | 'vgetHasStartTime' = 'notYouTube';
let currentVideoStartTime: number = NaN;

// タブの選択が切り替わった時に発火 (タブ切り替え時、あるタブが消されて別のタブが前に出た時、etc...)
chrome.tabs.onHighlighted.addListener(async (highlightInfo) => {
    await chrome.action.disable(); // タブが切り替わるたびに一旦無効にする
    const [HighlightedTabId] = highlightInfo.tabIds;
    const tab = await asyncTabsGet(HighlightedTabId);
    if (tab.status === 'complete') {updateStatus()};
});

// タブがリロードされた時に発火 (新しいタブを開いた時、タブにリロードをかけた時、etc...)。ページ内のframeの数だけ飛んでくる、読み込みステータスに応じてstatusが都度飛んでくることに注意
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    await chrome.action.disable(); // タブが切り替わるたびに一旦無効にする
    if (tab.status === 'complete') { updateStatus(); }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
    // popupからのhandshakeを受け取り、resとしてtitleとurlを返す
    if (message === 'handshakeFromPopupToBackgroundForTabInfo') {
        const res = {
            tabId: currentTabId,
            tabTitle:currentTabTitle,
            tabUrl: currentTabUrl,
            videoState: currentVideoState,
            videoStartTime: currentVideoStartTime
        };
        sendResponse(res);
    }
    sendResponse(); // 特定の用途(message)以外ではとりあえず終わった事だけ返す
    return true;
});

const updateStatus = async () => {
    const [newTab]: chrome.tabs.Tab[] = await asyncTabsQuery({active: true, currentWindow:true});

    if (newTab !== undefined && newTab.status === 'complete') { // 一応ここでも完了チェック
        currentTabId = newTab.id;
        currentTabTitle = newTab.title;
        currentTabUrl = newTab.url;
        currentVideoState = 'notYouTube';

        if (!currentTabUrl.includes('youtube.com/watch')) { // youtubeのビデオ再生ページではない(notYouTube)
            return //何もしない(=disableのまま)
        }
        // ToDo: vget-APIにvideoIDで問い合わせ、stateを切り替える
        // 1. vget-APIに存在しない(vgetNotFound)
        // 2. 存在するがstartTimeの情報がない(vgetDoesntHaveStartTime)
        // 3. 存在しstartTimeの情報がある(vgetHasStartTime)
        currentVideoState = 'vgetHasStartTime';
        currentVideoStartTime = 15;

        // タブの読み込みが完了して初めて有効化&アイコン活性化する
        await asyncSetIcon({path: "icon32_able.png", tabId: currentTabId});
        await chrome.action.enable();
    }

}

export {}