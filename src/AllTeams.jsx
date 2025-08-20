import { useEffect, useState } from "react";
import axios from "axios";
import api from "./api";

const sectors = ["Naruto", "Sasuke", "Itachi"];

function AllTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSectors, setSelectedSectors] = useState({});

  useEffect(() => {
    axios.get(`${api}/event/students`).then(res => {
      setTeams(res.data);
      // Initialize selectedSectors with current sector values
      const initialSectors = {};
      res.data.forEach(team => {
        initialSectors[team._id] = team.Sector || "";
      });
      setSelectedSectors(initialSectors);
      setLoading(false);
    });
  }, []);

  const handleSectorSelect = (teamId, newSector) => {
    setSelectedSectors(prev => ({
      ...prev,
      [teamId]: newSector
    }));
  };

  const handleSectorUpdate = async (teamId) => {
    const newSector = selectedSectors[teamId];
    await axios.post(`${api}/event/sector/${teamId}`, { Sector: newSector });
    setTeams(teams.map(team => team._id === teamId ? { ...team, Sector: newSector } : team));
  };

  return (
    <div className="bg-gray-900 min-h-screen p-4">
      <h1 className="text-3xl text-white mb-6">All Teams</h1>
      {loading ? <div>Loading...</div> : (
        <table className="min-w-full bg-gray-800 text-white rounded-lg">
          <thead>
            <tr>
              <th className="p-2">Team Name</th>
              <th className="p-2">Current Sector</th>
              <th className="p-2">Assign Sector</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(team => (
              <tr key={team._id}>
                <td className="p-2">{team.teamname}</td>
                <td className="p-2">{team.Sector || "Not Assigned"}</td>
                <td className="p-2">
                  <select
                    value={selectedSectors[team._id] || ""}
                    onChange={e => handleSectorSelect(team._id, e.target.value)}
                    className="bg-gray-700 text-white rounded px-2 py-1"
                  >
                    <option value="">Select Sector</option>
                    {sectors.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <button
                    className="px-4 py-1 bg-green-600 text-white rounded"
                    onClick={() => handleSectorUpdate(team._id)}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AllTeams;