import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import { Container } from 'react-bootstrap';
import '../styles/HistoryPage.css';

function HistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    transactionDate: '',
    amount: '',
    category: ''
  });

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User not logged in');
      setError('User not logged in');
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching transactions for userId: ${userId}, year: ${selectedYear}, month: ${selectedMonth}`);
        const response = await fetch(
          `http://localhost:8080/api/transactions/user/${userId}/month?year=${selectedYear}&month=${selectedMonth}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch transactions');
        }
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError(error.message || 'An error occurred while fetching transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [selectedYear, selectedMonth]);

  const handleEditClick = (transaction) => {
    setEditingTransactionId(transaction.id);
    setEditFormData({
      transactionDate: transaction.transactionDate,
      amount: transaction.amount.toString(),
      category: transaction.category
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (transactionId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User not logged in');
      return;
    }

    const payload = {
      id: transactionId,
      userId: parseInt(userId),
      transactionDate: editFormData.transactionDate,
      amount: parseFloat(editFormData.amount),
      isIncome: transactions.find(t => t.id === transactionId).isIncome,
      category: editFormData.category
    };

    try {
      const response = await fetch(`http://localhost:8080/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update transaction');
      }

      setTransactions(transactions.map(t =>
        t.id === transactionId ? data : t
      ));
      setEditingTransactionId(null);
    } catch (error) {
      console.error('Error updating transaction:', error);
      setError(error.message || 'Failed to update transaction');
    }
  };

  const handleCancelEdit = () => {
    setEditingTransactionId(null);
  };

  const handleDelete = async (transactionId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      // Remove the transaction from the state
      setTransactions(transactions.filter(t => t.id !== transactionId));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError(error.message || 'Failed to delete transaction');
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const categories = ["Housing", "Transportation", "Food", "Healthcare", "Entertainment", "Insurance", "Other", "NotSpecified"];

  const getEntryType = (isIncome) => (isIncome ? 'Income' : 'Expense');

  return (
    <>
      <TopBar />
      <Container className="main-container mt-4">
        <h2 className="text-center mb-4">Transaction History</h2>
        <div className="date-selector mb-4 text-center">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-danger">{error}</p>}
        {!loading && !error && transactions.length === 0 && (
          <p className="text-center">No transactions found for this month.</p>
        )}
        {!loading && !error && transactions.length > 0 && (
          <div className="transaction-table">
            <div className="transaction-row header-row">
              <span>Transaction Date</span>
              <span>Amount</span>
              <span>Entry Type</span>
              <span>Category</span>
              <span>Actions</span>
            </div>
            {transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-row">
                {editingTransactionId === transaction.id ? (
                  <>
                    <span>
                      <input
                        type="date"
                        name="transactionDate"
                        value={editFormData.transactionDate}
                        onChange={handleEditChange}
                        required
                      />
                    </span>
                    <span>
                      <input
                        type="number"
                        name="amount"
                        value={editFormData.amount}
                        onChange={handleEditChange}
                        placeholder="e.g., 300"
                        required
                      />
                    </span>
                    <span>{getEntryType(transaction.isIncome)}</span>
                    <span>
                      <select
                        name="category"
                        value={editFormData.category}
                        onChange={handleEditChange}
                        required
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </span>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEditSubmit(transaction.id)}
                      >
                        Save
                      </button>
                      <button
                        className="delete-button"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>{transaction.transactionDate}</span>
                    <span>EGP {transaction.amount}</span>
                    <span>{getEntryType(transaction.isIncome)}</span>
                    <span>{transaction.category}</span>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEditClick(transaction)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}

export default HistoryPage;