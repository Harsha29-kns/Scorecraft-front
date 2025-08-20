import { useState } from "react";
import axios from "axios";
import api from "./api";

function GameScore({ team }) {
  // State for the input field (for the NEW total score)
  const [newScore, setNewScore] = useState(""); 
  // State to display the team's current score
  const [currentScore, setCurrentScore] = useState(team.GameScore || 0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    if (newScore === "" || isNaN(newScore)) {
      setMessage("Please enter a valid numeric score.");
      setLoading(false);
      return;
    }
    
    try {
      // Use axios to call the new API endpoint
      const response = await axios.post(`${api}/api/admin/update-score/${team._id}`, {
        gameScore: Number(newScore),
      });

      // Update the displayed score with the new value from the server
      setCurrentScore(response.data.team.GameScore);
      setMessage("Score updated successfully!");
      setNewScore(""); // Clear the input field

    } catch (error) {
      console.error("Failed to update score:", error);
      setMessage("Error: Could not update score.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full justify-center">
      <div className="bg-white text-black p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-bold mb-2 text-center">{team.teamname}</h2>
        
        {/* Display the current score */}
        <p className="text-center text-2xl font-bold text-blue-600 mb-4">
          Current Score: {currentScore}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor={`score-${team._id}`} className="block text-sm font-medium text-gray-700">
              Set New Total Score
            </label>
            <input
              id={`score-${team._id}`}
              type="number"
              placeholder="Enter new total score"
              value={newScore}
              onChange={(e) => {
                setNewScore(e.target.value);
                setMessage("");
              }}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
            
          {message && (
            <p className={`text-sm text-center ${message.includes("Error") ? "text-red-500" : "text-green-600"}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? "Updating..." : "Update Score"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default GameScore;