// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/-bSSnnMIN/";

let model, labelContainer, maxPredictions;
let gameActive = false;
let targetObject = ''; // '핸드폰' or '사진'
const classes = ['핸드폰', '사진']; // Expected classes from the Teachable Machine model
const PREDICTION_THRESHOLD = 0.9; // Minimum probability to consider a match

// DOM elements
const gameStatusElem = document.getElementById('game-status');
const targetObjectElem = document.getElementById('target-object');
const gameMessageElem = document.getElementById('game-message');
const fileInput = document.getElementById('file-input');
const dropArea = document.getElementById('drop-area');
const uploadedImage = document.getElementById('uploaded-image');
let imageForPrediction = null; // Stores the image element for prediction

// Load the image model
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    gameStatusElem.textContent = "모델 준비 완료. 이미지를 업로드하고 게임 시작 버튼을 눌러주세요!";

    setupEventListeners();
}

function setupEventListeners() {
    // Click to open file dialog
    dropArea.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', (event) => {
        handleFiles(event.target.files);
    });

    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    dropArea.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    dropArea.classList.add('highlight');
}

function unhighlight() {
    dropArea.classList.remove('highlight');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    handleFiles(files);
}

function handleFiles(files) {
    if (files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
        gameMessageElem.textContent = "이미지 파일만 업로드할 수 있습니다.";
        gameMessageElem.classList.remove('correct');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImage.src = e.target.result;
        uploadedImage.style.display = 'block'; // Show the image
        imageForPrediction = uploadedImage; // Set the image for prediction
        predict(); // Make a prediction immediately after image is loaded
    };
    reader.readAsDataURL(file);
    gameMessageElem.textContent = "이미지 업로드됨. 예측 중...";
    gameMessageElem.classList.remove('correct');
}


// run the image through the image model
async function predict() {
    if (!imageForPrediction) {
        // Clear previous predictions if no image is present
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.childNodes[i].innerHTML = "";
        }
        return;
    }

    // Teachable Machine's predict function can take an HTMLImageElement
    const prediction = await model.predict(imageForPrediction);
    let currentPredictionClass = '';
    let currentPredictionProbability = 0;

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;

        // Find the most probable class
        if (prediction[i].probability > currentPredictionProbability) {
            currentPredictionProbability = prediction[i].probability;
            currentPredictionClass = prediction[i].className;
        }
    }

    if (gameActive && targetObject) {
        if (currentPredictionClass === targetObject && currentPredictionProbability >= PREDICTION_THRESHOLD) {
            gameMessageElem.textContent = `축하합니다! ${targetObject}을(를) 찾았습니다!`;
            gameMessageElem.classList.add('correct');
            gameActive = false; // Game over
        } else {
            gameMessageElem.textContent = ` ${targetObject}을(를) 찾아보세요!`;
            gameMessageElem.classList.remove('correct');
        }
    } else if (!gameActive && imageForPrediction) {
        // If not in game mode, just show the prediction status
        gameStatusElem.textContent = `현재 예측: ${currentPredictionClass} (${(currentPredictionProbability * 100).toFixed(0)}%)`;
    }
}

function startGame() {
    gameActive = true;
    gameMessageElem.textContent = '';
    gameMessageElem.classList.remove('correct');
    
    // Clear previous image and predictions
    uploadedImage.src = '#';
    uploadedImage.style.display = 'none';
    imageForPrediction = null;
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.childNodes[i].innerHTML = "";
    }

    // Randomly select target object
    targetObject = classes[Math.floor(Math.random() * classes.length)];
    targetObjectElem.textContent = `찾아야 할 물건: ${targetObject}`;
    gameStatusElem.textContent = "이미지를 업로드하고 예측해 보세요!";
}

// Initialize the model when the page loads
document.addEventListener('DOMContentLoaded', init);
