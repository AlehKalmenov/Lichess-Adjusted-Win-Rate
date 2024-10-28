// Function to calculate and display adjusted win rate
function calculateAndDisplayAdjustedWinRate() {
    const moveRows = document.querySelectorAll('.moves tbody tr[data-uci]');
    moveRows.forEach(row => {
        const winPercentageText = row.querySelector('.white').style.width;
        const drawPercentageText = row.querySelector('.draws').style.width;

        // Parse the percentages
        const winPercentage = parseFloat(winPercentageText);
        const drawPercentage = parseFloat(drawPercentageText);

        // Calculate adjusted win rate
        const adjustedWinRate = winPercentage + drawPercentage / 2;

        // Check if adjusted win rate element already exists
        let adjustedWinRateElement = row.querySelector('.adjusted-win-rate');
        if (!adjustedWinRateElement) {
            // Create new element if it doesn't exist
            adjustedWinRateElement = document.createElement('span');
            adjustedWinRateElement.classList.add('adjusted-win-rate');
            adjustedWinRateElement.style.color = 'green';
            adjustedWinRateElement.style.fontWeight = 'bold';
            row.querySelector('td:last-child').appendChild(adjustedWinRateElement);
        }

        // Update the text content of the adjusted win rate element
        adjustedWinRateElement.textContent = ` | Adjusted Win Rate: ${adjustedWinRate.toFixed(2)}%`;
    });
    console.log("Adjusted win rate calculated and displayed.");
}

// Set up an interval to repeatedly calculate and display adjusted win rates
setInterval(calculateAndDisplayAdjustedWinRate, 300); // Run every 300ms
