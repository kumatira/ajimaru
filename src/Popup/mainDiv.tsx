import {asyncTabsGet, asyncTabsSendMessageWith } from '../lib/asyncChrome';
import { Button, Box, createTheme, ThemeProvider, Card, CardMedia, CardContent, Typography, CardActions } from '@mui/material';
import { YouTube, PostAdd, DirectionsRun} from '@mui/icons-material';
import { makeMinSecString} from '../lib/util';

const youTubeTheme = createTheme({
    palette: {
        primary: {
            main: '#FF0000',
        },
    },
});

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

export const StartTimeRegisteredDiv: React.FC<{tabId: number; videoId: string; videoTitle: string, url: string, startTime: number}> = (props) => {
    const jump = async (tabId: number, startTime: number)=>{
        const tab = await asyncTabsGet(tabId);
        if (tab.status !== 'complete') { return };
        await asyncTabsSendMessageWith(tabId, {type: 'messageToContentFromPopupForJumping', startTime: startTime});
    }
    return (
        <div>
            <Card>
                <CardMedia
                    component="img"
                    height="130"
                    image={`https://img.youtube.com/vi/${props.videoId}/hqdefault.jpg`}
                    alt="video thumbnail"
                />
                <CardContent>
                    <Typography sx={{ lineHeight: 1.2}}>
                        {props.videoTitle}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        fullWidth
                        startIcon={<DirectionsRun />}
                        onClick={() => {
                            jump(props.tabId, props.startTime);
                        }}
                    >
                        Jump to {makeMinSecString(props.startTime)}
                    </Button>
                </CardActions>
            </Card>
        </div>

    );
}

export const ErrorDiv: React.FC<{}> = (props) => {
    return (
        <p>something wrong...</p>
    );
}