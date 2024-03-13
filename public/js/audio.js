document.addEventListener('DOMContentLoaded', () => {
    // Get a reference to the audio element
    const audio = document.getElementById('audioPlayer');
    // Get a reference to the play button
    const playButton = document.getElementById('chips_100');
    const playButton2 = document.getElementById('chips_500');
    const playButton3 = document.getElementById('chips_1000');
    const playButton4 = document.getElementById('chips_2500');
    // Add event listener to the play button
    playButton.addEventListener('click', () => {
        try {
            // Play the audio
            audio.play();
            console.log('Audio file started playing successfully.');
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    });

    playButton2.addEventListener('click', () => {
        try {
            // Play the audio
            audio.play();
            console.log('Audio file started playing successfully.');
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    });

    playButton3.addEventListener('click', () => {
        try {
            // Play the audio
            audio.play();
            console.log('Audio file started playing successfully.');
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    });

    playButton4.addEventListener('click', () => {
        try {
            // Play the audio
            audio.play();
            console.log('Audio file started playing successfully.');
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    });
});

const audio2 = document.getElementById('audioPlayer2');
const deal_btn = document.getElementById('deal_btn');

const playAudioMultipleTimes = () => {
    try {
        let count = 0;
        const playNext = () => {
        if (count < 4) {
            audio2.play();
            count++
        } else {
            console.log('Audio file played success')
        }
    };
    playNext();
    audio2.addEventListener('ended', playNext);
} catch (error) {
    console.error('Error', error);
}
};

deal_btn.addEventListener('click', () => {
    playAudioMultipleTimes();
});

const audio3 = document.getElementById('audioPlayer3');
const hit_btn = document.getElementById('hit_btn');

hit_btn.addEventListener('click', () => {
    try {
        audio3.play();
        console.log('Success')
    } catch (error) {
        console.log('error');
    }
});

function playAudio(audioURL) {
    const audio = new Audio(audioURL);
    audio.play();
}

const audio4 = document.getElementById('audioPlayer4');
const stay_button = document.getElementById('stay_btn');

stay_button.addEventListener('click', () => {
    try {
        audio4.play();
        console.log('Success')
    } catch (error) {
        console.log('error');
    }
});

function playAudio(audioURL) {
    const audio = new Audio(audioURL);
    audio.play();
}

const audio5 = document.getElementById('audioPlayer5');
const doubledn_btn = document.getElementById('doubledn_btn');

doubledn_btn.addEventListener('click', () => {
    try {
        audio5.play();
        console.log('Success')
    } catch (error) {
        console.log('error');
    }
});

function playAudio(audioURL) {
    const audio = new Audio(audioURL);
    audio.play();
}
// Work in progress //
fetch('/win', {
    method: 'POST',   
})
.then(response => response.json())
.then(data => {
    if (data.outcome === 'You Win!' && data.audio) {
        playAudio(data.audio);
    }
})
.catch(error => console.error('Error:', error));