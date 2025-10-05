// Random word collections for challenging typing
const randomWords = [
    "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "and", "cat",
    "programming", "computer", "keyboard", "typing", "practice", "speed", "accuracy", "test",
    "random", "words", "challenge", "difficult", "focus", "concentration", "skill", "improvement",
    "letters", "characters", "symbols", "numbers", "space", "backspace", "enter", "shift",
    "amazing", "wonderful", "excellent", "fantastic", "brilliant", "creative", "innovative", "modern",
    "technology", "internet", "website", "application", "software", "hardware", "database", "network",
    "learning", "studying", "practicing", "developing", "building", "creating", "designing", "coding",
    "beautiful", "colorful", "bright", "dark", "light", "heavy", "simple", "complex", "easy", "hard",
    "mountain", "ocean", "forest", "desert", "city", "village", "house", "building", "road", "bridge",
    "music", "art", "book", "movie", "game", "sport", "travel", "adventure", "journey", "destination"
];

// Generate random text from word collection
function generateNewText() {
    const numWords = Math.floor(Math.random() * 8) + 12; // 12-19 words
    let randomText = [];
    
    for (let i = 0; i < numWords; i++) {
        const randomIndex = Math.floor(Math.random() * randomWords.length);
        randomText.push(randomWords[randomIndex]);
    }
    
    return randomText.join(' ');
}

// Game state variables
let currentText = '';
let currentPosition = 0;
let isTestActive = false;
let errors = 0;
let totalCharactersTyped = 0;
let timerInterval = null;
let timeRemaining = 30;

// DOM elements
const textDisplay = document.getElementById('textDisplay');
const textInput = document.getElementById('textInput');
const timerElement = document.getElementById('timer');
const timerProgress = document.getElementById('timerProgress');
const resultsDiv = document.getElementById('results');
const finalWpmElement = document.getElementById('finalWpm');
const finalAccuracyElement = document.getElementById('finalAccuracy');
const highestWpmElement = document.getElementById('highestWpm');

// Initialize the app
function init() {
    resetTest();
    setupEventListeners();
    loadHighScore();
}

// Load highest WPM from local storage
function loadHighScore() {
    const savedHighScore = localStorage.getItem('unicorntype-highest-wpm');
    if (savedHighScore) {
        highestWpmElement.textContent = savedHighScore;
    } else {
        highestWpmElement.textContent = '0';
    }
}

// Save highest WPM to local storage
function saveHighScore(wpm) {
    const currentHigh = parseInt(localStorage.getItem('unicorntype-highest-wpm') || '0');
    if (wpm > currentHigh) {
        localStorage.setItem('unicorntype-highest-wpm', wpm.toString());
        return true; // New record!
    }
    return false;
}

// Setup event listeners
function setupEventListeners() {
    textInput.addEventListener('input', handleInput);
    textInput.addEventListener('keydown', handleKeyDown);
    
    // Make text display clickable to focus the hidden input
    textDisplay.addEventListener('click', () => {
        textInput.focus();
    });
    
    // Add global keydown listener for Enter key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            resetTest(); // Same as clicking "New Text" button
        }
    });
    
    // Auto-focus the input when page loads
    setTimeout(() => textInput.focus(), 100);
}

// Reset the test with new text
function resetTest() {
    currentText = generateNewText();
    currentPosition = 0;
    isTestActive = false;
    errors = 0;
    totalCharactersTyped = 0;
    timeRemaining = 30;
    
    textInput.value = '';
    textInput.disabled = false;
    resultsDiv.style.display = 'none';
    
    clearInterval(timerInterval);
    timerElement.textContent = '30s';
    
    // Reset circular progress
    timerProgress.style.strokeDashoffset = 283;
    
    displayText();
    
    // Focus the input
    setTimeout(() => textInput.focus(), 100);
}

// Restart the current test
function restartTest() {
    currentPosition = 0;
    isTestActive = false;
    errors = 0;
    totalCharactersTyped = 0;
    timeRemaining = 30;
    
    textInput.value = '';
    textInput.disabled = false;
    resultsDiv.style.display = 'none';
    
    clearInterval(timerInterval);
    timerElement.textContent = '30s';
    
    // Reset circular progress
    timerProgress.style.strokeDashoffset = 283;
    
    displayText();
    
    setTimeout(() => textInput.focus(), 100);
}

// Display text with character highlighting
function displayText() {
    let html = '';
    
    for (let i = 0; i < currentText.length; i++) {
        const char = currentText[i];
        let className = '';
        
        if (i < currentPosition) {
            // Check if this character was typed correctly
            className = textInput.value[i] === char ? 'correct' : 'incorrect';
        } else if (i === currentPosition) {
            className = 'current';
        }
        
        // Handle spaces - use regular space to allow wrapping
        const displayChar = char === ' ' ? ' ' : char;
        html += `<span class="char ${className}">${displayChar}</span>`;
    }
    
    textDisplay.innerHTML = html;
}

// Start the test
function startTest() {
    if (!isTestActive) {
        isTestActive = true;
        startTimer();
    }
}

// Start the timer
function startTimer() {
    timerInterval = setInterval(() => {
        if (isTestActive && timeRemaining > 0) {
            timeRemaining--;
            timerElement.textContent = timeRemaining + 's';
            
            // Update circular progress
            const progress = (30 - timeRemaining) / 30;
            const dashOffset = 283 - (progress * 283);
            timerProgress.style.strokeDashoffset = dashOffset;
            
            // End test when timer reaches 0
            if (timeRemaining === 0) {
                completeTest();
            }
        }
    }, 1000);
}

// Handle input changes
function handleInput(event) {
    // Start timer only when user types the first character
    if (!isTestActive && event.target.value.length > 0) {
        startTest();
    }
    
    // Don't allow input if time is up
    if (timeRemaining === 0) {
        return;
    }
    
    const inputValue = event.target.value;
    currentPosition = inputValue.length;
    
    // Update display
    displayText();
    
    // Check if user has typed the full length of current sentence - if so, load next sentence
    if (inputValue.length >= currentText.length && timeRemaining > 0) {
        loadNextSentence();
    }
}

// Load the next sentence and continue typing
function loadNextSentence() {
    // Count errors for the completed sentence
    const completedInput = textInput.value;
    for (let i = 0; i < completedInput.length && i < currentText.length; i++) {
        if (completedInput[i] !== currentText[i]) {
            errors++;
        }
    }
    
    // Update total characters typed before loading new sentence
    totalCharactersTyped += currentText.length;
    
    // Load new sentence with a space separator
    currentText = ' ' + generateNewText();
    currentPosition = 0;
    
    // Clear input and reset for new sentence
    textInput.value = '';
    
    displayText();
}

// Handle special key presses
function handleKeyDown(event) {
    // Prevent backspace beyond the current position or if input is longer than text
    if (event.key === 'Backspace' && textInput.value.length >= currentText.length) {
        event.preventDefault();
    }
}

// Complete the test
function completeTest() {
    isTestActive = false;
    clearInterval(timerInterval);
    
    // Calculate total characters and errors across all sentences
    const currentInput = textInput.value;
    const finalTotalTyped = totalCharactersTyped + currentInput.length;
    
    // Count total errors across all typing
    let totalErrors = errors;
    for (let i = 0; i < currentInput.length && i < currentText.length; i++) {
        if (currentInput[i] !== currentText[i]) {
            totalErrors++;
        }
    }
    
    // Calculate final stats based on 30-second test
    const timeUsed = 30 - timeRemaining; // Time actually used
    const wordsTyped = finalTotalTyped / 5; // Standard: 5 characters = 1 word
    const finalWpm = timeUsed > 0 ? Math.round((wordsTyped / timeUsed) * 60) : 0; // Convert to per minute
    const finalAccuracy = finalTotalTyped > 0 ? Math.round(((finalTotalTyped - totalErrors) / finalTotalTyped) * 100) : 100;
    
    // Check and save high score
    const isNewRecord = saveHighScore(finalWpm);
    
    // Display results
    finalWpmElement.textContent = finalWpm;
    finalAccuracyElement.textContent = finalAccuracy + '%';
    
    // Update highest WPM display
    loadHighScore();
    
    // Set WPM color
    finalWpmElement.style.color = '#c026d3';
    finalWpmElement.style.fontWeight = 'bold';
    
    resultsDiv.style.display = 'block';
    textInput.disabled = true;
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);