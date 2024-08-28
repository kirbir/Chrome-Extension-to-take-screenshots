console.log('Hello World from the background script!');

chrome.action.onClicked.addListener((tab) => {
  // Check if the URL is a chrome:// URL
  if (tab.url.startsWith('chrome://')) {
    console.log('Cannot inject script into chrome:// pages');
    return;
  }

  // Check if we can send a message to the tab
  chrome.tabs.sendMessage(tab.id, { action: "ping" }, response => {
    if (chrome.runtime.lastError) {
      // If there's an error, inject the content script
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['pages/Content/index.js']
      }).then(() => {
        // After injection, try sending the message again
        chrome.tabs.sendMessage(tab.id, { action: "showMessage" });
      }).catch(err => {
        console.error('Failed to inject content script:', err);
      });
    } else {
      // Content script is ready, send the actual message
      chrome.tabs.sendMessage(tab.id, { action: "showMessage" });
    }
  });
});
