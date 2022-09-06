import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Main from './Pages/Main';
import Signup from './Pages/Signup';
import Login from './Pages/Login';

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <Routes>

            <Route exact path='/' element={<Main />} />,
            <Route path='/signin' element={<Login />} />,
            <Route path='/signup' element={<Signup />} />,
            <Route path='/chat/:roomId' element={<Main />} />,
          </Routes>
        </div>

      </Router>
    </div>
  );
}


export default App;
