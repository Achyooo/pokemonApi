import Pokedex from './components/Pokedex';
import PokeDetail from './components/PokeDetail';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


function App() {
  return (
    <Routes>
      <Route index element={<Pokedex/>}/>
      <Route path="/poke-detail" element={<PokeDetail/>}/>
    </Routes>
  );
}

export default App;