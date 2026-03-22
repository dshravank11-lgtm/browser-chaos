console.log('popup loaded')
document.getElementById('save').onclick = ()=> {
    let mins = parseFloat(document.getElementById('mins').value);
    
    if (isNaN(mins) || mins < 1){
        mins = 5;
    }
    
    mins = Math.floor(mins);
    
    chrome.alarms.create("chaosAlarm", {periodInMinutes: mins});
    chrome.storage.local.set({chaosInterval: mins});
    
    document.getElementById('status').innerHTML = ` timer set for ${mins} mins`;
    setTimeout(()=> {
        document.getElementById('status').innerHTML = '';
    }, 2000);
};

document.getElementById('instantSkull').onclick = ()=> {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = ' sending skull... ';
    
    chrome.tabs.query({active: true, currentWindow: true},(tabs)=> {
        if (tabs[0] && tabs[0].id) {
            console.log('sending to tab:', tabs[0].id);
            
            chrome.tabs.sendMessage(tabs[0].id, {action: "instantSkull"},(response)=> {
                if (chrome.runtime.lastError){
                    console.error('error:',chrome.runtime.lastError);
                    statusDiv.innerHTML = ' error! refresh the page and try again ';
                    setTimeout(() => {
                        statusDiv.innerHTML = '';
                    }, 3000);
                }else{
                    console.log('sent successfully', response);
                    statusDiv.innerHTML = ' Skull in 3 seconds! ';
                    setTimeout(() => {
                        statusDiv.innerHTML = '';
                    }, 3000);
                }
            });
        } else {
            statusDiv.innerHTML = ' no active tab found! ';
            setTimeout(() => {
                statusDiv.innerHTML = '';
            }, 2000);
        }
    });
};

chrome.storage.local.get(['chaosInterval'],(result)=> {
    if (result.chaosInterval) {
        document.getElementById('mins').value = result.chaosInterval;
    }
});
