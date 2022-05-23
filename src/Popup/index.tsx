import React, { useState, useEffect } from 'react'
import {asyncTabsGet, asyncRuntimeSendMessage, asyncTabsSendMessageWith } from '../lib/asyncChrome';
import { NotYouTubeDiv, StartTimeRegisteredDiv } from './mainDiv';

const Popup: React.FC = () => {
    const [tabId, setTabId] = useState<number>(NaN);
    const [tabUrl, setTabUrl] = useState<string|undefined>( undefined );
    const [videoTitle, setVideoTitle] = useState<string|undefined>( 'title' );
    const [videoState, setVideoState] = useState<string|undefined>( undefined );
    const [videoStartTime, setVideoStartTime] = useState<number>(NaN);
    const [mainDiv, setMainDiv] = useState< JSX.Element>(<NotYouTubeDiv/>);

    // backgroundにhandshakeを送り、resとして各情報を受け取る
    const collectTabInfo = async () =>{
        const res = await asyncRuntimeSendMessage('handshakeFromPopupToBackgroundForTabInfo');
        setTabId(res.tabId)
        setTabUrl(res.tabUrl);
        setVideoTitle(res.videoTitle)
        setVideoStartTime(res.videoStartTime);
        setVideoState(res.videoState);
    };

    // 第二引数が[] = いずれのstateの変化にも反応せずロード時の一回のみ走る (stateが変わるたびにモジュール全体がレンダーされるreactの性質に注意)
    useEffect(() => {
        collectTabInfo();
    }, [])

    useEffect(() => {
        asyncRuntimeSendMessage('videoStateChanged');
        if (tabId === NaN || videoTitle === undefined || tabUrl === undefined || videoStartTime === NaN) {
            setMainDiv(<NotYouTubeDiv/>)
        } else {
            switch (videoState) {
                case 'notYouTube':
                    setMainDiv(<NotYouTubeDiv/>)
                    break;
                default:
                    setMainDiv(<StartTimeRegisteredDiv tabId={tabId} videoTitle={videoTitle} url={tabUrl} startTime={videoStartTime} />)
                    break;
            }
        }
        console.log(mainDiv);
    }, [videoState])

    return (
        <div style={{width: '200px'}}>
            {videoState}
            {mainDiv}
        </div>
    );

}

export default Popup;