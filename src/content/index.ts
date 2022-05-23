chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
    // backgroundからのhandshakeを受け取り、resとしてtitleを返す
    if (message.type === 'handshakeFromBackgroundToContentForVideoTitle') {
        const titleElement = document.querySelector('.title.style-scope.ytd-video-primary-info-renderer')?.firstChild as HTMLElement
        if (titleElement === undefined) {
            sendResponse({
                videoTitle: undefined
            })
            return true;
        }
        const title = titleElement.innerText
        sendResponse({
            videoTitle: title
        });
        return true;
    }

    // popupからのmessageを受け取り、ビデオをジャンプさせる
    if (message.type === 'messageToContentFromPopupForJumping') {
        let video = document.getElementsByClassName('html5-main-video')[0] as any;
        video.currentTime = message.startTime;
        sendResponse();
        return true;
    }
    // 特定の用途(message)以外ではとりあえず終わった事だけ返す
    console.log(message);
    sendResponse();
    return true;
});

export {}