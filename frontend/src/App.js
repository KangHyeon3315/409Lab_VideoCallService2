import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './Pages/Home';
import Signup from './Pages/Signup';
import Login from './Pages/Login';

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <Routes>
            
            <Route exact path='/' element={<Home />} />,
            <Route path='/signin' element={<Login />} />,
            <Route path='/signup' element={<Signup />} />,
          </Routes>
        </div>

      </Router>
    </div>
  );
}


export default App;
