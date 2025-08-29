import { useState } from "react";
import axios from "axios";
import api from "./api";

function GameScore({ team }) {
  const [newScore, setNewScore] = useState("");
  const [currentScore, setCurrentScore] = useState(team.GameScore || 0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (newScore === "" || isNaN(newScore)) {
      setMessage("Please enter a valid numeric score.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${api}/api/admin/update-score/${team._id}`, {
        gameScore: Number(newScore),
      });

      setCurrentScore(response.data.team.GameScore);
      setMessage("Score added successfully!");
      setNewScore("");

    } catch (error) {
      console.error("Failed to update score:", error);
      setMessage("Error: Could not update score.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full justify-center p-4">
      <div className="bg-gray-800 border border-orange-500/30 text-white p-6 rounded-2xl shadow-lg w-full max-w-sm transform transition-all duration-300 hover:shadow-orange-500/20">
        <h2 className="text-2xl font-bold mb-2 text-center text-orange-400 font-naruto">{team.teamname}</h2>

        <div className="text-center my-6">
          <p className="text-sm text-gray-400 uppercase tracking-wider">Current Score</p>
          <p className="text-6xl font-bold text-white drop-shadow-lg">
            {currentScore}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor={`score-${team._id}`} className="block text-sm font-medium text-gray-300 mb-1">
              Add Score
            </label>
            <input
              id={`score-${team._id}`}
              type="number"
              placeholder="Enter score to add"
              value={newScore}
              onChange={(e) => {
                setNewScore(e.target.value);
                setMessage("");
              }}
              onWheel={(e) => e.target.blur()}
              className="mt-1 w-full p-3 bg-gray-700 border-2 border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>

          {message && (
            <p className={`text-sm text-center font-semibold ${message.includes("Error") ? "text-red-400" : "text-green-400"}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              "Add Score"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default GameScore;