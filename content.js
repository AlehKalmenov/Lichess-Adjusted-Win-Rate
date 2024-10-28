// Store the current FEN string and setup default values for sliders
let previousFENString = '';
let previousMetrics = {};
let autoFlipEnabled = true; // Default to true

// Function to detect the current turn based on the FEN string
function isWhiteTurn() {
    const tbodyElement = document.querySelector('tbody[data-fen]');
    const fenString = tbodyElement ? tbodyElement.getAttribute('data-fen') : '';
    const turnChar = fenString.split(' ')[1]; // Gets 'w' or 'b'
    return turnChar === 'w';
}

// Function to detect board orientation and change sorting mode if autoFlipEnabled
function checkBoardOrientation() {
    if (!autoFlipEnabled) return;

    const boardElement = document.querySelector('.cg-wrap');
    const isWhiteOrientation = boardElement && boardElement.classList.contains('orientation-white');
    const sortingModeSlider = document.getElementById('sorting-mode-slider');
    const currentMode = sortingModeSlider.value;

    // Toggle sorting mode based on orientation and current mode
    if (isWhiteOrientation) {
        if (currentMode === 'black') {
            sortingModeSlider.value = 'white';
        } else if (currentMode === 'black-alternating') {
            sortingModeSlider.value = 'white-alternating';
        }
    } else {
        if (currentMode === 'white') {
            sortingModeSlider.value = 'black';
        } else if (currentMode === 'white-alternating') {
            sortingModeSlider.value = 'black-alternating';
        }
    }

    calculateAndSortByCustomMetric();
}

// Function to calculate and display adjusted win rate and custom metric
function calculateAndSortByCustomMetric() {
    const sliderElement = document.getElementById('ln-slider');
    const exponentSliderElement = document.getElementById('exponent-slider');
    const winrateOffsetSliderElement = document.getElementById('winrate-offset-slider');
    const sortingModeElement = document.getElementById('sorting-mode-slider');

    // Check if the sliders and sorting mode elements are present
    if (!sliderElement || !exponentSliderElement || !winrateOffsetSliderElement || !sortingModeElement) {
        console.warn("Sliders not initialized yet.");
        return;
    }

    const sliderValue = parseFloat(sliderElement.value);
    const exponentSliderValue = parseFloat(exponentSliderElement.value);
    const winrateOffset = parseFloat(winrateOffsetSliderElement.value);
    const sortingMode = sortingModeElement.value;
    const moveRows = Array.from(document.querySelectorAll('.moves tbody tr[data-uci]'));

    // Exclude the last move from sorting
    const rowsToSort = moveRows.slice(0, -1);
    const lastRow = moveRows[moveRows.length - 1];

    // Determine whether it's white's or black's turn for alternating modes
    const currentTurnIsWhite = isWhiteTurn();

    // Array to store moves with adjusted win rate and custom metric values
    const movesWithMetric = rowsToSort.map((row) => {
        const winPercentageText = row.querySelector('.white').style.width;
        const drawPercentageText = row.querySelector('.draws').style.width;
        const blackPercentageText = row.querySelector('.black').style.width;
        const thirdNumberText = row.children[2].textContent.replace(/,/g, '');

        // Parse the percentages and third number
        const winPercentage = parseFloat(winPercentageText);
        const drawPercentage = parseFloat(drawPercentageText);
        const blackPercentage = parseFloat(blackPercentageText);
        const thirdNumber = parseFloat(thirdNumberText);

// Calculate adjusted win rate and metric to sort by based on sorting mode
let adjustedWinRate;
let metricToSortBy;

// Determine adjustedWinRate and metricToSortBy for each mode
if (sortingMode === 'default') {
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
} else if (sortingMode === 'both-alternating') {
    // Assign metricToSortBy based on turn, ensuring a value is always set
    if (currentTurnIsWhite) {
        adjustedWinRate = winPercentage + drawPercentage / 2;
        metricToSortBy = adjustedWinRate;
    } else {
        adjustedWinRate = blackPercentage + drawPercentage / 2;
        metricToSortBy = adjustedWinRate;
    }
} else {
    // Fallback for unexpected mode values
    metricToSortBy = thirdNumber;
}

// Calculate the custom metric with fallback to thirdNumber if not sorting
const customMetric = (sortingMode !== 'default')
    ? ((metricToSortBy * thirdNumber) / (thirdNumber + winrateOffset))
      * Math.pow((1 - Math.pow(10, -(thirdNumber / Math.pow(10, sliderValue)))), 1 / exponentSliderValue)
    : thirdNumber;


        return { row, adjustedWinRate, customMetric };
    });

    // Check if there is any change in metrics
    const metricsChanged = movesWithMetric.some((metric, idx) => {
        const prevMetric = previousMetrics[idx];
        return !prevMetric || metric.customMetric !== prevMetric.customMetric || metric.adjustedWinRate !== prevMetric.adjustedWinRate;
    });

    // If no changes, skip the update
    if (!metricsChanged) return;

    // Update previous metrics for the next comparison
    previousMetrics = movesWithMetric.map(({ adjustedWinRate, customMetric }) => ({ adjustedWinRate, customMetric }));

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
    } else if (sortingMode === 'both-alternating') {
        lastAdjustedWinRate = currentTurnIsWhite
            ? (lastWinPercentage + lastDrawPercentage / 2)
            : (lastBlackPercentage + lastDrawPercentage / 2);
    } else {
        lastAdjustedWinRate = lastThirdNumber; // Default to third number if sorting mode is unclear
    }

    // Calculate custom metric for the last row with the new formula or default to third number
    const lastCustomMetric = (sortingMode !== 'default')
        ? ((lastAdjustedWinRate * lastThirdNumber) / (lastThirdNumber + winrateOffset))
          * Math.pow((1 - Math.pow(10, -(lastThirdNumber / Math.pow(10, sliderValue)))), 1 / exponentSliderValue)
        : lastThirdNumber;

    lastMetricCell.textContent = `Adjusted Win Rate: ${lastAdjustedWinRate.toFixed(2)}% | Custom Metric: ${lastCustomMetric.toFixed(2)}`;

    lastMetricRow.appendChild(lastMetricCell);
    tableBody.appendChild(lastMetricRow);

    console.log("Moves sorted by custom metric and sorting mode, displaying both metrics, excluding the last button.");
}

// Function to initialize the sliders at the bottom of the page
function initializeSliders() {
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
    lnSlider.min = '0';
    lnSlider.max = '10';
    lnSlider.value = '4'; // Set default value to 3
    lnSlider.step = '0.1';  // Allow for decimal increments

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

    // Exponent multiplier slider
    const exponentSliderLabel = document.createElement('label');
    exponentSliderLabel.textContent = 'Adjust exponent multiplier: ';
    exponentSliderLabel.style.fontWeight = 'bold';
    exponentSliderLabel.style.marginRight = '5px';

    const exponentSlider = document.createElement('input');
    exponentSlider.type = 'range';
    exponentSlider.id = 'exponent-slider';
    exponentSlider.min = '0';
    exponentSlider.max = '100';
    exponentSlider.value = '10'; // Set default value to 5
    exponentSlider.step = '1';  // Allow for decimal increments

    const exponentSliderValueDisplay = document.createElement('span');
    exponentSliderValueDisplay.id = 'exponent-slider-value';
    exponentSliderValueDisplay.textContent = exponentSlider.value;

    exponentSlider.addEventListener('input', () => {
        exponentSliderValueDisplay.textContent = exponentSlider.value;
        calculateAndSortByCustomMetric();
    });

    slidersContainer.appendChild(document.createElement('br'));
    slidersContainer.appendChild(exponentSliderLabel);
    slidersContainer.appendChild(exponentSlider);
    slidersContainer.appendChild(exponentSliderValueDisplay);

    // Winrate offset slider
    const winrateOffsetLabel = document.createElement('label');
    winrateOffsetLabel.textContent = 'Winrate Offset: ';
    winrateOffsetLabel.style.fontWeight = 'bold';
    winrateOffsetLabel.style.marginRight = '5px';

    const winrateOffsetSlider = document.createElement('input');
    winrateOffsetSlider.type = 'range';
    winrateOffsetSlider.id = 'winrate-offset-slider';
    winrateOffsetSlider.min = '0';
    winrateOffsetSlider.max = '10'; // Adjusted max range to 10
    winrateOffsetSlider.value = '3'; // Set initial default value
    winrateOffsetSlider.step = '0.1';  // Use decimal steps for precision

    const winrateOffsetValueDisplay = document.createElement('span');
    winrateOffsetValueDisplay.id = 'winrate-offset-value';
    winrateOffsetValueDisplay.textContent = winrateOffsetSlider.value;

    winrateOffsetSlider.addEventListener('input', () => {
        winrateOffsetValueDisplay.textContent = winrateOffsetSlider.value;
        calculateAndSortByCustomMetric();
    });

    slidersContainer.appendChild(document.createElement('br'));
    slidersContainer.appendChild(winrateOffsetLabel);
    slidersContainer.appendChild(winrateOffsetSlider);
    slidersContainer.appendChild(winrateOffsetValueDisplay);

    // Auto Flip Toggle slider
    const autoFlipLabel = document.createElement('label');
    autoFlipLabel.textContent = 'Enable Auto Flip: ';
    autoFlipLabel.style.fontWeight = 'bold';
    autoFlipLabel.style.marginRight = '5px';

    const autoFlipSlider = document.createElement('input');
    autoFlipSlider.type = 'checkbox';
    autoFlipSlider.id = 'auto-flip-slider';
    autoFlipSlider.checked = true; // Enabled by default

    autoFlipSlider.addEventListener('change', () => {
        autoFlipEnabled = autoFlipSlider.checked;
        if (autoFlipEnabled) checkBoardOrientation();
    });

    slidersContainer.appendChild(document.createElement('br'));
    slidersContainer.appendChild(autoFlipLabel);
    slidersContainer.appendChild(autoFlipSlider);

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
        { value: 'both-alternating', text: 'Both Alternating' }
    ];

    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.text = option.text;
        sortingModeSlider.appendChild(opt);
    });

    sortingModeSlider.value = 'white-alternating';

    sortingModeSlider.addEventListener('change', () => {
        calculateAndSortByCustomMetric();
    });

    slidersContainer.appendChild(document.createElement('br'));
    slidersContainer.appendChild(sortingModeLabel);
    slidersContainer.appendChild(sortingModeSlider);
    document.body.appendChild(slidersContainer);

    // Initial call to update metrics after sliders are loaded
    calculateAndSortByCustomMetric();
}

// Continuously check for FEN changes and board orientation
function checkFENAndOrientationChanges() {
    function recursiveCheck() {
        const tbodyElement = document.querySelector('tbody[data-fen]');
        const currentFENString = tbodyElement ? tbodyElement.getAttribute('data-fen') : '';

        if (currentFENString !== previousFENString) {
            previousFENString = currentFENString;
            calculateAndSortByCustomMetric();
        }

        checkBoardOrientation(); // Check and adjust sorting mode based on orientation
        requestAnimationFrame(recursiveCheck); // Continue looping without setInterval
    }
    recursiveCheck();
}

// Initialize sliders and set up FEN and orientation check loop
window.onload = () => {
    initializeSliders();
    checkFENAndOrientationChanges(); // Start continuous FEN and orientation checking
};
