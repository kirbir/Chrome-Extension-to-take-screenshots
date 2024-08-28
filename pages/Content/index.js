
console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');


let isSelecting = false;
let startX, startY, endX, endY;
let selectionBox;

function prepareDragCapture() {
  document.body.style.cursor = 'crosshair';
  
  const instructions = document.createElement('div');
  instructions.textContent = 'Click and drag to select an area';
  instructions.style.position = 'fixed';
  instructions.style.top = '10px';
  instructions.style.left = '50%';
  instructions.style.transform = 'translateX(-50%)';
  instructions.style.padding = '10px';
  instructions.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  instructions.style.color = 'white';
  instructions.style.borderRadius = '5px';
  instructions.style.zIndex = '9999';
  document.body.appendChild(instructions);

  document.addEventListener('mousedown', startDragCapture);
}

function startDragCapture(e) {
  isSelecting = true;
  startX = e.clientX;
  startY = e.clientY;
  
  selectionBox = document.createElement('div');
  selectionBox.style.position = 'fixed';
  selectionBox.style.border = '2px dashed #007bff';
  selectionBox.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
  selectionBox.style.pointerEvents = 'none';
  selectionBox.style.zIndex = '9999';
  document.body.appendChild(selectionBox);

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  document.removeEventListener('mousedown', startDragCapture);
}

function onMouseMove(e) {
  if (isSelecting) {
    endX = e.clientX;
    endY = e.clientY;
    updateSelectionBox();
  }
}

function onMouseUp() {
  isSelecting = false;
  document.body.style.cursor = 'default';
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);

  const area = {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY)
  };

  chrome.runtime.sendMessage({action: "dragCaptureComplete", area: area});
  selectionBox.remove();
  document.querySelector('div').remove(); // Remove instructions
}

function updateSelectionBox() {
  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  selectionBox.style.left = left + 'px';
  selectionBox.style.top = top + 'px';
  selectionBox.style.width = width + 'px';
  selectionBox.style.height = height + 'px';
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "prepareDragCapture") {
    prepareDragCapture();
    sendResponse({status: "Drag capture prepared"});
  }
  return true; // Keep the message channel open for asynchronous response
});
