document.addEventListener('DOMContentLoaded', () => {
    const newHabitInput = document.getElementById('new-habit-input');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const habitList = document.getElementById('habit-list');
    const currentDateSpan = document.getElementById('current-date');
    const prevDayBtn = document.getElementById('prev-day-btn');
    const nextDayBtn = document.getElementById('next-day-btn');

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

        habits.forEach(habit => {
            const habitItem = document.createElement('div');
            habitItem.classList.add('habit-item');
            if (habit.dailyRecords && habit.dailyRecords[formattedSelectedDate]) {
                habitItem.classList.add('completed');
            }

            const habitName = document.createElement('span');
            habitName.textContent = habit.name;

            const completeButton = document.createElement('button');
            completeButton.classList.add('complete-btn');
            completeButton.textContent = (habit.dailyRecords && habit.dailyRecords[formattedSelectedDate]) ? '미완료' : '완료';

            if (habit.dailyRecords && habit.dailyRecords[formattedSelectedDate]) {
                completeButton.classList.add('mark-completed'); // Style for 'Mark Incomplete'
            }

            completeButton.addEventListener('click', () => {
                toggleHabitCompletion(habit.id, formattedSelectedDate);
            });

            habitItem.appendChild(habitName);
            habitItem.appendChild(completeButton);
            habitList.appendChild(habitItem);
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
        renderHabits();
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
            renderHabits(); // Re-render to update UI
        }
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
        displayDate();
        renderHabits();
    });

    nextDayBtn.addEventListener('click', () => {
        selectedDate.setDate(selectedDate.getDate() + 1);
        displayDate();
        renderHabits();
    });

    // --- Initialization ---
    loadHabits();
    displayDate();
    renderHabits();
});