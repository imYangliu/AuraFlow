import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import BreakView from './components/BreakView';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/break" element={<BreakView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
