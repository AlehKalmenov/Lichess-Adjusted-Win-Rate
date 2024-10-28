// Function to calculate and display adjusted win rate
function calculateAndSortByAdjustedWinRate() {
    const moveRows = Array.from(document.querySelectorAll('.moves tbody tr[data-uci]'));

    // Exclude the last move from sorting
    const rowsToSort = moveRows.slice(0, -1);
    const lastRow = moveRows[moveRows.length - 1];

    // Array to store moves and their adjusted win rates
    const movesWithWinRate = rowsToSort.map(row => {
        const winPercentageText = row.querySelector('.white').style.width;
        const drawPercentageText = row.querySelector('.draws').style.width;

        // Parse the percentages
        const winPercentage = parseFloat(winPercentageText);
        const drawPercentage = parseFloat(drawPercentageText);

        // Calculate adjusted win rate
        const adjustedWinRate = winPercentage + drawPercentage / 2;

        return { row, adjustedWinRate };
    });

    // Sort the moves by adjusted win rate in descending order
    movesWithWinRate.sort((a, b) => b.adjustedWinRate - a.adjustedWinRate);

    // Clear existing rows and reinsert sorted rows with adjusted win rate displayed below each
    const tableBody = document.querySelector('.moves tbody');
    tableBody.innerHTML = ''; // Clear current rows

    movesWithWinRate.forEach(({ row, adjustedWinRate }) => {
        // Insert the sorted row
        tableBody.appendChild(row);

        // Create a new row for displaying adjusted win rate below the move
        let adjustedWinRateRow = document.createElement('tr');
        adjustedWinRateRow.classList.add('adjusted-win-rate-row');

        const adjustedWinRateCell = document.createElement('td');
        adjustedWinRateCell.colSpan = row.children.length; // Span across all columns

        // Style for further reduced height and font size
        adjustedWinRateCell.style.color = 'green';
        adjustedWinRateCell.style.fontWeight = 'bold';
        adjustedWinRateCell.style.fontSize = '0.7em'; // Smaller text size
        adjustedWinRateCell.style.lineHeight = '1em'; // Reduced line height for smaller row height
        adjustedWinRateCell.style.padding = '1px'; // Minimal padding
        adjustedWinRateCell.style.userSelect = 'text'; // Make text selectable
        adjustedWinRateCell.style.cursor = 'text'; // Show text cursor for selection
        adjustedWinRateCell.style.borderBottom = '2px solid black'; // Line below text
        adjustedWinRateCell.textContent = `Adjusted Win Rate: ${adjustedWinRate.toFixed(2)}%`;

        adjustedWinRateRow.appendChild(adjustedWinRateCell);
        tableBody.appendChild(adjustedWinRateRow); // Append the new row right after the move row
    });

    // Append the last row and its adjusted win rate row without sorting
    tableBody.appendChild(lastRow);

    // Display adjusted win rate for the last row if not already done
    let lastAdjustedWinRateRow = document.createElement('tr');
    lastAdjustedWinRateRow.classList.add('adjusted-win-rate-row');

    const lastAdjustedWinRateCell = document.createElement('td');
    lastAdjustedWinRateCell.colSpan = lastRow.children.length; // Span across all columns

    // Style for further reduced height and font size
    lastAdjustedWinRateCell.style.color = 'green';
    lastAdjustedWinRateCell.style.fontWeight = 'bold';
    lastAdjustedWinRateCell.style.fontSize = '0.7em'; // Smaller text size
    lastAdjustedWinRateCell.style.lineHeight = '1em'; // Reduced line height
    lastAdjustedWinRateCell.style.padding = '1px'; // Minimal padding
    lastAdjustedWinRateCell.style.userSelect = 'text'; // Make text selectable
    lastAdjustedWinRateCell.style.cursor = 'text'; // Show text cursor for selection
    lastAdjustedWinRateCell.style.borderBottom = '2px solid black'; // Line below text

    // Calculate adjusted win rate for the last row
    const lastWinPercentageText = lastRow.querySelector('.white').style.width;
    const lastDrawPercentageText = lastRow.querySelector('.draws').style.width;
    const lastWinPercentage = parseFloat(lastWinPercentageText);
    const lastDrawPercentage = parseFloat(lastDrawPercentageText);
    const lastAdjustedWinRate = lastWinPercentage + lastDrawPercentage / 2;

    lastAdjustedWinRateCell.textContent = `Adjusted Win Rate: ${lastAdjustedWinRate.toFixed(2)}%`;

    lastAdjustedWinRateRow.appendChild(lastAdjustedWinRateCell);
    tableBody.appendChild(lastAdjustedWinRateRow);

    console.log("Moves sorted by adjusted win rate, excluding the last button.");
}

// Set up an interval to repeatedly calculate and display adjusted win rates
setInterval(calculateAndDisplayAdjustedWinRate, 300); // Run every 300ms
