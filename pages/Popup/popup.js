document.getElementById('capture-btn').addEventListener('click', captureScreenshot);
document.getElementById('save-btn').addEventListener('click', saveScreenshot);

function captureScreenshot() {
  chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(dataUrl) {
    // Display the screenshot on the canvas
    const canvas = document.getElementById('screenshot-canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      canvas.style.display = 'block';
      document.getElementById('emoji-selector').style.display = 'block';
      document.getElementById('save-btn').style.display = 'block'; // Add this line
      setupEmojiSelector(); // Add this line
    };
    img.src = dataUrl;
  });
}

// Add these new functions

function setupEmojiSelector() {
  const emojiButtons = document.querySelectorAll('.emoji');
  emojiButtons.forEach(button => {
    button.addEventListener('click', function() {
      const selectedEmoji = this.getAttribute('data-emoji');
      const selectedSize = document.getElementById('emoji-size').value;
      enableEmojiPlacement(selectedEmoji, selectedSize);
    });
  });
}

function enableEmojiPlacement(emoji, size) {
  const canvas = document.getElementById('screenshot-canvas');
  canvas.style.cursor = 'crosshair';
  
  canvas.onclick = function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    placeEmojiOnCanvas(emoji, x, y, size);
    canvas.onclick = null;
    canvas.style.cursor = 'default';
  };
}

function placeEmojiOnCanvas(emoji, x, y, size) {
  const canvas = document.getElementById('screenshot-canvas');
  const ctx = canvas.getContext('2d');
  
  // Set font size based on the selected size
  ctx.font = `${size}px Arial`;
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.fillText(emoji, x, y);
}

// Add this new function
function saveScreenshot() {
  const canvas = document.getElementById('screenshot-canvas');
  
  // Convert canvas to blob
  canvas.toBlob(function(blob) {
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.download = 'emoji_screenshot.png';
    link.href = url;
    link.click();
    
    // Clean up the temporary URL
    URL.revokeObjectURL(url);
  }, 'image/png');
}

// Optional: Add a function to share the screenshot
function shareScreenshot() {
  const canvas = document.getElementById('screenshot-canvas');
  
  canvas.toBlob(function(blob) {
    const file = new File([blob], "emoji_screenshot.png", { type: "image/png" });
    const shareData = {
      files: [file],
    };
    
    if (navigator.share && navigator.canShare(shareData)) {
      navigator.share(shareData)
        .then(() => console.log('Shared successfully'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
      console.log('Web Share API not supported');
      // Fallback to save functionality
      saveScreenshot();
    }
  }, 'image/png');
}

// Existing comment (you can remove this if you want)
// Add function to save or share the modified image

document.getElementById('drag-capture-btn').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ['pages/Content/index.js']
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Script injection failed:', chrome.runtime.lastError.message);
      } else {
        chrome.tabs.sendMessage(tabs[0].id, {action: "prepareDragCapture"}, (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
          } else {
            console.log("Message sent successfully");
            window.close(); // Close the popup to allow interaction with the page
          }
        });
      }
    });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "dragCaptureComplete") {
    console.log("Captured area:", request.area);
    captureScreenshotArea(request.area);
  }
});

function captureScreenshotArea(area) {
  chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(dataUrl) {
    const canvas = document.getElementById('screenshot-canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = function() {
      canvas.width = area.width;
      canvas.height = area.height;
      ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
      canvas.style.display = 'block';
      document.getElementById('emoji-selector').style.display = 'block';
      document.getElementById('save-btn').style.display = 'block';
      setupEmojiSelector();
    };
    img.src = dataUrl;
  });
}
