const balance = document.getElementById('balance');
const currencySelect = document.getElementById('currency-select');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const deleteAllBtn = document.getElementById('delete-all-btn');
const container = document.querySelector('.container');
const transactionForm = document.getElementById('transaction-form');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const transactionList = document.getElementById('transaction-list');

const filterCategoryInput = document.getElementById('filter-category');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const applyFilterBtn = document.getElementById('apply-filter-btn');
const clearFilterBtn = document.getElementById('clear-filter-btn');
const spendingChartCtx = document.getElementById('spending-chart').getContext('2d');

let spendingChart; // To hold the Chart.js instance
let currencySymbol = localStorage.getItem('currencySymbol') || '$';
// Fixed exchange rates (base: USD)
const exchangeRates = {
    '$': 1,      // USD
    '€': 0.93,  // EUR
    '£': 0.80,  // GBP
    '₹': 83,    // INR
    '¥': 150    // JPY
};

let baseCurrency = '$'; // All transactions stored in USD

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
// Convert amount from base currency to selected currency
function convertAmount(amount, fromSymbol, toSymbol) {
    if (fromSymbol === toSymbol) return amount;
    const usdAmount = amount / exchangeRates[fromSymbol];
    return usdAmount * exchangeRates[toSymbol];
}

// Function to update the balance
function updateBalance() {
    // Convert all amounts for display
    const amounts = transactions.map(transaction => convertAmount(transaction.amount, baseCurrency, currencySymbol));
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts.filter(a => a > 0).reduce((acc, item) => acc + item, 0).toFixed(2);
    const expenses = amounts.filter(a => a < 0).reduce((acc, item) => acc + item, 0).toFixed(2);
    balance.innerText = `${currencySymbol}${total}`;
    document.getElementById('income').innerText = `${currencySymbol}${income}`;
    document.getElementById('expenses').innerText = `${currencySymbol}${Math.abs(expenses)}`;
}

// Function to add a transaction to the DOM
function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? 'minus' : 'plus';
    const item = document.createElement('li');
    const displayAmount = convertAmount(transaction.amount, baseCurrency, currencySymbol);
    item.classList.add(sign);
    item.innerHTML = `
        <div class="transaction-details">
            ${transaction.title} <span>${transaction.category} - ${transaction.date}</span>
        </div>
        <span class="transaction-amount">${currencySymbol}${Math.abs(displayAmount).toFixed(2)}</span>
        <button class="edit-btn" onclick="editTransaction(${transaction.id})">Edit</button>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    `;
    transactionList.appendChild(item);
}

// Function to filter transactions
function filterTransactions() {
    transactionList.innerHTML = ''; // Clear current list

    let filteredTransactions = transactions;

    const selectedCategory = filterCategoryInput.value;
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (selectedCategory !== 'all') {
        filteredTransactions = filteredTransactions.filter(transaction => transaction.category === selectedCategory);
    }

    if (startDate) {
        filteredTransactions = filteredTransactions.filter(transaction => new Date(transaction.date) >= new Date(startDate));
    }

    if (endDate) {
        filteredTransactions = filteredTransactions.filter(transaction => new Date(transaction.date) <= new Date(endDate));
    }

    filteredTransactions.forEach(addTransactionDOM);
}

// Clear filters
function clearFilters() {
    filterCategoryInput.value = 'all';
    startDateInput.value = '';
    endDateInput.value = '';
    init(); // Re-initialize to show all transactions
}

// Function to add a new transaction
function addTransaction(e) {
    e.preventDefault();

    if (titleInput.value.trim() === '' || amountInput.value.trim() === '' || dateInput.value.trim() === '' || categoryInput.value.value === '' || typeInput.value === '') {
        alert('Please add a title, amount, date, category, and type');
    } else {
        let amount = Math.abs(+amountInput.value);
        if (typeInput.value === 'expense') {
            amount = -amount;
        }
        // Always store in base currency (USD)
        amount = convertAmount(amount, currencySymbol, baseCurrency);
        const transaction = {
            id: generateID(),
            title: titleInput.value,
            amount: amount,
            date: dateInput.value,
            category: categoryInput.value
        };

        transactions.push(transaction);
        addTransactionDOM(transaction);
        updateLocalStorage();
        updateBalance();

        titleInput.value = '';
        amountInput.value = '';
        dateInput.value = '';
        categoryInput.value = '';
        typeInput.value = 'income';
    }
}

// Generate random ID
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// Remove transaction by ID
function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    init();
}

// Edit transaction by ID
function editTransaction(id) {
    const transactionToEdit = transactions.find(transaction => transaction.id === id);
    if (transactionToEdit) {
        titleInput.value = transactionToEdit.title;
        // Show amount in selected currency
        amountInput.value = Math.abs(convertAmount(transactionToEdit.amount, baseCurrency, currencySymbol));
        dateInput.value = transactionToEdit.date;
        categoryInput.value = transactionToEdit.category;
        typeInput.value = transactionToEdit.amount < 0 ? 'expense' : 'income';

        // Remove the transaction from the array temporarily
        transactions = transactions.filter(transaction => transaction.id !== id);
        updateLocalStorage();
        init();

        // Change button text to "Update Transaction"
        const btn = transactionForm.querySelector('.btn');
        btn.innerText = 'Update Transaction';
        btn.onclick = (e) => {
            e.preventDefault();
            updateExistingTransaction(id);
        };
    }
}

// Update existing transaction
function updateExistingTransaction(id) {
    if (titleInput.value.trim() === '' || amountInput.value.trim() === '' || dateInput.value.trim() === '' || categoryInput.value.value === '' || typeInput.value === '') {
        alert('Please add a title, amount, date, category, and type');
    } else {
        let amount = Math.abs(+amountInput.value);
        if (typeInput.value === 'expense') {
            amount = -amount;
        }
        // Always store in base currency (USD)
        amount = convertAmount(amount, currencySymbol, baseCurrency);
        const updatedTransaction = {
            id: id, // Keep the original ID
            title: titleInput.value,
            amount: amount,
            date: dateInput.value,
            category: categoryInput.value
        };

        transactions.push(updatedTransaction); // Add the updated transaction back
        updateLocalStorage();
        init();

        // Reset form and button
        titleInput.value = '';
        amountInput.value = '';
        dateInput.value = '';
        categoryInput.value = '';
        typeInput.value = 'income';
        const btn = transactionForm.querySelector('.btn');
        btn.innerText = 'Add Transaction';
        btn.onclick = addTransaction; // Re-assign original add function
    }
}


// Update local storage transactions
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Initialize app
function init() {
    transactionList.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateBalance();
    updateSpendingChart();
}

// Function to update spending chart
function updateSpendingChart() {
    const expenseTransactions = transactions.filter(t => t.amount < 0);
    const categories = [...new Set(expenseTransactions.map(t => t.category))];
    const data = categories.map(category =>
        expenseTransactions
            .filter(t => t.category === category)
            .reduce((acc, t) => acc + Math.abs(convertAmount(t.amount, baseCurrency, currencySymbol)), 0)
    );

    if (spendingChart) {
        spendingChart.destroy(); // Destroy existing chart before creating a new one
    }

    spendingChart = new Chart(spendingChartCtx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#dc3545', // Red
                    '#ffc107', // Yellow
                    '#007bff', // Blue
                    '#6f42c1', // Purple
                    '#fd7e14', // Orange
                    '#20c997'  // Teal
                ],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Spending by Category (${currencySymbol})`
                }
            }
        }
    });
// Dark mode toggle
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    container.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        darkModeToggle.innerText = 'Light Mode';
        localStorage.setItem('darkMode', 'true');
    } else {
        darkModeToggle.innerText = 'Dark Mode';
        localStorage.setItem('darkMode', 'false');
    }
});

// Restore dark mode on load
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    container.classList.add('dark-mode');
    darkModeToggle.innerText = 'Light Mode';
}

// Currency selection
currencySelect.value = currencySymbol;
currencySelect.addEventListener('change', () => {
    currencySymbol = currencySelect.value;
    localStorage.setItem('currencySymbol', currencySymbol);
    updateBalance();
    init();
});

// Delete all transactions
deleteAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all transactions?')) {
        transactions = [];
        updateLocalStorage();
        init();
    }
});
}

init();

transactionForm.addEventListener('submit', addTransaction);
applyFilterBtn.addEventListener('click', filterTransactions);
clearFilterBtn.addEventListener('click', clearFilters);