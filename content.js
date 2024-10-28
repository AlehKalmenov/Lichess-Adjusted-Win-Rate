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

        // Check if adjusted win rate row already exists
        let adjustedWinRateRow = row.nextElementSibling;
        if (!adjustedWinRateRow || !adjustedWinRateRow.classList.contains('adjusted-win-rate-row')) {
            // Create a new row for the adjusted win rate
            adjustedWinRateRow = document.createElement('tr');
            adjustedWinRateRow.classList.add('adjusted-win-rate-row');

            const adjustedWinRateCell = document.createElement('td');
            adjustedWinRateCell.colSpan = row.children.length; // Span across all columns
            adjustedWinRateCell.style.color = 'green';
            adjustedWinRateCell.style.fontWeight = 'bold';
            adjustedWinRateCell.style.userSelect = 'text'; // Make text selectable
            adjustedWinRateCell.style.cursor = 'text'; // Show text cursor for selection

            adjustedWinRateRow.appendChild(adjustedWinRateCell);
            row.parentNode.insertBefore(adjustedWinRateRow, row.nextSibling); // Insert after the current row
        }

        // Update the text content of the adjusted win rate cell
        adjustedWinRateRow.querySelector('td').textContent = `Adjusted Win Rate: ${adjustedWinRate.toFixed(2)}%`;
    });
    console.log("Adjusted win rate calculated and displayed.");
}

// Set up an interval to repeatedly calculate and display adjusted win rates
setInterval(calculateAndDisplayAdjustedWinRate, 1000); // Run every second
