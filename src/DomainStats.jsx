import { useState, useEffect } from 'react';
import axios from 'axios';
import api from './api';
import { io } from "socket.io-client";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import score from "/public/scorecraft.jpg";

const socket = io(api);

function DomainStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [domains, setDomains] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [statsMode, setStatsMode] = useState('pie'); // 'pie', 'bar', 'table'
  
  // --- NEW FEATURES STATE ---
  const [showUnassigned, setShowUnassigned] = useState(false); // For the "Unassigned Teams" modal
  const [filterStatus, setFilterStatus] = useState('all'); // For table filtering ('all', 'available', 'full')
  const [searchQuery, setSearchQuery] = useState(''); // For table search

  // Color palette for charts
  const COLORS = [
    '#34D4BA', '#f73e91', '#FFD700', '#FF6B6B', '#4ECDC4', 
    '#A06CD5', '#FF8C42', '#6A0572', '#2E86AB', '#F18F01'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        socket.emit("domaindat", "");
        
        const teamsResponse = await axios.get(`${api}/event/students`);
        setTeams(teamsResponse.data);
        
        socket.on("domaindata", (domainData) => {
          setDomains(domainData);
          setLoading(false);
        });
        
        return () => {
          socket.off("domaindata");
        };
      } catch (err) {
        console.error("Error fetching domain stats:", err);
        setError("Failed to load domain statistics");
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Process data for visualization
  const processedDomainData = domains.map(domain => {
    const teamsInDomain = teams.filter(team => team.Domain === domain.name);
    return {
      ...domain,
      count: teamsInDomain.length,
      teams: teamsInDomain,
      percentage: teams.length ? Math.round((teamsInDomain.length / teams.length) * 100) : 0,
      filled: domain.slots !== 0 && teamsInDomain.length >= domain.slots, // Assuming 'slots' property exists
      capacity: domain.slots || 10 // Default capacity to 10 if not provided
    };
  });

  // Sort domains by count for better visualization
  const sortedDomainData = [...processedDomainData].sort((a, b) => b.count - a.count);

  // --- NEW: Apply filtering and searching for the table view ---
  const filteredAndSearchedData = sortedDomainData.filter(domain => {
    // Search filter logic
    const matchesSearch = domain.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Status filter logic
    if (filterStatus === 'available') {
        return !domain.filled;
    }
    if (filterStatus === 'full') {
        return domain.filled;
    }
    return true; // for 'all'
  });


  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const handleDomainClick = (domain) => {
    if (selectedDomain && selectedDomain.id === domain.id) {
      setSelectedDomain(null); // Toggle off
    } else {
      setSelectedDomain(domain); // Set new selection
    }
  };

  const totalTeams = teams.filter(team => team.Domain).length;
  const domainDistribution = domains.map(domain => ({
    name: domain.name,
    value: teams.filter(team => team.Domain === domain.name).length
  })).filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-3 rounded-md border border-gray-700 shadow-xl">
          <p className="text-[#34D4BA] font-bold">{payload[0].name}</p>
          <p className="text-white">Teams: {payload[0].value}</p>
          <p className="text-gray-300 text-sm">
            {totalTeams > 0 ? Math.round((payload[0].value / totalTeams) * 100) : 0}% of all teams
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#34D4BA] mx-auto"></div>
          <p className="mt-4 text-xl">Loading domain statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800 rounded-lg max-w-md">
          <h2 className="text-2xl text-red-400 mb-4">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-[#34D4BA] text-black rounded-lg hover:bg-opacity-80 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-gradient-to-r from-[#1a1a1a]/80 to-[#333]/80 backdrop-blur-md p-4 fixed w-full top-0 z-50 border-b border-white/10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={score} className="w-12 h-12 rounded-full" alt="Logo" />
            <h1 className="text-xl font-bold">Domain Statistics</h1>
          </div>
          <div>
            <button 
              onClick={() => window.location.href = '/'}
              className="text-white/80 hover:text-white"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto pt-24 pb-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Available Domains</p>
                <h3 className="text-2xl font-bold">{domains.length}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Teams With Domain</p>
                <h3 className="text-2xl font-bold text-green-400">{teams.filter(team => team.Domain).length}</h3>
                <p className="text-xs text-gray-400">{teams.length > 0 ? Math.round((teams.filter(team => team.Domain).length / teams.length) * 100) : 0}% of all teams</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* --- NEW: Clickable card to show unassigned teams --- */}
          <div 
            className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 cursor-pointer hover:border-[#34D4BA] transition-colors"
            onClick={() => setShowUnassigned(true)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Teams Without Domain</p>
                <h3 className="text-2xl font-bold text-yellow-400">{teams.filter(team => !team.Domain).length}</h3>
                <p className="text-xs text-gray-400">{teams.length > 0 ? Math.round((teams.filter(team => !team.Domain).length / teams.length) * 100) : 0}% of all teams</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-gray-800 rounded-full p-1 inline-flex">
            <button
              onClick={() => setStatsMode('pie')}
              className={`px-4 py-2 rounded-full ${statsMode === 'pie' ? 'bg-[#34D4BA] text-black' : 'text-white'}`}
            >
              Pie Chart
            </button>
            <button
              onClick={() => setStatsMode('bar')}
              className={`px-4 py-2 rounded-full ${statsMode === 'bar' ? 'bg-[#34D4BA] text-black' : 'text-white'}`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setStatsMode('table')}
              className={`px-4 py-2 rounded-full ${statsMode === 'table' ? 'bg-[#34D4BA] text-black' : 'text-white'}`}
            >
              Table View
            </button>
          </div>
        </div>

        <div className="bg-gray-900/30 rounded-lg p-4 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Domain Distribution</h2>
          
          <div className={`${statsMode === 'pie' ? 'block' : 'hidden'}`}>
            <div className="w-full h-80 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={domainDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    // --- NEW: Interactive pie chart ---
                    onClick={(data) => {
                      const clickedDomain = processedDomainData.find(d => d.name === data.name);
                      if (clickedDomain) handleDomainClick(clickedDomain);
                    }}
                    className="cursor-pointer"
                  >
                    {domainDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${statsMode === 'bar' ? 'block' : 'hidden'}`}>
            <div className="w-full h-80 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedDomainData}>
                  <XAxis dataKey="name" tick={{ fill: 'white' }} />
                  <YAxis tick={{ fill: 'white' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', color: 'white', border: '1px solid #374151' }}
                  />
                  <Bar 
                    dataKey="count" 
                    name="Teams" 
                    fill="#34D4BA" 
                    className="cursor-pointer"
                    // --- NEW: Interactive bar chart ---
                    onClick={(data) => handleDomainClick(data)}
                  >
                    {sortedDomainData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${statsMode === 'table' ? 'block' : 'hidden'}`}>
            {/* --- NEW: Filter and Search UI for Table --- */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-full">
                <button onClick={() => setFilterStatus('all')} className={`px-3 py-1 text-sm rounded-full ${filterStatus === 'all' ? 'bg-[#34D4BA] text-black' : 'text-white'}`}>All</button>
                <button onClick={() => setFilterStatus('available')} className={`px-3 py-1 text-sm rounded-full ${filterStatus === 'available' ? 'bg-[#34D4BA] text-black' : 'text-white'}`}>Available</button>
                <button onClick={() => setFilterStatus('full')} className={`px-3 py-1 text-sm rounded-full ${filterStatus === 'full' ? 'bg-[#34D4BA] text-black' : 'text-white'}`}>Full</button>
              </div>
              <input
                type="text"
                placeholder="Search domains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-sm w-full sm:w-64"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Domain</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Teams</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Capacity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Percentage</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/30 divide-y divide-gray-700">
                  {/* --- UPDATED: use filteredAndSearchedData --- */}
                  {filteredAndSearchedData.map((domain) => (
                    <tr key={domain.id} className="hover:bg-gray-700/50 cursor-pointer" onClick={() => handleDomainClick(domain)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{domain.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{domain.count} teams</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${domain.filled ? 'bg-red-500' : 'bg-[#34D4BA]'}`}
                            style={{ width: `${domain.capacity > 0 ? Math.min((domain.count / domain.capacity) * 100, 100) : 0}%` }}
                          ></div>
                        </div>
                        <div className="text-xs mt-1 text-gray-400">{domain.count}/{domain.capacity} slots</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{domain.percentage}% of all teams</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {domain.filled ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-900 text-red-200">Filled</span>
                        ) : domain.count >= domain.capacity * 0.8 ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-900 text-yellow-200">Almost Full</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-900 text-green-200">Available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selectedDomain && (
          <div className="bg-gray-900/30 rounded-lg p-4 animation-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Teams in {selectedDomain.name}</h2>
              <button onClick={() => setSelectedDomain(null)} className="text-gray-400 hover:text-white">Close</button>
            </div>
            {selectedDomain.teams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedDomain.teams.map((team) => (
                  <div key={team._id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-[#34D4BA]">{team.teamname}</h3>
                        <p className="text-sm text-gray-400">Sector: {team.Sector}</p>
                      </div>
                      {team.GroupPic && (
                        <div className="w-12 h-12 overflow-hidden rounded-full">
                          <img src={team.GroupPic} alt={`${team.teamname} photo`} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm line-clamp-2">{team.ProblemStatement || "No problem statement yet"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No teams have selected this domain yet</p>
            )}
          </div>
        )}
      </div>

      {/* --- NEW: Modal for Unassigned Teams --- */}
      {showUnassigned && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-lg w-full animation-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Teams Without a Domain</h2>
              <button onClick={() => setShowUnassigned(false)} className="text-gray-400 hover:text-white">&times;</button>
            </div>
            <div className="max-h-96 overflow-y-auto pr-2">
              {teams.filter(team => !team.Domain).length > 0 ? (
                teams.filter(team => !team.Domain).map(team => (
                  <div key={team._id} className="bg-gray-800 p-3 rounded-md mb-2 flex items-center gap-4">
                    {team.GroupPic && <img src={team.GroupPic} className="w-10 h-10 rounded-full object-cover" alt={team.teamname}/>}
                    <div>
                      <h3 className="font-bold text-white">{team.teamname}</h3>
                      <p className="text-sm text-gray-400">Sector: {team.Sector}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">All teams have selected a domain!</p>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-900 text-gray-400 text-center py-4 border-t border-gray-800">
        <p>© {new Date().getFullYear()} Scorecraft Kare</p>
      </footer>
    </div>
  );
}

export default DomainStats;