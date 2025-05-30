/**
 * Класс Transaction представляет одну финансовую транзакцию.
 */
 class Transaction {
  /**
   * Создает экземпляр Transaction.
   * @param {Object} params - Параметры транзакции.
   * @param {string} params.transaction_id - Уникальный идентификатор транзакции.
   * @param {string} params.transaction_date - Дата транзакции в формате "YYYY-MM-DD".
   * @param {number|string} params.transaction_amount - Сумма транзакции.
   * @param {string} params.transaction_type - Тип транзакции ('debit' или 'credit').
   * @param {string} params.transaction_description - Описание транзакции.
   * @param {string} params.merchant_name - Название торговой точки или компании.
   * @param {string} params.card_type - Тип карты ('Visa', 'MasterCard', и т.д.).
   */
  constructor({ transaction_id, transaction_date, transaction_amount, transaction_type, transaction_description, merchant_name, card_type }) {
    this.transaction_id = transaction_id;
    this.transaction_date = new Date(transaction_date);
    this.transaction_amount = parseFloat(transaction_amount);
    this.transaction_type = transaction_type;
    this.transaction_description = transaction_description;
    this.merchant_name = merchant_name;
    this.card_type = card_type;
  }

  /**
   * Возвращает строковое представление транзакции в формате JSON.
   * @returns {string} JSON-строка с данными транзакции.
   */
  string() {
    return JSON.stringify({
      transaction_id: this.transaction_id,
      transaction_date: this.transaction_date.toISOString().split('T')[0],
      transaction_amount: this.transaction_amount.toFixed(2),
      transaction_type: this.transaction_type,
      transaction_description: this.transaction_description,
      merchant_name: this.merchant_name,
      card_type: this.card_type
    }, null, 2);
  }
}

/**
 * Класс TransactionAnalyzer для анализа массива транзакций.
 */
class TransactionAnalyzer {
  /**
   * @param {Array<Object>} transactions - Массив объектов транзакций.
   */
  constructor(transactions = []) {
    /** @private @type {Transaction[]} */
    this.transactions = transactions.map(t => new Transaction(t));
  }

  /** Добавляет новую транзакцию. */
  addTransaction(transaction) { this.transactions.push(new Transaction(transaction)); }

  /** Возвращает все транзакции. */
  getAllTransaction() { return this.transactions; }

  /** Возвращает уникальные типы транзакций. */
  getUniqueTransactionType() { return Array.from(new Set(this.transactions.map(t => t.transaction_type))); }

  /** Рассчитывает общую сумму всех транзакций. */
  calculateTotalAmount() { return this.transactions.reduce((sum, t) => sum + t.transaction_amount, 0); }

  /**
   * Рассчитывает сумму транзакций за заданную дату.
   * @param {number} [year]
   * @param {number} [month]
   * @param {number} [day]
   * @returns {number}
   */
  calculateTotalAmountByDate(year, month, day) {
    return this.transactions
      .filter(t => {
        const d = t.transaction_date;
        return (year ? d.getFullYear() === year : true) && (month ? d.getMonth() + 1 === month : true) && (day ? d.getDate() === day : true);
      })
      .reduce((sum, t) => sum + t.transaction_amount, 0);
  }

  /** Возвращает транзакции указанного типа. */
  getTransactionByType(type) { return this.transactions.filter(t => t.transaction_type === type); }

  /** Возвращает транзакции в диапазоне дат. */
  getTransactionsInDateRange(startDate, endDate) {
    const start = new Date(startDate), end = new Date(endDate);
    return this.transactions.filter(t => t.transaction_date >= start && t.transaction_date <= end);
  }

  /** Возвращает транзакции по торговой точке. */
  getTransactionsByMerchant(merchantName) { return this.transactions.filter(t => t.merchant_name === merchantName); }

  /** Вычисляет среднюю сумму транзакции. */
  calculateAverageTransactionAmount() { return this.transactions.length ? this.calculateTotalAmount() / this.transactions.length : 0; }

  /** Возвращает транзакции в диапазоне сумм. */
  getTransactionsByAmountRange(min, max) { return this.transactions.filter(t => t.transaction_amount >= min && t.transaction_amount <= max); }

  /** Рассчитывает сумму всех debit-транзакций. */
  calculateTotalDebitAmount() { return this.transactions.filter(t => t.transaction_type === 'debit').reduce((sum, t) => sum + t.transaction_amount, 0); }

  /** Находит месяц с наибольшим числом транзакций. */
  findMostTransactionsMonth() {
    const counts = {};
    this.transactions.forEach(t => {
      const key = `${t.transaction_date.getFullYear()}-${t.transaction_date.getMonth() + 1}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }

  /** Находит месяц с наибольшим числом debit-транзакций. */
  findMostDebitTransactionMonth() {
    const counts = {};
    this.transactions.filter(t => t.transaction_type === 'debit').forEach(t => {
      const key = `${t.transaction_date.getFullYear()}-${t.transaction_date.getMonth() + 1}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }

  /** Определяет, каких транзакций больше. */
  mostTransactionTypes() {
    const debitCount = this.transactions.filter(t => t.transaction_type === 'debit').length;
    const creditCount = this.transactions.filter(t => t.transaction_type === 'credit').length;
    return debitCount > creditCount ? 'debit' : creditCount > debitCount ? 'credit' : 'equal';
  }

  /** Возвращает транзакции до указанной даты. */
  getTransactionsBeforeDate(date) {
    const target = new Date(date);
    return this.transactions.filter(t => t.transaction_date < target);
  }

  /** Ищет транзакцию по ID. */
  findTransactionById(id) { return this.transactions.find(t => t.transaction_id === id); }

  /** Возвращает массив описаний всех транзакций. */
  mapTransactionDescriptions() { return this.transactions.map(t => t.transaction_description); }

  /**
   * Выполняет проверку всех методов через assert.
   */
  static runAllTests() {
    const assert = require('assert');
    const data = [
      { transaction_id: '1', transaction_date: '2021-01-01', transaction_amount: '10', transaction_type: 'debit', transaction_description: 'A', merchant_name: 'M', card_type: 'C' },
      { transaction_id: '2', transaction_date: '2021-01-02', transaction_amount: '20', transaction_type: 'credit', transaction_description: 'B', merchant_name: 'N', card_type: 'C2' },
      { transaction_id: '3', transaction_date: '2021-01-01', transaction_amount: '30', transaction_type: 'debit', transaction_description: 'C', merchant_name: 'M', card_type: 'C' }
    ];
    const ana = new TransactionAnalyzer(data);
    // Проверка методов
    assert.strictEqual(ana.getAllTransaction().length, 3);
    ana.addTransaction({ transaction_id: '4', transaction_date: '2021-01-03', transaction_amount: '40', transaction_type: 'credit', transaction_description: 'D', merchant_name: 'O', card_type: 'C3' });
    assert.strictEqual(ana.getAllTransaction().length, 4);
    assert.deepStrictEqual(ana.getUniqueTransactionType().sort(), ['credit', 'debit']);
    assert.strictEqual(ana.calculateTotalAmount(), 100);
    assert.strictEqual(ana.calculateTotalAmountByDate(2021, 1, 1), 40);
    assert.strictEqual(ana.getTransactionByType('debit').length, 2);
    assert.strictEqual(ana.getTransactionsInDateRange('2021-01-02', '2021-01-02').length, 1);
    assert.strictEqual(ana.getTransactionsByMerchant('M').length, 2);
    assert.strictEqual(ana.calculateAverageTransactionAmount(), 25);
    assert.strictEqual(ana.getTransactionsByAmountRange(15, 35).length, 2);
    assert.strictEqual(ana.calculateTotalDebitAmount(), 40);
    assert.strictEqual(ana.findMostTransactionsMonth(), '2021-1');
    assert.strictEqual(ana.findMostDebitTransactionMonth(), '2021-1');
    assert.strictEqual(ana.mostTransactionTypes(), 'equal');
    assert.strictEqual(ana.getTransactionsBeforeDate('2021-01-02').length, 2);
    assert.strictEqual(ana.findTransactionById('2').transaction_description, 'B');
    assert.deepStrictEqual(ana.mapTransactionDescriptions(), ['A', 'B', 'C', 'D']);
    const tx = new Transaction(data[0]);
    assert.strictEqual(JSON.parse(tx.string()).transaction_id, '1');
    console.log('All tests passed');
  }
}

// Запуск самопроверки при прямом запуске файла
if (require.main === module) TransactionAnalyzer.runAllTests();

module.exports = { Transaction, TransactionAnalyzer };
