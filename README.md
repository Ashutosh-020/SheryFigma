# Shery Figma: Figma-Style Design Tool (HTML, CSS, JavaScript)

**Shery Figma** is a **Figma-inspired visual design editor** built using **pure HTML, CSS, and vanilla JavaScript**.  
This project was developed as part of the **Sheriyans Coding School - Inter Batch Showdown**, a frontend competition focused on testing **core fundamentals, creativity, UI/UX decisions, and real-world problem solving**.

The primary goal of this project was to deeply understand **DOM manipulation, pointer events, editor-style state management, and responsive UI design without using Canvas, SVG, frameworks, or external libraries**.

🔗 **Live Demo (Hosted on Vercel)**  
👉 https://shery-figma.vercel.app/

---

## 🏆 Competition Context

This project was built for the **Inter Batch Showdown** organized by **Sheriyans Coding School**, where:

- All participants were given the **same core problem statement**
- The project had to be built using **only HTML, CSS, and JavaScript (DOM-based)**
- **No frameworks or libraries** were allowed
- Creativity, UI/UX, originality, and functionality were key evaluation criteria
- Participants were expected to **plan, design, and implement independently**

**Shery Figma** is my interpretation of the given challenge, with additional enhancements focused on usability, responsiveness, and editor-like behavior.

---

## 🎨 Project Overview

Shery Figma allows users to **visually design layouts** by creating and manipulating elements inside a workspace similar to a simplified version of professional tools like Figma.

Core ideas behind the project:

- DOM-based rendering (no Canvas / SVG)
- Pointer-event-driven interactions (mouse + touch)
- Real-time property editing
- Layer and z-index management
- Persistent editor state
- Fully responsive and touch-friendly UI

---

## 📱 Mobile-First & Responsive Design

The editor is built with a **mobile-first and responsive mindset**:

- Fully usable on **touch devices**
- Works seamlessly on:
  - 📱 Mobile phones
    <p align="center">
      <img src="https://github.com/Ashutosh-020/SheryFigma/blob/main/res/Screenshot%202026-01-24%20at%205.40.55%E2%80%AFPM.png?raw=true" alt="HTML export" width="400" height="800" />
    </p>
  - 📲 Tablets
  - 💻 Desktop
    <p align="center">
      <img src="https://github.com/Ashutosh-020/SheryFigma/blob/main/res/Screenshot%202026-01-24%20at%205.37.10%E2%80%AFPM.png?raw=true" alt="HTML export" width="700" />
    </p>

- Layout adapts dynamically:
  - **Mobile:** stacked panels
  - **Tablet:** 25% / 50% / 25% layout
  - **Desktop & large screens:** centered editor with balanced spacing

---

## 🛠️ Technologies Used

- **HTML5** - Semantic structure and layout
- **CSS3** - Grid, Flexbox, media queries, responsive units
- **JavaScript (Vanilla)** - Core logic, DOM updates, state handling
- **Pointer Events API** - Unified mouse + touch interactions
- **LocalStorage API** - Persistent editor state
- **Vercel** - Deployment and hosting

> No frameworks. No libraries. No Canvas. No SVG.

---

## ✨ Core Features

### 🧱 Element Creation
- Add **Rectangles** and **Text boxes**
- Each element:
  - Has a unique ID
  - Uses `data-*` attributes for metadata
  - Is positioned absolutely inside the workspace

---

### 🖱️ Drag, Resize & Rotate
- Drag elements freely within the workspace
- Resize using four resize handles
- Rotate on **X, Y, and Z axes**
- Supports **mouse and touch interactions**
- Movement is clamped to workspace boundaries

---

### 🧩 Layers Panel
- Displays all elements as layers
- Supports:
  - Reordering (move up / down)
  - Visibility toggle
  - Deletion
- Layer order is synced with `z-index`

---

### 🎛️ Properties Panel
- Context-aware (updates on element selection)
- Real-time editing of:
  - Width & height
  - Background color (with transparency toggle)
  - Border color, width, radius (px / %)
  - Font size, color, bold, italic (text only)
- Changes reflect instantly on the canvas

---

### 💾 Save, Load & Persistence
- Editor state is automatically saved to **localStorage**
- On page reload:
  - All elements are restored
  - Positions, styles, rotations, and layers persist
- No backend required

---

### 📤 Export Options
- **Export as JSON**
  - Clean, formatted layout data
    <p align="center">
      <img src="https://github.com/Ashutosh-020/SheryFigma/blob/main/res/Screenshot%202026-01-24%20at%205.38.16%E2%80%AFPM.png?raw=true" alt="HTML export" width="500" height="700" />
    </p>
- **Export as HTML**
  - Generates a standalone HTML file
  - Uses inline styles to visually recreate the design
    <p align="center">
      <img src="https://github.com/Ashutosh-020/SheryFigma/blob/main/res/Screenshot%202026-01-24%20at%205.37.37%E2%80%AFPM.png?raw=true" alt="HTML export" width="700" />
    </p>
---

## 🎯 What I Learned

- Advanced DOM manipulation techniques
- Using Pointer Events for cross-device input
- Implementing drag & resize logic manually
- Managing shared editor state
- Persisting complex UI state with localStorage
- Building responsive layouts for large and small screens
- Designing UI tools without Canvas or frameworks

---

## 📌 Future Improvements

- Multi-select support
- Snap-to-grid and alignment guides
- Undo / redo history
- Zoom and pan support
- Grouping elements
- Component-based refactor

---

## 👤 Author

**Ashutosh Dubey**  
B.Tech (Computer Science & Engineering)  
Aspiring Full-Stack Developer

---

⭐ If you like this project, feel free to star the repository and share feedback!
