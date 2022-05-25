import React, { useState, useEffect } from 'react'
import { asyncRuntimeSendMessage } from '../lib/asyncChrome';
import { NotYouTubeDiv, VideoNotFoundDiv, StartTimeUnregisteredDiv, StartTimeRegisteredDiv, ErrorDiv } from './mainDiv';

const Popup: React.FC = () => {
    const [tabId, setTabId] = useState<number>(NaN);
    const [tabUrl, setTabUrl] = useState<string|undefined>( undefined );
    const [videoId, setVideoId] = useState<string|undefined>( undefined );
    const [videoTitle, setVideoTitle] = useState<string|undefined>( undefined );
    const [videoState, setVideoState] = useState<string|undefined>( undefined );
    const [videoStartTime, setVideoStartTime] = useState<number>(NaN);
    const [mainDiv, setMainDiv] = useState< JSX.Element>(<NotYouTubeDiv/>);

    // backgroundにhandshakeを送り、resとして各情報を受け取る
    const collectTabInfo = async () =>{
        const res = await asyncRuntimeSendMessage('handshakeFromPopupToBackgroundForTabInfo');
        setTabId(res.tabId)
        setTabUrl(res.tabUrl);
        setVideoId(res.videoId);
        setVideoTitle(res.videoTitle)
        setVideoStartTime(res.videoStartTime);
        setVideoState(res.videoState);
    };

    // 第二引数が[] = いずれのstateの変化にも反応せずロード時の一回のみ走る (stateが変わるたびにモジュール全体がレンダーされるreactの性質に注意)
    useEffect(() => {
        collectTabInfo();
    }, [])

    useEffect(() => {
        switch (videoState) {
            case 'notYouTube':
                setMainDiv(<NotYouTubeDiv/>)
                break;
            case 'vgetNotFound':
                if (videoId !== undefined) {
                    setMainDiv(<VideoNotFoundDiv videoId={videoId}/>)
                } else {
                    setMainDiv(<ErrorDiv/>)
                }
                break;
            case 'vgetDoesntHaveStartTime':
                if (videoId !== undefined) {
                    setMainDiv(<StartTimeUnregisteredDiv videoId={videoId}/>)
                } else {
                    setMainDiv(<ErrorDiv/>)
                }
                break;
            case 'vgetHasStartTime':
                if (tabId !== NaN && videoTitle !== undefined && tabUrl !== undefined && videoStartTime !== NaN) {
                    setMainDiv(<StartTimeRegisteredDiv tabId={tabId} videoTitle={videoTitle} url={tabUrl} startTime={videoStartTime} />)
                } else {
                    setMainDiv(<ErrorDiv/>)
                }
                break;
            default:
                setMainDiv(<ErrorDiv/>)
                break;
        }
    }, [videoState])

    return (
        <div>
            {mainDiv}
        </div>
    );

}

export default Popup;