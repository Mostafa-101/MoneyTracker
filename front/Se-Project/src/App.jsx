import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MainPage from './pages/MainPage';
import InsightsPage from './pages/InsightsPage';
import History from './pages/History';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/Signup' element={<Signup />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/insights" element={<InsightsPage />} /> 
        <Route path="/history" element={<History />} /> 
      </Routes>
    </Router>
  );
}

export default App;
