import React, { useState, useEffect } from 'react'

const Popup: React.FC = () => {
    const [currentTitle, setCurrentTitle] = useState('aa');
    const [currentUrl, setCurrentUrl] = useState('aa');
    // backgroundにhandshakeを送り、resとしてtitleとurlを受け取る
    chrome.runtime.sendMessage('handshakeToBackgroundFromPopup', (response)=>{
        setCurrentTitle(response.title);
        setCurrentUrl(response.url);
    });

    return (
        <div style={{width: '200px'}}>
            <p>title: {currentTitle}</p>
            <p>url: {currentUrl}</p>
        </div>
    );
}

export default Popup;