export const asyncTabsQuery = (queryInfo:chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> => {
    return new Promise((resolve, reject)=>{
        chrome.tabs.query(
            queryInfo,
            (tab)=>{resolve(tab)}
        )
    })
}

export const asyncSetIcon = (details: chrome.action.TabIconDetails): Promise<void> => {
    return new Promise((resolve, reject) => {
        chrome.action.setIcon(
            details,
            ()=>{resolve}
        )
    })
}