const createTool = document.querySelector(".bottom");
const workspace = document.querySelector(".workspace");
const layersPanel = document.getElementById("layers");
let layerCounter = 0;
const BASE_Z_INDEX = 1;

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
    rectBox.dataset.rotateX = 0;
    rectBox.dataset.rotateY = 0;
    rectBox.dataset.rotateZ = 0;
    rectBox.style.backgroundColor = "transparent";
    rectBox.style.border = "1px solid white";
    rectBox.style.position = "absolute";

    rectBox.dataset.layerId = `layer-${++layerCounter}`;
    rectBox.style.zIndex = BASE_Z_INDEX + layerCounter;

    workspace.appendChild(rectBox);
    renderLayers();
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
    text.style.minHeight = "30px";
    text.style.minWidth = "30px";
    text.style.fontSize = "clamp(0.5rem, 20px, 3rem)";
    text.dataset.rotateX = 0;
    text.dataset.rotateY = 0;
    text.dataset.rotateZ = 0;
    text.style.textAlign = "center";
    text.textContent = "Edit text";
    text.style.position = 'absolute';

    text.dataset.layerId = `layer-${++layerCounter}`;
    text.style.zIndex = BASE_Z_INDEX + layerCounter;

    workspace.appendChild(text);
    renderLayers();
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

function applyRotation(element) {
    const rx = element.dataset.rotateX || 0;
    const ry = element.dataset.rotateY || 0;
    const rz = element.dataset.rotateZ || 0;

    element.style.transform =
        `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
}

function selectEle(ele) {
    if (selectedElement && selectedElement !== ele) {
        selectedElement.classList.remove("selected");
        removeResizeHandles(selectedElement);
    }

    selectedElement = ele;
    ele.classList.add("selected");
    addResizeHandles(ele);
    renderRotationControls(ele);
    renderLayers();
}

function deselectEle() {
    if (!selectedElement) return;

    selectedElement.classList.remove("selected");
    removeResizeHandles(selectedElement);
    selectedElement = null;

    document.getElementById("props").innerHTML = "";
    renderLayers();
}

function renderRotationControls(element) {
    const props = document.getElementById("props");
    props.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.gap = "8px";

    wrapper.innerHTML = `
        <label>
            Rotate X
            <input type="number" data-axis="rotateX" value="${element.dataset.rotateX}">
        </label>
        <label>
            Rotate Y
            <input type="number" data-axis="rotateY" value="${element.dataset.rotateY}">
        </label>
        <label>
            Rotate Z
            <input type="number" data-axis="rotateZ" value="${element.dataset.rotateZ}">
        </label>
    `;

    wrapper.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", (e) => {
            element.dataset[e.target.dataset.axis] = e.target.value || 0;
            applyRotation(element);
        });
    });

    props.appendChild(wrapper);
}

function renderLayers() { // Layer section
    layersPanel.innerHTML = "";

    const elements = [...workspace.querySelectorAll("[data-type]")];

    // Topmost layer first (higher z-index on top)
    elements
        .sort((a, b) => Number(b.style.zIndex) - Number(a.style.zIndex))
        .forEach(el => {
            const layer = document.createElement("div");
            layer.className = "layer-item";

            if (el === selectedElement) {
                layer.classList.add("active");
            }

            // Floating label on border
            const label = document.createElement("span");
            label.className = "layer-label";
            label.textContent = el.id;
            label.onclick = () => selectEle(el);

            // Inner content (buttons)
            const content = document.createElement("div");
            content.className = "layer-content";

            content.innerHTML = `
                <div class="layer-btn" title="Move Up">
                    <i class="ri-arrow-up-line"></i>
                </div>
                <div class="layer-btn" title="Move Down">
                    <i class="ri-arrow-down-line"></i>
                </div>
                <div class="layer-btn" title="Toggle Visibility">
                    <i class="${el.style.display === "none" ? "ri-eye-off-line" : "ri-eye-line"}"></i>
                </div>
                <div class="layer-btn" title="Delete">
                    <i class="ri-delete-bin-line"></i>
                </div>
            `;

            const [upBtn, downBtn, eyeBtn, deleteBtn] = content.children;

            // Button actions  
            upBtn.onclick = () => moveLayer(el, 1);
            downBtn.onclick = () => moveLayer(el, -1);

            eyeBtn.onclick = () => {
                el.style.display = el.style.display === "none" ? "block" : "none";
                renderLayers();
            };

            deleteBtn.onclick = () => {
                if (el === selectedElement) deselectEle();
                el.remove();
                renderLayers();
            };

            layer.appendChild(label);
            layer.appendChild(content);
            layersPanel.appendChild(layer);
        });
}

function moveLayer(element, direction) {
    const elements = [...workspace.querySelectorAll("[data-type]")];

    // Sort bottom → top
    elements.sort((a, b) => Number(a.style.zIndex) - Number(b.style.zIndex));

    const index = elements.indexOf(element);
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= elements.length) return;

    // Swap z-index
    const temp = elements[index].style.zIndex;
    elements[index].style.zIndex = elements[targetIndex].style.zIndex;
    elements[targetIndex].style.zIndex = temp;

    // Safety: never go below workspace
    elements.forEach(el => {
        el.style.zIndex = Math.max(BASE_Z_INDEX, Number(el.style.zIndex));
    });

    renderLayers();
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
        applyRotation(selectedElement);

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
    if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement.isContentEditable
    ) {
        return;
    }

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
