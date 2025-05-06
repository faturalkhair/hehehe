// --- Pengaturan Durasi (dalam menit) ---
const durations = {
    focus: 25,
    shortBreak: 5,
    // longBreak: 15,
};
const roundsBeforeLongBreak = 4;
// ----------------------------------------

// --- Ambil Elemen DOM ---
const timeLeftDisplay = document.getElementById('time-left');
const modeDisplay = document.getElementById('mode');
const startPauseButton = document.getElementById('start-pause-btn');
const resetButton = document.getElementById('reset-btn');
const progressCircle = document.querySelector('.progress-ring__circle');
const pomodoroContainer = document.querySelector('.pomodoro-container');
const roundCountDisplay = document.getElementById('round-count');
const totalRoundsDisplay = document.getElementById('total-rounds');

// --- Variabel State Timer ---
let timerInterval = null; // Untuk menyimpan ID interval
let currentMode = 'focus'; // 'focus', 'shortBreak', 'longBreak'
let timeRemaining = durations[currentMode] * 60; // Waktu tersisa dalam detik
let isPaused = true; // Status awal: paused
let pomodoroCount = 0; // Jumlah sesi focus yang selesai

// --- Pengaturan SVG Progress Circle ---
const radius = progressCircle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;
progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = circumference; // Awalnya penuh

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
}

function updateDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timeLeftDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    // Update Judul Halaman (opsional)
    document.title = `${timeLeftDisplay.textContent} - ${modeDisplay.textContent}`;

    // Update Progress Circle
    const totalDuration = durations[currentMode] * 60;
    const percent = ((totalDuration - timeRemaining) / totalDuration) * 100;
    setProgress(percent);
}

function updateModeDisplay() {
    let modeText = '';
    switch (currentMode) {
        case 'focus':
            modeText = 'FOCUS';
            break;
        case 'shortBreak':
            modeText = 'SHORT BREAK';
            break;
        case 'longBreak':
            modeText = 'LONG BREAK';
            break;
    }
    modeDisplay.textContent = modeText;

    // Hapus class mode sebelumnya dan tambahkan yang baru
    pomodoroContainer.classList.remove('focus-mode', 'short-break-mode', 'long-break-mode');
    pomodoroContainer.classList.add(`${currentMode.replace('B','-b')}-mode`); // contoh: shortBreak -> short-break-mode
}

function switchMode(newMode) {
    clearInterval(timerInterval); // Hentikan interval lama
    timerInterval = null;
    currentMode = newMode;
    timeRemaining = durations[currentMode] * 60;
    isPaused = true; // Mode baru selalu mulai dalam keadaan paused
    startPauseButton.innerHTML = '<i class="fas fa-play"></i>'; // Set tombol ke Play
    updateModeDisplay();
    updateDisplay(); // Perbarui tampilan waktu dan progress
}

function timerTick() {
    if (timeRemaining > 0) {
        timeRemaining--;
        updateDisplay();
    } else {
        // Waktu habis
        clearInterval(timerInterval);
        timerInterval = null;

        // Putar suara notifikasi (opsional, perlu file audio)
        // const alarmSound = new Audio('path/to/alarm.mp3');
        // alarmSound.play();

        if (currentMode === 'focus') {
            pomodoroCount++;
            roundCountDisplay.textContent = pomodoroCount;
            if (pomodoroCount % roundsBeforeLongBreak === 0) {
                switchMode('longBreak');
            } else {
                switchMode('shortBreak');
            }
        } else { // Jika selesai break (short atau long)
            switchMode('focus'); // Kembali ke focus
        }

        // Otomatis mulai mode berikutnya? Atau biarkan user menekan Play?
        // Untuk sekarang, biarkan user menekan Play lagi.
        isPaused = true;
        startPauseButton.innerHTML = '<i class="fas fa-play"></i>';
    }
}

function toggleTimer() {
    if (isPaused) {
        isPaused = false;
        startPauseButton.innerHTML = '<i class="fas fa-pause"></i>'; // Ganti ikon ke Pause
        // Mulai interval hanya jika belum ada
        if (!timerInterval) {
             // Jalankan tick pertama kali segera
             timerTick();
             // Kemudian set interval
             timerInterval = setInterval(timerTick, 1000);
        }
    } else {
        isPaused = true;
        startPauseButton.innerHTML = '<i class="fas fa-play"></i>'; // Ganti ikon ke Play
        clearInterval(timerInterval);
        timerInterval = null; // Set null saat di-pause
    }
}

function resetCurrentTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timeRemaining = durations[currentMode] * 60; // Reset waktu ke durasi mode saat ini
    isPaused = true;
    startPauseButton.innerHTML = '<i class="fas fa-play"></i>'; // Tombol jadi Play
    updateDisplay(); // Perbarui tampilan waktu dan progress
}

// --- Event Listeners ---
startPauseButton.addEventListener('click', toggleTimer);
resetButton.addEventListener('click', resetCurrentTimer);

// --- Inisialisasi Awal ---
totalRoundsDisplay.textContent = roundsBeforeLongBreak;
updateModeDisplay(); // Set mode awal
updateDisplay(); // Set waktu awal dan progress