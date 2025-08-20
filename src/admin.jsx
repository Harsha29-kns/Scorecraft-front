import { useEffect, useState } from "react";
import axios from "axios";
import api from "./api";
import { io } from "socket.io-client";
import GameScore from "./GameScore"; // Assuming this component exists
import { useNavigate } from "react-router-dom";

const socket = io(api);

// Naruto Themed Loader Component
const NarutoLoader = () => (
    <div className="flex flex-col items-center justify-center text-center">
        <svg width="80" height="80" viewBox="0 0 100 100" className="animate-spin" style={{ animationDuration: '2s' }}>
            <circle cx="50" cy="50" r="45" fill="none" stroke="#FF5722" strokeWidth="4" />
            <circle cx="50" cy="50" r="15" fill="#FF5722" />
            <path d="M50 5 C 74.85 5, 95 25.15, 95 50 C 95 25.15, 74.85 5, 50 5" fill="none" stroke="#FF5722" strokeWidth="1">
                <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="120 50 50" dur="0.67s" repeatCount="indefinite" />
            </path>
            <path d="M50 5 C 25.15 5, 5 25.15, 5 50 C 5 25.15, 25.15 5, 50 5" fill="none" stroke="#FF5722" strokeWidth="1">
                <animateTransform attributeName="transform" type="rotate" from="120 50 50" to="240 50 50" dur="0.67s" repeatCount="indefinite" />
            </path>
             <path d="M5 50 C 5 74.85, 25.15 95, 50 95 C 25.15 95, 5 74.85, 5 50" fill="none" stroke="#FF5722" strokeWidth="1">
                <animateTransform attributeName="transform" type="rotate" from="240 50 50" to="360 50 50" dur="0.67s" repeatCount="indefinite" />
            </path>
        </svg>
        <p className="text-orange-400 text-xl font-naruto mt-4">Loading Missions...</p>
    </div>
);

// A simple card for displaying stats
const StatCard = ({ title, value, color }) => (
    <div className={`bg-gray-800/50 border-2 ${color} p-6 rounded-xl shadow-lg text-center backdrop-blur-md`}>
        <h2 className="text-lg font-semibold text-white/80 mb-1">{title}</h2>
        <p className="text-4xl font-bold text-white">{value}</p>
    </div>
);


function Admin() {
    // --- NEW: Authentication State ---
    const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem("adminAuthenticated") === "true");
    const [passwordInput, setPasswordInput] = useState("");
    const [loginError, setLoginError] = useState("");

    // --- Original States ---
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sectors, setSectors] = useState(["Naruto", "Sasuke", "Itachi"]);
    const [currentSectorIndex, setCurrentSectorIndex] = useState(0);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationTab, setVerificationTab] = useState('pending');
    const [expandedTeam, setExpandedTeam] = useState(null);
    const [showAttdModal, setShowAttdModal] = useState(false);
    const [selectedAttdRound, setSelectedAttdRound] = useState(null);
    const navigate = useNavigate();

    // Domain Management States
    const [showDomainModal, setShowDomainModal] = useState(false);
    const [allDomains, setAllDomains] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // States for Support Requests
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [teamsWithIssues, setTeamsWithIssues] = useState([]);
    const [issuesLoading, setIssuesLoading] = useState(false);

    // States for Admin Reminders
    const [reminderText, setReminderText] = useState("");
    const [isSendingReminder, setIsSendingReminder] = useState(false);
    const [reminderError, setReminderError] = useState("");
    
    // --- NEW: Login Handler ---
    const handleLogin = (e) => {
        e.preventDefault();
        if (passwordInput === "harsha") {
            setIsAuthenticated(true);
            sessionStorage.setItem("adminAuthenticated", "true");
            setLoginError("");
        } else {
            setLoginError("Incorrect Secret Jutsu. Access Denied.");
            setPasswordInput("");
        }
    };

    // --- NEW: Logout Handler ---
    const handleLogout = () => {
        sessionStorage.removeItem("adminAuthenticated");
        setIsAuthenticated(false);
        setPasswordInput("");
    };

    useEffect(() => {
        // Only fetch data if authenticated
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        async function fetchData() {
            setLoading(true);
            try {
                const [teamsRes, domainsRes, issuesRes] = await Promise.all([
                    axios.get(`${api}/event/students`),
                    axios.get(`${api}/domains`),
                    axios.get(`${api}/event/issues`)
                ]);

                setTeams(teamsRes.data);
                setAllDomains(domainsRes.data);
                
                const pendingIssuesTeams = issuesRes.data
                    .map(team => ({
                        ...team,
                        issues: team.issues.filter(issue => issue.status === 'Pending')
                    }))
                    .filter(team => team.issues.length > 0);
                setTeamsWithIssues(pendingIssuesTeams);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [isAuthenticated]); // Re-fetch data when authentication status changes
    
    const fetchIssues = async () => {
        setIssuesLoading(true);
        try {
            const res = await axios.get(`${api}/event/issues`);
            const pendingIssues = res.data
                .map(team => ({
                    ...team,
                    issues: team.issues.filter(issue => issue.status === 'Pending')
                }))
                .filter(team => team.issues.length > 0);
            setTeamsWithIssues(pendingIssues);
        } catch (error) {
            console.error("Error fetching issues:", error);
            alert("Could not load support requests.");
        } finally {
            setIssuesLoading(false);
        }
    };

    const handleOpenSupportModal = () => {
        setShowSupportModal(true);
        fetchIssues();
    };

    const handleResolveIssue = async (teamId, issueId) => {
        setTeamsWithIssues(prevTeams =>
            prevTeams
                .map(team => {
                    if (team._id === teamId) {
                        return { ...team, issues: team.issues.filter(issue => issue._id !== issueId) };
                    }
                    return team;
                })
                .filter(team => team.issues.length > 0)
        );

        try {
            await axios.post(`${api}/event/issue/resolve/${teamId}/${issueId}`);
        } catch (error) {
            console.error("Error resolving issue:", error);
            alert("Failed to resolve the issue. Reverting changes.");
            fetchIssues();
        }
    };
    
    const handleSendReminder = () => {
        if (!reminderText.trim()) {
            setReminderError("Reminder message cannot be empty.");
            return;
        }
        setIsSendingReminder(true);
        setReminderError("");
        socket.emit('admin:sendReminder', { message: reminderText.trim() });
        setTimeout(() => {
            setIsSendingReminder(false);
            setReminderText("");
        }, 1000);
    };
    
    const handleVerifyTeam = async (teamId) => {
        try {
            await axios.post(`${api}/event/event/verify/${teamId}`);
            setTeams(prev => prev.map(t => t._id === teamId ? { ...t, verified: true } : t));
        } catch (error) {
            console.error("Failed to verify team:", error);
            alert("Verification failed. Please try again.");
        }
    };
    
    const handleDomainChange = async (teamId, newDomain) => {
        const originalTeams = [...teams];
        setTeams(prev => prev.map(t => t._id === teamId ? { ...t, Domain: newDomain } : t));
        try {
            await axios.post(`${api}/admin/updateDomain`, { teamId, domain: newDomain });
        } catch (error) {
            console.error("Failed to update domain:", error);
            alert("Error: Could not update domain.");
            setTeams(originalTeams);
        }
    };

    const toggleTeamDetails = (teamId) => {
        setExpandedTeam(expandedTeam === teamId ? null : teamId);
    };

    const verifiedCount = teams.filter(t => t.verified).length;
    const notVerifiedCount = teams.length - verifiedCount;
    const filteredTeams = teams.filter(team => team.teamname.toLowerCase().includes(searchTerm.toLowerCase()));
    const pendingIssuesCount = teamsWithIssues.reduce((count, team) => count + team.issues.length, 0);

    // --- NEW: Login Screen UI ---
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: `url('https://images6.alphacoders.com/605/605598.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
                <div className="relative z-10 w-full max-w-md">
                    <form onSubmit={handleLogin} className="bg-gray-900/50 backdrop-blur-lg border border-orange-500/30 rounded-2xl shadow-2xl p-8 space-y-6">
                        <div className="text-center">
                            <h1 className="text-4xl font-naruto text-orange-500 drop-shadow-lg">Hokage's Office</h1>
                            <p className="text-gray-400 mt-2">Admin Seal Verification Required</p>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-orange-400 mb-2 block" htmlFor="password">
                                Secret Jutsu (Password)
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="************"
                                className="w-full bg-gray-800 border-2 border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>
                        {loginError && <p className="text-red-400 text-center text-sm">{loginError}</p>}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:scale-105 transition-transform text-lg"
                        >
                            Verify Seal
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    
    // --- Original Dashboard UI (now shown only after login) ---
    return (
        <div className="min-h-screen p-6" style={{ backgroundImage: `url('https://images6.alphacoders.com/605/605598.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-5xl font-naruto text-orange-500 drop-shadow-lg">Hokage's Dashboard</h1>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard title="Total Teams" value={teams.length} color="border-blue-500" />
                    <StatCard title="Verified" value={verifiedCount} color="border-green-500" />
                    <StatCard title="Pending" value={notVerifiedCount} color="border-red-500" />
                    <StatCard title="Support Requests" value={pendingIssuesCount} color="border-yellow-500" />
                </div>

                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 mb-10 border border-orange-500/30 flex flex-wrap items-center justify-center gap-6">
                    <button onClick={() => setShowVerificationModal(true)} className="w-full md:w-auto flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:scale-105 transition-transform">
                        Verify Payments
                    </button>
                    <button onClick={() => setShowDomainModal(true)} className="w-full md:w-auto flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg transition-colors">
                        Manage Domains
                    </button>
                    <button onClick={handleOpenSupportModal} className="relative w-full md:w-auto flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-colors">
                        Support Requests
                        {pendingIssuesCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-6 w-6">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 text-white text-xs font-semibold items-center justify-center">
                                    {pendingIssuesCount}
                                </span>
                            </span>
                        )}
                    </button>
                     <button onClick={() => navigate("/all-teams")} className="w-full md:w-auto flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg transition-colors">
                        Assign Sectors
                    </button>
                    <button onClick={() => { const futureTime = new Date(Date.now() + 10 * 60 * 1000).toISOString(); socket.emit("domainOpen", { open: futureTime }); }} className="w-full md:w-auto flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition-colors">
                        Open Domain
                    </button>
                    <button
                        className="w-full md:w-auto flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-lg transition-colors"
                        onClick={() => setShowAttdModal(true)}
                    >
                        Attendance Open
                    </button>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 mb-10 border border-yellow-500/30">
                    <h2 className="text-2xl font-naruto text-yellow-400 text-center mb-4">Broadcast a Reminder</h2>
                    <div className="flex flex-col gap-4">
                        <textarea
                            value={reminderText}
                            onChange={(e) => setReminderText(e.target.value)}
                            placeholder="e.g., Lunch will be served at 1:00 PM in the main hall."
                            className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                            disabled={isSendingReminder}
                        />
                        {reminderError && <p className="text-red-400 text-sm text-center">{reminderError}</p>}
                        <button
                            onClick={handleSendReminder}
                            disabled={isSendingReminder || !reminderText.trim()}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSendingReminder ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Broadcasting...
                                </>
                            ) : (
                                "Send to All Teams"
                            )}
                        </button>
                    </div>
                </div>

                {/* Verification Modal */}
                {showVerificationModal && (
                    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
                        <div className="bg-gray-900 border-2 border-orange-500/50 rounded-xl shadow-lg p-6 w-full max-w-4xl flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl text-orange-400 font-naruto">Payment Verification</h2>
                                <button className="text-gray-400 hover:text-white text-3xl" onClick={() => setShowVerificationModal(false)}>&times;</button>
                            </div>
                            <div className="flex border-b border-gray-700 mb-4">
                                <button onClick={() => setVerificationTab('pending')} className={`py-2 px-4 font-semibold ${verificationTab === 'pending' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400'}`}>
                                    Pending ({notVerifiedCount})
                                </button>
                                <button onClick={() => setVerificationTab('verified')} className={`py-2 px-4 font-semibold ${verificationTab === 'verified' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}>
                                    Verified ({verifiedCount})
                                </button>
                            </div>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                {teams.filter(t => verificationTab === 'pending' ? !t.verified : t.verified).map((team) => (
                                    <div key={team._id} className="bg-gray-800 rounded-lg p-4 shadow transition-all duration-300">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-white font-semibold">{team.teamname}</p>
                                                <p className="text-gray-400 text-sm">{team.email}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => toggleTeamDetails(team._id)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-semibold">
                                                    {expandedTeam === team._id ? 'Collapse' : 'Expand'}
                                                </button>
                                                {verificationTab === 'pending' && (
                                                    <button onClick={() => handleVerifyTeam(team._id)} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold shadow transition">
                                                        Verify
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {expandedTeam === team._id && (
                                            <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-bold text-orange-400 mb-2">Team Members:</h4>
                                                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                                                        <li>{team.name} (Leader)</li>
                                                        {team.teamMembers.map((member, index) => (
                                                            <li key={index}>{member.name}</li>
                                                        ))}
                                                    </ul>
                                                    <h4 className="font-bold text-orange-400 mt-4 mb-2">Payment Details:</h4>
                                                    <p className="text-gray-300"><span className="font-semibold">UPI ID:</span> {team.upiId}</p>
                                                    <p className="text-gray-300"><span className="font-semibold">Transaction ID:</span> {team.transtationId}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-orange-400 mb-2">Payment Proof:</h4>
                                                    <a href={team.imgUrl} target="_blank" rel="noopener noreferrer">
                                                        <img src={team.imgUrl} alt="Payment Proof" className="rounded-lg w-full h-auto max-h-60 object-contain cursor-pointer"/>
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Domain Management Modal */}
                {showDomainModal && (
                    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
                        <div className="bg-gray-900 border-2 border-orange-500/50 rounded-xl shadow-lg p-6 w-full max-w-3xl flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                 <h2 className="text-2xl text-orange-400 font-naruto">Change Team Domains</h2>
                                 <button className="text-gray-400 hover:text-white text-3xl" onClick={() => setShowDomainModal(false)}>&times;</button>
                            </div>
                            <input type="text" placeholder="Search for a team..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 mb-4 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:border-orange-500"/>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                {filteredTeams.map(team => (
                                    <div key={team._id} className="bg-gray-800 rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center shadow gap-3">
                                        <p className="text-white font-semibold">{team.teamname}</p>
                                        <select value={team.Domain || ''} onChange={(e) => handleDomainChange(team._id, e.target.value)} className="w-full sm:w-1/2 p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-orange-500">
                                            <option value="" disabled>-- Select a Domain --</option>
                                            {allDomains.map(domain => (<option key={domain.id} value={domain.name}>{domain.name}</option>))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Support Requests Modal */}
                {showSupportModal && (
                    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
                        <div className="bg-gray-900 border-2 border-orange-500/50 rounded-xl shadow-lg p-6 w-full max-w-3xl flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl text-orange-400 font-naruto">Support Requests</h2>
                                <button className="text-gray-400 hover:text-white text-3xl" onClick={() => setShowSupportModal(false)}>&times;</button>
                            </div>
                            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                {issuesLoading ? (
                                    <div className="text-center text-gray-400 py-8">Loading requests...</div>
                                ) : teamsWithIssues.length > 0 ? (
                                    teamsWithIssues.map(team => (
                                        team.issues.map(issue => (
                                            <div key={issue._id} className="bg-gray-800 rounded-lg p-4 shadow-md transition-all duration-300">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <p className="font-bold text-lg text-white">{team.teamname}</p>
                                                        <p className="text-gray-400 text-sm mt-2 whitespace-pre-wrap">{issue.text}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleResolveIssue(team._id, issue._id)}
                                                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors whitespace-nowrap"
                                                    >
                                                        Resolve
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500 text-right mt-2">
                                                    {new Date(issue.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        ))
                                    ))
                                ) : (
                                    <div className="text-center text-gray-400 py-12">
                                        <p className="text-3xl">🎉</p>
                                        <p className="mt-2 font-semibold text-lg">All requests have been resolved!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Attendance Modal */}
                {showAttdModal && (
                  <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
                    <div className="bg-gray-900 border-2 border-orange-500/50 rounded-xl shadow-lg p-6 w-full max-w-sm flex flex-col">
                      <h2 className="text-xl font-bold text-orange-400 mb-4">Select Attendance Round</h2>
                      <div className="flex flex-col gap-3">
                        {["First", "Second", "Third", "Fourth"].map((round, idx) => (
                          <button
                            key={round}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${
                              selectedAttdRound === idx + 1
                                ? "bg-orange-700 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-orange-600 hover:text-white"
                            }`}
                            onClick={() => {
                              setSelectedAttdRound(idx + 1);
                              setShowAttdModal(false);
                              navigate(`/attd?round=${idx + 1}`);
                            }}
                          >
                            {round} Attendance
                          </button>
                        ))}
                      </div>
                      <button
                        className="mt-6 px-4 py-2 bg-gray-600 text-white rounded-lg"
                        onClick={() => setShowAttdModal(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64"><NarutoLoader /></div>
                ) : (
                    <div>
                        <div className="flex justify-center flex-wrap gap-3 mb-8">
                            {sectors.map((sector, index) => (
                                <button key={sector} onClick={() => setCurrentSectorIndex(index)} className={`px-6 py-2 rounded-lg font-semibold shadow transition ${currentSectorIndex === index ? 'bg-orange-600 text-white scale-105' : 'bg-gray-700/80 text-gray-300 hover:bg-orange-500/70'}`}>
                                    Sector {sector}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {teams.filter(t => t.Sector === sectors[currentSectorIndex]).map((team, i) => (
                                <div key={team._id} className="bg-gray-800/80 rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition backdrop-blur-sm border border-orange-500/30">
                                    <p className="text-lg text-orange-400 font-bold mb-2">#{i + 1} - {team.teamname}</p>
                                    <div className="w-full mb-4"><GameScore team={team} /></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Admin;