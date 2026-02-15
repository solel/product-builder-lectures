document.addEventListener('DOMContentLoaded', () => {
    const newHabitInput = document.getElementById('new-habit-input');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const habitList = document.getElementById('habit-list');
    const currentDateSpan = document.getElementById('current-date');
    const prevDayBtn = document.getElementById('prev-day-btn');
    const nextDayBtn = document.getElementById('next-day-btn');

    let habits = [];
    let selectedDate = new Date(); // Tracks the date currently being viewed

    // Pastel colors for habit items
    const pastelColors = [
        '#FFD1DC', // Light Pink
        '#FFABAB', // Light Red
        '#FFC3A0', // Peach
        '#FF677D', // Coral
        '#D4A5A5', // Rosy Brown
        '#FFD700', // Gold
        '#C6E2E9', // Powder Blue
        '#ADD8E6', // Light Blue
        '#87CEEB', // Sky Blue
        '#B0E0E6', // Powder Blue (again, to have more options)
        '#C1E1C1', // Light Green
        '#A1D9D9', // Light Cyan
        '#BFEABC', // Light Mint
        '#E0BBE4', // Lavender
        '#957DAD', // Medium Purple
        '#D291BC', // Orchid
        '#FFCCE5'  // Pinkish White
    ];

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

        habits.forEach((habit, index) => {
            const habitItem = document.createElement('div');
            habitItem.classList.add('habit-item');
            
            // Assign pastel background color
            const color = pastelColors[index % pastelColors.length];
            habitItem.style.backgroundColor = color;
            // Also set border color for better contrast
            habitItem.style.borderColor = color.replace(/(\d+)/g, (match) => Math.max(0, parseInt(match) - 20)); // Darker border

            if (habit.dailyRecords && habit.dailyRecords[formattedSelectedDate]) {
                habitItem.classList.add('completed');
            }

            const habitName = document.createElement('span');
            habitName.textContent = habit.name;
            habitName.style.color = '#333'; // Ensure readable text against pastel background

            const completeButton = document.createElement('button');
            completeButton.classList.add('complete-btn');
            completeButton.textContent = (habit.dailyRecords && habit.dailyRecords[formattedSelectedDate]) ? '미완료' : '완료';

            // Change button color based on completion status
            if (habit.dailyRecords && habit.dailyRecords[formattedSelectedDate]) {
                completeButton.style.backgroundColor = '#f44336'; // Red for 'Mark Incomplete'
                completeButton.style.borderColor = '#d32f2f'; // Darker red border
            } else {
                completeButton.style.backgroundColor = '#2196F3'; // Blue for 'Complete'
                completeButton.style.borderColor = '#1976D2'; // Darker blue border
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