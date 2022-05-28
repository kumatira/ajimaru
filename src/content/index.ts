chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
    // backgroundからのhandshakeを受け取り、存在確認に応答する
    if (message.type === 'handshakeFromBackgroundToContent') {
        sendResponse();
        return true;
    }

    // popupからのmessageを受け取り、ビデオをジャンプさせる
    if (message.type === 'messageToContentFromPopupForJumping') {
        let video = document.getElementsByClassName('html5-main-video')[0] as any;
        video.currentTime = message.startTime;
        sendResponse();
        return true;
    }
    console.log(`ReceivedMessage: ${message}`);
    sendResponse(); // 特定の用途(message)以外ではとりあえず終わった事だけ返す
    return true;
});

export {}