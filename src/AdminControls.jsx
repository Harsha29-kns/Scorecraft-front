// src/AdminControls.jsx
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import api from "./api";
import { Clock, Unlock, Lock, Users } from "lucide-react"; // Added Users icon

const socket = io(api);

function AdminControls() {
  // State for Domain Controls
  const [regTime, setRegTime] = useState("");
  const [time, setTime] = useState("");

  // <-- 1. ADD STATES for registration control -->
  const [regLimitInput, setRegLimitInput] = useState(60); // For the input field
  const [currentCount, setCurrentCount] = useState(0);    // Current registered teams
  const [currentLimit, setCurrentLimit] = useState(0);    // The server's actual limit
  const [isRegClosed, setIsRegClosed] = useState(false);  // To show open/closed status

  const handleSetRegTime = () => {
        if (regTime) {
            const isoTimestamp = new Date(regTime).toISOString();
            // Emits the event the server is listening for
            socket.emit("admin:setRegOpenTime", isoTimestamp);
            alert(`Registration opening time set to: ${new Date(regTime).toLocaleString()}`);
        } else {
            alert("Please select a valid date and time for registration.");
        }
    };

    const handleForceOpenReg = () => {
        if (window.confirm("Are you sure you want to OPEN registrations for all teams immediately?")) {
            socket.emit("admin:forceOpenReg");
            alert("Signal to open registrations has been sent!");
        }
    };

    const handleForceCloseReg = () => {
        if (window.confirm("⚠️ WARNING: This will immediately CLOSE registrations. Continue?")) {
            socket.emit("admin:forceCloseReg");
            alert("Signal to close registrations has been sent!");
        }
    };

  // <-- 2. ADD USEEFFECT to listen for server updates -->
  useEffect(() => {
    // This listener receives the comprehensive status object from the server
    socket.on('registrationStatus', (status) => {
      setIsRegClosed(status.isClosed);
      setCurrentCount(status.count);
      setCurrentLimit(status.limit);
      setRegLimitInput(status.limit); // Sync input field with the actual current limit
    });

    // Request the initial status when the component loads
    socket.emit('check');

    // Cleanup the listener when the component unmounts
    return () => {
      socket.off('registrationStatus');
    };
  }, []);

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

  // <-- 3. ADD HANDLER to set the new registration limit -->
  const handleSetRegLimit = () => {
    const limit = parseInt(regLimitInput, 10);
    if (!isNaN(limit) && limit >= 0) {
        socket.emit("admin:setRegLimit", limit);
        alert(`Registration limit has been set to ${limit}`);
    } else {
        alert("Please enter a valid, non-negative number.");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-orange-400 to-pink-500 text-transparent bg-clip-text">
          Admin Controls Panel
        </h1>
        
        {/* <-- 4. ADD THE NEW UI SECTION FOR REGISTRATION --> */}
        <div className="bg-gray-900/70 backdrop-blur-md p-6 rounded-2xl shadow-lg mb-8 border border-gray-700 hover:border-yellow-400 transition">
            <div className="flex items-center gap-2 mb-3">
              <Users className="text-yellow-400" />
              <h2 className="text-2xl font-semibold">Registration Limit Control</h2>
            </div>
            <p className="text-gray-400 mb-4">
              Set the maximum number of teams that can register. The form will close automatically when the limit is reached.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
              <input
                type="number"
                value={regLimitInput}
                onChange={(e) => setRegLimitInput(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 shadow-sm focus:ring-2 focus:ring-yellow-400 text-white"
              />
              <button
                onClick={handleSetRegLimit}
                className="bg-yellow-500 hover:bg-yellow-600 px-6 py-2 rounded-lg font-semibold transition shadow-md"
              >
                Set Limit
              </button>
            </div>
            <div className={`p-3 rounded-lg text-center font-bold text-lg ${isRegClosed ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
              Status: {currentCount} / {currentLimit} Teams Registered. (Registrations are {isRegClosed ? 'CLOSED' : 'OPEN'})
            </div>
        </div>
        <div className="bg-gray-900/70 backdrop-blur-md p-6 rounded-2xl shadow-lg mb-8 border border-gray-700 hover:border-cyan-400 transition">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="text-cyan-400" />
                        <h2 className="text-2xl font-semibold">Set Registration Opening Time</h2>
                    </div>
                    <p className="text-gray-400 mb-4">
                        Schedule a time for registrations to open automatically. The home page will show a countdown.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <input
                            type="datetime-local"
                            onChange={(e) => setRegTime(e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 shadow-sm focus:ring-2 focus:ring-cyan-400 text-white"
                        />
                        <button
                            onClick={handleSetRegTime}
                            className="bg-cyan-500 hover:bg-cyan-600 px-6 py-2 rounded-lg font-semibold transition shadow-md"
                        >
                            Set Timer
                        </button>
                    </div>
                </div>

                {/* --- 4. ADD NEW UI for Force Open/Close Registrations --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Force Open Registrations */}
                    <div className="bg-gray-900/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-700 hover:border-green-400 transition">
                         <div className="flex items-center gap-2 mb-3">
                            <Unlock className="text-green-400" />
                            <h2 className="text-2xl font-semibold">Force Open Registrations</h2>
                         </div>
                        <p className="text-gray-400 mb-4">Instantly open registrations, ignoring timers or limits.</p>
                        <button
                            onClick={handleForceOpenReg}
                            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition shadow-md"
                        >
                            Open Now
                        </button>
                    </div>
                    {/* Force Close Registrations */}
                    <div className="bg-gray-900/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-700 hover:border-red-400 transition">
                         <div className="flex items-center gap-2 mb-3">
                            <Lock className="text-red-400" />
                            <h2 className="text-2xl font-semibold">Force Close Registrations</h2>
                         </div>
                        <p className="text-gray-400 mb-4">Immediately lock registrations for everyone.</p>
                        <button
                            onClick={handleForceCloseReg}
                            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition shadow-md"
                        >
                            Close Now
                        </button>
                    </div>
                </div>


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
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="datetime-local"
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 shadow-sm focus:ring-2 focus:ring-orange-400 text-white"
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