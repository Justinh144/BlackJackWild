const { Game } = require('./test');
async function startGame(userId, playerBalance, betAmount) {
    try {

        const game = new Game(userId);

        await game.initialize();
        console.log("Game initialized.");

        console.log(`Placing a bet of ${betAmount}...`);
        await game.bet(game.playerBalance, betAmount);
        console.log("Bet placed.");

        // Deal initial cards
        console.log("Dealing cards...");
        await game.deal();
        console.log("Cards dealt.");

        // Display player and dealer hands
        console.log("Player's Hand:", game.playerHand);
        console.log("Dealer's Hand:", game.computerHand);

        let playerBust = false;
        while (!playerBust) {
            // Simulate player's decision (hit or stay)
            const playerDecision = Math.random() < 0.5 ? 'hit' : 'stay';
            if (playerDecision === 'hit') {
                console.log("Player decides to hit.");
                playerBust = await game.hit();
                console.log("Player's Hand:", game.playerHand);
                if (playerBust) {
                    console.log("Player busts!");
                }
            } else {
                console.log("Player decides to stay.");
                break;
            }
        }

        // If player hasn't busted, it's the dealer's turn
        if (!playerBust) {
            await game.dealerTurn();
            console.log("Dealer's Hand:", game.computerHand);
        }

        // Compare hands and determine the winner
        console.log("Comparing hands...");
        // await game.compareHands(); // Implement this method in your Game class

        // End the game
        // await game.endGame(); // Implement this method in your Game class
    } catch (error) {
        console.error("Error starting the game:", error);
    }
}

// Example usage:
const userId = 5;
const playerBalance = 1000;
const betAmount = 50;

startGame(userId, playerBalance, betAmount);
