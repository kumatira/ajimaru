chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
    // popupからのhandshakeを受け取り、resとしてtitleとurlを返す
    if (message.type === 'handshakeToContentFromPopupForVideoTitle') {
        const metaTagOfTitle:any = document.querySelector('meta[name="title"]')
        const title = metaTagOfTitle.content;
        sendResponse({
            videoTitle: title
        });
    }
    if (message.type === 'handshakeToContentFromPopupJump') {
        let video = document.getElementsByClassName('html5-main-video')[0] as any;
        video.currentTime = 600;
        sendResponse();
    }
    sendResponse(); // 特定の用途(message)以外ではとりあえず終わった事だけ返す
    return true;
});

export {}