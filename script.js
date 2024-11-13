let stream; // Global stream variable to store the media stream

// Request camera access and start streaming
function requestCameraAccess() {
    const video = document.getElementById('camera-stream');
    const takePictureBtn = document.getElementById('take-picture');
    const stopCameraBtn = document.getElementById('stop-camera');
    const cameraBtn = document.getElementById('camera-button');

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
            alert("Camera access was denied or failed. Please check permissions.");
        });
}

// Capture a photo from the video stream
function capturePhoto() {
    const video = document.getElementById('camera-stream');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!stream) {
        alert("Please start the camera first.");
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to Base64 image
    const imageBase64 = canvas.toDataURL("image/jpeg").split(',')[1];

    // Send the image to the backend
    fetch("http://localhost:5000/detect_emotion", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: imageBase64 })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("Error: " + data.error);
        } else {
            alert(`Emotion: ${data.emotion}, Now playing: ${data.song} by ${data.artist}`);
        }
    })
    .catch(error => console.error("Error:", error));
}

// Stop the camera stream
function stopCamera() {
    if (stream) {
        let tracks = stream.getTracks();
        tracks.forEach(track => track.stop()); // Stop all tracks
        document.getElementById('camera-stream').classList.add('hidden'); // Hide the video
        document.getElementById('camera-button').classList.remove('hidden'); // Show the start button
        document.getElementById('take-picture').classList.add('hidden'); // Hide take picture button
        document.getElementById('stop-camera').classList.add('hidden'); // Hide stop button
    }
}
