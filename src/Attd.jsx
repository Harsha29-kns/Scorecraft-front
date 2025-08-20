import { useEffect, useState } from "react";
import "./admin.css";
import axios from "axios";
import api from "./api";
import AttenCard from "./components/Atted";
import { useLocation } from "react-router-dom";

function Attd() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSector, setCurrentSector] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState(sessionStorage.getItem("password") || "");
  const [error, setError] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null); // ✅ NEW
  const sectors = ["Naruto", "Sasuke", "Itachi"];

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const round = params.get("round") || "1";
  const attdField = ["FirstAttd", "SecondAttd", "ThirdAttd", "FourthAttd"][parseInt(round) - 1];

  useEffect(() => {
    async function data() {
      try {
        let res = await axios.get(`${api}/event/students`);
        res = await res.data;
        setTeams(res);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    }
    if (password === "att2025") setIsAuthenticated(true);
    if (isAuthenticated) data();
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "att2025") {
      setIsAuthenticated(true);
      sessionStorage.setItem("password", password);
      setError("");
    } else setError("Incorrect password. Please try again.");
  };

  const getSectorTeams = (sectorIndex) => {
    const selectedSector = sectors[sectorIndex];
    return teams.filter((team) => team.Sector === selectedSector);
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-tr from-gray-900 to-gray-800 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md bg-gray-800/90 backdrop-blur rounded-2xl shadow-lg p-8 border border-gray-700">
          <h2 className="text-3xl font-bold text-white text-center mb-6">🔐 Attendance Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter password..."
              className="w-full px-4 py-2 bg-gray-700/80 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-2 rounded-lg shadow-md"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 flex flex-col min-h-screen">
      {/* Sticky header */}
      <header className="sticky top-0 bg-gray-900/95 border-b border-gray-700 p-4 flex justify-between items-center z-10">
        <h1 className="text-2xl font-bold text-blue-400">📊 Attendance Dashboard</h1>
        <span className="text-gray-300">Round: <b>{round}</b></span>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Sector Tabs */}
          <div className="flex flex-wrap justify-center mb-6 px-4 mt-6">
            {sectors.map((sector, index) => (
              <button
                key={sector}
                className={`mx-2 px-5 py-2 rounded-full transition-all ${
                  currentSector === index ? "bg-blue-600 scale-105" : "bg-gray-700"
                } text-white`}
                onClick={() => {
                  setCurrentSector(index);
                  setSelectedTeam(null); // reset when changing sector
                }}
              >
                {sector}
              </button>
            ))}
          </div>

          {/* Team Selector */}
          <div className="px-6 mb-6 flex justify-center">
            <select
              value={selectedTeam || ""}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full max-w-md px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
            >
              <option value="">-- Select Team --</option>
              {getSectorTeams(currentSector).map((t) => (
                <option key={t._id} value={t._id}>
                  {t.teamname}
                </option>
              ))}
            </select>
          </div>

          {/* Show Only Selected Team */}
          <div className="px-6 mb-10">
            {selectedTeam ? (
              <AttenCard
                team={teams.find((t) => t._id === selectedTeam)}
                attdField={attdField}
                round={round}
              />
            ) : (
              <p className="text-gray-400 text-center">Please select a team to view details</p>
            )}
          </div>

          <div className="text-right px-6 pb-6">
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Attd;
