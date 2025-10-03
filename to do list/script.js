document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const deadlineInput = document.getElementById('deadline-input');
    const reminderInput = document.getElementById('reminder-input');
    const addButton = document.getElementById('add-button');
    const todoList = document.getElementById('todo-list');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let reminderTimers = {}; // To store setInterval IDs for recurring reminders
    let deadlineTimers = {}; // To store setTimeout IDs for deadline alerts

    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    const clearAllTimers = (index) => {
        if (reminderTimers[index]) {
            clearInterval(reminderTimers[index]);
            delete reminderTimers[index];
        }
        if (deadlineTimers[index]) {
            clearTimeout(deadlineTimers[index]);
            delete deadlineTimers[index];
        }
    };

    const scheduleTimers = (todo, index) => {
        clearAllTimers(index); // Clear existing timers for this todo

        if (!todo.completed && todo.deadline) {
            const deadlineTime = new Date(todo.deadline).getTime();
            const now = new Date().getTime();

            // 1. Schedule Deadline Alert
            if (deadlineTime > now) {
                deadlineTimers[index] = setTimeout(() => {
                    alert(`DEADLINE REACHED for "${todo.text}"! It was due at ${new Date(todo.deadline).toLocaleString()}`);
                    clearAllTimers(index); // Clear all timers once deadline is reached
                    renderTodos(); // Re-render to update overdue status
                }, deadlineTime - now);
            }

            // 2. Schedule Reminder(s)
            if (todo.reminder) {
                let reminderOffsetMs = 0;
                let isRecurring = false;
                let recurrenceIntervalMs = 0;

                const reminderMatch = todo.reminder.match(/(\d+)\s*(min|hour)s?\s*before/i);
                const recurringMatch = todo.reminder.match(/every\s*(\d+)\s*(min|hour)s?/i);

                if (reminderMatch) {
                    const value = parseInt(reminderMatch[1]);
                    const unit = reminderMatch[2].toLowerCase();
                    if (unit === 'min') {
                        reminderOffsetMs = value * 60 * 1000;
                    } else if (unit === 'hour') {
                        reminderOffsetMs = value * 60 * 60 * 1000;
                    }
                }

                if (recurringMatch) {
                    isRecurring = true;
                    const value = parseInt(recurringMatch[1]);
                    const unit = recurringMatch[2].toLowerCase();
                    if (unit === 'min') {
                        recurrenceIntervalMs = value * 60 * 1000;
                    } else if (unit === 'hour') {
                        recurrenceIntervalMs = value * 60 * 60 * 1000;
                    }
                }

                const firstReminderTime = deadlineTime - reminderOffsetMs;

                const triggerReminderAlert = () => {
                    // Only trigger if not completed and before deadline
                    if (!todos[index].completed && new Date().getTime() < deadlineTime) {
                        alert(`REMINDER for "${todo.text}"! Deadline is ${new Date(todo.deadline).toLocaleString()}`);
                    } else {
                        // If completed or past deadline, clear this reminder
                        if (reminderTimers[index]) {
                            clearInterval(reminderTimers[index]);
                            delete reminderTimers[index];
                        }
                    }
                };

                if (isRecurring && recurrenceIntervalMs > 0) {
                    // Schedule the first reminder
                    if (firstReminderTime > now) {
                        reminderTimers[index] = setTimeout(() => {
                            triggerReminderAlert(); // Trigger the first reminder
                            // Then set up recurring reminders until deadline
                            if (new Date().getTime() < deadlineTime) {
                                reminderTimers[index] = setInterval(triggerReminderAlert, recurrenceIntervalMs);
                            }
                        }, firstReminderTime - now);
                    } else if (deadlineTime > now) {
                        // If first reminder time is in the past but deadline is in the future, start recurring immediately
                        triggerReminderAlert(); // Trigger immediately
                        reminderTimers[index] = setInterval(triggerReminderAlert, recurrenceIntervalMs);
                    }
                } else if (firstReminderTime > now) {
                    // For single reminders, schedule a setTimeout
                    reminderTimers[index] = setTimeout(triggerReminderAlert, firstReminderTime - now);
                }
            }
        }
    };

    const renderTodos = () => {
        todoList.innerHTML = '';
        todos.forEach((todo, index) => {
            const listItem = document.createElement('li');
            listItem.className = todo.completed ? 'completed' : '';

            let deadlineDisplay = '';
            if (todo.deadline) {
                const deadlineDate = new Date(todo.deadline);
                const now = new Date();
                const isOverdue = !todo.completed && deadlineDate < now;
                deadlineDisplay = `<span class="deadline-display ${isOverdue ? 'overdue' : ''}">Deadline: ${deadlineDate.toLocaleString()}</span>`;
            }

            let reminderDisplay = '';
            if (todo.reminder) {
                reminderDisplay = `<span class="reminder-display">Reminder: ${todo.reminder}</span>`;
            }

            listItem.innerHTML = `
                <span>${todo.text}</span>
                <div class="todo-meta">
                    ${deadlineDisplay}
                    ${reminderDisplay}
                </div>
                <div>
                    <button data-index="${index}" class="complete-button">${todo.completed ? 'Uncomplete' : 'Complete'}</button>
                    <button data-index="${index}" class="delete-button">Delete</button>
                </div>
            `;
            todoList.appendChild(listItem);
            scheduleTimers(todo, index); // Schedule both deadline and reminder timers
        });
    };

    const addTodo = () => {
        const todoText = todoInput.value.trim();
        const deadline = deadlineInput.value; // datetime-local value
        const reminder = reminderInput.value.trim();

        if (todoText !== '') {
            const newTodo = {
                text: todoText,
                completed: false,
                deadline: deadline || null,
                reminder: reminder || null
            };
            todos.push(newTodo);
            todoInput.value = '';
            deadlineInput.value = '';
            reminderInput.value = '';
            saveTodos();
            renderTodos();
        }
    };

    const toggleComplete = (index) => {
        todos[index].completed = !todos[index].completed;
        if (todos[index].completed) {
            clearAllTimers(index); // Clear all timers if todo is completed
        }
        saveTodos();
        renderTodos();
    };

    const deleteTodo = (index) => {
        clearAllTimers(index); // Clear all timers before deleting
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
    };

    addButton.addEventListener('click', addTodo);

    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    todoList.addEventListener('click', (e) => {
        if (e.target.classList.contains('complete-button')) {
            const index = e.target.dataset.index;
            toggleComplete(index);
        } else if (e.target.classList.contains('delete-button')) {
            const index = e.target.dataset.index;
            deleteTodo(index);
        }
    });

    // Initial render and schedule all timers
    renderTodos();
    // Re-render periodically to update overdue status
    setInterval(renderTodos, 10 * 1000); // Check every 10 seconds
});