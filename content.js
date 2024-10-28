// Function to detect the current turn based on the FEN string
function isWhiteTurn() {
    const fenString = document.querySelector('tbody').getAttribute('data-fen');
    const turnChar = fenString.split(' ')[1]; // Gets 'w' or 'b'
    return turnChar === 'w';
}

// Function to calculate and display adjusted win rate and custom metric
function calculateAndSortByCustomMetric() {
    const sliderValue = parseFloat(document.getElementById('ln-slider').value);
    const sortingMode = document.getElementById('sorting-mode-slider').value;
    const moveRows = Array.from(document.querySelectorAll('.moves tbody tr[data-uci]'));

    // Exclude the last move from sorting
    const rowsToSort = moveRows.slice(0, -1);
    const lastRow = moveRows[moveRows.length - 1];

    // Determine whether it's white's or black's turn for alternating modes
    const currentTurnIsWhite = isWhiteTurn();

    // Array to store moves with adjusted win rate and custom metric values
    const movesWithMetric = rowsToSort.map((row, index) => {
        const winPercentageText = row.querySelector('.white').style.width;
        const drawPercentageText = row.querySelector('.draws').style.width;
        const blackPercentageText = row.querySelector('.black').style.width;
        const thirdNumberText = row.children[2].textContent.replace(/,/g, '');

        // Parse the percentages and third number
        const winPercentage = parseFloat(winPercentageText);
        const drawPercentage = parseFloat(drawPercentageText);
        const blackPercentage = parseFloat(blackPercentageText);
        const thirdNumber = parseFloat(thirdNumberText);

        // Calculate adjusted win rate based on sorting mode
        let adjustedWinRate;
        let metricToSortBy;

        if (sortingMode === 'default') {
            // Default sorts by the third number
            metricToSortBy = thirdNumber;
        } else if (sortingMode === 'white') {
            adjustedWinRate = winPercentage + drawPercentage / 2;
            metricToSortBy = adjustedWinRate;
        } else if (sortingMode === 'black') {
            adjustedWinRate = blackPercentage + drawPercentage / 2;
            metricToSortBy = adjustedWinRate;
        } else if (sortingMode === 'white-alternating') {
            adjustedWinRate = winPercentage + drawPercentage / 2;
            metricToSortBy = currentTurnIsWhite ? adjustedWinRate : thirdNumber;
        } else if (sortingMode === 'black-alternating') {
            adjustedWinRate = blackPercentage + drawPercentage / 2;
            metricToSortBy = !currentTurnIsWhite ? adjustedWinRate : thirdNumber;
        }

        // Calculate the custom metric
        const customMetric = metricToSortBy * (1 - (1 / Math.log(thirdNumber + 1)) * Math.log(sliderValue));

        return { row, adjustedWinRate, customMetric };
    });

    // Sort the moves by the custom metric in descending order
    movesWithMetric.sort((a, b) => b.customMetric - a.customMetric);

    // Clear existing rows and reinsert sorted rows with adjusted win rate and custom metric displayed below each
    const tableBody = document.querySelector('.moves tbody');
    tableBody.innerHTML = ''; // Clear current rows

    movesWithMetric.forEach(({ row, adjustedWinRate, customMetric }) => {
        // Insert the sorted row
        tableBody.appendChild(row);

        // Create a new row for displaying adjusted win rate and custom metric below the move
        let metricRow = document.createElement('tr');
        metricRow.classList.add('metric-row');

        const metricCell = document.createElement('td');
        metricCell.colSpan = row.children.length; // Span across all columns

        // Style for compact height and font size
        metricCell.style.color = 'green';
        metricCell.style.fontWeight = 'bold';
        metricCell.style.fontSize = '0.7em';
        metricCell.style.lineHeight = '1em';
        metricCell.style.padding = '1px';
        metricCell.style.userSelect = 'text';
        metricCell.style.cursor = 'text';
        metricCell.style.borderBottom = '2px solid black';
        metricCell.textContent = `Adjusted Win Rate: ${adjustedWinRate.toFixed(2)}% | Custom Metric: ${customMetric.toFixed(2)}`;

        metricRow.appendChild(metricCell);
        tableBody.appendChild(metricRow); // Append the new row right after the move row
    });

    // Append the last row and its metrics without sorting
    tableBody.appendChild(lastRow);

    let lastMetricRow = document.createElement('tr');
    lastMetricRow.classList.add('metric-row');

    const lastMetricCell = document.createElement('td');
    lastMetricCell.colSpan = lastRow.children.length;

    lastMetricCell.style.color = 'green';
    lastMetricCell.style.fontWeight = 'bold';
    lastMetricCell.style.fontSize = '0.7em';
    lastMetricCell.style.lineHeight = '1em';
    lastMetricCell.style.padding = '1px';
    lastMetricCell.style.userSelect = 'text';
    lastMetricCell.style.cursor = 'text';
    lastMetricCell.style.borderBottom = '2px solid black';

    const lastWinPercentageText = lastRow.querySelector('.white').style.width;
    const lastDrawPercentageText = lastRow.querySelector('.draws').style.width;
    const lastBlackPercentageText = lastRow.querySelector('.black').style.width;
    const lastThirdNumberText = lastRow.children[2].textContent.replace(/,/g, '');
    const lastWinPercentage = parseFloat(lastWinPercentageText);
    const lastDrawPercentage = parseFloat(lastDrawPercentageText);
    const lastBlackPercentage = parseFloat(lastBlackPercentageText);
    const lastThirdNumber = parseFloat(lastThirdNumberText);

    // Calculate adjusted win rate and custom metric for the last row based on sorting mode
    let lastAdjustedWinRate;
    if (sortingMode === 'default') {
        lastAdjustedWinRate = lastThirdNumber;
    } else if (sortingMode === 'white') {
        lastAdjustedWinRate = lastWinPercentage + lastDrawPercentage / 2;
    } else if (sortingMode === 'black') {
        lastAdjustedWinRate = lastBlackPercentage + lastDrawPercentage / 2;
    } else if (sortingMode === 'white-alternating') {
        lastAdjustedWinRate = currentTurnIsWhite ? lastWinPercentage + lastDrawPercentage / 2 : lastThirdNumber;
    } else if (sortingMode === 'black-alternating') {
        lastAdjustedWinRate = !currentTurnIsWhite ? lastBlackPercentage + lastDrawPercentage / 2 : lastThirdNumber;
    }

    const lastCustomMetric = lastAdjustedWinRate * (1 - (1 / Math.log(lastThirdNumber + 1)) * Math.log(sliderValue));
    lastMetricCell.textContent = `Adjusted Win Rate: ${lastAdjustedWinRate.toFixed(2)}% | Custom Metric: ${lastCustomMetric.toFixed(2)}`;

    lastMetricRow.appendChild(lastMetricCell);
    tableBody.appendChild(lastMetricRow);

    console.log("Moves sorted by custom metric and sorting mode, displaying both metrics, excluding the last button.");
}

// Function to initialize the sliders at the bottom of the page
function initializeSliders() {
    // Create a container for the sliders at the bottom of the page
    const slidersContainer = document.createElement('div');
    slidersContainer.style.marginTop = '20px';

    // ln multiplier slider
    const lnSliderLabel = document.createElement('label');
    lnSliderLabel.textContent = 'Adjust ln multiplier: ';
    lnSliderLabel.style.fontWeight = 'bold';
    lnSliderLabel.style.marginRight = '5px';

    const lnSlider = document.createElement('input');
    lnSlider.type = 'range';
    lnSlider.id = 'ln-slider';
    lnSlider.min = '1';
    lnSlider.max = '10';
    lnSlider.value = '2';
    lnSlider.step = '0.1';

    const lnSliderValueDisplay = document.createElement('span');
    lnSliderValueDisplay.id = 'ln-slider-value';
    lnSliderValueDisplay.textContent = lnSlider.value;

    lnSlider.addEventListener('input', () => {
        lnSliderValueDisplay.textContent = lnSlider.value;
        calculateAndSortByCustomMetric();
    });

    slidersContainer.appendChild(lnSliderLabel);
    slidersContainer.appendChild(lnSlider);
    slidersContainer.appendChild(lnSliderValueDisplay);

    // Sorting mode slider
    const sortingModeLabel = document.createElement('label');
    sortingModeLabel.textContent = 'Sorting Mode: ';
    sortingModeLabel.style.fontWeight = 'bold';
    sortingModeLabel.style.marginRight = '5px';

    const sortingModeSlider = document.createElement('select');
    sortingModeSlider.id = 'sorting-mode-slider';

    const options = [
        { value: 'default', text: 'Default' },
        { value: 'white', text: 'White Sorting' },
        { value: 'black', text: 'Black Sorting' },
        { value: 'white-alternating', text: 'White Alternating' },
        { value: 'black-alternating', text: 'Black Alternating' },
    ];

    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.text = option.text;
        sortingModeSlider.appendChild(opt);
    });

    sortingModeSlider.value = 'white-alternating'; // Set default to White Alternating

    sortingModeSlider.addEventListener('change', () => {
        calculateAndSortByCustomMetric();
    });

    slidersContainer.appendChild(document.createElement('br'));
    slidersContainer.appendChild(sortingModeLabel);
    slidersContainer.appendChild(sortingModeSlider);

    // Append slidersContainer at the end of the page
    document.body.appendChild(slidersContainer);
}

// Initialize the sliders and set up repeated calculation and sorting
initializeSliders();
setInterval(calculateAndSortByCustomMetric, 300); // Run every 300ms
