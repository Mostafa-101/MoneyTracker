import { useState } from 'react';
import '../styles/IncomeExpenseCards.css';

function IncomeCard() {
  const [formData, setFormData] = useState({
    transactionDate: '',
    amount: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User not logged in');
      return;
    }

    const payload = {
      userId: parseInt(userId),
      transactionDate: formData.transactionDate,
      amount: parseFloat(formData.amount),
      isIncome: true,
      category: 'Income'
    };

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/api/transactions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() || 'Unknown server error' };
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create transaction');
      }

      console.log('Transaction created with ID:', data.id);
      // Clear form inputs after successful submission
      setFormData({
        transactionDate: '',
        amount: ''
      });
    } catch (error) {
      setError(error.message || 'Network error. Please try again.');
    }
  };

  return (
    <div className="IncomeCard">
      <h2>Income Form</h2>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="date">Choose a Date:</label>
            <input
              type="date"
              id="date"
              name="transactionDate"
              value={formData.transactionDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Enter a Value:</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="e.g., 100"
              required
            />
          </div>

          <button type="submit">Submit</button>
          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default IncomeCard;