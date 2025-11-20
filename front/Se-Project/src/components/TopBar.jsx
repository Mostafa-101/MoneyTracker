import { useNavigate } from 'react-router-dom';
import '../styles/TopBar.css';
import website_logo from '../assets/WebSiteLogo.png';

function TopBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div className="TopBar">
      <img src={website_logo} alt='website-logo' className='website-logo' />
      <h1 className='website_name'>Budget Tracker</h1>
      <button onClick={handleLogout} className='logout_button'>LogOut</button>
    </div>
  );
}

export default TopBar;