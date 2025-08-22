import { useState, useEffect } from "react";
import axios from "axios";
import api from "../api";
import QrScannerModal from "./QrScanner";

// --- MemberRow Component ---
const MemberRow = ({ member, status, onScan, onToggle, isDisabled }) => {
    const isPresent = status === "Present";
    const isAbsent = status === "Absent";

    return (
        <div className={`p-4 rounded-xl transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isPresent ? 'bg-green-500/20 border-green-500' :
            isAbsent ? 'bg-red-500/20 border-red-500' :
            'bg-gray-700/50 border-gray-600'
        } border`}>
            <div>
                <p className="font-bold text-white text-lg">{member.name} {member.isLead ? '(Lead)' : ''}</p>
                <p className="text-sm text-gray-400">Reg No: {member.registrationNumber}</p>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => onScan(member)} 
                    disabled={isDisabled}
                    className="h-12 w-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Scan QR for ${member.name}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4L12 4C12.5523 4 13 4.44772 13 5L13 5.01C13 5.56228 12.5523 6.01 12 6.01L12 6.01C11.4477 6.01 11 5.56228 11 5.01L11 5C11 4.44772 11.4477 4 12 4zM5 4h1a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zm13 0h1a1 1 0 011 1v1a1 1 0 01-1 1h-1a1 1 0 01-1-1V5a1 1 0 011-1zm-13 13h1a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1a1 1 0 011-1z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12v4h4v-4H9zM9 4v4h4V4H9zm10 10v4h4v-4h-4zM4 12v4h4v-4H4zm15-8v4h4V4h-4z" />
                    </svg>
                </button>
                <button 
                    onClick={() => onToggle(member.registrationNumber, "Present")} 
                    disabled={isDisabled}
                    className={`h-12 w-12 flex items-center justify-center rounded-full transition-all duration-200 ${isPresent ? 'bg-green-500 text-white scale-110' : 'bg-gray-700 text-gray-400 hover:bg-green-500/50'}`}
                    title={`Mark ${member.name} as Present`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </button>
                <button 
                    onClick={() => onToggle(member.registrationNumber, "Absent")} 
                    disabled={isDisabled}
                    className={`h-12 w-12 flex items-center justify-center rounded-full transition-all duration-200 ${isAbsent ? 'bg-red-500 text-white scale-110' : 'bg-gray-700 text-gray-400 hover:bg-red-500/50'}`}
                    title={`Mark ${member.name} as Absent`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    );
};


function AttenCard({ team, round }) {
  const [attendance, setAttendance] = useState({});
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [memberToScan, setMemberToScan] = useState(null);

  useEffect(() => {
    const initialAttendance = {};
    let isSubmitted = false;

    if (team.lead && team.lead.attendance) {
        const leadAttd = team.lead.attendance.find(a => a.round == round);
        if (leadAttd) {
            initialAttendance[team.registrationNumber] = leadAttd.status;
            isSubmitted = true;
        }
    }
    
    team.teamMembers.forEach(member => {
        if (member.attendance) {
            const memberAttd = member.attendance.find(a => a.round == round);
            if (memberAttd) {
                initialAttendance[member.registrationNumber] = memberAttd.status;
            }
        }
    });

    setAttendance(initialAttendance);
    setDone(isSubmitted);
    setEditMode(false);
  }, [team, round]);

  const openScannerFor = (member) => {
    setMemberToScan(member);
    setIsScannerOpen(true);
  };

  const handleScan = (data) => {
    if (data) {
      setIsScannerOpen(false);
      try {
        const scannedData = JSON.parse(data.text);

        if (scannedData.teamId !== team._id) {
          alert(`Error: This member is not from team "${team.teamname}".`);
          setMemberToScan(null);
          return;
        }
        
        if (scannedData.registrationNumber !== memberToScan.registrationNumber) {
            const scannedMember = [...team.teamMembers, {name: team.name, registrationNumber: team.registrationNumber}].find(m => m.registrationNumber === scannedData.registrationNumber);
            const scannedMemberName = scannedMember ? scannedMember.name : "an unknown member";
            alert(`Incorrect QR. You scanned ${scannedMemberName}'s code instead of ${memberToScan.name}'s code.`);
            setMemberToScan(null);
            return;
        }

        setAttendance(prev => ({
            ...prev,
            [scannedData.registrationNumber]: "Present"
        }));
        
        setMemberToScan(null);

      } catch (error) {
        console.error("Invalid QR code format:", error);
        alert("Invalid QR code format.");
        setMemberToScan(null);
      }
    }
  };

  const handleScanError = (err) => {
    console.error(err);
    alert("Could not start the camera. Please check permissions.");
    setIsScannerOpen(false);
    setMemberToScan(null);
  };

  const toggleAttendance = (registrationNumber, status) => {
    setAttendance(prev => ({ ...prev, [registrationNumber]: status }));
  };

  const handleSubmit = async () => {
    const allMembers = [
        { registrationNumber: team.registrationNumber }, 
        ...team.teamMembers
    ];

    const isComplete = allMembers.every(m => attendance[m.registrationNumber]);
    if (!isComplete) {
      alert("⚠ Please mark attendance for all members before submitting.");
      return;
    }

    try {
        await axios.post(`${api}/event/attendance/submit`, {
            teamId: team._id,
            roundNumber: parseInt(round),
            attendanceData: attendance
        });
        setDone(true);
        setEditMode(false);
        alert(editMode ? "✅ Attendance updated successfully!" : "✅ Attendance submitted successfully!");
    } catch (error) {
        console.error("Failed to submit attendance:", error);
        alert("❌ Error submitting attendance. Please try again.");
    }
  };

  const markAllPresent = () => {
    const newAttendance = {};
    newAttendance[team.registrationNumber] = "Present";
    team.teamMembers.forEach(member => {
        newAttendance[member.registrationNumber] = "Present";
    });
    setAttendance(newAttendance);
  };

  const getStatus = (regNo) => attendance[regNo] || null;

  return (
    <>
      {isScannerOpen && (
        <QrScannerModal
          onScan={handleScan}
          onError={handleScanError}
          onClose={() => {
              setIsScannerOpen(false);
              setMemberToScan(null);
          }}
          // --- THIS IS THE NEW PROP ---
          // This tells the browser to prefer the rear-facing (environment) camera.
          constraints={{
            audio: false,
            video: { facingMode: "environment" },
          }}
        />
      )}

      <div className="bg-gray-800 shadow-lg rounded-xl overflow-hidden max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gray-900 px-4 py-3 flex flex-col sm:flex-row justify-between items-center border-b border-gray-700 gap-4">
          <h2 className="text-lg font-bold text-white">{team.teamname} - Round {round}</h2>
          <div className="flex items-center gap-4">
            <button 
                onClick={markAllPresent}
                disabled={done && !editMode}
                className="bg-green-600/50 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Mark All Present
            </button>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${done ? "bg-green-600 text-white" : "bg-yellow-500 text-white"}`}>
                {done ? "✔ Submitted" : "⏳ Pending"}
            </span>
          </div>
        </div>

        {/* Members List */}
        <div className="p-4 space-y-4">
            <MemberRow 
                member={{ name: team.name, registrationNumber: team.registrationNumber, isLead: true }}
                status={getStatus(team.registrationNumber)}
                onScan={openScannerFor}
                onToggle={toggleAttendance}
                isDisabled={done && !editMode}
            />
            {team.teamMembers.map((member) => (
                <MemberRow 
                    key={member.registrationNumber}
                    member={member}
                    status={getStatus(member.registrationNumber)}
                    onScan={openScannerFor}
                    onToggle={toggleAttendance}
                    isDisabled={done && !editMode}
                />
            ))}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-700 flex flex-col sm:flex-row gap-3">
          {(!done || editMode) && (
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-lg" onClick={handleSubmit}>
              {editMode ? 'Update Attendance' : 'Submit Attendance'}
            </button>
          )}
          {done && !editMode && (
            <button className="flex-1 bg-gray-600 text-white py-3 rounded-lg cursor-default font-bold text-lg">
              ✔ Submitted
            </button>
          )}
          {done && (
            <button className={`px-6 py-3 rounded-lg text-white font-bold text-lg ${editMode ? 'bg-gray-500 hover:bg-gray-600' : 'bg-yellow-500 hover:bg-yellow-600'}`} onClick={() => setEditMode(!editMode)}>
              {editMode ? 'Cancel' : '✏ Edit'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default AttenCard;