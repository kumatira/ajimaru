import { asyncTabsQuery, asyncSetIcon, asyncTabsGet, asyncTabsSendMessageWith, asyncRuntimeSendMessage } from '../lib/asyncChrome';

const resetProperties = ():void => {
    currentTabId = NaN;
    currentTabTitle = undefined;
    currentTabUrl = undefined;
    currentVideoId = undefined;
    currentVideoTitle = undefined;
    currentVideoState = 'notYouTube';
    currentVideoStartTime  = NaN;
}

const isYouTubeVideoUrl = (url:URL):boolean => {
    if (url.host !== 'www.youtube.com') {
        return false
    }
    if (url.pathname !== '/watch') {
        return false
    }
    if (!url.searchParams.has('v')) {
        return false
    }
    return true
}

//ContentScriptが読み込まれているか確認し、いなければインサートする
const checkAndInsertContentScript = async (targetTabId):Promise<undefined> => {
    try {
        await asyncTabsSendMessageWith(targetTabId, {type: 'handshakeFromBackgroundToContent'});
        return
    } catch (error) {
        if (error === 'ReceiverDoesNotExist') { // content.jsが読み込まれておらずメッセージの送り先がない時は、content.jsを読み込んだ上で呼び直す
            await chrome.scripting.executeScript({
                target: {tabId: targetTabId, frameIds: [0]},
                files: ['content.js'],
            });
            return
        }
        console.log(error);
    }
}

interface VGetVideo {
    readonly ResultSet: {
        apiVersion: string,
        videos:{
            readonly id: string;
            readonly title: string;
            readonly tags?: string[];
        }[]
    }
}

const getVGetVideoInfo = async (youTubeVideoId:string):Promise< VGetVideo | undefined > => {
    const query = new URLSearchParams({videoId: `YT_V_${youTubeVideoId}`})
    try {
        const res = await fetch('https://api-development.vget.dev/v1/videos?' + query); // GET
        if (res.ok) {
            return res.json()
        } else {
            return undefined
        }
    } catch (e: any) {
        console.log(e);
        return undefined;
    }
}

// 初期化
let currentTabId: number;
let currentTabTitle: string | undefined;
let currentTabUrl: URL | undefined;
let currentVideoId: string | undefined;
let currentVideoTitle: string | undefined;
let currentVideoState: 'notYouTube' | 'vgetNotFound' | 'vgetDoesntHaveStartTime' | 'vgetHasStartTime';
let currentVideoStartTime: number;
resetProperties();

chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
    // popupからのhandshakeを受け取り、resとしてtitleとurlを返す
    if (message === 'handshakeFromPopupToBackgroundForTabInfo') {
        const res = {
            tabId: currentTabId,
            tabTitle:currentTabTitle,
            tabUrl: currentTabUrl,
            videoId: currentVideoId,
            videoTitle: currentVideoTitle,
            videoState: currentVideoState,
            videoStartTime: currentVideoStartTime
        };
        sendResponse(res);
        return true;
    }
    console.log(`ReceivedMessage: ${message}`);
    sendResponse(); // 特定の用途(message)以外ではとりあえず終わった事だけ返す
    return true;
});

// タブの選択が切り替わった時に発火 (タブ切り替え時、あるタブが消されて別のタブが前に出た時、etc...)
chrome.tabs.onHighlighted.addListener(async (highlightInfo) => {
    const [highlightedTabId] = highlightInfo.tabIds;
    const tab = await asyncTabsGet(highlightedTabId);
    if (tab.status === 'complete') {
        updateStatus('onHighlighted', tab)
    }else {
        // status: completeのonUpdateイベント(=load完了)を待つ
    }
});

// タブ内frameに何らかの変更があったときに発火(status:loading, complete と title:hogeを拾う)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.hasOwnProperty('audible') || changeInfo.hasOwnProperty('favIconUrl')) { return }

    const [current] = (await chrome.history.search({text: '', maxResults: 1}));
    if (tab.url !== current.url) {
        return
    }
    if (changeInfo.hasOwnProperty('status') && changeInfo.status === 'loading') {
        return
    }
    if (changeInfo.hasOwnProperty('status') && changeInfo.status === 'complete') {
        updateStatus('onUpdated:status:complete', tab);
        return
    }
    if (changeInfo.hasOwnProperty('title')) {
        updateStatus('onUpdated:title', tab);
        return
    }
});

const updateStatus = async (triggerEvent, tab) => {
    currentTabId = tab.id;
    currentTabTitle = tab.title;
    currentTabUrl = new URL(tab.url);
    currentVideoId = undefined;
    await asyncSetIcon({path: "icon32_disable.png", tabId: currentTabId});

    if (!isYouTubeVideoUrl(currentTabUrl)) {
        currentVideoState = 'notYouTube';
        currentVideoTitle = undefined;
    } else {
        await checkAndInsertContentScript(currentTabId);
        currentVideoId = currentTabUrl.searchParams.get('v');
        const vgetVideoInfo = (await getVGetVideoInfo(currentVideoId))?.ResultSet.videos[0];

        if (vgetVideoInfo === undefined) { //見つからなかった
            currentVideoState = 'vgetNotFound';
            currentVideoTitle = undefined;
            currentVideoStartTime = NaN;
        } else if (vgetVideoInfo.hasOwnProperty('tags') && vgetVideoInfo.tags.some(tag => tag.startsWith('startTime:'))) {
            currentVideoState = 'vgetHasStartTime';
            currentVideoTitle = vgetVideoInfo.title;
            const startTimeTag = vgetVideoInfo.tags.find(tag => tag.startsWith('startTime:'));
            currentVideoStartTime = Number(startTimeTag.split(':')[1]);
            await asyncSetIcon({path: "icon32_able.png", tabId: currentTabId});
        } else {  //タグが一つもない or startTimeタグが付いてなかった
            currentVideoState = 'vgetDoesntHaveStartTime';
            currentVideoTitle = vgetVideoInfo.title;
            currentVideoStartTime = NaN;
        }
    }
    // 更新があったことをpopupに通知する
    try {
        await asyncRuntimeSendMessage('handshakeFromBackgroundToPopupForRefreshCollectTabInfo');
    } catch (error) {
        if (error === 'ReceiverDoesNotExist') { // Receiver = メッセージを受け取るポップアップが開かれていない
            // 無視する
        }
        console.log(error);
    }
    console.log(`
    currentTabId: ${currentTabId}
    currentTabTitle: ${currentTabTitle}
    currentTabUrl: ${currentTabUrl}
    currentVideoId: ${currentVideoId}
    currentVideoTitle: ${currentVideoTitle}
    currentVideoState: ${currentVideoState}
    `);
}

console.clear();
console.log('background.js loaded!');

export {}