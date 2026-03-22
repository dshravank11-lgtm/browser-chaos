console.log('background');

chrome.runtime.onInstalled.addListener(() => {
    console.log('installed');
    chrome.storage.local.get(['chaosInterval'], (result)=> {
        const mins = result.chaosInterval || 5;
        chrome.alarms.create("chaosAlarm", {periodInMinutes: mins});
        console.log('alarm created with interval:', mins);
    });
});

chrome.alarms.onAlarm.addListener((alarm)=> {
    if (alarm.name === "chaosAlarm"){
        console.log('chaos alarmed');
        chrome.tabs.query({}, (tabs)=> {
            tabs.forEach(tab=> {
                if (tab.id){
                    chrome.tabs.sendMessage(tab.id, { action: "skull" })
                        .catch(err => console.log('could not send to tab:', tab.id));
                }
            });
        });
    }
});
