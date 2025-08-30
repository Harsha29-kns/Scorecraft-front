import { Route, Routes } from 'react-router';
import './App.css';
import Home from './Home';
import Payment from './payment';
import Form from './form';
import Admin from './admin';
import Attd from './Attd';
import TeamPanel from './TeamPanel';
import Marks from './Marks';
import Leaderboard from './LeaderBoard';
import AttdDetail from './AttdDetail';
import Instructions from "./Instructions";
import AdminControls from './AdminControls'
import Pics from './pics';
import DomainStats from './DomainStats';

import AllTeams from "./AllTeams";

function App() {
    return (
                <Routes >
        <Route path='/' element={<Home/>}/>
        <Route path='/registration' element={<Form/>}/>
        <Route path='/payment' element={<Payment/>}/>
        <Route path='/admin-login' element={<Admin/>}/>
        <Route path='/attd' element={<Attd/>}/>
        <Route path='/teamlogin' element={<TeamPanel/>}/>
        <Route path='/marks' element={<Marks/>}/>
        <Route path="/all-teams" element={<AllTeams />}/>
        <Route path='/leaderboard' element={<Leaderboard/>}/>
        <Route path='/attdetail' element={<AttdDetail/>}/>
        <Route path='/photos'  element={<Pics/>}/>
        <Route path='/domaindata' element={<DomainStats/>}/>
        <Route path='/instructions' element={<Instructions/>}/>
        <Route path='/admin-controls' element={<AdminControls />} />
      </Routes>           
    );
}

export default App