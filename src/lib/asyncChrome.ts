const asyncTabsQuery = (queryInfo:chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> => {
    return new Promise((resolve, reject)=>{
        chrome.tabs.query(
            queryInfo,
            (tab)=>{resolve(tab)}
        )
    })
}

const asyncSetIcon = (details: chrome.action.TabIconDetails): Promise<void> => {
    return new Promise((resolve, reject) => {
        chrome.action.setIcon(
            details,
            ()=>{resolve()}
        )
    })
}

const asyncTabsGet = (tabId: number): Promise<chrome.tabs.Tab> => {
    return new Promise((resolve, reject) => {
        chrome.tabs.get(
            tabId,
            (tab)=>{resolve(tab)}
        )
    })
}

//特段の理由がない限りは送信先から明示的な返信を受け取った方が良いと思う
const asyncRuntimeSendMessageWithOutResponse = (message: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage( message );
        resolve();
    })
}

const asyncRuntimeSendMessage = (message: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            message,
            (res)=>{resolve(res)}
        )
    })
}

//特段の理由がない限りは送信先から明示的な返信を受け取った方が良いと思う
const asyncTabsSendMessageWithOutResponse = (tabId: number, message: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, message );
        resolve()
    })
}

const asyncTabsSendMessageWith = (tabId: number, message: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(
            tabId,
            message,
            (res)=>{
                if (res !== undefined) {
                    resolve(res);
                } else {
                    const error = chrome.runtime.lastError;
                    if (error?.message === 'Could not establish connection. Receiving end does not exist.') {
                        reject('ReceiverDoesNotExist')
                    }
                }
            }
        )
    })
}

export {
    asyncTabsQuery,
    asyncSetIcon,
    asyncTabsGet,
    asyncRuntimeSendMessageWithOutResponse,
    asyncRuntimeSendMessage,
    asyncTabsSendMessageWithOutResponse,
    asyncTabsSendMessageWith,
}
