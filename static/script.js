const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsDiv = document.getElementById('results');
const audioPlayer = document.getElementById('audio-player');
const upNextDiv = document.getElementById('up-next');

let upNextQueue = [];

// Search YouTube
searchBtn.addEventListener('click', () => {
    const query = searchInput.value;
    if (!query) return alert('Please enter a search term.');

    fetch(`/search?query=${query}`)
        .then(response => response.json())
        .then(data => {
            resultsDiv.innerHTML = '';
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'result-item';

                div.innerHTML = `
                    <img src="${item.thumbnail}" alt="Thumbnail">
                    <span>${item.title}</span>
                    <button class="play-btn" data-video-id="${item.videoId}">Play</button>
                    <button class="queue-btn" data-video-id="${item.videoId}" data-title="${item.title}">Add to Queue</button>
                `;

                resultsDiv.appendChild(div);
            });
        });
});

// Play Audio
resultsDiv.addEventListener('click', event => {
    if (event.target.classList.contains('play-btn')) {
        const videoId = event.target.getAttribute('data-video-id');
        playAudio(videoId);
    } else if (event.target.classList.contains('queue-btn')) {
        const videoId = event.target.getAttribute('data-video-id');
        const title = event.target.getAttribute('data-title');
        addToQueue(videoId, title);
    }
});

// Add to Queue
function addToQueue(videoId, title) {
    upNextQueue.push({ videoId, title });
    updateUpNext();
}

// Update "Up Next" Section
function updateUpNext() {
    upNextDiv.innerHTML = '<h3>Up Next</h3>';
    upNextQueue.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'up-next-item';

        div.innerHTML = `
            <span>${item.title}</span>
            <button class="play-btn" data-video-id="${item.videoId}">Play Now</button>
            <button class="remove-btn" data-index="${index}">Remove</button>
        `;

        upNextDiv.appendChild(div);
    });
}

// Play the next song in the queue
audioPlayer.addEventListener('ended', () => {
    if (upNextQueue.length > 0) {
        const nextItem = upNextQueue.shift(); // Remove the first item from the queue
        playAudio(nextItem.videoId);
        updateUpNext();
    }
});

// Remove a song from the queue
upNextDiv.addEventListener('click', event => {
    if (event.target.classList.contains('remove-btn')) {
        const index = event.target.getAttribute('data-index');
        upNextQueue.splice(index, 1);
        updateUpNext();
    }
});

// Play audio by video ID
function playAudio(videoId) {
    fetch(`/stream?video_id=${videoId}`)
        .then(response => response.json())
        .then(data => {
            audioPlayer.src = data.audio_url;
            audioPlayer.play();
        });
        fetchRecommendations(videoId);
}
const recommendedDiv = document.createElement('div');
recommendedDiv.id = 'recommended';
document.querySelector('.container').appendChild(recommendedDiv);

// Fetch recommendations for the current song
function fetchRecommendations(videoId) {
    fetch(`/recommend?video_id=${videoId}`)
        .then(response => response.json())
        .then(data => {
            recommendedDiv.innerHTML = '<h3>Recommended Songs</h3>';
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'recommended-item';

                div.innerHTML = `
                    <img src="${item.thumbnail}" alt="Thumbnail">
                    <span>${item.title}</span>
                    <button class="play-btn" data-video-id="${item.videoId}">Play</button>
                `;

                recommendedDiv.appendChild(div);
            });
        });
}

// Play the first recommended song if "Up Next" is empty
audioPlayer.addEventListener('ended', () => {
    if (upNextQueue.length === 0 && recommendedDiv.children.length > 1) {
        const firstRecommendation = recommendedDiv.querySelector('.play-btn');
        if (firstRecommendation) {
            const videoId = firstRecommendation.getAttribute('data-video-id');
            playAudio(videoId);
            
        }
    }
});

// Play recommended song directly
recommendedDiv.addEventListener('click', event => {
    if (event.target.classList.contains('play-btn')) {
        const videoId = event.target.getAttribute('data-video-id');
        playAudio(videoId);
    }
});

