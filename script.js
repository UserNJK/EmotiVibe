let stream; // This will hold the video stream from the camera

// Function to request camera access
function requestCameraAccess() {
    const video = document.getElementById('camera-stream');
    const takePictureBtn = document.getElementById('take-picture');
    const stopCameraBtn = document.getElementById('stop-camera');
    const cameraBtn = document.getElementById('camera-button');

    // Request the camera stream from the user
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(mediaStream => {
            stream = mediaStream; // Store the stream globally
            video.srcObject = mediaStream; // Show the video feed in the video element
            video.classList.remove('hidden'); // Show the video element
            cameraBtn.classList.add('hidden'); // Hide the "Start Camera" button
            takePictureBtn.classList.remove('hidden'); // Show the "Take Picture" button
            stopCameraBtn.classList.remove('hidden'); // Show the "Stop Camera" button
        })
        .catch(err => {
            console.error("Error accessing camera:", err);
            alert("Camera access was denied.");
        });
}

// Function to capture a photo
function capturePhoto() {
    const video = document.getElementById('camera-stream');
    const emotionPopup = document.getElementById('emotion-popup');
    const canvas = document.createElement('canvas'); // Create a canvas element to hold the photo
    const context = canvas.getContext('2d'); // Get the canvas context

    // Check if the camera stream is active
    if (!stream) {
        alert("Please start the camera first.");
        return;
    }

    // Set canvas size to match video feed size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current frame from the video feed to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Show the "Analyzing your emotion" popup for 2 seconds
    emotionPopup.classList.add('active'); // Add 'active' class to show the pop-up
    setTimeout(() => {
        emotionPopup.classList.remove('active'); // Hide the pop-up after 2 seconds
        showChatbot(); // Display the chatbot after the analysis
    }, 2000);
}

// Function to stop the camera stream
function stopCamera() {
    const video = document.getElementById('camera-stream');

    // Stop all tracks (this stops the camera)
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    // Clear the video element and hide it
    video.srcObject = null;
    video.classList.add('hidden'); // Hide the video element

    // Hide "Take Picture" and "Stop Camera" buttons
    document.getElementById('take-picture').classList.add('hidden');
    document.getElementById('stop-camera').classList.add('hidden');

    // Show the "Start Camera" button again
    document.getElementById('camera-button').classList.remove('hidden');
}

// Function to display the chatbot
function showChatbot() {
    document.getElementById('chatbot').classList.add('active'); // Show the chatbot by adding 'active' class
}

// Function to close the chatbot
function closeChatbot() {
    document.getElementById('chatbot').classList.remove('active'); // Hide the chatbot by removing 'active' class
}

// Chatbot functionality for sending and receiving messages
function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value;

    if (message.trim() !== "") {
        const messagesDiv = document.getElementById('messages');

        // Display the user's message
        const userMessage = document.createElement('div');
        userMessage.textContent = "You: " + message;
        messagesDiv.appendChild(userMessage);

        chatInput.value = ""; // Clear the input field

        // Simulate a chatbot reply after 1 second
        setTimeout(() => {
            const botMessage = document.createElement('div');
            botMessage.textContent = "Bot: " + "Hello! How can I help you?";
            messagesDiv.appendChild(botMessage);

            // Scroll to the latest message
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }, 1000);
    }
}
