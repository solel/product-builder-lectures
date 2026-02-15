document.addEventListener('DOMContentLoaded', () => {
    const newHabitInput = document.getElementById('new-habit-input');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const habitList = document.getElementById('habit-list');
    const currentDateSpan = document.getElementById('current-date');
    const prevDayBtn = document.getElementById('prev-day-btn');
    const nextDayBtn = document.getElementById('next-day-btn');

    let habits = [];
    let selectedDate = new Date(); // Tracks the date currently being viewed

    // Refined, harmonious pastel colors for habit items
    const pastelColors = [
        '#FFEBEE', // Very Light Red/Pink (from Material Design)
        '#E3F2FD', // Very Light Blue
        '#E8F5E9', // Very Light Green
        '#FFF3E0', // Very Light Orange
        '#F3E5F5', // Very Light Purple
        '#EFEBE9', // Light Brown/Grey
        '#E0F2F7', // Another Light Blue
        '#FCE4EC', // Another Light Pink
        '#F1F8E9', // Another Light Green
        '#FFFDE7', // Creamy Yellow
        '#EDE7F6', // Light Lavender
        '#D7CCC8', // Light Greyish Brown
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
            
            // Set border color for better contrast, slightly darker than background
            // Simple method: darken a bit, or use a predefined darker shade
            const darkColor = darkenColor(color, 10); // Darken by 10%
            habitItem.style.borderColor = darkColor;

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

    // Helper function to darken a hex color (simple version)
    function darkenColor(hex, percent) {
        let f = parseInt(hex.slice(1), 16),
            t = percent < 0 ? 0 : 255,
            p = percent < 0 ? percent * -1 : percent,
            R = f >> 16,
            G = (f >> 8) & 0x00ff,
            B = f & 0x0000ff;
        return "#" + (
            0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 +
            (Math.round((t - G) * p) + G) * 0x100 +
            (Math.round((t - B) * p) + B)
        ).toString(16).slice(1);
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