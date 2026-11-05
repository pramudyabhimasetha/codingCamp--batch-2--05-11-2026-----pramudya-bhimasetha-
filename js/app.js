// State Management
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
const SPENDING_LIMIT = 50; // Batas pengeluaran untuk fitur Highlight (> $50)
let chartInstance = null;

// DOM Elements
const transactionForm = document.getElementById('transactionForm');
const itemNameInput = document.getElementById('itemName');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const totalBalanceEl = document.getElementById('totalBalance');
const transactionListEl = document.getElementById('transactionList');
const sortSelect = document.getElementById('sortSelect');
const themeToggleBtn = document.getElementById('themeToggleBtn');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderApp();
});

// Event Listeners
transactionForm.addEventListener('submit', addTransaction);
sortSelect.addEventListener('change', renderTransactionList);
themeToggleBtn.addEventListener('click', toggleTheme);

// Add Transaction
function addTransaction(e) {
  e.preventDefault();

  const name = itemNameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if (!name || isNaN(amount) || amount <= 0 || !category) {
    alert('Harap isi semua kolom dengan benar!');
    return;
  }

  const transaction = {
    id: Date.now(),
    name,
    amount,
    category
  };

  transactions.push(transaction);
  saveData();
  renderApp();

  // Reset form
  transactionForm.reset();
}

// Delete Transaction
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveData();
  renderApp();
}

// Save to Local Storage
function saveData() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Render All Components
function renderApp() {
  updateTotalBalance();
  renderTransactionList();
  renderChart();
}

// Update Total Balance
function updateTotalBalance() {
  const total = transactions.reduce((acc, t) => acc + t.amount, 0);
  totalBalanceEl.textContent = `$${total.toFixed(2)}`;
}

// Render Transaction List (Includes Sorting & Highlighting)
function renderTransactionList() {
  transactionListEl.innerHTML = '';

  let sortedTransactions = [...transactions];
  const sortValue = sortSelect.value;

  if (sortValue === 'amount-high') {
    sortedTransactions.sort((a, b) => b.amount - a.amount);
  } else if (sortValue === 'amount-low') {
    sortedTransactions.sort((a, b) => a.amount - b.amount);
  } else if (sortValue === 'category') {
    sortedTransactions.sort((a, b) => a.category.localeCompare(b.category));
  } else {
    sortedTransactions.reverse(); // Default: Terbaru di atas
  }

  if (sortedTransactions.length === 0) {
    transactionListEl.innerHTML = '<p style="text-align:center; color: var(--text-muted);">Belum ada transaksi.</p>';
    return;
  }

  sortedTransactions.forEach(t => {
    const item = document.createElement('div');
    item.className = 'transaction-item';
    
    // Highlight jika pengeluaran > SPENDING_LIMIT
    if (t.amount > SPENDING_LIMIT) {
      item.classList.add('high-spending');
    }

    item.innerHTML = `
      <div class="item-info">
        <div class="title">${t.name}</div>
        <div class="details">$${t.amount.toFixed(2)} • ${t.category}</div>
      </div>
      <button class="btn-delete" onclick="deleteTransaction(${t.id})">Delete</button>
    `;

    transactionListEl.appendChild(item);
  });
}

// Render Visual Chart (Chart.js)
function renderChart() {
  const ctx = document.getElementById('spendingChart').getContext('2d');

  // Total pengeluaran per kategori
  const categories = ['Food', 'Transport', 'Fun'];
  const dataTotals = categories.map(cat => {
    return transactions
      .filter(t => t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0);
  });

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{
        data: dataTotals,
        backgroundColor: ['#10b981', '#3b82f6', '#f97316'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: getComputedStyle(document.body).getPropertyValue('--text-color')
          }
        }
      }
    }
  });
}

// Theme Toggle (Dark/Light Mode)
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeToggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
  renderChart(); // Refresh chart legend color
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggleBtn.textContent = '☀️ Light Mode';
  }
}