const calculator = {
    displayValue: '0',
    firstOperand: null,
    waitingForSecondOperand: false,
    operator: null,
};

function inputDigit(digit) {
    const { displayValue, waitingForSecondOperand } = calculator;

    if (waitingForSecondOperand === true) {
        calculator.displayValue = digit;
        calculator.waitingForSecondOperand = false;
    } else {
        calculator.displayValue = displayValue === '0' ? digit : displayValue + digit;
    }
}

function inputDecimal(dot) {
    if (calculator.waitingForSecondOperand === true) {
        calculator.displayValue = "0."
        calculator.waitingForSecondOperand = false;
        return
    }

    if (!calculator.displayValue.includes(dot)) {
        calculator.displayValue += dot;
    }
}

function handleOperator(nextOperator) {
  const { firstOperand, displayValue, operator } = calculator
  const inputValue = parseFloat(displayValue)

  if (operator && calculator.waitingForSecondOperand)  {
    calculator.operator = nextOperator;
    return;
  }

  if (firstOperand === null && !isNaN(inputValue)) {
    calculator.firstOperand = inputValue;
  } else if (operator) {
    const result = operate(firstOperand, inputValue, operator);

    calculator.displayValue = `${parseFloat(result.toFixed(7))}`;
    calculator.firstOperand = result;
    // After an operation, the display should show the result, but the operator is still active for chaining
    // The next digit input will clear displayValue
  }

  calculator.waitingForSecondOperand = true;
  calculator.operator = nextOperator;

  if (nextOperator === '=') {
    calculator.firstOperand = null;
    calculator.waitingForSecondOperand = false;
    calculator.operator = null;
  }
}

function operate(firstOperand, secondOperand, operator) {
    if (operator === '+') {
        return firstOperand + secondOperand;
    } else if (operator === '-') {
        return firstOperand - secondOperand;
    } else if (operator === '*') {
        return firstOperand * secondOperand;
    } else if (operator === '/') {
        return firstOperand / secondOperand;
    }
    return secondOperand;
}

function resetCalculator() {
    calculator.displayValue = '0';
    calculator.firstOperand = null;
    calculator.waitingForSecondOperand = false;
    calculator.operator = null;
}

function updateDisplay() {
    const display = document.querySelector('.calculator-screen');
    const { displayValue, firstOperand, operator, waitingForSecondOperand } = calculator;

    if (firstOperand !== null && operator !== null && waitingForSecondOperand) {
        display.value = `${firstOperand} ${operator}`;
    } else {
        display.value = displayValue;
    }
}

updateDisplay();

const keys = document.querySelector('.calculator-keys');
keys.addEventListener('click', (event) => {
    const { target } = event;
    if (!target.matches('button')) {
        return;
    }

    if (target.classList.contains('operator')) {
        handleOperator(target.value);
        updateDisplay();
        return;
    }

    if (target.classList.contains('decimal')) {
        inputDecimal(target.value);
        updateDisplay();
        return;
    }

    if (target.classList.contains('all-clear')) {
        resetCalculator();
        updateDisplay();
        return;
    }

    inputDigit(target.value);
    updateDisplay();
});
document.addEventListener('keydown', (event) => {
    const { key } = event;

    if (/\d/.test(key)) { // Digits 0-9
        inputDigit(key);
        updateDisplay();
    } else if (['+', '-', '*', '/'].includes(key)) { // Operators
        handleOperator(key);
        updateDisplay();
    } else if (key === '.') { // Decimal
        inputDecimal(key);
        updateDisplay();
    } else if (key === '=' || key === 'Enter') { // Equal sign
        handleOperator('=');
        updateDisplay();
    } else if (key === 'Backspace' || key === 'Delete') { // All Clear
        resetCalculator();
        updateDisplay();
    }
});