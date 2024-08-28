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

let dragCaptureData = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "prepareDragCapture") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, request);
    });
    return false; // We don't need to keep the message channel open here
  }
  
  if (request.action === "dragCaptureComplete") {
    dragCaptureData = request.area;
    chrome.action.openPopup(); // Reopen the popup
    return false;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getDragCaptureData") {
    sendResponse(dragCaptureData);
    dragCaptureData = null; // Clear the data after sending
    return false;
  }
});
