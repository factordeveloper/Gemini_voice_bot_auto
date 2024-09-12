// Configurar reconocimiento de voz
let recognition;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
} else if ('SpeechRecognition' in window) {
    recognition = new SpeechRecognition();
}

recognition.lang = 'es-ES';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const recordButton = document.getElementById('recordButton');
let isRecording = false;

recordButton.addEventListener('mousedown', function () {
    recognition.start();
    isRecording = true;
    recordButton.textContent = '🎙️ Grabando...';
});

recordButton.addEventListener('mouseup', function () {
    if (isRecording) {
        recognition.stop();
        recordButton.textContent = '🎙️ Mantén para Grabar';
        isRecording = false;
    }
});

recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    sendPrompt(transcript);
};

recognition.onspeechend = function () {
    recognition.stop();
};

// Enviar el texto a la API y reproducir la respuesta
function sendPrompt(prompt) {
    const apiKey = 'AIzaSyBhHYEGpFfGiQfKGU4udecPt_bT6sCtqko'; // Reemplaza esto con tu clave de API real 

    const url = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

    const requestBody = {
        contents: [
            {
                role: 'user',
                parts: [
                    { text: prompt }
                ]
            }
        ]
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => response.json())
        .then(data => {
            const responseContainer = document.getElementById('responseContainer');
            if (data.error) {
                responseContainer.textContent = `Error: ${data.error.message}`;
            } else {
                const textResponse = data.candidates[0]?.content?.parts[0]?.text || 'No response text available';
                responseContainer.textContent = textResponse;
                speakResponse(textResponse); // Reproducir la respuesta
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('responseContainer').textContent = 'Error: ' + error;
        });
}

// Función para convertir texto a voz
function speakResponse(text) {
    const synth = window.speechSynthesis;
    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.lang = 'es-ES'; // Cambiar el idioma si es necesario
    synth.speak(utterThis);
}
