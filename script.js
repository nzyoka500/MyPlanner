/**
 * MyPlanner Pro - Production State Logic
 */

let state = {
    items: JSON.parse(localStorage.getItem('myplanner_pro_db')) || [],
    filter: 'all',
    searchQuery: '',
    editingId: null
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    render();
    initClock();
    setupListeners();
});

function initClock() {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    document.getElementById('headerDate').innerText = new Date().toLocaleDateString('en-US', options);
}

// --- Rendering Engine ---
function render() {
    const grid = document.getElementById('taskGrid');
    const emptyState = document.getElementById('emptyState');
    grid.innerHTML = '';

    // Filter Logic
    let filtered = state.items.filter(item => {
        const matchesFilter = 
            state.filter === 'all' ? true :
            state.filter === 'pending' ? !item.completed :
            item.completed;
        
        const matchesSearch = item.title.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
                              item.desc.toLowerCase().includes(state.searchQuery.toLowerCase());
        
        return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'grid';
        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = `task-card ${item.completed ? 'done' : ''}`;
            card.innerHTML = `
                <div class="priority-chip ${item.priority}">${item.priority}</div>
                <h3>${item.title}</h3>
                <p class="task-desc-preview">${item.desc || 'No additional notes...'}</p>
                <div class="card-footer" style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.75rem; color:var(--text-muted)">
                        <span class="material-icons-round" style="font-size:14px; vertical-align:text-bottom">calendar_today</span>
                        ${item.date}
                    </span>
                    <button class="icon-btn" onclick="event.stopPropagation(); toggleComplete(${item.id})">
                        <span class="material-icons-round">${item.completed ? 'check_circle' : 'radio_button_unchecked'}</span>
                    </button>
                </div>
            `;
            card.onclick = () => openViewModal(item.id);
            grid.appendChild(card);
        });
    }
    updateStats();
}

// --- Core Actions ---
function saveItem(e) {
    e.preventDefault();
    const formData = {
        title: document.getElementById('taskTitle').value,
        desc: document.getElementById('taskDesc').value,
        date: document.getElementById('taskDate').value,
        priority: document.getElementById('taskPriority').value,
        type: document.querySelector('input[name="itemType"]:checked').value
    };

    if(state.editingId) {
        state.items = state.items.map(i => i.id === state.editingId ? {...i, ...formData} : i);
        showToast("Entry updated successfully");
    } else {
        const newItem = { id: Date.now(), ...formData, completed: false };
        state.items.unshift(newItem);
        showToast("New task added to planner");
    }

    sync();
    closeModal();
}

function deleteItem(id) {
    if(confirm("Permanently delete this item?")) {
        state.items = state.items.filter(i => i.id !== id);
        sync();
        closeModal();
        showToast("Deleted");
    }
}

function toggleComplete(id) {
    state.items = state.items.map(i => i.id === id ? {...i, completed: !i.completed} : i);
    sync();
    showToast("Status updated");
}

// --- Modal Control ---
const modal = document.getElementById('mainModal');
const viewMode = document.getElementById('viewMode');
const formMode = document.getElementById('taskForm');

function openFormModal(id = null) {
    state.editingId = id;
    viewMode.classList.add('hidden');
    formMode.classList.remove('hidden');
    
    if(id) {
        const item = state.items.find(i => i.id === id);
        document.getElementById('taskTitle').value = item.title;
        document.getElementById('taskDesc').value = item.desc;
        document.getElementById('taskDate').value = item.date;
        document.getElementById('taskPriority').value = item.priority;
    } else {
        formMode.reset();
    }
    modal.style.display = 'flex';
}

function openViewModal(id) {
    const item = state.items.find(i => i.id === id);
    state.editingId = id;
    
    document.getElementById('viewTitleText').innerText = item.title;
    document.getElementById('viewDescText').innerText = item.desc || "No description provided.";
    document.getElementById('viewDateText').innerText = item.date;
    document.getElementById('viewTypeText').innerText = item.type;
    const pChip = document.getElementById('viewPriority');
    pChip.innerText = item.priority;
    pChip.className = `priority-chip ${item.priority}`;

    // Setup actions
    document.getElementById('viewDeleteBtn').onclick = () => deleteItem(id);
    document.getElementById('viewEditBtn').onclick = () => openFormModal(id);

    formMode.classList.add('hidden');
    viewMode.classList.remove('hidden');
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

// --- Helpers ---
function sync() {
    localStorage.setItem('myplanner_pro_db', JSON.stringify(state.items));
    render();
}

function updateStats() {
    const total = state.items.length;
    const done = state.items.filter(i => i.completed).length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    
    document.getElementById('progressBar').style.width = pct + '%';
    document.getElementById('progressValue').innerText = pct + '%';
    document.getElementById('countBadge').innerText = `${total} Items Total`;
}

function showToast(msg) {
    const s = document.getElementById("snackbar");
    s.innerText = msg;
    s.className = "show";
    setTimeout(() => s.className = s.className.replace("show", ""), 3000);
}

function setupListeners() {
    // Form Submit
    formMode.addEventListener('submit', saveItem);

    // Filter Buttons
    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelector('.nav-link.active').classList.remove('active');
            e.currentTarget.classList.add('active');
            state.filter = e.currentTarget.dataset.filter;
            document.getElementById('viewTitle').innerText = e.currentTarget.innerText;
            render();
        });
    });

    // Search Logic
    document.getElementById('searchInput').addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        render();
    });

    // Shortcut for Search
    window.addEventListener('keydown', (e) => {
        if(e.key === '/') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
    });
}