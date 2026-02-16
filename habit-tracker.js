document.addEventListener('DOMContentLoaded', () => {
    const newHabitInput = document.getElementById('new-habit-input');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const habitList = document.getElementById('habit-list');
    const currentDateSpan = document.getElementById('current-date');
    const prevDayBtn = document.getElementById('prev-day-btn');
    const nextDayBtn = document.getElementById('next-day-btn');
    const calendarGrid = document.getElementById('calendar-grid');

    let habits = [];
    let selectedDate = new Date(); // Tracks the date currently being viewed

    // --- Helper Functions ---

    function getFormattedDate(date) {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    function displayDate() {
        currentDateSpan.textContent = getFormattedDate(selectedDate);
    }

    function loadHabits() {
        const storedHabits = localStorage.getItem('habits');
        if (storedHabits) {
            habits = JSON.parse(storedHabits);
        }
    }

    function saveHabits() {
        localStorage.setItem('habits', JSON.stringify(habits));
    }

    function renderHabits() {
        habitList.innerHTML = ''; // Clear current list

        if (habits.length === 0) {
            habitList.innerHTML = '<p class="no-habits-message">아직 습관이 없습니다. 새 습관을 추가해 보세요!</p>';
            return;
        }

        const formattedSelectedDate = getFormattedDate(selectedDate);

        habits.forEach((habit) => {
            const habitItem = document.createElement('div');
            habitItem.classList.add('habit-item');
            
            // Background and border now handled by CSS for unified look
            if (habit.dailyRecords && habit.dailyRecords[formattedSelectedDate]) {
                habitItem.classList.add('completed');
            }

            const habitName = document.createElement('span');
            habitName.textContent = habit.name;
            // Text color now handled by CSS
            // habitName.style.color = '#333'; 

            const completeButton = document.createElement('button');
            completeButton.classList.add('complete-btn');
            completeButton.textContent = (habit.dailyRecords && habit.dailyRecords[formattedSelectedDate]) ? '미완료' : '완료';

            if (habit.dailyRecords && habit.dailyRecords[formattedSelectedDate]) {
                completeButton.classList.add('mark-completed'); // Apply class for styling
            }

            completeButton.addEventListener('click', () => {
                toggleHabitCompletion(habit.id, formattedSelectedDate);
            });

            habitItem.appendChild(habitName);
            habitItem.appendChild(completeButton);
            habitList.appendChild(habitItem);
        });
    }

    function renderCalendar() {
        calendarGrid.innerHTML = ''; // Clear current calendar grid

        if (habits.length === 0) {
            // calendarGrid.innerHTML = '<p class="no-habits-message">습관이 없어 진행 상황을 표시할 수 없습니다.</p>';
            return; // Don't render empty grid, just empty habit list message is enough
        }

        const today = new Date();
        const numDays = 90; // Show last 90 days
        const dates = [];

        // Generate dates for the last numDays
        for (let i = numDays - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            dates.push(d);
        }

        dates.forEach(date => {
            const cell = document.createElement('div');
            cell.classList.add('calendar-cell');
            const formattedDate = getFormattedDate(date);

            let completedHabitsCount = 0;
            let tooltipContent = `${formattedDate}\n`;
            let completedHabitNames = [];
            let incompleteHabitNames = [];

            habits.forEach(habit => {
                if (habit.dailyRecords && habit.dailyRecords[formattedDate]) {
                    completedHabitsCount++;
                    completedHabitNames.push(habit.name);
                } else {
                    incompleteHabitNames.push(habit.name);
                }
            });

            const completionPercentage = habits.length > 0 ? (completedHabitsCount / habits.length) : 0;
            let level = 0;
            if (completionPercentage === 1) {
                level = 4; // All habits completed
            } else if (completionPercentage >= 0.75) {
                level = 3;
            } else if (completionPercentage >= 0.5) {
                level = 2;
            } else if (completionPercentage > 0) {
                level = 1; // Some habits completed
            }
            cell.classList.add(`level-${level}`);

            if (completedHabitNames.length > 0) {
                tooltipContent += `완료: ${completedHabitNames.join(', ')}\n`;
            }
            if (incompleteHabitNames.length > 0) {
                tooltipContent += `미완료: ${incompleteHabitNames.join(', ')}`;
            }
            if (completedHabitNames.length === 0 && incompleteHabitNames.length === 0) {
                 tooltipContent += `습관 없음`;
            } else if (completedHabitNames.length === 0 && incompleteHabitNames.length > 0) {
                tooltipContent = `${formattedDate}\n모두 미완료`;
            } else if (completedHabitNames.length > 0 && incompleteHabitNames.length === 0) {
                tooltipContent = `${formattedDate}\n모두 완료`;
            }


            cell.setAttribute('data-tooltip', tooltipContent);
            calendarGrid.appendChild(cell);
        });
    }

    function addHabit(name) {
        if (name.trim() === '') {
            alert('습관 이름을 입력해 주세요.');
            return;
        }

        const newHabit = {
            id: Date.now().toString(), // Simple unique ID
            name: name.trim(),
            dailyRecords: {} // To store completion status for each day
        };
        habits.push(newHabit);
        saveHabits();
        newHabitInput.value = ''; // Clear input field
        renderAll(); // Re-render everything
    }

    function toggleHabitCompletion(habitId, date) {
        const habitIndex = habits.findIndex(h => h.id === habitId);
        if (habitIndex > -1) {
            const habit = habits[habitIndex];
            if (!habit.dailyRecords) {
                habit.dailyRecords = {};
            }
            // Toggle the completion status for the selected date
            habit.dailyRecords[date] = !habit.dailyRecords[date];
            saveHabits();
            renderAll(); // Re-render everything
        }
    }

    function renderAll() {
        displayDate();
        renderHabits();
        renderCalendar();
    }

    // --- Event Listeners ---

    addHabitBtn.addEventListener('click', () => {
        addHabit(newHabitInput.value);
    });

    newHabitInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addHabit(newHabitInput.value);
        }
    });

    prevDayBtn.addEventListener('click', () => {
        selectedDate.setDate(selectedDate.getDate() - 1);
        renderAll();
    });

    nextDayBtn.addEventListener('click', () => {
        selectedDate.setDate(selectedDate.getDate() + 1);
        renderAll();
    });

    // --- Initialization ---
    loadHabits();
    renderAll();
});