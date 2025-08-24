// src/AdminControls.jsx
import React, { useState } from "react";
import { io } from "socket.io-client";
import api from "./api";
import { Clock, Unlock, Lock } from "lucide-react"; // nice icons

const socket = io(api);

function AdminControls() {
  const [time, setTime] = useState("");

  const handleSetTime = () => {
    if (time) {
      const isoTimestamp = new Date(time).toISOString();
      socket.emit("admin:setDomainTime", isoTimestamp);
      alert(
        `Domain opening time broadcasted: ${new Date(time).toLocaleString()}`
      );
    } else {
      alert("Please select a valid date and time.");
    }
  };

  const handleOpenNow = () => {
    if (
      window.confirm(
        "Are you sure you want to OPEN domain selection for all teams immediately?"
      )
    ) {
      socket.emit("domainOpen");
      alert("Signal to open domains has been sent!");
    }
  };

  const handleCloseDomains = () => {
    if (
      window.confirm(
        "⚠️ WARNING: This will immediately CLOSE domain selection for all teams. Continue?"
      )
    ) {
      socket.emit("admin:closeDomains");
      alert("Signal to close domains has been sent!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-8 flex flex-col items-center">


      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-orange-400 to-pink-500 text-transparent bg-clip-text">
          Admin Controls Panel
        </h1>

        {/* Set Timer */}
        <div className="bg-gray-900/70 backdrop-blur-md p-6 rounded-2xl shadow-lg mb-8 border border-gray-700 hover:border-orange-400 transition">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="text-orange-400" />
            <h2 className="text-2xl font-semibold">Set Domain Opening Time</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Choose a date & time when domain selection will automatically open.
            Teams will see a live countdown.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-end">
            <input
              type="datetime-local"
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-orange-400"
            />
            <button
              onClick={handleSetTime}
              className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-lg font-semibold transition shadow-md"
            >
              Set Timer
            </button>
          </div>
        </div>

        {/* Force Open */}
        <div className="bg-gray-900/70 backdrop-blur-md p-6 rounded-2xl shadow-lg mb-8 border border-gray-700 hover:border-green-400 transition">
          <div className="flex items-center gap-2 mb-3">
            <Unlock className="text-green-400" />
            <h2 className="text-2xl font-semibold">Force Open Domains</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Instantly unlock domain selection for all teams, ignoring any
            scheduled timers.
          </p>
          <button
            onClick={handleOpenNow}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition shadow-md"
          >
            Open Now
          </button>
        </div>

        {/* Force Close */}
        <div className="bg-gray-900/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-700 hover:border-red-400 transition">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="text-red-400" />
            <h2 className="text-2xl font-semibold">Force Close Domains</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Immediately lock domain selection for all teams.  
            <span className="text-red-400 font-semibold">
              ⚠️ This action cannot be undone.
            </span>
          </p>
          <button
            onClick={handleCloseDomains}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition shadow-md"
          >
            Close Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminControls;
