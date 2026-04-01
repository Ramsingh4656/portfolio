class Calculator {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';  // display string e.g. "12 +"
        this.previousValue = null;  // numeric value of previous operand
        this.operation = null;
        this.updateDisplay();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.previousValue = null;
        this.operation = null;
        this.updateDisplay();
        this.animateButton('AC');
    }

    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.slice(0, -1);
        if (this.currentOperand === '' || this.currentOperand === '-') {
            this.currentOperand = '0';
        }
        this.updateDisplay();
        this.animateButton('DEL');
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
        this.updateDisplay();
        this.animateButton(number);
    }

    chooseOperation(op) {
        if (this.currentOperand === '') return;
        if (this.previousValue !== null && this.operation != null) {
            this.calculate();
        }
        this.operation = op;
        this.previousValue = parseFloat(this.currentOperand);
        this.previousOperand = this.currentOperand + ' ' + op;
        this.currentOperand = '0';
        this.updateDisplay();
        this.animateButton(op);
    }

    calculate() {
        let result;
        const prev = this.previousValue;
        const current = parseFloat(this.currentOperand);

        if (prev === null || isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError('Cannot divide by zero!');
                    return;
                }
                result = prev / current;
                break;
            case '%':
                // Percentage mode: prev * (current / 100)
                result = prev * (current / 100);
                break;
            default:
                return;
        }

        this.currentOperand = this.roundNumber(result).toString();
        this.operation = null;
        this.previousOperand = '';
        this.previousValue = null;
        this.updateDisplay();
        this.animateButton('=');
    }

    roundNumber(num) {
        return Math.round(num * 100000000) / 100000000;
    }

    updateDisplay() {
        const currentDisplay = document.getElementById('current');
        const previousDisplay = document.getElementById('previous');

        if (currentDisplay) {
            // Prevent display overflow for very long numbers
            const displayText = this.currentOperand;
            currentDisplay.textContent = displayText;
            // Scale down font if number is very long
            if (displayText.length > 12) {
                currentDisplay.style.fontSize = '1.5rem';
            } else if (displayText.length > 9) {
                currentDisplay.style.fontSize = '2rem';
            } else {
                currentDisplay.style.fontSize = '';
            }
        }
        if (previousDisplay) previousDisplay.textContent = this.previousOperand;
    }

    showError(message) {
        const currentDisplay = document.getElementById('current');
        if (currentDisplay) {
            currentDisplay.textContent = 'Error';
            currentDisplay.style.color = '#ef4444';

            setTimeout(() => {
                this.clear();
                currentDisplay.style.color = 'var(--text-primary)';
            }, 2000);
        }
    }

    animateButton(buttonText) {
        // Use data-key attribute first, then fall back to text content search
        const key = this.getKeyForButton(buttonText);
        let button = document.querySelector(`button[data-key="${key}"]`);

        // Fallback: find by text content (valid vanilla JS)
        if (!button) {
            button = Array.from(document.querySelectorAll('button')).find(
                btn => btn.textContent.trim() === buttonText
            );
        }

        if (button) {
            button.classList.add('btn-pressed');
            setTimeout(() => {
                button.classList.remove('btn-pressed');
            }, 150);
        }
    }

    getKeyForButton(buttonText) {
        const keyMap = {
            'AC': 'Escape',
            'DEL': 'Backspace',
            '×': '*',
            '÷': '/',
            '=': 'Enter'
        };
        return keyMap[buttonText] || buttonText;
    }
}

// Initialize calculator
const calculator = new Calculator();

// Ensure display is updated on load
window.addEventListener('DOMContentLoaded', () => {
    calculator.updateDisplay();
    
    // Add click event listeners to all buttons for better feedback
    const buttons = document.querySelectorAll('.buttons .btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.add('btn-pressed');
            setTimeout(() => {
                button.classList.remove('btn-pressed');
            }, 150);
        });
        
        // Add keyboard hint to button title
        const key = button.getAttribute('data-key');
        if (key) {
            button.title = `Press ${key} key`;
        }
    });
});

// Enhanced keyboard support with visual feedback
document.addEventListener('keydown', (e) => {
    // Prevent default behavior for calculator keys
    if (['/', '*', '+', '-', '=', 'Enter', 'Escape', 'Backspace', '%'].includes(e.key)) {
        e.preventDefault();
    }
    
    // Find and animate the corresponding button
    const button = document.querySelector(`button[data-key="${e.key}"]`);
    if (button) {
        button.classList.add('btn-pressed');
        setTimeout(() => {
            button.classList.remove('btn-pressed');
        }, 150);
    }
    
    // Handle calculator operations
    if (e.key >= '0' && e.key <= '9') calculator.appendNumber(e.key);
    if (e.key === '.') calculator.appendNumber('.');
    if (e.key === '+') calculator.chooseOperation('+');
    if (e.key === '-') calculator.chooseOperation('-');
    if (e.key === '*') calculator.chooseOperation('×');
    if (e.key === '/') calculator.chooseOperation('÷');
    if (e.key === '%') calculator.chooseOperation('%');
    if (e.key === 'Enter' || e.key === '=') calculator.calculate();
    if (e.key === 'Escape') calculator.clear();
    if (e.key === 'Backspace') calculator.delete();
});

// Add visual feedback for button presses
document.addEventListener('keyup', (e) => {
    const button = document.querySelector(`button[data-key="${e.key}"]`);
    if (button) {
        button.classList.remove('btn-pressed');
    }
});