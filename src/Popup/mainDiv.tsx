import {asyncTabsGet, asyncTabsSendMessageWith } from '../lib/asyncChrome';
import { Button, Box, createTheme, ThemeProvider } from '@mui/material';
import { YouTube, PostAdd} from '@mui/icons-material';
// import YouTubeIcon from '@mui/icons-material/YouTube';
// import PostAddIcon from '@mui/icons-material/PostAdd';

const youTubeTheme = createTheme({
    palette: {
        primary: {
            main: '#FF0000',
        },
    },
});

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
            <ThemeProvider theme={youTubeTheme}>
                <small>{chrome.i18n.getMessage('not_YouTube_div_note')}</small>
                <Box textAlign='center'>
                    <Button
                        variant="outlined"
                        size="small"
                        target="_blank"
                        href='https://www.youtube.com/results?search_query=VTuber&sp=CAI%253D'
                        color="primary"
                        startIcon={< YouTube />} >
                        Go VTuber Streams!
                    </Button>
                </Box>
            </ThemeProvider>
        </div>
    );
}

export const VideoNotFoundDiv: React.FC<{videoId:string}> = (props) => {
    return (
        <div>
            <p>{chrome.i18n.getMessage('video_not_found_div_message')}</p>
            <Box textAlign='center'>
                    <Button
                        variant="outlined"
                        size="small"
                        target="_blank"
                        href={chrome.i18n.getMessage('form_link', props.videoId)}
                        color="primary"
                        endIcon={<PostAdd />} >
                        {chrome.i18n.getMessage('form_post_button')}
                    </Button>
                </Box>
        </div>
    );
}

export const StartTimeUnregisteredDiv: React.FC<{videoId:string}> = (props) => {
    return (
        <div>
            <p>{chrome.i18n.getMessage('start_time_unregistered_div_message')}</p>
            <Box textAlign='center'>
                    <Button
                        variant="outlined"
                        size="small"
                        target="_blank"
                        href={chrome.i18n.getMessage('form_link', props.videoId)}
                        color="primary"
                        endIcon={<PostAdd />} >
                        {chrome.i18n.getMessage('form_post_button')}
                    </Button>
                </Box>
        </div>
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