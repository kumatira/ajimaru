import { asyncTabsQuery, asyncSetIcon, asyncTabsGet, asyncTabsSendMessageWith } from '../lib/asyncChrome';

const resetProperties = ():void => {
    currentTabId = NaN;
    currentTabTitle = undefined;
    currentTabUrl = undefined;
    currentVideoTitle = undefined;
    currentVideoState = 'notYouTube';
    currentVideoStartTime  = NaN;
}

const isYTVideoUrl = (url:string):boolean => {
    return url.includes('https://www.youtube.com/watch')
}

// 初期化
(async() => {
    await chrome.action.disable(); //初期は無効にする
})();
let currentTabId: number;
let currentTabTitle: string | undefined;
let currentTabUrl: string | undefined;
let currentVideoTitle: string | undefined;
let currentVideoState: 'notYouTube' | 'vgetNotFound' | 'vgetDoesntHaveStartTime' | 'vgetHasStartTime';
let currentVideoStartTime: number;
resetProperties();

// タブの選択が切り替わった時に発火 (タブ切り替え時、あるタブが消されて別のタブが前に出た時、etc...)
chrome.tabs.onHighlighted.addListener(async (highlightInfo) => {
    await chrome.action.disable(); // タブが切り替わるたびに一旦無効にする
    const [highlightedTabId] = highlightInfo.tabIds;
    const tab = await asyncTabsGet(highlightedTabId);

    if (!isYTVideoUrl(tab.url)) { return }
    if (tab.status === 'complete') {
        updateStatus('onHighlighted')
    }else {
        // status: completeのonUpdateイベント(=load完了)を待つ
    }
});

// タブ内frameに何らかの変更があったときに発火(status:loading, complete と title:hogeを拾う)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.hasOwnProperty('audible') || changeInfo.hasOwnProperty('favIconUrl')) { return }
    const [current] = (await chrome.history.search({text: '', maxResults: 1}));


    if (!isYTVideoUrl(tab.url) || tab.url !== current.url) {
        await chrome.action.disable();
        return
    }

    if (changeInfo.hasOwnProperty('status') && changeInfo.status === 'loading') {
        await chrome.action.disable();
        return
    }

    if (changeInfo.hasOwnProperty('status') && changeInfo.status === 'complete') {
        updateStatus('onUpdated:status:complete');
        return
    }

    if (changeInfo.hasOwnProperty('title')) {
        updateStatus('onUpdated:title');
        return
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
    // popupからのhandshakeを受け取り、resとしてtitleとurlを返す
    if (message === 'handshakeFromPopupToBackgroundForTabInfo') {
        const res = {
            tabId: currentTabId,
            tabTitle:currentTabTitle,
            tabUrl: currentTabUrl,
            videoTitle: currentVideoTitle,
            videoState: currentVideoState,
            videoStartTime: currentVideoStartTime
        };
        sendResponse(res);
        return true;
    }
    console.log(message);
    sendResponse(); // 特定の用途(message)以外ではとりあえず終わった事だけ返す
    return true;
});

const updateStatus = async (triggerEvent) => {
    const [newTab]: chrome.tabs.Tab[] = await asyncTabsQuery({active: true, currentWindow:true});
    currentTabId = newTab.id;
    currentTabTitle = newTab.title;
    currentTabUrl = newTab.url;
    currentVideoState = 'notYouTube';

    // ToDo: vget-APIにvideoIDで問い合わせ、stateを切り替える
    // 1. vget-APIに存在しない(vgetNotFound)
    // 2. 存在するがstartTimeの情報がない(vgetDoesntHaveStartTime)
    // 3. 存在しstartTimeの情報がある(vgetHasStartTime)
    currentVideoState = 'vgetHasStartTime';
    currentVideoStartTime = 15;

    console.log(`update by ${triggerEvent}`, currentTabUrl);

    try {
        const res = await asyncTabsSendMessageWith(currentTabId, {type: 'handshakeFromBackgroundToContentForVideoTitle'});
        currentVideoTitle = res.videoTitle;
    } catch (error) {
        if (error === 'ReceiverDoesNotExist') { // content.jsが読み込まれておらずメッセージの送り先がない時は、content.jsを読み込んだ上で呼び直す
            await chrome.scripting.executeScript({
                target: {tabId: currentTabId, frameIds: [0]},
                files: ['content.js'],
            });
            const res = await asyncTabsSendMessageWith(currentTabId, {type: 'handshakeFromBackgroundToContentForVideoTitle'});
            if (res.videoTitle !== undefined) {
                currentVideoTitle = res.videoTitle;
            }
        }
    }

    console.log(`
    currentTabId: ${currentTabId}
    currentTabTitle: ${currentTabTitle}
    currentTabUrl: ${currentTabUrl}
    currentVideoTitle: ${currentVideoTitle}
    currentVideoState: ${currentVideoState}
    `);

    // タブの読み込みが完了して初めて有効化&アイコン活性化する
    await asyncSetIcon({path: "icon32_able.png", tabId: currentTabId});
    await chrome.action.enable();
}

console.clear();
console.log('background.js loaded!');

export {}