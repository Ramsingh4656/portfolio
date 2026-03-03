class Calculator {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.updateDisplay();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
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
        if (this.previousOperand !== '' && this.operation != null) {
            this.calculate();
        }
        this.operation = op;
        this.previousOperand = this.currentOperand + ' ' + op;
        this.currentOperand = '0';
        this.updateDisplay();
        this.animateButton(op);
    }

    calculate() {
        let result;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;

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
                result = prev % current;
                break;
            default:
                return;
        }

        this.currentOperand = this.roundNumber(result).toString();
        this.operation = null;
        this.previousOperand = '';
        this.updateDisplay();
        this.animateButton('=');
    }

    roundNumber(num) {
        return Math.round(num * 100000000) / 100000000;
    }

    updateDisplay() {
        const currentDisplay = document.getElementById('current');
        const previousDisplay = document.getElementById('previous');
        
        if (currentDisplay) currentDisplay.textContent = this.currentOperand;
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
        const button = document.querySelector(`button[data-key="${this.getKeyForButton(buttonText)}"]`) ||
                      document.querySelector(`button:contains("${buttonText}")`);
        
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