// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/-bSSnnMIN/";

let model, webcam, labelContainer, maxPredictions;
let gameActive = false;
let targetObject = ''; // '핸드폰' or '사진'
const classes = ['핸드폰', '사진']; // Expected classes from the Teachable Machine model
const PREDICTION_THRESHOLD = 0.9; // Minimum probability to consider a match

// DOM elements
const gameStatusElem = document.getElementById('game-status');
const targetObjectElem = document.getElementById('target-object');
const gameMessageElem = document.getElementById('game-message');

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }

    gameStatusElem.textContent = "웹캠 준비 완료. 게임 시작 버튼을 눌러주세요!";
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    const prediction = await model.predict(webcam.canvas);
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
            webcam.stop(); // Stop webcam feed
        } else {
            gameMessageElem.textContent = ` ${targetObject}을(를) 찾아보세요!`;
            gameMessageElem.classList.remove('correct');
        }
    }
}

function startGame() {
    gameActive = true;
    gameMessageElem.textContent = '';
    gameMessageElem.classList.remove('correct');
    
    // Randomly select target object
    targetObject = classes[Math.floor(Math.random() * classes.length)];
    targetObjectElem.textContent = `찾아야 할 물건: ${targetObject}`;
    gameStatusElem.textContent = "게임을 시작합니다!";

    // Ensure webcam is playing when starting a new game
    if (webcam && !webcam.canvas.isConnected) {
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        webcam.play();
        window.requestAnimationFrame(loop);
    } else if (webcam && webcam.canvas.isConnected) {
        webcam.play();
    } else {
        // If webcam is not initialized, call init()
        init();
    }
}

// Initialize the model and webcam when the page loads
document.addEventListener('DOMContentLoaded', init);
