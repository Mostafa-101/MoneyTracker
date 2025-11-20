import { Container, Row, Col, Button } from "react-bootstrap";
import TopBar from "../components/TopBar";
import UserCard from "../components/userCard";
import IncomeCard from "../components/IncomeCard";
import ExpenseCard from "../components/ExpenseCard";
import { useNavigate } from 'react-router-dom';
import '../styles/mainPage.css';

function MainPage() {
  const navigate = useNavigate();

  return (
    <>
      <TopBar />
      <Container className="main-container mt-4">
        <Row>
          <Col md={4}>
            <UserCard />
          </Col>
          <Col md={8}>
            <Row>
              <Col md={12}>
                <IncomeCard />
              </Col>
              <Col md={12} className="mt-4">
                <ExpenseCard />
              </Col>
              <Col md={12} className="mt-4 text-center">
                <Button variant="primary" onClick={() => navigate('/history')}>
                  History
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default MainPage;