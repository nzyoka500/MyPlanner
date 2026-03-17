// State Management
let items = JSON.parse(localStorage.getItem('myPlannerData')) || [];
let currentFilter = 'all';
let editingId = null;

// Selectors
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const currentDateEl = document.getElementById('currentDate');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    renderItems();
    setupFilters();
});

// Update Header Date
function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.innerText = new Date().toLocaleDateString(undefined, options);
}

// Add Item
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newItem = {
        id: Date.now(),
        title: document.getElementById('taskTitle').value,
        date: document.getElementById('taskDate').value,
        priority: document.getElementById('taskPriority').value,
        type: document.getElementById('itemType').value,
        completed: false
    };

    items.push(newItem);
    saveAndRender();
    taskForm.reset();
});

// Render Items
function renderItems() {
    taskList.innerHTML = '';
    
    const filteredItems = items.filter(item => {
        if (currentFilter === 'pending') return !item.completed;
        if (currentFilter === 'completed') return item.completed;
        return true;
    });

    filteredItems.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = `task-item ${item.completed ? 'completed' : ''}`;
        
        itemEl.innerHTML = `
            <span class="priority-badge priority-${item.priority}">${item.type} • ${item.priority}</span>
            <h3>${item.title}</h3>
            <p><i class="far fa-calendar-alt"></i> ${item.date || 'No date'}</p>
            <div class="task-footer">
                <span class="status-text">${item.completed ? '✓ Finished' : '○ In Progress'}</span>
                <div class="task-btns">
                    <button onclick="toggleComplete(${item.id})" class="complete-btn" title="Complete">
                        <i class="fas ${item.completed ? 'fa-undo' : 'fa-check'}"></i>
                    </button>
                    <button onclick="openEditModal(${item.id})" class="edit-btn" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteItem(${item.id})" class="delete-btn" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        taskList.appendChild(itemEl);
    });

    updateProgress();
}

// Logic Functions
function toggleComplete(id) {
    items = items.map(item => item.id === id ? {...item, completed: !item.completed} : item);
    saveAndRender();
}

function deleteItem(id) {
    if(confirm('Delete this item?')) {
        items = items.filter(item => item.id !== id);
        saveAndRender();
    }
}

function saveAndRender() {
    localStorage.setItem('myPlannerData', JSON.stringify(items));
    renderItems();
}

// Progress Bar Logic (Bonus Feature)
function updateProgress() {
    if (items.length === 0) {
        progressBar.style.width = '0%';
        progressText.innerText = '0% Completed';
        return;
    }
    const completed = items.filter(i => i.completed).length;
    const percent = Math.round((completed / items.length) * 100);
    progressBar.style.width = `${percent}%`;
    progressText.innerText = `${percent}% Completed`;
}

// Filter Logic
function setupFilters() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.nav-btn.active').classList.remove('active');
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            document.querySelector('.active-filter-text').innerText = `Showing: ${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)} Items`;
            renderItems();
        });
    });
}

// Edit Modal Logic
const modal = document.getElementById('editModal');
function openEditModal(id) {
    editingId = id;
    const item = items.find(i => i.id === id);
    document.getElementById('editTitle').value = item.title;
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

document.getElementById('saveEdit').addEventListener('click', () => {
    const newTitle = document.getElementById('editTitle').value;
    if(newTitle) {
        items = items.map(item => item.id === editingId ? {...item, title: newTitle} : item);
        saveAndRender();
        closeModal();
    }
});