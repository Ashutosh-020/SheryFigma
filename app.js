const createTool = document.querySelector(".bottom");
const workspace = document.querySelector(".workspace");
const layersPanel = document.getElementById("layers");
let layerCounter = 0;
const BASE_Z_INDEX = 1;

document.getElementById("export-json").addEventListener("click", exportJSON);
document.getElementById("export-html").addEventListener("click", exportHTML);

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
    saveToLocalStorage();
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
    text.style.color = "white";
    text.style.border = "0px solid white";
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
    saveToLocalStorage();
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
    renderProperties(ele);
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

function rgbToHex(rgb, fallback = "#ffffff") {
    if (!rgb || rgb === "transparent") return fallback;

    if (rgb.startsWith("#")) return rgb;

    const match = rgb.match(/\d+/g);
    if (!match) return fallback;

    return (
        "#" + match.slice(0, 3).map(v => parseInt(v).toString(16).padStart(2, "0")).join("")
    );
}

function saveToLocalStorage() {
    const elements = [...workspace.querySelectorAll("[data-type]")];

    const data = elements.map(el => ({
        id: el.id,
        name: el.dataset.name || "",
        type: el.dataset.type,
        x: el.offsetLeft,
        y: el.offsetTop,
        width: el.style.width,
        height: el.style.height,
        zIndex: el.style.zIndex,
        rotateX: el.dataset.rotateX,
        rotateY: el.dataset.rotateY,
        rotateZ: el.dataset.rotateZ,
        styles: {
            backgroundColor: el.style.backgroundColor,
            border: el.style.border,
            borderRadius: el.style.borderRadius,
            color: el.style.color,
            fontSize: el.style.fontSize,
            fontWeight: el.style.fontWeight,
            fontStyle: el.style.fontStyle,
            textAlign: el.style.textAlign
        },
        textContent: el.dataset.type === "text" ? el.textContent : ""
    }));

    localStorage.setItem("figmaLayout", JSON.stringify(data));
}

function loadFromLocalStorage() {
    const raw = localStorage.getItem("figmaLayout");
    if (!raw) return;

    const data = JSON.parse(raw);
    workspace.innerHTML = "";

    data.forEach(item => {
        let el = document.createElement("div");

        el.id = item.id;
        el.dataset.name = item.name;
        el.dataset.type = item.type;

        el.style.position = "absolute";
        el.style.left = item.x + "px";
        el.style.top = item.y + "px";
        el.style.width = item.width;
        el.style.height = item.height;
        el.style.zIndex = item.zIndex;

        el.dataset.rotateX = item.rotateX;
        el.dataset.rotateY = item.rotateY;
        el.dataset.rotateZ = item.rotateZ;

        Object.assign(el.style, item.styles);

        if (item.type === "text") {
            el.contentEditable = true;
            el.textContent = item.textContent;
        }

        applyRotation(el);
        workspace.appendChild(el);
    });
    // Sync counters after load
    rectCount = 0;
    textCount = 0;

    data.forEach(item => {
        if (item.type === "rectangle") rectCount++;
        if (item.type === "text") textCount++;
    });

    renderLayers();
    clampAllElementsToWorkspace();

    // 🔒 SYNC LAYER COUNTER WITH EXISTING Z-INDEX
    const elements = [...workspace.querySelectorAll("[data-type]")];

    layerCounter = elements.reduce((max, el) => {
        return Math.max(max, Number(el.style.zIndex));
    }, BASE_Z_INDEX) - BASE_Z_INDEX;

}

function exportJSON() {
    const raw = localStorage.getItem("figmaLayout");
    if (!raw) {
        alert("Nothing to export");
        return;
    }

    const formatted = JSON.stringify(JSON.parse(raw), null, 2);

    const blob = new Blob([formatted], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "design.json";
    a.click();

    URL.revokeObjectURL(url);
}

function exportHTML() {
    const elements = [...workspace.querySelectorAll("[data-type]")];

    if (!elements.length) {
        alert("Nothing to export");
        return;
    }

    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Exported Design</title>
<style>
body {
    margin: 0;
    background: #0b0e12;
}
.canvas {
    position: relative;
    width: 100vw;
    height: 100vh;
}
</style>
</head>
<body>
<div class="canvas">
`;

    elements.forEach(el => {
        const style = `
position:absolute;
left:${el.style.left};
top:${el.style.top};
width:${el.style.width};
height:${el.style.height};
z-index:${el.style.zIndex};
background:${el.style.backgroundColor};
border:${el.style.border};
border-radius:${el.style.borderRadius};
color:${el.style.color};
font-size:${el.style.fontSize};
font-weight:${el.style.fontWeight};
font-style:${el.style.fontStyle};
text-align:${el.style.textAlign};
transform: rotateX(${el.dataset.rotateX}deg)
           rotateY(${el.dataset.rotateY}deg)
           rotateZ(${el.dataset.rotateZ}deg);
`;

        if (el.dataset.type === "text") {
            html += `
<div style="${style}">
${el.textContent}
</div>
`;
        } else {
            html += `
<div style="${style}"></div>
`;
        }
    });

    html += `
</div>
</body>
</html>
`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "design.html";
    a.click();

    URL.revokeObjectURL(url);
}

function renderProperties(element) {
    const props = document.getElementById("props");
    props.innerHTML = "";

    const isText = element.dataset.type === "text";

    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.gap = "10px";

    const isTransparent =
    !element.style.backgroundColor ||
    element.style.backgroundColor === "transparent" ||
    element.style.backgroundColor === "rgba(0, 0, 0, 0)";

    if (
        !element.dataset.bgColor &&
        element.style.backgroundColor &&
        element.style.backgroundColor !== "transparent"
    ) {
        element.dataset.bgColor = rgbToHex(element.style.backgroundColor);
    }

    let radiusValue = 0;
    let radiusUnit = "px";

    if (element.style.borderRadius) {
        radiusValue = parseFloat(element.style.borderRadius);
        radiusUnit = element.style.borderRadius.includes("%") ? "%" : "px";
    }

    /* ========= ID & NAME ========= */
    wrap.innerHTML += `
        <label>
            Element ID
            <input type="text" value="${element.id}" data-meta="id" disabled>
        </label>
    `;

    /* ========= ROTATION ========= */
wrap.innerHTML += `
    <label>
        Rotate X
        <input type="number" value="${element.dataset.rotateX || 0}" data-axis="rotateX">
    </label>

    <label>
        Rotate Y
        <input type="number" value="${element.dataset.rotateY || 0}" data-axis="rotateY">
    </label>

    <label>
        Rotate Z
        <input type="number" value="${element.dataset.rotateZ || 0}" data-axis="rotateZ">
    </label>
`;

    /* ========= SIZE ========= */
    wrap.innerHTML += `
        <label>
            Width (px)
            <input type="number" value="${parseInt(element.style.width) || 0}" data-prop="width">
        </label>

        <label>
            Height (px)
            <input type="number" value="${parseInt(element.style.height) || 0}" data-prop="height">
        </label>
    `;

    /* ========= BACKGROUND & BORDER ========= */
    wrap.innerHTML += `
        <label>
            Background
            <input type="color" value="${element.dataset.bgColor || "#ffffff"}" data-prop="backgroundColor">
        </label>

        <label>
            Transparent
            <input type="checkbox" data-bg-transparent ${isTransparent ? "checked" : ""}>
        </label>

        <label>
            Border Color
            <input type="color" value="${rgbToHex(element.style.borderColor || "rgb(255,255,255)")}" data-prop="borderColor">
        </label>

        <label>
            Border Width (px)
            <input type="number" value="${parseInt(element.style.borderWidth) || 0}" data-prop="borderWidth">
        </label>

        <label>
            Border Radius
            <input type="number" value="${radiusValue}" data-radius>
            <select data-radius-unit>
                <option value="px" ${radiusUnit === "px" ? "selected" : ""}>px</option>
                <option value="%" ${radiusUnit === "%" ? "selected" : ""}>%</option>
            </select>
        </label>
    `;

    /* ========= TEXT ONLY ========= */
    if (isText) {
        wrap.innerHTML += `
            <label>
                Font Size (px)
                <input type="number" value="${parseInt(element.style.fontSize) || 16}" data-prop="fontSize">
            </label>

            <label>
                Font Color
                <input type="color" value="${rgbToHex(element.style.color, "#ffffff")}" data-prop="color">
            </label>

            <label>
                Bold
                <input type="checkbox" data-font="bold" ${element.style.fontWeight === "bold" ? "checked" : ""}>
            </label>

            <label>
                Italic
                <input type="checkbox" data-font="italic" ${element.style.fontStyle === "italic" ? "checked" : ""}>
            </label>
        `;
    }

    props.appendChild(wrap);

    /* ========= EVENTS ========= */
    wrap.querySelectorAll("input, select").forEach(ctrl => {
        ctrl.addEventListener("input", (e) => {

            if (e.target.dataset.bgTransparent !== undefined) {
                if (e.target.checked) {
                    // Hide background but remember current color
                    if (
                        element.style.backgroundColor &&
                        element.style.backgroundColor !== "transparent"
                    ) {
                        element.dataset.bgColor = rgbToHex(element.style.backgroundColor);
                    }
                    element.style.backgroundColor = "transparent";
                } else {
                    // Restore last chosen color
                    element.style.backgroundColor =
                        element.dataset.bgColor || "transparent";
                }
                saveToLocalStorage();
                return;
            }

            // Generic style handler (RESTORED)
            if (e.target.dataset.prop) {
                const prop = e.target.dataset.prop;

                if (e.target.type === "color") {
                    element.style[prop] = e.target.value;
                }
                else if (prop === "fontSize") {
                    element.style.fontSize = e.target.value + "px";
                }
                else if (prop === "borderWidth") {
                    element.style.borderWidth = e.target.value + "px";

                    // Ensure border renders (important for text elements)
                    if (!element.style.borderStyle) {
                        element.style.borderStyle = "solid";
                    }
                }
                else {
                    element.style[prop] = e.target.value + "px";
                }
                saveToLocalStorage();
                return;
            }

            if (e.target.dataset.axis) {
                element.dataset[e.target.dataset.axis] = e.target.value || 0;
                applyRotation(element);
                saveToLocalStorage();
                return;
            }

            if (e.target.dataset.prop === "backgroundColor") {
                // Always overwrite chosen color
                element.dataset.bgColor = e.target.value;

                const transparentCheckbox =
                    wrap.querySelector("[data-bg-transparent]");

                // Apply only if transparent is OFF
                if (!transparentCheckbox.checked) {
                    element.style.backgroundColor = e.target.value;
                }

                saveToLocalStorage();
                return;
            }

            if (e.target.dataset.radius !== undefined) {
                const unit = wrap.querySelector("[data-radius-unit]").value;
                element.style.borderRadius = e.target.value + unit;
            }

            if (e.target.dataset.font === "bold") {
                element.style.fontWeight = e.target.checked ? "bold" : "normal";
            }

            if (e.target.dataset.font === "italic") {
                element.style.fontStyle = e.target.checked ? "italic" : "normal";
            }

            saveToLocalStorage();
        });
    });
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
                normalizeZIndex();
                renderLayers();
                saveToLocalStorage();
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
    saveToLocalStorage();
}

function clampAllElementsToWorkspace() {
    const elements = [...workspace.querySelectorAll("[data-type]")];

    const maxWidth = workspace.clientWidth;
    const maxHeight = workspace.clientHeight;

    elements.forEach(el => {
        const elWidth = el.offsetWidth;
        const elHeight = el.offsetHeight;

        let left = el.offsetLeft;
        let top = el.offsetTop;

        // Clamp X
        if (left + elWidth > maxWidth) {
            left = maxWidth - elWidth;
        }
        if (left < 0) {
            left = 0;
        }

        // Clamp Y
        if (top + elHeight > maxHeight) {
            top = maxHeight - elHeight;
        }
        if (top < 0) {
            top = 0;
        }

        el.style.left = left + "px";
        el.style.top = top + "px";
    });

    saveToLocalStorage();
}

function normalizeZIndex() {
    const elements = [...workspace.querySelectorAll("[data-type]")];

    elements
        .sort((a, b) => Number(a.style.zIndex) - Number(b.style.zIndex))
        .forEach((el, i) => {
            el.style.zIndex = BASE_Z_INDEX + i + 1;
        });

    layerCounter = elements.length;
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
        saveToLocalStorage();
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

    saveToLocalStorage();
});


document.addEventListener("mouseup", () => {
    isMouseDown = false;
    isResizing = false;
    saveToLocalStorage();
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
            normalizeZIndex();
            saveToLocalStorage();
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
window.addEventListener("resize", clampAllElementsToWorkspace);

loadFromLocalStorage();