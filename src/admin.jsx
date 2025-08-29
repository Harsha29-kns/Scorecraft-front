import { useEffect, useState, useRef } from "react";
import axios from "axios";
import api from "./api";
import { io } from "socket.io-client";
import GameScore from "./GameScore";
import { useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from "papaparse";

const socket = io(api);

// --- NEW: Notification Component ---
const Notification = ({ message, type, onClear }) => {
    useEffect(() => {
        // Automatically clear the notification after 3 seconds
        const timer = setTimeout(() => {
            onClear();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClear]);

    // Determine styles based on the notification type (success or error)
    const baseStyles = "fixed top-20 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl text-white font-semibold text-lg animate-fade-in-down";
    const typeStyles = type === 'success' 
        ? "bg-gradient-to-r from-green-500 to-emerald-600" 
        : "bg-gradient-to-r from-red-500 to-rose-600";

    return (
        <div className={`${baseStyles} ${typeStyles}`}>
            {message}
        </div>
    );
};

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
    // --- Authentication State ---
    const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem("adminAuthenticated") === "true");
    const [passwordInput, setPasswordInput] = useState("");
    const [loginError, setLoginError] = useState("");

    // --- NEW: Notification State ---
    const [notification, setNotification] = useState({ message: '', type: '' });

    // --- Dashboard States ---
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

    // --- Modal-specific States ---
    const [showDomainModal, setShowDomainModal] = useState(false);
    const [allDomains, setAllDomains] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [teamsWithIssues, setTeamsWithIssues] = useState([]);
    const [issuesLoading, setIssuesLoading] = useState(false);
    const [reminderText, setReminderText] = useState("");
    const [isSendingReminder, setIsSendingReminder] = useState(false);
    const [reminderError, setReminderError] = useState("");
    const [showCredentialModal, setShowCredentialModal] = useState(false);
    const [selectedTeamForPass, setSelectedTeamForPass] = useState("");
    const [isGeneratingPass, setIsGeneratingPass] = useState(false);
    const passContainerRef = useRef(null);

    // --- NEW: State for PPT Template ---
    const [pptTemplate, setPptTemplate] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");


    // --- Handlers ---
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

    const handleLogout = () => {
        sessionStorage.removeItem("adminAuthenticated");
        setIsAuthenticated(false);
        setPasswordInput("");
    };

    const handleSendPPT = async () => {
        if (!pptTemplate) {
            setUploadError("Please select a PowerPoint template file first.");
            return;
        }
        setIsUploading(true);
        setUploadError("");

        try {
            const formData = new FormData();
            formData.append("file", pptTemplate);
            formData.append("upload_preset", "ppt_templet");

            const response = await axios.post(
                "https://api.cloudinary.com/v1_1/dsvwojzli/raw/upload",
                formData
            );

            const fileUrl = response.data.secure_url;
            socket.emit('admin:sendPPT', { fileUrl: fileUrl, fileName: pptTemplate.name });
            setPptTemplate(null);
            document.getElementById('ppt-input').value = null;
            setNotification({ message: 'PPT Template Sent!', type: 'success' });

        } catch (error) {
            console.error("Error uploading PPT:", error);
            setUploadError("Failed to upload the template. Please try again.");
            setNotification({ message: 'PPT Upload Failed!', type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleExportMembers = () => {
        const flatData = [];
        teams.forEach(team => {
            flatData.push({
                "Team Name": team.teamname,
                "Payment Status": team.verified ? "Yes" : "No",
                "Member Name": team.name,
                "Role": "Lead",
                "Registration Number": team.registrationNumber,
                "Year": team.year,
                "Department": team.department,
                "Email": team.email,
                "Phone": team.phone,
                "Transaction ID": team.transtationId,
                "Payment Image URL": team.imgUrl,
            });
            team.teamMembers.forEach(member => {
                flatData.push({
                    "Team Name": team.teamname,
                    "Payment Status": team.verified ? "Yes" : "No",
                    "Member Name": member.name,
                    "Role": "Member",
                    "Registration Number": member.registrationNumber,
                    "Year": member.year,
                    "Department": member.department,
                    "Email": member.email,
                    "Phone": member.phone,
                });
            });
        });
    
        const csv = Papa.unparse(flatData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "members_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
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
    }, [isAuthenticated]);

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
        const originalIssues = [...teamsWithIssues];
        setTeamsWithIssues(prevTeams =>
            prevTeams
                .map(team => team._id === teamId ? { ...team, issues: team.issues.filter(issue => issue._id !== issueId) } : team)
                .filter(team => team.issues.length > 0)
        );
        try {
            await axios.post(`${api}/event/issue/resolve/${teamId}/${issueId}`);
            setNotification({ message: 'Issue Resolved!', type: 'success' });
        } catch (error) {
            console.error("Error resolving issue:", error);
            setTeamsWithIssues(originalIssues);
            setNotification({ message: 'Failed to Resolve Issue!', type: 'error' });
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
        setNotification({ message: 'Reminder Sent!', type: 'success' });
        setTimeout(() => {
            setIsSendingReminder(false);
            setReminderText("");
        }, 1000);
    };

    const handleVerifyTeam = async (teamId) => {
        try {
            await axios.post(`${api}/event/event/verify/${teamId}`);
            setTeams(prev => prev.map(t => t._id === teamId ? { ...t, verified: true } : t));
            setNotification({ message: 'Team Verified & Email Sent!', type: 'success' });
        } catch (error) {
            console.error("Failed to verify team:", error);
            setNotification({ message: 'Verification Failed!', type: 'error' });
        }
    };
    
    const handleDomainChange = async (teamId, newDomain) => {
        const originalTeams = [...teams];
        setTeams(prev => prev.map(t => t._id === teamId ? { ...t, Domain: newDomain } : t));
        try {
            await axios.post(`${api}/event/updateDomain`, { teamId, domain: newDomain });
            setNotification({ message: 'Domain Updated!', type: 'success' });
        } catch (error) {
            console.error("Failed to update domain:", error);
            setTeams(originalTeams);
            setNotification({ message: 'Failed to Update Domain!', type: 'error' });
        }
    };

    const toggleTeamDetails = (teamId) => {
        setExpandedTeam(expandedTeam === teamId ? null : teamId);
    };

    const handleDownloadPass = async () => {
        if (!selectedTeamForPass) {
            alert("Please select a team from the dropdown first.");
            return;
        }
        const team = teams.find(t => t._id === selectedTeamForPass);
        if (!team) {
            alert("Selected team not found.");
            return;
        }

        setIsGeneratingPass(true);
        const passElement = document.getElementById(`credential-pass-${team._id}`);

        if (!passElement) {
            console.error("Pass element could not be found in the DOM!");
            setIsGeneratingPass(false);
            return;
        }

        try {
            const canvas = await html2canvas(passElement, {
                scale: 2,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${team.teamname}_Credentials.pdf`);
            setNotification({ message: 'Credentials Exported!', type: 'success' });

        } catch (error) {
            console.error("Error generating PDF:", error);
            setNotification({ message: 'Export Failed!', type: 'error' });
        } finally {
            setIsGeneratingPass(false);
        }
    };

    // --- Calculated Values ---
    const verifiedCount = teams.filter(t => t.verified).length;
    const notVerifiedCount = teams.length - verifiedCount;
    const filteredTeams = teams.filter(team => team.teamname.toLowerCase().includes(searchTerm.toLowerCase()));
    const pendingIssuesCount = teamsWithIssues.reduce((count, team) => count + team.issues.length, 0);

    // --- UI Rendering ---
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

    return (
        <div className="min-h-screen p-6" style={{ backgroundImage: `url('https://images6.alphacoders.com/605/605598.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
            {notification.message && (
                <Notification 
                    message={notification.message} 
                    type={notification.type}
                    onClear={() => setNotification({ message: '', type: '' })}
                />
            )}
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
                    <button onClick={handleExportMembers} className="w-full md:w-auto flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:scale-105 transition-transform">
                        Export Members (CSV)
                    </button>
                    <button onClick={() => setShowDomainModal(true)} className="w-full md:w-auto flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg transition-colors">
                        Manage Domains
                    </button>
                    <button onClick={handleOpenSupportModal} className="relative w-full md:w-auto flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-colors">
                        Support Requests
                        {pendingIssuesCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-6 w-6">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 text-white text-xs font-semibold items-center justify-center">{pendingIssuesCount}</span>
                            </span>
                        )}
                    </button>
                    <button onClick={() => navigate("/all-teams")} className="w-full md:w-auto flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg transition-colors">
                        Assign Sectors
                    </button>
                    <button
                    onClick={() => { window.location.href = "/admin-controls"; }}
                    className="w-full md:w-auto flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition-colors"
                    >
                    Domain Controls
                    </button>
                    <button
                        className="w-full md:w-auto flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-lg transition-colors"
                        onClick={() => setShowAttdModal(true)}
                    >
                        Attendance Open
                    </button>
                    <button
                        onClick={() => setShowCredentialModal(true)}
                        className="w-full md:w-auto flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:scale-105 transition-transform"
                    >
                        Export Credentials
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
                                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Broadcasting...</>
                            ) : ( "Send to All Teams" )}
                        </button>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 mb-10 border border-purple-500/30">
                    <h2 className="text-2xl font-naruto text-purple-400 text-center mb-4">Broadcast PPT Template</h2>
                    <div className="flex flex-col gap-4">
                        <input
                            id="ppt-input"
                            type="file"
                            accept=".ppt, .pptx"
                            onChange={(e) => setPptTemplate(e.target.files[0])}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                            disabled={isUploading}
                        />
                        {uploadError && <p className="text-red-400 text-sm text-center">{uploadError}</p>}
                        <button
                            onClick={handleSendPPT}
                            disabled={isUploading || !pptTemplate}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isUploading ? (
                                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                            ) : ( "Send to All Teams" )}
                        </button>
                    </div>
                </div>

                {/* --- ALL MODALS --- */}
                {showCredentialModal && (
                    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
                        <div className="bg-gray-900 border-2 border-cyan-500/50 rounded-xl shadow-lg p-6 w-full max-w-lg flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl text-cyan-400 font-naruto">Export Team Credentials</h2>
                                <button className="text-gray-400 hover:text-white text-3xl" onClick={() => setShowCredentialModal(false)}>&times;</button>
                            </div>
                            <div className="space-y-4">
                                <p className="text-gray-300 text-center">Select a verified team to download their pass with the password and all member QR codes.</p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <select
                                        value={selectedTeamForPass}
                                        onChange={(e) => setSelectedTeamForPass(e.target.value)}
                                        className="flex-grow p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:border-cyan-500"
                                    >
                                        <option value="">-- Select a Verified Team --</option>
                                        {teams.filter(t => t.verified).map(team => (
                                            <option key={team._id} value={team._id}>{team.teamname}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleDownloadPass}
                                        disabled={!selectedTeamForPass || isGeneratingPass}
                                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isGeneratingPass ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating...</>) : 'Download Pass (PDF)'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showVerificationModal && (
                    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
                        <div className="bg-gray-900 border-2 border-orange-500/50 rounded-xl shadow-lg p-6 w-full max-w-4xl flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl text-orange-400 font-naruto">Payment Verification</h2>
                                <button className="text-gray-400 hover:text-white text-3xl" onClick={() => setShowVerificationModal(false)}>&times;</button>
                            </div>
                            <div className="flex border-b border-gray-700 mb-4">
                                <button onClick={() => setVerificationTab('pending')} className={`py-2 px-4 font-semibold ${verificationTab === 'pending' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400'}`}>Pending ({notVerifiedCount})</button>
                                <button onClick={() => setVerificationTab('verified')} className={`py-2 px-4 font-semibold ${verificationTab === 'verified' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}>Verified ({verifiedCount})</button>
                            </div>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                {teams.filter(t => verificationTab === 'pending' ? !t.verified : t.verified).map((team) => (
                                    <div key={team._id} className="bg-gray-800 rounded-lg p-4 shadow">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-white font-semibold">{team.teamname}</p>
                                                <p className="text-gray-400 text-sm">{team.email}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => toggleTeamDetails(team._id)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-semibold">{expandedTeam === team._id ? 'Collapse' : 'Expand'}</button>
                                                {verificationTab === 'pending' && (
                                                    <button onClick={() => handleVerifyTeam(team._id)} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold shadow">Verify</button>
                                                )}
                                            </div>
                                        </div>
                                        {expandedTeam === team._id && (
                                            <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-bold text-orange-400 mb-2">Team Members:</h4>
                                                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                                                        <li>{team.name} (Leader)</li>
                                                        {team.teamMembers.map((member, index) => (<li key={index}>{member.name}</li>))}
                                                    </ul>
                                                    <h4 className="font-bold text-orange-400 mt-4 mb-2">Payment Details:</h4>
                                                    <p className="text-gray-300"><span className="font-semibold">UPI ID:</span> {team.upiId}</p>
                                                    <p className="text-gray-300"><span className="font-semibold">Transaction ID:</span> {team.transtationId}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-orange-400 mb-2">Payment Proof:</h4>
                                                    <a href={team.imgUrl} target="_blank" rel="noopener noreferrer"><img src={team.imgUrl} alt="Payment Proof" className="rounded-lg w-full h-auto max-h-60 object-contain cursor-pointer"/></a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

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

                {showSupportModal && (
                    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
                        <div className="bg-gray-900 border-2 border-orange-500/50 rounded-xl shadow-lg p-6 w-full max-w-3xl flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl text-orange-400 font-naruto">Support Requests</h2>
                                <button className="text-gray-400 hover:text-white text-3xl" onClick={() => setShowSupportModal(false)}>&times;</button>
                            </div>
                            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                {issuesLoading ? (<div className="text-center text-gray-400 py-8">Loading requests...</div>) : teamsWithIssues.length > 0 ? (teamsWithIssues.map(team => (team.issues.map(issue => (
                                    <div key={issue._id} className="bg-gray-800 rounded-lg p-4 shadow-md">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <p className="text-sm text-gray-400 mb-1">Sector: {team.Sector}</p>
                                                <p className="font-bold text-lg text-white">Team Name: {team.teamname}</p>
                                                <p className="text-gray-400 text-sm mt-2 whitespace-pre-wrap">Issue: {issue.text}</p>
                                            </div>
                                            <button onClick={() => handleResolveIssue(team._id, issue._id)} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md whitespace-nowrap">Resolve</button>
                                        </div>
                                        <p className="text-xs text-gray-500 text-right mt-2">{new Date(issue.timestamp).toLocaleString()}</p>
                                    </div>
                                ))))) : (<div className="text-center text-gray-400 py-12"><p className="text-3xl">🎉</p><p className="mt-2 font-semibold text-lg">All requests have been resolved!</p></div>)}
                            </div>
                        </div>
                    </div>
                )}

                {showAttdModal && (
                    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
                        <div className="bg-gray-900 border-2 border-orange-500/50 rounded-xl shadow-lg p-6 w-full max-w-sm flex flex-col">
                            <h2 className="text-xl font-bold text-orange-400 mb-4">Select Attendance Round</h2>
                            <div className="flex flex-col gap-3">
                                {["First", "Second", "Third", "Fourth"].map((round, idx) => (
                                    <button
                                        key={round}
                                        className={`px-4 py-2 rounded-lg font-semibold transition ${selectedAttdRound === idx + 1 ? "bg-orange-700 text-white" : "bg-gray-700 text-gray-300 hover:bg-orange-600 hover:text-white"}`}
                                        onClick={() => {
                                            setSelectedAttdRound(idx + 1);
                                            setShowAttdModal(false);
                                            navigate(`/attd?round=${idx + 1}`);
                                        }}
                                    >{round} Attendance</button>
                                ))}
                            </div>
                            <button className="mt-6 px-4 py-2 bg-gray-600 text-white rounded-lg" onClick={() => setShowAttdModal(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                {/* --- MAIN CONTENT DISPLAY --- */}
                {loading ? (
                    <div className="flex justify-center items-center h-64"><NarutoLoader /></div>
                ) : (
                    <div>
                        <div className="flex justify-center flex-wrap gap-3 mb-8">
                            {sectors.map((sector, index) => (
                                <button key={sector} onClick={() => setCurrentSectorIndex(index)} className={`px-6 py-2 rounded-lg font-semibold shadow transition ${currentSectorIndex === index ? 'bg-orange-600 text-white scale-105' : 'bg-gray-700/80 text-gray-300 hover:bg-orange-500/70'}`}>Sector {sector}</button>
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

            {/* --- HIDDEN DIV FOR PDF GENERATION (WITH INLINE STYLES) --- */}
            <div ref={passContainerRef} style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -10 }}>
                {teams.filter(t => t.verified).map(team => (
                    <div
                        key={`pass-${team._id}`}
                        id={`credential-pass-${team._id}`}
                        style={{
                            width: '620px',
                            minHeight: '877px', // A4 aspect ratio
                            padding: '2rem',
                            backgroundColor: '#f5f5f5',
                            color: '#1a202c',
                            fontFamily: 'sans-serif',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Background shape element for visual flair */}
                        <div style={{
                            position: 'absolute',
                            top: '-50px',
                            left: '-50px',
                            width: '200px',
                            height: '200px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '50%',
                            opacity: '0.1',
                        }} />
                        <div style={{
                            position: 'absolute',
                            bottom: '-50px',
                            right: '-50px',
                            width: '250px',
                            height: '250px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '50%',
                            opacity: '0.05',
                        }} />

                        <div style={{ textAlign: 'center', borderBottom: '2px solid #cbd5e0', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1a202c' }}>EVENT CREDENTIALS</h1>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 'normal', color: '#4a5568', marginTop: '0.5rem' }}>HACKFORGE 2025</h2>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'normal', color: '#4a5568', marginTop: '0.5rem'}}>DONT SHARE THIS PASSWOARDS WITH ANYONE!</h3>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'semibold', color: '#2d3748', marginBottom: '0.5rem' }}>Team: <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{team.teamname}</span></p>
                            <p style={{ fontSize: '1.125rem', color: '#f82121ff' }}>Sector: {team.Sector || 'N/A'}</p>
                        </div>

                        <div style={{ backgroundColor: '#e2e8f0', border: '1px solid #a0aec0', borderRadius: '1rem', textAlign: 'center', padding: '1.5rem', margin: '2rem 0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <p style={{ color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Team Secret Code / Password</p>
                            <p style={{ fontSize: '2.5rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#3b82f6', letterSpacing: '0.1em' }}>
                                {team.password || 'N/A'}
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
                            {/* Team Lead */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                {team.lead?.qrCode && team.lead.qrCode.startsWith('data:image') ? (
                                    <img src={team.lead.qrCode} alt={`QR Code for ${team.name}`} style={{ width: '8rem', height: '8rem', borderRadius: '0.5rem', border: '2px solid #e2e8f0', padding: '0.25rem' }}/>
                                ) : (
                                    <div style={{ width: '8rem', height: '8rem', borderRadius: '0.5rem', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '0.8rem', color: '#cbd5e0', padding: '0.5rem', border: '2px solid #e2e8f0' }}>
                                        QR Code Data Invalid
                                    </div>
                                )}
                                <div>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                        {team.name}
                                        <span style={{ fontSize: '0.8rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', marginLeft: '0.5rem', verticalAlign: 'middle' }}>LEADER</span>
                                    </p>
                                    <p style={{ color: '#4a5568' }}>Reg No: {team.registrationNumber}</p>
                                </div>
                            </div>
                            {/* Team Members */}
                            {team.teamMembers.map((member, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    {member.qrCode && member.qrCode.startsWith('data:image') ? (
                                        <img src={member.qrCode} alt={`QR Code for ${member.name}`} style={{ width: '8rem', height: '8rem', borderRadius: '0.5rem', border: '2px solid #e2e8f0', padding: '0.25rem' }}/>
                                    ) : (
                                        <div style={{ width: '8rem', height: '8rem', borderRadius: '0.5rem', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '0.8rem', color: '#cbd5e0', padding: '0.5rem', border: '2px solid #e2e8f0' }}>
                                            QR Code Data Invalid
                                        </div>
                                    )}
                                    <div>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{member.name}</p>
                                        <p style={{ color: '#4a5568' }}>Reg No: {member.registrationNumber}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '2.5rem', color: '#718096', fontSize: '0.875rem' }}>
    <p>ANY ISSUES CONTACT 7671084221</p>
                            <p>This pass must be presented for entry and attendance verification.</p>
                            <p>&copy; 2025 Scorecraft KARE</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Admin;