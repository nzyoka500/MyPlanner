/**
 * MyPlanner Pro - Production State Logic
 */

let state = {
    items: JSON.parse(localStorage.getItem('myplanner_v2_db')) || [],
    filter: 'all',
    search: '',
    editingId: null
};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    render();
});

function initApp() {
    // Set current date
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    document.getElementById('headerDate').innerText = new Date().toLocaleDateString('en-US', options);

    // Form submission
    document.getElementById('taskForm').addEventListener('submit', handleFormSubmit);

    // Real-time Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        state.search = e.target.value.toLowerCase();
        render();
    });

    // Keyboard Shortcut (/)
    window.addEventListener('keydown', (e) => {
        if(e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
    });
}

// Sidebar Controls
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
    if(window.innerWidth <= 1024) toggleSidebar();
}

// Rendering Core
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
        grid.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        grid.style.display = 'grid';
        
        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = `task-card ${item.completed ? 'done' : ''}`;
            card.innerHTML = `
                <span class="tag-priority ${item.priority}">${item.priority}</span>
                <h3 style="margin-bottom:8px">${item.title}</h3>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.5rem; line-height:1.4; height:2.8rem; overflow:hidden;">
                    ${item.desc || 'No detailed notes provided.'}
                </p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:6px; font-size:0.75rem; color:var(--text-muted)">
                        <span class="material-icons-round" style="font-size:16px">event</span>
                        ${item.date}
                    </div>
                    <button class="status-btn" onclick="event.stopPropagation(); toggleStatus(${item.id})" 
                            style="border:none; background:none; cursor:pointer;">
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

// CRUD Actions
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
        state.items = state.items.map(i => i.id === state.editingId ? {...i, ...data} : i);
        notify("Entry updated");
    } else {
        state.items.unshift({ id: Date.now(), ...data, completed: false });
        notify("Task added successfully");
    }

    sync();
    closeModal();
}

function toggleStatus(id) {
    state.items = state.items.map(i => i.id === id ? {...i, completed: !i.completed} : i);
    sync();
    notify("Status updated");
}

function deleteItem(id) {
    if(confirm("Permanently delete this item?")) {
        state.items = state.items.filter(i => i.id !== id);
        sync();
        closeModal();
        notify("Item removed");
    }
}

// Modal Logic
const modal = document.getElementById('universalModal');
const vMode = document.getElementById('viewMode');
const fMode = document.getElementById('taskForm');

function openFormModal(id = null) {
    state.editingId = id;
    vMode.classList.add('hidden');
    fMode.classList.remove('hidden');
    if(id) {
        const item = state.items.find(i => i.id === id);
        document.getElementById('taskTitle').value = item.title;
        document.getElementById('taskDesc').value = item.desc;
        document.getElementById('taskDate').value = item.date;
        document.getElementById('taskPriority').value = item.priority;
    } else { fMode.reset(); }
    modal.style.display = 'flex';
}

function openViewModal(id) {
    const item = state.items.find(i => i.id === id);
    state.editingId = id;
    document.getElementById('viewTitleText').innerText = item.title;
    document.getElementById('viewDescText').innerText = item.desc || "No additional notes.";
    document.getElementById('viewDateText').innerText = item.date;
    document.getElementById('viewTypeText').innerText = item.type;
    const chip = document.getElementById('viewPriority');
    chip.innerText = item.priority;
    chip.className = `tag-priority ${item.priority}`;

    document.getElementById('viewDeleteBtn').onclick = () => deleteItem(id);
    document.getElementById('viewEditBtn').onclick = () => openFormModal(id);

    fMode.classList.add('hidden');
    vMode.classList.remove('hidden');
    modal.style.display = 'flex';
}

function closeModal() { modal.style.display = 'none'; }

// Helpers
function sync() {
    localStorage.setItem('myplanner_v2_db', JSON.stringify(state.items));
    render();
}

function updateStats(filteredCount) {
    const total = state.items.length;
    const completed = state.items.filter(i => i.completed).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    document.getElementById('progressBar').style.width = pct + '%';
    document.getElementById('progressValue').innerText = pct + '%';
    document.getElementById('itemCountLabel').innerText = `${filteredCount} items matching criteria`;
}

function notify(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}