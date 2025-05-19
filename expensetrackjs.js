let transactions = [];
let budgetLimit = parseFloat(localStorage.getItem('budgetLimit')) || 0; 
const currentMonth = new Date().getMonth();
const savedMonth = localStorage.getItem('budgetMonth');

if (savedMonth === null || parseInt(savedMonth) !== currentMonth) {
  transactions = [];
  budgetLimit = 0;
  localStorage.removeItem('transactions');
  localStorage.removeItem('budgetLimit');
  localStorage.setItem('budgetMonth', currentMonth);
  alert("New month detected. Data has been reset.");
} else {
  transactions = JSON.parse(localStorage.getItem('transactions')) || [];
}


    const form = document.getElementById('transaction-form');
    
const budgetInput = document.getElementById('budgetInput');
const setBudgetBtn = document.getElementById('setBudgetBtn');
const budgetDisplay = document.getElementById('budgetDisplay');


setBudgetBtn.addEventListener('click', () => {
  const value = parseFloat(budgetInput.value);
  if (!isNaN(value) && value > 0) {
    budgetLimit = value;
    localStorage.setItem('budgetLimit', budgetLimit);
    budgetInput.value = '';
    displayBudget();
    applyFilter(); 
  }
});


function displayBudget() {
  if (budgetLimit > 0) {
    budgetDisplay.textContent = `Budget: $${budgetLimit.toFixed(2)}`;
  } else {
    budgetDisplay.textContent = '';
  }
}

    const transactionList = document.getElementById('transactions');
    const filterSelect = document.getElementById('filter');
    const categorySelect = document.getElementById('category');
    const showFilterBtn = document.getElementById('show-filter-btn');

    function saveTransactions() {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function updateBalance(filteredTransactions = transactions) {
  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  document.getElementById('summary-income').textContent = `$${income.toFixed(2)}`;
  document.getElementById('summary-expense').textContent = `$${expenses.toFixed(2)}`;
  document.getElementById('summary-balance').textContent = `$${balance.toFixed(2)}`;

  
  if (budgetLimit > 0 && expenses > budgetLimit) {
    alert(`⚠️ You have exceeded your budget of $${budgetLimit.toFixed(2)}!`);
  }
}

    function renderTransactions(filtered = transactions) {
      transactionList.innerHTML = '';
      if (filtered.length === 0) {
        transactionList.innerHTML = '<li>No transactions found</li>';
        updateBalance([]);
        return;
      }

      filtered.forEach(transaction => {
        const li = document.createElement('li');
        li.innerHTML = `
          <div class="transaction-info">
            <div>${transaction.description}</div>
            <div class="transaction-category">${transaction.category}</div>
          </div>
          <span class="${transaction.type}">
            ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
          </span>
          <button class="delete-btn" data-id="${transaction.id}">x</button>
        `;
        transactionList.appendChild(li);
      });

      document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function () {
          const id = parseInt(this.getAttribute('data-id'));
          transactions = transactions.filter(t => t.id !== id);
          saveTransactions();
          applyFilter();
          drawExpenseChart(transactions);

        });
      });

      updateBalance(filtered);
    }

    
        function applyFilter() {
  const type = filterSelect.value;
  const category = categorySelect.value;

  const filtered = transactions.filter(t => {
    const matchType = type === 'all' || t.type === type;
    const matchCategory = category === 'all' || t.category === category;
    return matchType && matchCategory;
  });

  renderTransactions(filtered);
  drawExpenseChart(filtered); // draw chart based on filtered data
}


  

      

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const type = document.getElementById('type').value;
      const amount = parseFloat(document.getElementById('amount').value);
      
      const description = document.getElementById('description').value || 'No description';
      const category = document.getElementById('categoryInput').value || 'other';

      const transaction = {
        id: Date.now(),
        type,
        amount,
        description,
        category
      };

      transactions.push(transaction);
      saveTransactions();
      form.reset();
      applyFilter();
      drawExpenseChart(transactions);

    });

    showFilterBtn.addEventListener('click', function () {
      applyFilter();
    });

    
    applyFilter();
    displayBudget();
    drawExpenseChart(transactions);


    function drawExpenseChart(filteredTransactions = transactions) {
  const canvas = document.getElementById('expenseChart');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const expenseData = {};
  filteredTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const category = t.category || 'Other';
      expenseData[category] = (expenseData[category] || 0) + t.amount;
    });

  const total = Object.values(expenseData).reduce((a, b) => a + b, 0);
  if (total === 0) return;

  const colors = ['#e74c3c', '#3498db', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c'];
  const categories = Object.keys(expenseData);
  const values = Object.values(expenseData);

  let startAngle = 0;

  values.forEach((amount, i) => {
    const sliceAngle = (amount / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.arc(150, 150, 100, startAngle, startAngle + sliceAngle);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    startAngle += sliceAngle;
  });

  
  startAngle = 0;
  values.forEach((amount, i) => {
    const sliceAngle = (amount / total) * 2 * Math.PI;
    const midAngle = startAngle + sliceAngle / 2;
    const x = 150 + Math.cos(midAngle) * 70;
    const y = 150 + Math.sin(midAngle) * 70;
    ctx.fillStyle = "#000";
    ctx.font = "12px sans-serif";
    ctx.fillText(categories[i], x - 20, y);
    startAngle += sliceAngle;
  });
      }
