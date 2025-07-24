        const taskTitle = document.getElementById('taskTitle');
        const taskDescription = document.getElementById('taskDescription');
        const taskPriority = document.getElementById('taskPriority');
        const taskDate = document.getElementById('taskDate');
        const taskTime = document.getElementById('taskTime');
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskList = document.getElementById('taskList');
        const totalCount = document.getElementById('totalCount');
        const completedCount = document.getElementById('completedCount');
        const filterButtons = document.querySelectorAll('.filter-btn');

        const today = new Date();
        taskDate.valueAsDate = today;

        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let currentFilter = 'all';

        function initApp() {
            renderTasks();
            updateTaskCount();
            const today = new Date().toISOString().split('T')[0];
            taskDate.min = today;
        }

        function addTask() {
            const title = taskTitle.value.trim();
            const description = taskDescription.value.trim();
            const priority = taskPriority.value;
            const date = taskDate.value;
            const time = taskTime.value;

            if (!title) {
                taskTitle.focus();
                return;
            }

            const newTask = {
                id: Date.now(),
                title,
                description,
                priority,
                date,
                time,
                completed: false,
                createdAt: new Date().toISOString()
            };

            tasks.unshift(newTask);
            saveTasks();
            renderTasks();
            updateTaskCount();

            taskTitle.value = '';
            taskDescription.value = '';
            taskPriority.value = 'low';
            taskDate.valueAsDate = today;
            taskTime.value = '';

            taskTitle.focus();

            const newTaskElement = document.querySelector(`[data-id="${newTask.id}"]`);
            if (newTaskElement) {
                newTaskElement.style.animation = 'slideIn 0.4s ease-out';
                setTimeout(() => {
                    newTaskElement.style.animation = '';
                }, 400);
            }
        }

        function saveTasks() {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        function renderTasks() {
            let filteredTasks = tasks;

            if (currentFilter === 'active') {
                filteredTasks = tasks.filter(task => !task.completed);
            } else if (currentFilter === 'completed') {
                filteredTasks = tasks.filter(task => task.completed);
            }

            if (filteredTasks.length === 0) {
                taskList.innerHTML = `
                    <li class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <h3>No tasks found</h3>
                        <p>${currentFilter === 'all' ? 'Start by adding your first task' : 
                           currentFilter === 'active' ? 'All tasks are completed' : 
                           'No completed tasks yet'}</p>
                    </li>
                `;
                return;
            }

            taskList.innerHTML = '';

            filteredTasks.forEach(task => {
                const taskElement = document.createElement('li');
                taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
                taskElement.setAttribute('data-id', task.id);

                const formattedDate = task.date ? new Date(task.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                }) : 'No date';

                const formattedTime = task.time ? new Date(`2000-01-01T${task.time}`).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }) : 'No time';

                taskElement.innerHTML = `
                    <div class="task-header">
                        <div class="task-title">${task.title}</div>
                        <div class="task-priority priority-${task.priority}">
                            ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                        </div>
                    </div>

                    <div class="task-description">${task.description || 'No description provided'}</div>

                    <div class="task-meta">
                        <div class="task-datetime">
                            <div><i class="far fa-calendar"></i> ${formattedDate}</div>
                            <div><i class="far fa-clock"></i> ${formattedTime}</div>
                        </div>

                        <div class="task-actions">
                            <button class="action-btn edit" title="Edit task">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" title="Delete task">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="action-btn complete" title="${task.completed ? 'Mark as active' : 'Mark as completed'}">
                                <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                            </button>
                        </div>
                    </div>
                `;

                taskList.appendChild(taskElement);

                taskElement.querySelector('.edit').addEventListener('click', () => editTask(task.id));
                taskElement.querySelector('.delete').addEventListener('click', () => deleteTask(task.id));
                taskElement.querySelector('.complete').addEventListener('click', () => toggleComplete(task.id));
            });
        }

        function updateTaskCount() {
            totalCount.textContent = tasks.length;
            const completedTasks = tasks.filter(task => task.completed).length;
            completedCount.textContent = completedTasks;
        }

        function editTask(id) {
            const task = tasks.find(task => task.id === id);
            if (!task) return;

            taskTitle.value = task.title;
            taskDescription.value = task.description;
            taskPriority.value = task.priority;
            taskDate.value = task.date;
            taskTime.value = task.time;

            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
            updateTaskCount();

            document.querySelector('.task-form').scrollIntoView({ behavior: 'smooth' });
            taskTitle.focus();
        }

        function deleteTask(id) {
            if (!confirm('Are you sure you want to delete this task?')) return;

            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
            updateTaskCount();
        }

        function toggleComplete(id) {
            tasks = tasks.map(task => {
                if (task.id === id) {
                    return { ...task, completed: !task.completed };
                }
                return task;
            });

            saveTasks();
            renderTasks();
            updateTaskCount();
        }

        function setFilter(filter) {
            currentFilter = filter;

            filterButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === filter);
            });

            renderTasks();
        }

        addTaskBtn.addEventListener('click', addTask);

        taskTitle.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask();
            }
        });

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                setFilter(btn.dataset.filter);
            });
        });

        initApp();