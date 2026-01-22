const createTool = document.querySelector(".bottom");
const workspace = document.querySelector(".workspace");

createTool.addEventListener('click',(ele)=>{ // event delegation/bubbling to create element
    if(ele.target.id === "add-rect"){
        return Rectangle();
    }
    else if(ele.target.id === "add-text"){
        return textBox();
    }
});

let rectCount = 0;
function Rectangle(){ // fn to create rectangle element
    rectCount += 1 ;
    let rectBox = document.createElement("div");
    
    rectBox.id = `rectangle${rectCount}`; // giving unique ID to every rectangle created

    rectBox.dataset.type = "rectangle"; // metadata 
    rectBox.dataset.index = rectCount;

    rectBox.style.height = "90px"; // default settings
    rectBox.style.width = "120px";
    rectBox.style.minHeight = "30px";
    rectBox.style.minWidth = "30px";
    rectBox.style.backgroundColor = "transparent";
    rectBox.style.border = "1px solid white";
    rectBox.style.position = "absolute";

    workspace.appendChild(rectBox);
}

let textCount = 0;
function textBox() { // fn to create text box
    textCount++;
    let text = document.createElement("div");

    text.id = `text${textCount}`; // giving unique ID to every textbox created

    text.dataset.type = "text"; // metadata
    text.dataset.index = textCount;

    text.contentEditable = true; // default settings
    text.style.height = "30px";
    text.style.width = "90px"
    text.style.textAlign = "center";
    text.textContent = "Edit text";
    text.style.position = 'absolute';

    workspace.appendChild(text);
}

let selectedElement = null;
let isMouseDown = false;
let offsetX = 0;
let offsetY = 0;
let mouseX = 0;
let mouseY = 0;
let isResizing = false;
let resizeDirection = null;
let startX = 0;
let startY = 0;
let startWidth = 0;
let startHeight = 0;
let startLeft = 0;
let startTop = 0;

workspace.addEventListener("mousedown", (e) => {
    const resizeHandle = e.target.closest(".resize-handle");

    if (resizeHandle && selectedElement) {
        isResizing = true;
        resizeDirection = resizeHandle.dataset.resize;

        startX = e.clientX;
        startY = e.clientY;
        startWidth = selectedElement.offsetWidth;
        startHeight = selectedElement.offsetHeight;
        startLeft = selectedElement.offsetLeft;
        startTop = selectedElement.offsetTop;

        return;
    }

    const element = e.target.closest("[data-type]");
    if (!element) {
        deselectEle();
        return;
    }

    isMouseDown = true;
    offsetX = element.offsetLeft - e.clientX;
    offsetY = element.offsetTop - e.clientY;
    selectEle(element);
});

function selectEle(ele) {
    if (selectedElement && selectedElement !== ele) {
        selectedElement.classList.remove("selected");
        removeResizeHandles(selectedElement);
    }

    selectedElement = ele;
    ele.classList.add("selected");
    addResizeHandles(ele);
}

function deselectEle() {
    if (!selectedElement) return;

    selectedElement.classList.remove("selected");
    removeResizeHandles(selectedElement);
    selectedElement = null;
}

function addResizeHandles(element) {
    removeResizeHandles(element);

    const directions = ["top", "right", "bottom", "left"];

    directions.forEach(dir => {
        const handle = document.createElement("div");
        handle.classList.add("resize-handle", `resize-${dir}`);
        handle.dataset.resize = dir;
        element.appendChild(handle);
    });
}

function removeResizeHandles(element) {
    element.querySelectorAll(".resize-handle").forEach(h => h.remove());
}


workspace.addEventListener("mousemove", (e) => {

    if (isResizing && selectedElement) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (resizeDirection === "right") {
            selectedElement.style.width = startWidth + dx + "px";
        }

        if (resizeDirection === "bottom") {
            selectedElement.style.height = startHeight + dy + "px";
        }

        if (resizeDirection === "left") {
            selectedElement.style.width = startWidth - dx + "px";
            selectedElement.style.left = startLeft + dx + "px";
        }

        if (resizeDirection === "top") {
            selectedElement.style.height = startHeight - dy + "px";
            selectedElement.style.top = startTop + dy + "px";
        }

        return;
    }

    if (!isMouseDown || !selectedElement) return;

    e.preventDefault();

    let mouseX = e.clientX + offsetX;
    let mouseY = e.clientY + offsetY;

    const maxLeft = workspace.clientWidth - selectedElement.offsetWidth;
    const maxTop = workspace.clientHeight - selectedElement.offsetHeight;

    mouseX = Math.max(0, Math.min(mouseX, maxLeft));
    mouseY = Math.max(0, Math.min(mouseY, maxTop));

    selectedElement.style.left = mouseX + "px";
    selectedElement.style.top = mouseY + "px";
});


document.addEventListener("mouseup", () => {
    isMouseDown = false;
    isResizing = false;
});

window.addEventListener("keydown", (e) => {
    if (!selectedElement) {
        return;
    }

    if (
        selectedElement.dataset.type === "text" &&
        document.activeElement === selectedElement &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
    ) {
        return;
    }

    const step = 5;
    const container = workspace;
    const containerRect = container.getBoundingClientRect();

    let top = selectedElement.offsetTop;
    let left = selectedElement.offsetLeft;

    switch (e.key) {

        case "Delete":
        case "Backspace":
            e.preventDefault();
            removeResizeHandles(selectedElement);
            selectedElement.remove();
            selectedElement = null;
            break;

        case "ArrowUp":
            e.preventDefault();
            if (top - step >= 0) {
                selectedElement.style.top = top - step + "px";
            }
            break;

        case "ArrowDown":
            e.preventDefault();
            if (top + selectedElement.offsetHeight + step <= containerRect.height) {
                selectedElement.style.top = top + step + "px";
            }
            break;

        case "ArrowLeft":
            e.preventDefault();
            if (left - step >= 0) {
                selectedElement.style.left = left - step + "px";
            }
            break;

        case "ArrowRight":
            e.preventDefault();
            if (left + selectedElement.offsetWidth + step <= containerRect.width) {
                selectedElement.style.left = left + step + "px";
            }
            break;
    }
});
