import axios from "axios";
import api from "../api";
import { useState, useEffect, useCallback } from "react";

function PaymentCard({ team }) {
  const [photo, setPhoto] = useState(false);
  const [full, setFull] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(team.verified);
  console.log(team);

  // Add new function to handle escape key
  const handleEscapeKey = useCallback((event) => {
    if (event.key === 'Escape') {
      setPhoto(false);
    }
  }, []);

  // Add new function to handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setPhoto(false);
    }
  };

  // Add effect for escape key listener
  useEffect(() => {
    if (photo) {
      document.addEventListener('keydown', handleEscapeKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [photo, handleEscapeKey]);

  async function handleVerify(id) {
    try {
      setLoading(true);
      const response = await axios.get(`${api}/event/team/${id}`);
      console.log(response.data);
      setVerified(true);
    } catch (err) {
      console.error("Error verifying:", err);
      alert("Failed to verify the team.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 p-4 sm:p-6 bg-white rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-start md:space-x-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="w-full md:w-2/3">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
          {team.teamname || "Team Name"}
        </h3>
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base">transtationId: {team.transtationId}</h3>
          <h3 className="text-sm sm:text-base">upiId: {team.upiId}</h3>
        </div>

        {full && (
          <div className="mb-4 mt-4">
            <h3 className="font-bold text-black text-base sm:text-lg">Team Lead:</h3>
            <h3 className="text-gray-700 text-sm sm:text-base">{team.name}</h3>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 mt-2">
              Team Members:
            </h3>
            <div className="space-y-1">
              {team.teamMembers.map((member) => (
                <h3 key={member.name} className="text-gray-600 text-sm sm:text-base">
                  {member.name}
                </h3>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-4 items-center">
          <button
            onClick={() => handleVerify(team._id)}
            disabled={team.verified}
            className={`px-3 sm:px-4 py-2 rounded font-semibold text-white flex items-center space-x-2 text-sm sm:text-base ${
              !team.verified
                ? "bg-[#E16254] hover:bg-[#E16256] transition duration-300"
                : "bg-gray-600"
            } ${verified && "bg-gray-600"}`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Loading...
              </>
            ) : (
              <h3>{verified ? "Verified" : "Verify"}</h3>
            )}
          </button>

          {verified && (
            <h3 className="text-green-500 font-bold text-sm sm:text-base"> ✅ Verified</h3>
          )}
        </div>

        <button
          onClick={() => setFull(!full)}
          className="mt-4 p-1 border hover:underline transition duration-200 text-sm sm:text-base"
        >
          {full ? "Hide Members" : "Show Members"}
        </button>
      </div>

      <div className="w-full md:w-1/3 mt-4 md:mt-0">
        {team.imgUrl && (
          <img
            src={team.imgUrl}
            onClick={() => setPhoto(true)}
            alt={`${team.teamname} Logo`}
            className="w-full h-40 sm:h-48 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
          />
        )}
      </div>

      {photo && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4"
          onClick={handleOverlayClick}
        >
          <div className="bg-white rounded-lg p-3 sm:p-4 relative shadow-2xl w-full max-w-3xl mx-auto">
            <button
              className="absolute -top-3 -right-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-lg"
              onClick={() => setPhoto(false)}
            >
              ×
            </button>

            <div className="mt-4">
              <img
                src={team.imgUrl}
                alt="Payment Screenshot"
                className="w-full h-auto rounded-lg mx-auto"
                style={{ maxHeight: "85vh" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentCard;
