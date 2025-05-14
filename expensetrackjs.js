let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    const form = document.getElementById('transaction-form');
    const transactionList = document.getElementById('transactions');
    const balanceElement = document.getElementById('balance');
    const filterSelect = document.getElementById('filter');
    const categorySelect = document.getElementById('category');
    const showFilterBtn = document.getElementById('show-filter-btn');

    function saveTransactions() {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function updateBalance(filteredTransactions = transactions) {
      const balance = filteredTransactions.reduce((total, t) => {
        return t.type === 'income' ? total + t.amount : total - t.amount;
      }, 0);
      balanceElement.textContent = `$${balance.toFixed(2)}`;
      balanceElement.className = balance >= 0 ? 'balance positive' : 'balance negative';
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
    });

    showFilterBtn.addEventListener('click', function () {
      applyFilter();
    });

    
    applyFilter();