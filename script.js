/**
 * MyPlanner Pro - Core Logic
 * Handles State, CRUD, Search, and Modal Switching
 */

let state = {
    items: JSON.parse(localStorage.getItem('myplanner_v3_db')) || [],
    filter: 'all',
    search: '',
    editingId: null
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    render();
});

function initApp() {
    // 1. Display Current Date in Header
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    document.getElementById('headerDate').innerText = new Date().toLocaleDateString('en-US', options);

    // 2. Form Submit Listener
    document.getElementById('taskForm').addEventListener('submit', handleFormSubmit);

    // 3. Search Functionality
    document.getElementById('searchInput').addEventListener('input', (e) => {
        state.search = e.target.value.toLowerCase();
        render();
    });

    // 4. Keyboard Shortcut for Search (/)
    window.addEventListener('keydown', (e) => {
        if(e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
    });
}

// --- Navigation & Sidebar ---
function toggleSidebar() {
    document.getElementById('sideDrawer').classList.toggle('active');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

function handleNavClick(btn) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    btn.classList.add('active');
    state.filter = btn.dataset.filter;
    document.getElementById('pageTitle').innerText = btn.querySelector('.nav-text').innerText;
    render();
    // Auto-close sidebar on mobile
    if(window.innerWidth <= 1024) toggleSidebar();
}

// --- Modal Mode Switching Logic ---
/**
 * This helper ensures only one part of the modal is visible
 */
function switchModalMode(mode) {
    const viewModeEl = document.getElementById('viewMode');
    const formModeEl = document.getElementById('taskForm');
    
    if (mode === 'form') {
        viewModeEl.classList.add('hidden');
        formModeEl.classList.remove('hidden');
    } else {
        viewModeEl.classList.remove('hidden');
        formModeEl.classList.add('hidden');
    }
}

function closeModal() {
    document.getElementById('universalModal').style.display = 'none';
    state.editingId = null;
}

// --- CRUD Actions ---

/**
 * Open Form for either CREATE or UPDATE
 */
function openFormModal(id = null) {
    state.editingId = id;
    switchModalMode('form');
    
    const formTitle = document.getElementById('formTitle');
    const form = document.getElementById('taskForm');

    if (id) {
        // Edit Mode: Pre-fill data
        const item = state.items.find(i => i.id === id);
        formTitle.innerText = "Update Entry";
        
        document.getElementById('taskTitle').value = item.title;
        document.getElementById('taskDesc').value = item.desc;
        document.getElementById('taskDate').value = item.date;
        document.getElementById('taskPriority').value = item.priority;
        
        // Handle Segmented Control (Radios)
        if(item.type === 'Goal') {
            document.getElementById('catGoal').checked = true;
        } else {
            document.getElementById('catTask').checked = true;
        }
    } else {
        // Add Mode: Reset form
        formTitle.innerText = "Add New Task";
        form.reset();
    }
    
    document.getElementById('universalModal').style.display = 'flex';
}

/**
 * Open Modal in READ-ONLY View mode
 */
function openViewModal(id) {
    const item = state.items.find(i => i.id === id);
    state.editingId = id;
    
    switchModalMode('view');

    // Populate the View details
    document.getElementById('viewTitleText').innerText = item.title;
    document.getElementById('viewDescText').innerText = item.desc || "No additional notes provided.";
    document.getElementById('viewDateText').innerText = item.date;
    document.getElementById('viewTypeText').innerText = item.type;
    
    const chip = document.getElementById('viewPriority');
    chip.innerText = item.priority;
    chip.className = `tag-priority ${item.priority}`;

    // Link Action Buttons
    document.getElementById('viewDeleteBtn').onclick = () => deleteItem(id);
    document.getElementById('viewEditBtn').onclick = () => openFormModal(id);

    document.getElementById('universalModal').style.display = 'flex';
}

function handleFormSubmit(e) {
    e.preventDefault();
    const data = {
        title: document.getElementById('taskTitle').value,
        desc: document.getElementById('taskDesc').value,
        date: document.getElementById('taskDate').value,
        priority: document.getElementById('taskPriority').value,
        type: document.querySelector('input[name="itemType"]:checked').value
    };

    if(state.editingId) {
        // Update existing
        state.items = state.items.map(i => i.id === state.editingId ? {...i, ...data} : i);
        notify("Planner updated");
    } else {
        // Create new
        state.items.unshift({ id: Date.now(), ...data, completed: false });
        notify("New task added");
    }

    sync();
    closeModal();
}

function toggleStatus(id) {
    state.items = state.items.map(i => i.id === id ? {...i, completed: !i.completed} : i);
    sync();
}

function deleteItem(id) {
    if(confirm("Permanently remove this entry?")) {
        state.items = state.items.filter(i => i.id !== id);
        sync();
        closeModal();
        notify("Deleted");
    }
}

// --- UI Sync & Rendering ---

function render() {
    const grid = document.getElementById('taskGrid');
    const emptyState = document.getElementById('emptyState');
    grid.innerHTML = '';

    const filtered = state.items.filter(item => {
        const matchesFilter = state.filter === 'all' ? true : 
                            (state.filter === 'pending' ? !item.completed : item.completed);
        const matchesSearch = item.title.toLowerCase().includes(state.search) || 
                             item.desc.toLowerCase().includes(state.search);
        return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = `task-card ${item.completed ? 'done' : ''}`;
            card.innerHTML = `
                <span class="tag-priority ${item.priority}">${item.priority}</span>
                <h3 style="margin-bottom:8px">${item.title}</h3>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.2rem; line-height:1.4; height:2.8rem; overflow:hidden;">
                    ${item.desc || 'No details...'}
                </p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:6px; font-size:0.75rem; color:var(--text-muted)">
                        <span class="material-icons-round" style="font-size:16px">event</span>
                        ${item.date}
                    </div>
                    <button class="status-btn" onclick="event.stopPropagation(); toggleStatus(${item.id})" 
                            style="border:none; background:none; cursor:pointer; display:flex;">
                        <span class="material-icons-round" style="color:${item.completed ? 'var(--primary)' : '#cbd5e1'}">
                            ${item.completed ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                    </button>
                </div>
            `;
            card.onclick = () => openViewModal(item.id);
            grid.appendChild(card);
        });
    }

    updateStats(filtered.length);
}

function sync() {
    localStorage.setItem('myplanner_v3_db', JSON.stringify(state.items));
    render();
}

function updateStats(filteredCount) {
    const total = state.items.length;
    const completed = state.items.filter(i => i.completed).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    document.getElementById('progressBar').style.width = pct + '%';
    document.getElementById('progressValue').innerText = pct + '%';
    document.getElementById('itemCountLabel').innerText = `${filteredCount} items total`;
}

function notify(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

