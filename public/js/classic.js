// In game-init.js
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/classic/start-game');
        const data = await response.json();
        console.log('Game started:', data);
    } catch (err) {
        console.error('Error starting game:', err);
    }
});
