console.log('background');

chrome.runtime.onInstalled.addListener(()=> {
    console.log('installed');
    chrome.storage.local.get(['chaosInterval'], (result)=> {
        const mins = result.chaosInterval || 5;
        chrome.alarms.create("chaosAlarm", { periodInMinutes: mins });
        console.log('alarm created with interval:', mins);
    });
});

chrome.alarms.onAlarm.addListener((alarm)=> {
    if (alarm.name === "chaosAlarm") {
        console.log('chaos alarmed');
        chrome.tabs.query({}, (tabs)=> {
            tabs.forEach(tab => {
                if (tab.id) {
                    chrome.tabs.sendMessage(tab.id, {action: "skull"})
                        .catch(err=> console.log('could not send to tab:', tab.id));
                }
            });
        });
    }
});

const weirdTitles = [
  "Windows Update In Progress...",
  "VIRUS DETECTED - Action Required",
  "Why did the chicken cross the road?",
  "1 unread message from Mom",
  "Your PC is infected with 47 viruses",
  "FREE ROBUX CLICK HERE",
  "FBI surveillance van detected nearby",
  "Your webcam has been accessed",
  "free vbucks 2022 no verification",
  "wlecome back to my minecraft channel",
];

setInterval(function() {
  chrome.tabs.query({}, function(tabs) {
    const backgroundTabs = tabs.filter(tab => !tab.active);
    if (backgroundTabs.length === 0) return;
    if (Math.random() > 0.3) return;

    const tab = backgroundTabs[Math.floor(Math.random() * backgroundTabs.length)];
    const title = weirdTitles[Math.floor(Math.random() * weirdTitles.length)];

    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: (t)=> { document.title = t; },
      args: [title]
    }).catch(err=> console.log('script failed,', tab.id, err));
  });
}, 30 * 1000);
