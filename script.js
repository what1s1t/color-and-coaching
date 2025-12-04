// --------------------------------------------------------
// Global Constants for Gemini Image Generation
// --------------------------------------------------------
const IMAGE_MODEL = 'imagen-4.0-generate-001';
const API_KEY = ""; // Canvas will provide this at runtime

/**
 * Retries the fetch request with exponential backoff.
 * API 호출이 실패하거나 속도 제한에 걸렸을 때 재시도하는 로직입니다.
 * @param {string} url The API endpoint URL.
 * @param {object} options Fetch request options.
 * @param {number} maxRetries Maximum number of retries.
 * @returns {Promise<Response>} The successful response.
 */
async function fetchWithRetry(url, options, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            } else if (response.status === 429) { // Rate limit or transient error
                if (i < maxRetries - 1) {
                    const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
            }
            throw new Error(`API request failed with status ${response.status}`);
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error;
            }
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Generates an image using the Gemini API and updates the corresponding container.
 * Gemini API를 사용하여 이미지를 생성하고 HTML 컨테이너를 업데이트합니다.
 * @param {string} containerId The ID of the HTML element to hold the image.
 * @param {string} prompt The text prompt for image generation.
 */
async function generateImage(containerId, prompt) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Show loading spinner (로딩 스피너 표시)
    container.innerHTML = '<div class="spinner"></div>';
    container.classList.add('flex', 'items-center', 'justify-center');

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:predict?key=${API_KEY}`;
    const payload = { 
        instances: { prompt: prompt }, 
        parameters: { 
            sampleCount: 1,
            aspectRatio: "16:9" 
        } 
    };

    try {
        const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
            const base64Data = result.predictions[0].bytesBase64Encoded;
            const imageUrl = `data:image/png;base64,${base64Data}`;
            
            // Create and insert the image element (이미지 엘리먼트 생성 및 삽입)
            const img = new Image();
            img.src = imageUrl;
            img.alt = prompt;
            img.className = 'w-full h-full object-cover rounded-lg shadow-md';
            
            // Clear spinner and insert image (스피너 제거 후 이미지 삽입)
            container.innerHTML = '';
            container.appendChild(img);
            container.classList.remove('flex', 'items-center', 'justify-center');

        } else {
            const errorMessage = result.error?.message || "이미지 생성 실패";
            container.innerHTML = `<p class="text-sm text-red-600 text-center p-2">오류: ${errorMessage}</p>`;
        }
    } catch (error) {
        console.error("Image generation error:", error);
        container.innerHTML = `<p class="text-sm text-red-600 text-center p-2">이미지 로딩 중 오류가 발생했습니다.</p>`;
    }
}

// --------------------------------------------------------
// Event Handlers and Initialization
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle logic
    document.getElementById('menu-button').addEventListener('click', function() {
        var mobileMenu = document.getElementById('mobile-menu');
        mobileMenu.classList.toggle('hidden');
    });

    // Simple contact form submission handler
    document.getElementById('contact-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const messageBox = document.getElementById('contact-message-box');
        
        // For demonstration, show success message
        messageBox.textContent = '문의가 성공적으로 접수되었습니다. 곧 연락드리겠습니다.';
        messageBox.className = 'mt-4 p-4 bg-green-100 text-green-800 rounded-lg text-sm text-center font-medium';
        messageBox.classList.remove('hidden');
        
        setTimeout(() => {
            messageBox.classList.add('hidden');
        }, 5000);

        this.reset();
    });

    // Run image generation for all containers
    const containers = document.querySelectorAll('[data-prompt]');
    containers.forEach(container => {
        const id = container.id;
        const prompt = container.getAttribute('data-prompt');
        generateImage(id, prompt);
    });
});
