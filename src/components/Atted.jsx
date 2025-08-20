import { useState, useEffect } from "react";
import io from "socket.io-client";
import api from "../api";

function AttenCard({ team, attdField }) {
  const [leadAttendance, setLeadAttendance] = useState(team.lead?.[attdField] || null);
  const [done, setDone] = useState(!!team.lead?.[attdField]);
  const [editMode, setEditMode] = useState(false);
  const [socket, setSocket] = useState(null);
  const [memberAttendance, setMemberAttendance] = useState(
    team.teamMembers.reduce((acc, m) => {
      acc[m.name] = m[attdField] || null;
      return acc;
    }, {})
  );

  useEffect(() => {
    const newSocket = io(api);
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  const toggleLeadAttendance = (status) => setLeadAttendance(status);
  const toggleMemberAttendance = (name, status) =>
    setMemberAttendance((prev) => ({ ...prev, [name]: status }));

  const handleSubmit = () => {
    if (!socket) return;
    const isComplete = leadAttendance && Object.values(memberAttendance).every((v) => v !== null);
    if (!isComplete) {
      alert("⚠ Please mark attendance for all members");
      return;
    }
    const attendanceData = {
      name: team.teamname,
      lead: { ...team.lead, [attdField]: leadAttendance },
      teamMembers: team.teamMembers.map((m) => ({ ...m, [attdField]: memberAttendance[m.name] })),
    };
    socket.emit("admin", attendanceData);
    setDone(true);
    setEditMode(false);
    alert(editMode ? "✅ Attendance updated!" : "✅ Attendance submitted!");
  };

  return (
    <div className="bg-gray-800 shadow-lg rounded-xl overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 flex justify-between items-center border-b border-gray-700">
        <h2 className="text-lg font-bold text-white">{team.teamname}</h2>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            done ? "bg-green-600 text-white" : "bg-yellow-500 text-white"
          }`}
        >
          {done ? "✔ Submitted" : "⏳ Pending"}
        </span>
      </div>

      {/* Lead Section */}
      <div className="p-4 border-b border-gray-700">
        <p className="font-semibold text-gray-200">👤 Lead: {team.name}</p>
        <p className="text-sm text-gray-400">Reg No: {team.registrationNumber}</p>
        <div className="flex mt-3 border border-gray-700 rounded-lg overflow-hidden">
          <button
            className={`flex-1 py-2 ${
              leadAttendance === "Present"
                ? "bg-green-500 text-white"
                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
            }`}
            onClick={() => (editMode || !done) && toggleLeadAttendance("Present")}
            disabled={done && !editMode}
          >
            ✅ Present
          </button>
          <button
            className={`flex-1 py-2 ${
              leadAttendance === "Absent"
                ? "bg-red-500 text-white"
                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
            }`}
            onClick={() => (editMode || !done) && toggleLeadAttendance("Absent")}
            disabled={done && !editMode}
          >
            ❌ Absent
          </button>
        </div>
      </div>

      {/* Members */}
      <div className="p-4">
        <h3 className="text-gray-300 text-sm mb-3">👥 Members</h3>
        <div className="space-y-3">
          {team.teamMembers.map((m) => (
            <div key={m.name} className="p-3 border border-gray-700 rounded-lg flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-200 font-medium">{m.name}</p>
                  <p className="text-xs text-gray-400">Reg: {m.registrationNumber}</p>
                </div>
              </div>
              <div className="flex border border-gray-700 rounded-lg overflow-hidden">
                <button
                  className={`flex-1 py-1 ${
                    memberAttendance[m.name] === "Present"
                      ? "bg-green-500 text-white"
                      : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                  }`}
                  onClick={() => (editMode || !done) && toggleMemberAttendance(m.name, "Present")}
                  disabled={done && !editMode}
                >
                  ✅ Present
                </button>
                <button
                  className={`flex-1 py-1 ${
                    memberAttendance[m.name] === "Absent"
                      ? "bg-red-500 text-white"
                      : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                  }`}
                  onClick={() => (editMode || !done) && toggleMemberAttendance(m.name, "Absent")}
                  disabled={done && !editMode}
                >
                  ❌ Absent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-700 flex gap-3">
        {!done && (
          <button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            onClick={handleSubmit}
          >
            Submit Attendance
          </button>
        )}
        {done && !editMode && (
          <>
            <button className="flex-1 bg-gray-600 text-white py-2 rounded-lg cursor-default">
              ✔ Submitted
            </button>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
              onClick={() => setEditMode(true)}
            >
              ✏ Edit
            </button>
          </>
        )}
        {done && editMode && (
          <>
            <button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
              onClick={handleSubmit}
            >
              Update
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AttenCard;
