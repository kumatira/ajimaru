import {asyncTabsGet, asyncTabsSendMessageWith } from '../lib/asyncChrome';
import { Button, Box } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';

const JumpButton: React.FC<{ tabId: number; startTime: number}> = (props) => {
    const jump = async ()=>{
        const tab = await asyncTabsGet(props.tabId);
        if (tab.status !== 'complete') { return };
        await asyncTabsSendMessageWith(props.tabId, {type: 'messageToContentFromPopupForJumping', startTime: props.startTime});
    }
    return (
        <button onClick={async () => await jump()}>Jump to {props.startTime}s</button>
    );
}

export const NotYouTubeDiv: React.FC<{}> = (props) => {
    return (
        <div>
            <small>{chrome.i18n.getMessage('not_YouTube_div_note')}</small>
            <Box textAlign='center'>
                <Button variant="outlined" size="small" target="_blank" href='https://www.youtube.com/results?search_query=VTuber&sp=CAI%253D' startIcon={<YouTubeIcon />}>
                    Go VTuber Streams!
                </Button>
            </Box>
        </div>
    );
}

export const VideoNotFoundDiv: React.FC<{}> = (props) => {
    return (
        <p>VideoNotFoundDiv</p>
    );
}

export const StartTimeUnregisteredDiv: React.FC<{}> = (props) => {
    return (
        <p>StartTimeUnregisteredDiv</p>
    );
}

export const StartTimeRegisteredDiv: React.FC<{tabId: number; videoTitle:string, url: string, startTime: number}> = (props) => {
    return (
        <div>
            <p>tabId: {props.tabId}</p>
            <p>title: {props.videoTitle}</p>
            <p>url: {props.url}</p>
            <p>startTime: {props.startTime}</p>
            <JumpButton tabId={props.tabId} startTime={props.startTime}></JumpButton>
        </div>
    );
}

export const ErrorDiv: React.FC<{}> = (props) => {
    return (
        <p>something wrong...</p>
    );
}