import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import TopBar from '../components/TopBar';
import '../styles/insightsPage.css';
import { Link, useNavigate } from 'react-router-dom';

function InsightsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [topCategory, setTopCategory] = useState({ name: '', value: 0 });
  const [totalIncome, setTotalIncome] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [chartUrl, setChartUrl] = useState('');
  const [noExpenseMessage, setNoExpenseMessage] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User not logged in');
      return;
    }

    const fetchData = async () => {
      try {
        console.log(`Fetching data for year: ${selectedYear}, month: ${selectedMonth}`);
        // Fetch spending by category
        const spendingResponse = await fetch(
          `http://localhost:8080/api/transactions/user/${userId}/spending-by-category?year=${selectedYear}&month=${selectedMonth}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const spendingData = await spendingResponse.json();
        setData(spendingData);

        // Calculate total expenses
        const total = Object.values(spendingData).reduce((sum, value) => sum + value, 0);
        setTotalExpenses(total);

        // Find top category
        const top = Object.entries(spendingData).reduce((max, [name, value]) =>
          value > max.value ? { name, value } : max, { name: '', value: 0 }
        );
        setTopCategory(top);

        // Fetch total income
        const incomeResponse = await fetch(
          `http://localhost:8080/api/transactions/user/${userId}/income?year=${selectedYear}&month=${selectedMonth}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const incomeData = await incomeResponse.json();
        setTotalIncome(incomeData);

        // Fetch expenses breakdown chart
        const chartResponse = await fetch(
          `http://localhost:5000/api/spending-by-category-chart?user_id=${userId}&year=${selectedYear}&month=${selectedMonth}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const contentType = chartResponse.headers.get('content-type');
        if (chartResponse.ok && contentType && contentType.includes('image')) {
          const blob = await chartResponse.blob();
          if (chartUrl) {
            URL.revokeObjectURL(chartUrl);
          }
          const url = URL.createObjectURL(blob);
          setChartUrl(url);
          setNoExpenseMessage('');
        } else {
          const chartData = await chartResponse.json();
          setChartUrl('');
          setNoExpenseMessage(chartData.error === "No data returned from Spring API" ? 'There is no expense this month' : 'Error loading chart');
          console.log('Chart response:', chartData);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
        setChartUrl('');
        setNoExpenseMessage('There is no expense this month');
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth, chartUrl]);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <>
      <TopBar />
      <Container className="main-container mt-4">
        <h2 className="text-center mb-4">Summary & Insights</h2>
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
        <Row>
          <Col md={6}>
            <Card className="insight-card">
              <Card.Body>
                <Card.Title>Total Expenses</Card.Title>
                <Card.Text>💸 EGP {totalExpenses}</Card.Text>
              </Card.Body>
            </Card>
            <Card className="insight-card mt-3">
              <Card.Body>
                <Card.Title>Top Spending Category</Card.Title>
                <Card.Text>{topCategory.name} - EGP {topCategory.value}</Card.Text>
              </Card.Body>
            </Card>
            <Card className="insight-card mt-3">
              <Card.Body>
                <Card.Title>Total Income</Card.Title>
                <Card.Text>💰 EGP {totalIncome}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="insight-card chart-card">
              <Card.Body>
                <Card.Title>Expenses Breakdown</Card.Title>
                <div className="chart-container">
                  {chartUrl ? (
                    <img src={chartUrl} alt="Expenses Breakdown Chart" />
                  ) : (
                    noExpenseMessage && <p>{noExpenseMessage}</p>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <div className="text-center mt-4">
          <Button variant="secondary" onClick={() => navigate('/main')}>
            ← Back
          </Button>
        </div>
      </Container>
    </>
  );
}

export default InsightsPage;