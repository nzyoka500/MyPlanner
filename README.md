# MyPlanner

**MyPlanner** is a high-performance productivity dashboard designed to help users manage daily tasks and long-term goals. 
> Built with a  mindset, the application utilizes **Material Design 3 (M3)** principles to provide a premium user experience characterized by clean typography, glassmorphism, and intuitive micro-interactions.

<!-- Screen images -->
![MyPlanner Dashboad](/images/dashboard.png)


## Key Features

### Productivity Management
- **Task & Goal Tracking:** Differentiate between immediate daily tasks and high-level long-term goals.
- **Priority Matrix:** Categorize items into High, Medium, and Low priorities with color-coded visual cues.
- **Progress Analytics:** Real-time completion tracking via a dynamic, animated progress bar in the sidebar.

### Search & Organization
- **Smart Search:** Instant, real-time filtering across titles and descriptions.
- **Hotkeys:** Press `/` anywhere to immediately focus the search bar.
- **Status Filtering:** Quickly navigate between "All Items," "Active Tasks," and "Completed" views.

### Design & Experience
- **Modern Material UI:** Built using Google's Material 3 design system for a clean, professional aesthetic.
- **Fully Responsive:** Seamlessly transitions from desktop ultra-wide views to a sliding drawer navigation on mobile devices.
- **Micro-Interactions:** Smooth CSS transitions for status toggling, modal entries, and task removal.

### Reliability
- **Local Persistence:** Uses `localStorage` to ensure your data is saved even after closing the browser or refreshing the page.
- **Zero Dependencies:** Built using pure HTML5, CSS3, and Vanilla JavaScript—no heavy frameworks required for lightning-fast load times.


## Technical Stack

- **HTML5:** Semantic structure for optimal accessibility and SEO.
- **CSS3:** Advanced Flexbox/Grid layouts, CSS Custom Properties (Variables), and Backdrop-filters for glassmorphism.
- **JavaScript (ES6+):** **State-driven architecture** ensures that the UI stays perfectly synced with the data model.
- **Fonts & Icons:** Plus Jakarta Sans (Typography) and Material Icons Round (Visuals).


## 📂 Project Structure

```text
MyPlanner/
│
├── images/       # screenshots
├── index.html    # Application structure and UI components
├── style.css     # Production-grade styling and responsive media queries
├── script.js     # Core logic, state management, and event handling
└── README.md     # Documentation
```

## 📖 Usage Guide

- **Adding a Task:** Click the **"New Task"** button (or the `+` icon on mobile) to open the creation modal.
- **Viewing Details:** Click on any task card to open the **Detail View** modal to read full notes.
- **Editing:** Inside the Detail View, click **"Edit Details"** to modify the task.
- **Search:** Start typing in the search bar or use the `/` shortcut to find specific items instantly.
- **Completion:** Click the radio icon on any card to mark it as complete.

---

## Design 

The application follows the **"Focus & Flow"** philosophy:
1. **Minimize Distraction:** Unimportant elements stay in the sidebar or hidden in modals.
2. **Visual Hierarchy:** Important tasks (High Priority) stand out using tonal color palettes.
3. **Feedback:** Every action (save, delete, complete) triggers a visual feedback (Toast or Animation) to confirm the action.

---

## Requirements Checklist (Project Submission)

- **Responsive Layout:** Works on Desktop, Tablet, and Mobile.
- **Task Input:** Title, Date, Priority, and Description fields included.
- **Functionality:** Add, Edit, Remove, and Toggle status fully implemented.
- **Storage:** Data persists via `localStorage`.
- **Filtering:** All/Pending/Completed filters operational.
- **Clean Code:** Structured with comments and semantic indentation.
- **Bonus:** Integrated progress bar and Material UI interactions.
