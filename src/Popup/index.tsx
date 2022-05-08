import React, { useState, useEffect } from 'react'
import {asyncTabsGet, asyncRuntimeSendMessage, asyncTabsSendMessageWith } from '../lib/asyncChrome';

const JumpButton: React.FC<{ tabId: number; startTime: number}> = (props) => {
    const jump = async ()=>{
        const tab = await asyncTabsGet(props.tabId);
        if (tab.status !== 'complete') { return };
        await asyncTabsSendMessageWith(props.tabId, {type: 'handshakeToContentFromPopupJump', startTime: props.startTime});
    }
    return (
        <button onClick={async () => await jump()}>Jump to {props.startTime}s</button>
    );
}

const Popup: React.FC = () => {
    const [tabId, setTabId] = useState<number>(NaN);
    const [tabUrl, setTabUrl] = useState<string|undefined>( undefined );
    const [videoTitle, setVideoTitle] = useState<string|undefined>( 'title' );
    const [videoState, setVideoState] = useState<string|undefined>( undefined );
    const [videoStartTime, setVideoStartTime] = useState<number>(NaN);

    // backgroundにhandshakeを送り、resとして各情報を受け取る
    const collectTabInfo = async () =>{
        const res = await asyncRuntimeSendMessage('handshakeFromPopupToBackgroundForTabInfo');

        setTabId(res.tabId)
        setTabUrl(res.tabUrl);
        setVideoState(res.videoState);
        setVideoStartTime(res.videoStartTime);
    };

    const collectVideoTitle = async () =>{
        if (Number.isNaN(tabId)) { return }
        const tab = await asyncTabsGet(tabId);
        if (tab.status !== 'complete') {return };

        // contentにhandshakeを送り、resとしてビデオのtitleを受け取る
        const res = await asyncTabsSendMessageWith(tabId, {type: 'handshakeToContentFromPopupForVideoTitle'});
        setVideoTitle(res.videoTitle)
    }

    // 第二引数が[] = いずれのstateの変化にも反応せずロード時の一回のみ走る (stateが変わるたびにモジュール全体がレンダーされるreactの性質に注意)
    useEffect(() => {
        collectTabInfo();
    }, [])

    useEffect(() => {
        collectVideoTitle();
    }, [tabId])

    return (
        <div style={{width: '200px'}}>
            <p>tabId: {tabId}</p>
            <p>title: {videoTitle}</p>
            <p>url: {tabUrl}</p>
            <JumpButton tabId={tabId} startTime={videoStartTime}></JumpButton>
        </div>
    );
}

export default Popup;