import { asyncTabsQuery, asyncSetIcon, asyncTabsGet, asyncTabsSendMessageWith } from '../lib/asyncChrome';

const resetProperties = ():void => {
    currentTabId = NaN;
    currentTabTitle = undefined;
    currentTabUrl = undefined;
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
    console.log('checkAndInsertContentScript()');
    try {
        await asyncTabsSendMessageWith(targetTabId, {type: 'handshakeFromBackgroundToContent'});
        return
    } catch (error) {
        console.log(error);
        if (error === 'ReceiverDoesNotExist') { // content.jsが読み込まれておらずメッセージの送り先がない時は、content.jsを読み込んだ上で呼び直す
            await chrome.scripting.executeScript({
                target: {tabId: targetTabId, frameIds: [0]},
                files: ['content.js'],
            });
            return
        }
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
        console.log(res);
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
            videoTitle: currentVideoTitle,
            videoState: currentVideoState,
            videoStartTime: currentVideoStartTime
        };
        sendResponse(res);
        console.log(res);
        return true;
    }
    console.log(message);
    sendResponse(); // 特定の用途(message)以外ではとりあえず終わった事だけ返す
    return true;
});

// タブの選択が切り替わった時に発火 (タブ切り替え時、あるタブが消されて別のタブが前に出た時、etc...)
chrome.tabs.onHighlighted.addListener(async (highlightInfo) => {
    const [highlightedTabId] = highlightInfo.tabIds;
    const tab = await asyncTabsGet(highlightedTabId);
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
    if (tab.url !== current.url) {
        return
    }
    if (changeInfo.hasOwnProperty('status') && changeInfo.status === 'loading') {
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

const updateStatus = async (triggerEvent) => {
    const [newTab]: chrome.tabs.Tab[] = await asyncTabsQuery({active: true, currentWindow:true});
    currentTabId = newTab.id;
    currentTabTitle = newTab.title;
    currentTabUrl = new URL(newTab.url);
    console.log(`update by ${triggerEvent}`, currentTabUrl);
    await asyncSetIcon({path: "icon32_disable.png", tabId: currentTabId});

    if (!isYouTubeVideoUrl(currentTabUrl)) {
        currentVideoState = 'notYouTube';
        currentVideoTitle = undefined;
    } else {
        await checkAndInsertContentScript(currentTabId);
        const videoId = currentTabUrl.searchParams.get('v');
        const vgetVideoInfo = (await getVGetVideoInfo(videoId)).ResultSet.videos[0];
        console.log(vgetVideoInfo);

        if (vgetVideoInfo === undefined) {
            currentVideoState = 'vgetNotFound';
            currentVideoTitle = undefined;
            currentVideoStartTime = NaN;
        } else if (!vgetVideoInfo.tags.some(tag => tag.startsWith('startTime:'))) {
            currentVideoState = 'vgetDoesntHaveStartTime';
            currentVideoTitle = vgetVideoInfo.title;
            currentVideoStartTime = NaN;
        } else {
            currentVideoState = 'vgetHasStartTime';
            currentVideoTitle = vgetVideoInfo.title;
            const startTimeTag = vgetVideoInfo.tags.find(tag => tag.startsWith('startTime:'));
            currentVideoStartTime = Number(startTimeTag.split(':')[1]);
            await asyncSetIcon({path: "icon32_able.png", tabId: currentTabId});
        }
    }

    console.log(`
    currentTabId: ${currentTabId}
    currentTabTitle: ${currentTabTitle}
    currentTabUrl: ${currentTabUrl}
    currentVideoTitle: ${currentVideoTitle}
    currentVideoState: ${currentVideoState}
    `);
}

console.clear();
console.log('background.js loaded!');

export {}