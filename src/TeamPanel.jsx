import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import api from "./api";
import { io } from "socket.io-client";
import "driver.js/dist/driver.css";
import Modal from 'react-modal';

// Import your images
import kalasalingam from "/public/kalasalingam.png";
import lod from "/image_processing20210907-13511-1juj33d.gif";
import expra from "/public/expra.png";
import scorecraft from "/public/scorecraft.jpg";
import attd from "/public/attd.png";
import king from "/public/king.png";
import prob from "/public/prob.png";
import domains from "/public/domains.png";
import profile from "/public/Players_Profile.png";

const socket = io(api);

// --- MODAL STYLES ---
const customModalStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#1f2937', // bg-gray-800
        border: '1px solid #f97316', // border-orange-500
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '90vw',
        width: '850px', // Increased width for the new layout
        maxHeight: '90vh',
        color: 'white',
        zIndex: 1001,
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 1000,
    },
};

// --- MODAL COMPONENTS ---

const LeaderboardModal = ({ isOpen, onClose, leaderboard }) => (
    <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        style={customModalStyles}
        contentLabel="Leaderboard"
        appElement={document.getElementById('root') || undefined}
    >
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                <h2 className="text-2xl font-bold text-orange-400 font-naruto">SCOREBOARD</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-3xl font-light">×</button>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {leaderboard && leaderboard.length > 0 ? leaderboard.map((item, index) => (
                <div key={index}
                     className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-between text-black ${
                         index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                         index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                         index === 2 ? 'bg-gradient-to-r from-orange-400 to-amber-600' :
                         'bg-gray-600 text-white'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold bg-white/30">
                            {index + 1}
                        </div>
                        <span className="font-bold">{item.teamname}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold bg-black/20 px-3 py-1 rounded-full text-white">
                            {item.GameScore || 0}
                        </span>
                    </div>
                </div>
            )) : <p className="text-gray-400 text-center py-4">Leaderboard is being updated...</p>}
        </div>
    </Modal>
);

const AttendanceModal = ({ isOpen, onClose, team, attendanceClass, attendanceIcon }) => {
    const getAttendanceStatus = (member, round) => {
        if (!member || !member.attendance || !Array.isArray(member.attendance)) {
            return null;
        }
        const attendanceRecord = member.attendance.find(a => a.round == round);
        return attendanceRecord ? attendanceRecord.status : null;
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={{ ...customModalStyles, width: '800px', maxWidth: '95vw' }}
            contentLabel="Attendance Tracker"
            appElement={document.getElementById('root') || undefined}
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <img src={attd} className="w-12" alt="Attendance Icon" />
                    <h2 className="text-2xl font-bold text-orange-400 font-naruto">ATTENDANCE TRACKER</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-3xl font-light">×</button>
            </div>
            <div className="overflow-x-auto max-h-[60vh] pr-2">
                {team ? (
                    <table className="min-w-full divide-y divide-gray-700 text-sm md:text-base">
                        <thead className="bg-gray-900 sticky top-0">
                            <tr className="text-white font-bold">
                                <th className="px-4 py-3 text-left text-lg">Name</th>
                                <th className="px-4 py-3 text-lg">Round 1</th>
                                <th className="px-4 py-3 text-lg">Round 2</th>
                                <th className="px-4 py-3 text-lg">Round 3</th>
                                <th className="px-4 py-3 text-lg">Round 4</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800">
                            <tr>
                                <td className="border-t border-gray-700 px-4 py-2 font-medium">{team.name} (Lead)</td>
                                <td className="border-t border-gray-700 px-4 py-2"><div className={attendanceClass(getAttendanceStatus(team.lead, 1))}>{attendanceIcon(getAttendanceStatus(team.lead, 1))}</div></td>
                                <td className="border-t border-gray-700 px-4 py-2"><div className={attendanceClass(getAttendanceStatus(team.lead, 2))}>{attendanceIcon(getAttendanceStatus(team.lead, 2))}</div></td>
                                <td className="border-t border-gray-700 px-4 py-2"><div className={attendanceClass(getAttendanceStatus(team.lead, 3))}>{attendanceIcon(getAttendanceStatus(team.lead, 3))}</div></td>
                                <td className="border-t border-gray-700 px-4 py-2"><div className={attendanceClass(getAttendanceStatus(team.lead, 4))}>{attendanceIcon(getAttendanceStatus(team.lead, 4))}</div></td>
                            </tr>
                            {team.teamMembers.map((member, index) => (
                                <tr key={`${member.registrationNumber}-${index}`}>
                                    <td className="border-t border-gray-700 px-4 py-2">{member.name}</td>
                                    <td className="border-t border-gray-700 px-4 py-2"><div className={attendanceClass(getAttendanceStatus(member, 1))}>{attendanceIcon(getAttendanceStatus(member, 1))}</div></td>
                                    <td className="border-t border-gray-700 px-4 py-2"><div className={attendanceClass(getAttendanceStatus(member, 2))}>{attendanceIcon(getAttendanceStatus(member, 2))}</div></td>
                                    <td className="border-t border-gray-700 px-4 py-2"><div className={attendanceClass(getAttendanceStatus(member, 3))}>{attendanceIcon(getAttendanceStatus(member, 3))}</div></td>
                                    <td className="border-t border-gray-700 px-4 py-2"><div className={attendanceClass(getAttendanceStatus(member, 4))}>{attendanceIcon(getAttendanceStatus(member, 4))}</div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-center text-gray-400 py-4">Loading attendance data...</p>}
            </div>
        </Modal>
    );
};

const ReminderModal = ({ isOpen, onClose, reminderText }) => (
    <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        style={customModalStyles}
        contentLabel="Admin Reminder"
        appElement={document.getElementById('root') || undefined}
    >
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <span className="text-3xl animate-pulse">📢</span>
                <h2 className="text-2xl font-bold text-yellow-400 font-naruto">IMPORTANT REMINDER</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-3xl font-light">×</button>
        </div>
        <div className="text-center text-lg bg-gray-900/50 p-6 rounded-lg border border-yellow-500/50">
            <p>{reminderText}</p>
        </div>
        <div className="mt-6 flex justify-end">
            <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
            >
                Acknowledged
            </button>
        </div>
    </Modal>
);

const AssistanceModal = ({ isOpen, onClose, isSubmittingIssue, issueError, issueText, setIssueText, handleIssueSubmit }) => (
    <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        style={customModalStyles}
        contentLabel="Request Assistance"
        appElement={document.getElementById('root') || undefined}
    >
        <div className="text-white">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-orange-400 font-naruto">Request Assistance</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors text-3xl font-light"
                    disabled={isSubmittingIssue}
                >
                    ×
                </button>
            </div>
            {issueError && (
                <div className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-4 text-center">
                    {issueError}
                </div>
            )}
            <p className="text-gray-300 mb-4">
                If you have a technical problem or need help, please describe it below. Our team will reach you shortly.
            </p>
            <textarea
                value={issueText}
                onChange={(e) => setIssueText(e.target.value)}
                placeholder="Describe your problem here..."
                className="w-full h-40 p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                disabled={isSubmittingIssue}
            />
            <div className="mt-6 flex justify-end gap-4">
                <button
                    onClick={onClose}
                    className="px-6 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors"
                    disabled={isSubmittingIssue}
                >
                    Cancel
                </button>
                <button
                    onClick={handleIssueSubmit}
                    className="px-6 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={isSubmittingIssue || !issueText.trim()}
                >
                    {isSubmittingIssue ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        "Submit Request"
                    )}
                </button>
            </div>
        </div>
    </Modal>
);

function TeamPanel() {
    const [pass, setPass] = useState(localStorage.getItem("token") || "");
    const [teamName, setTeamName] = useState("");
    const [EventUp, setEventUp] = useState("");
    const [team, setTeam] = useState(null);
    const [DomainLoading, setDomainLoading] = useState(false);
    const [link, setLink] = useState();
    const [DomainOpen, setDomainOpen] = useState(false);
    const [domainOpenTime, setDomainOpenTime] = useState(null);
    const [countdownTime, setCountdownTime] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [leaderboard, setLeaderboard] = useState([]);
    const [ProblemID, setProblemID] = useState();
    const [selectedDomain, setSelectedDomain] = useState();
    const [DomainData, setDomainData] = useState([]);
    const [domain, setDomain] = useState("");
    const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
    const [ProblemStatement, setProblemStatement] = useState("");
    const [photoLoading, setPhotoLoading] = useState(false);
    const [problemSubmitting, setProblemSubmitting] = useState(false);
    const [photoError, setPhotoError] = useState("");
    const [problemError, setProblemError] = useState("");
    const [hasNewUpdate, setHasNewUpdate] = useState(false);
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [tourShown, setTourShown] = useState(
        localStorage.getItem("kare_tourShown") === "true"
    );
    const driverRef = useRef(null);
    const [issueText, setIssueText] = useState("");
    const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
    const [issueError, setIssueError] = useState("");
    const [showCamera, setShowCamera] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const videoRef = useRef(null);
    const photoRef = useRef(null);

    // --- State for Modals ---
    const [isAssistanceModalOpen, setIsAssistanceModalOpen] = useState(false);
    const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

    // --- State for Reminders and Timeline ---
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [activeReminder, setActiveReminder] = useState("");
    const [reminders, setReminders] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    // --- State for PPT Template ---
    const [pptData, setPptData] = useState(null);

    // --- NEW: Fetch existing reminders and PPT data on component load ---
    useEffect(() => {
        // This listener waits for the server to send the stored data
        socket.on("server:loadData", (data) => {
            if (data.reminders) {
                // The time will be a string, so convert it back to a Date object for consistency
                const formattedReminders = data.reminders.map(r => ({ ...r, time: new Date(r.time) }));
                setReminders(formattedReminders);
            }
            if (data.ppt) {
                setPptData(data.ppt);
            }
        });

        // Proactively ask the server for the data
        socket.emit("client:getData");

        // Cleanup: remove the listener when the component is unmounted
        return () => {
            socket.off("server:loadData");
        };
    }, []); // Empty dependency array means this effect runs only once on mount

    const handleDomainSelect = (domainId) => {
        setSelectedDomain(domainId);
    };

    const handleDomain = async () => {
        setDomainLoading(true);
        try {
            socket.emit("domainSelected", { teamId: team._id, domain: selectedDomain });
        } catch (error) {
            setDomainLoading(false);
            console.log(error);
        }
    };

    const handleIssueSubmit = async () => {
        if (!issueText.trim()) {
            setIssueError("Please describe your issue before submitting.");
            return;
        }
        setIsSubmittingIssue(true);
        setIssueError("");
        try {
            const response = await axios.post(`${api}/event/issue/${team._id}`, {
                issueText: issueText.trim(),
            });
            setTeam(response.data);
            setIsAssistanceModalOpen(false);
            setIssueText("");
        } catch (err) {
            console.error("Error submitting issue:", err);
            setIssueError("Failed to submit your request. Our team has been notified. Please try again later.");
        } finally {
            setIsSubmittingIssue(false);
        }
    };
    
    const startCamera = async () => {
        setShowCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
                audio: false,
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setPhotoError("Failed to access camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        const stream = videoRef.current?.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
        setShowCamera(false);
    };

    const capturePhoto = async () => {
        setPhotoLoading(true);
        setPhotoError("");
        try {
            const video = videoRef.current;
            const photo = photoRef.current;
            const ctx = photo.getContext('2d');
            
            photo.width = video.videoWidth;
            photo.height = video.videoHeight;
            
            ctx.drawImage(video, 0, 0, photo.width, photo.height);
            
            const imageData = photo.toDataURL('image/jpeg');
            const cloudinaryResponse = await axios.post(
                "https://api.cloudinary.com/v1_1/dus9hgplo/image/upload",
                { file: imageData, upload_preset: "vh0llv8b" }
            );
            
            setCapturedImage(cloudinaryResponse.data.secure_url);
            await axios.post(`${api}/pic`, {
                id: team._id,
                photo: cloudinaryResponse.data.secure_url,
            });
            
            stopCamera();
            window.location.reload();
        } catch (err) {
            setPhotoError("Failed to upload image. Please try again.");
            console.error("Photo upload error:", err);
        } finally {
            setPhotoLoading(false);
        }
    };

    function Clock() {
        const [time, setTime] = useState(new Date().toLocaleTimeString());

        useEffect(() => {
            const timer = setInterval(() => {
                const currentDate = new Date();
                setTime(currentDate.toLocaleTimeString());
            }, 1000);

            return () => clearInterval(timer);
        }, []);

        return (
            <div style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", backgroundColor: "white", color: "black", padding: "5px", borderRadius: "5px" }}>
                {time}
            </div>
        );
    }
    
    const verify = () => {
        setLoading(true);
        setError("");
        axios.post(`${api}/event/team/${pass}`)
            .then((res) => {
                const data = res.data;
                localStorage.setItem("token", pass);
                setTeam(data);
                setLeaderboard(data.sort((a, b) => b.gameScore - a.gameScore));
            })
            .catch(() => {
                setError("Invalid password. Please try again.");
            })
            .finally(() => {
                setLoading(false);
            });
        axios.get(`${api}/event/students`).then((res) => {
            const data = res.data;
            setLeaderboard(data.sort((a, b) => b.gameScore - a.gameScore).slice(0, 10));
        });
    };

    useEffect(() => {
        const timeUpdater = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        socket.on("admin:sendReminder", (data) => {
            if (data && data.message) {
                setActiveReminder(data.message);
                setIsReminderModalOpen(true);
                setReminders(prev => [...prev, { text: data.message, time: new Date(data.time) }]);
            }
        });

        socket.on("eventupdates", (text) => {
            if (text !== "") {
                const el = document.querySelector(".htmlcon");
                if(el) el.innerHTML = text;
                setEventUp(text);
                setHasNewUpdate(true);
                setNotificationVisible(true);
                try {
                    new Notification("Event Update", { body: "Check your team panel", icon: scorecraft });
                } catch {
                    console.log("Notifications not supported");
                }
                setTimeout(() => {
                    setNotificationVisible(false);
                }, 10000);
            }
        });

        socket.on("client:receivePPT", (data) => {
            if (data && data.url) {
                setPptData(data);
                try {
                    new Notification("New Presentation Template!", {
                        body: `The organizers have sent a new template: ${data.fileName}`,
                        icon: scorecraft
                    });
                } catch (err) {
                    console.log("Notifications not supported or permission denied.");
                }
            }
        });

        socket.on("domainSelected", (data) => {
            if (data === "fulled") {
                alert("Sorry, that domain is full. Please try again.");
            }
            setDomainLoading(false);
            setIsDomainModalOpen(false);
            if (pass) {
                setLoading(true);
                axios.post(`${api}/event/team/${pass}`)
            .then((res) => {
                setTeam(res.data);
            })
            .catch((err) => {
                console.error("Failed to refetch team data:", err);
                setError("Could not refresh team data. Please reload the page.");
            })
            .finally(() => {
                setLoading(false);
            });
            }
        });
        
        socket.on("team", (team) => {
            setTeam(team);
        });

        socket.on("domainStat", (res) => {
            if (res && !DomainOpen) {
                setDomainOpenTime(res);
                const timeLeft = calculateTimeLeft(res);
                setCountdownTime(timeLeft);
                if (new Date(res) <= new Date()) {
                    setDomainOpen(true);
                } else {
                    setDomainOpen(false);
                }
            } else {
                setDomainOpen(!!res);
            }
        });

        socket.on("domaindata", (res) => {
            setDomainData(res);
        });

        socket.on("leaderboard", (leaderboard) => {
            setLeaderboard(leaderboard.slice(0, 10));
        });

        if (localStorage.getItem("token")) {
            setLoading(true);
            axios.get(`${api}/event/students`).then((res) => {
                const data = res.data;
                setLeaderboard(data.sort((a, b) => b.gameScore - a.gameScore).slice(0, 10));
            });
            axios.post(`${api}/event/team/${pass}`)
                .then((res) => {
                    const data = res.data;
                    setTeam(data);
                    setProblemID(data.ProblemID);
                })
                .catch(() => {
                    setError("Failed to fetch team data.");
                })
                .finally(() => {
                    setLoading(false);
                });
            
            socket.emit("domaindat", "");
            socket.emit("prevevent", "");
            socket.emit("domainStat", "");
        }

        return () => {
            clearInterval(timeUpdater);
            socket.off("admin:sendReminder");
            socket.off("eventupdates");
            socket.off("domainSelected");
            socket.off("team");
            socket.off("domainStat");
            socket.off("domaindata");
            socket.off("leaderboard");
            socket.off("client:receivePPT");
        };
    }, [pass]);
    
    useEffect(() => {
        if (team) {
            socket.emit("join", team.teamname);
        }
        localStorage.setItem("team", JSON.stringify(team));
        Notification.requestPermission().then((res) => {
            if (res === "denied") {
                alert("Please enable notifications for event updates.");
            }
        });
    }, [team]);
    
    const calculateTimeLeft = (targetDate) => {
        const difference = new Date(targetDate) - new Date();
        if (difference <= 0) {
            setDomainOpen(true);
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    };

    useEffect(() => {
        if (!domainOpenTime || DomainOpen) return;
        const timer = setInterval(() => {
            const timeLeft = calculateTimeLeft(domainOpenTime);
            setCountdownTime(timeLeft);
            if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
                setDomainOpen(true);
                clearInterval(timer);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [domainOpenTime, DomainOpen]);

    const attendanceClass = (attendance) => {
        switch (attendance) {
            case 'Present':
                return 'bg-green-500 border-2 border-white rounded-full w-8 h-8 mx-auto flex items-center justify-center text-white font-bold';
            case 'Absent':
                return 'bg-red-500 border-2 border-white rounded-full w-8 h-8 mx-auto flex items-center justify-center text-white font-bold';
            default:
                return 'bg-gray-500/20 border-2 border-gray-400 rounded-full w-8 h-8 mx-auto flex items-center justify-center';
        }
    };

    const attendanceIcon = (attendance) => {
        switch (attendance) {
            case 'Present':
                return '✓';
            case 'Absent':
                return '✕';
            default:
                return '';
        }
    };

    const handleProblemStatement = async () => {
        if (!ProblemStatement.trim()) {
            setProblemError("Please enter a problem statement.");
            return;
        }
        setProblemSubmitting(true);
        setProblemError("");
        const ans = prompt("Please type 'CONFIRM' to submit your problem statement. This cannot be changed later.");
        if (ans === "CONFIRM") {
            try {
                const response = await axios.post(`${api}/problemSta`, {
                    id: team._id,
                    PS: ProblemStatement.trim(),
                });
                if (response.data) {
                    setTeam((prev) => ({
                        ...prev,
                        ProblemStatement: ProblemStatement.trim(),
                    }));
                }
            } catch (err) {
                setProblemError("Failed to submit problem statement. Please try again.");
                console.error("Problem statement error:", err);
            } finally {
                setProblemSubmitting(false);
            }
        } else {
            setProblemSubmitting(false);
            alert("Confirmation failed. Problem statement was not submitted.");
        }
    };

    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            if (sectionId === 'event-updates') {
                setHasNewUpdate(false);
                setNotificationVisible(false);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("team");
        localStorage.removeItem("kare_tourShown");
        window.location.reload();
    };

    const scrollToEventUpdates = () => {
        scrollToSection('event-updates');
    };

    const Navbar = () => (
        <nav className="bg-gray-900/80 backdrop-blur-md p-3 fixed w-full top-0 z-50 border-b border-orange-500/30">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <img src={scorecraft} className="w-16 h-16 sm:w-16 sm:h-16 rounded-full relative hover:scale-105 transition-transform" alt="Logo" />
                        <div className="h-8 w-px bg-white/20 hidden sm:block" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-orange-400 font-naruto">HACKFORGE</h1>
                        <img src={expra} className="relative w-28" />
                    </div>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-6">
                    {[
                        { name: 'Event Updates', id: 'event-updates' },
                        { name: 'Problem Statement', id: 'problem-statement' },
                    ].map((item) => (
                        <a
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className="relative text-gray-300 hover:text-orange-400 font-semibold text-lg cursor-pointer transition-colors duration-300 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-orange-500 after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300"
                        >
                            {item.name}
                        </a>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );

    if (!localStorage.getItem("token")) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center text-white p-4" style={{ backgroundImage: `url('https://images3.alphacoders.com/133/1332283.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="flex items-center mb-6">
                        <img src={scorecraft} className="h-24 rounded-full" alt="ScoreCraft Logo" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-naruto text-orange-500 drop-shadow-lg tracking-wider">HACKFORGE</h1>
                    <h2 className="text-orange-300 text-2xl mb-10">[ 24hr Hackathon ]</h2>
                    
                    <div className="relative bg-gray-900/50 border border-orange-500/50 text-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col backdrop-blur-md">
                        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                        
                        <div className="flex flex-col mb-4">
                            <label htmlFor="teamName" className="text-lg mb-2 text-orange-300 font-semibold">Enter Team Name:</label>
                            <input
                                id="teamName"
                                type="text"
                                placeholder="Your Shinobi Team Name"
                                className="bg-gray-800 border-2 border-gray-600 h-12 px-4 rounded-md text-white focus:outline-none focus:border-orange-500 transition-colors"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex flex-col mb-6">
                            <label htmlFor="pass" className="text-lg mb-2 text-orange-300 font-semibold">Enter Secret Scroll (Password):</label>
                            <input
                                id="pass"
                                type="password"
                                placeholder="Enter your secret code"
                                className="bg-gray-800 border-2 border-gray-600 h-12 px-4 rounded-md text-white focus:outline-none focus:border-orange-500 transition-colors"
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                            />
                            <p className="text-sm text-gray-400 mt-2">The password was provided by the Hokage's office.</p>
                        </div>
                        <button
                            className="bg-orange-600 py-3 rounded-lg text-white font-bold text-lg hover:bg-orange-700 transition duration-200 disabled:opacity-50"
                            onClick={verify}
                            disabled={loading}
                        >
                            {loading ? "Verifying Mission..." : "Enter the Arena"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    // --- UPDATED MODAL ---
    const DomainSelectionModal = () => (
        <Modal
            isOpen={isDomainModalOpen}
            onRequestClose={() => setIsDomainModalOpen(false)}
            style={customModalStyles} // The width is now updated in the style object
            contentLabel="Domain Selection"
        >
            <div className="text-white">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-orange-400 font-naruto">Choose Your Ninja Way</h2>
                    <button
                        onClick={() => setIsDomainModalOpen(false)}
                        className="text-gray-400 hover:text-white transition-colors text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {/* New container for side-by-side layout */}
                <div className="flex gap-6">
                    {/* Scrollable grid for domains */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow max-h-[60vh] overflow-y-auto pr-4">
                        {DomainData.map((domain) => {
                            if (domain.slots === 0) {
                                return (
                                    <div key={domain.id} className="cursor-not-allowed p-4 rounded-xl bg-red-900/50 border-2 border-red-700">
                                        <p className="text-xl text-red-300">Slots Filled</p>
                                        <p className="text-gray-400">{domain.name}</p>
                                    </div>
                                );
                            }
                            return (
                                <div
                                    key={domain.id}
                                    onClick={() => handleDomainSelect(domain.id)}
                                    className={`cursor-pointer p-4 rounded-xl transition-all duration-300 border-2 ${domain.id === selectedDomain
                                            ? 'bg-orange-600 text-white border-orange-400'
                                            : 'bg-gray-800 hover:bg-gray-700 border-gray-600'
                                        }`}
                                >
                                    <h3 className="text-xl font-bold mb-2">{domain.name} ({domain.slots}/10)</h3>
                                    <p className="text-sm opacity-80 line-clamp-3">{domain.description}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Buttons on the right side */}
                    <div className="flex flex-col gap-4 w-48 shrink-0">
                        <button
                            onClick={handleDomain}
                            className="w-full px-6 py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:opacity-50"
                            disabled={!selectedDomain || DomainLoading}
                        >
                            {DomainLoading ? "Submitting..." : "Confirm Selection"}
                        </button>
                        <button
                            onClick={() => setIsDomainModalOpen(false)}
                            className="w-full px-6 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
    
    const CameraSection = () => (
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 mt-4 md:mt-0">
            {photoError && (
                <div className="text-red-400 bg-red-900/30 p-3 rounded mb-4 w-full text-center">
                    {photoError}
                </div>
            )}
            {showCamera ? (
                <div className="flex flex-col items-center w-full">
                    <div className="relative w-full aspect-video">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="absolute top-0 left-0 w-full h-full object-cover rounded-2xl border-2 border-orange-500"
                        />
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button
                                onClick={stopCamera}
                                className="bg-red-500 p-2 rounded-full hover:bg-red-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                    <canvas ref={photoRef} style={{ display: 'none' }} />
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={capturePhoto}
                            disabled={photoLoading}
                            className="bg-orange-600 px-6 py-3 rounded-full text-white hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {photoLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>📸 Capture Photo</>
                            )}
                        </button>
                    </div>
                </div>
            ) : capturedImage || (team && team.GroupPic) ? (
                <div className="flex flex-col items-center w-full">
                    <div className="relative w-full aspect-video">
                        <img
                            src={capturedImage || team.GroupPic}
                            alt="Team Photo"
                            className="w-full h-full object-cover rounded-xl"
                        />
                    </div>
                    <button
                        className="mt-4 bg-orange-600 px-6 py-3 rounded-full text-white hover:bg-orange-700 transition-colors"
                        onClick={() => {
                            stopCamera();
                            startCamera();
                        }}
                    >
                        Retake Photo
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center w-full">
                    <div className="relative w-full flex justify-center items-center aspect-video bg-gray-800 rounded-xl">
                        <svg className="w-1/3 h-1/3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <button
                        onClick={startCamera}
                        className="mt-4 bg-orange-600 border-gray-300 border-2 hover:bg-orange-700 rounded-full px-6 py-3 flex items-center gap-2 text-white"
                    >
                        📸 Take A Group Photo!
                    </button>
                </div>
            )}
        </div>
    );

    const NotificationBell = () => (
        <div
            className={`fixed bottom-4 right-4 bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center gap-3 cursor-pointer transform transition-all duration-300 ${notificationVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
            onClick={scrollToEventUpdates}
        >
            <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-swing" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                    1
                </span>
            </div>
            <div>
                <p className="font-bold">New Scroll!</p>
                <p className="text-sm">Click to view</p>
            </div>
        </div>
    );
    
    const CountdownDisplay = () => (
        <div className="flex flex-col items-center space-y-2">
            <p className="text-gray-300 font-semibold">Domain selection opens in:</p>
            <div className="grid grid-flow-col gap-2 text-center auto-cols-max">
                {countdownTime.days > 0 && (
                    <div className="flex flex-col p-2 bg-black/20 rounded-lg text-white">
                        <span className="text-2xl font-bold">{countdownTime.days}</span>
                        <span className="text-white/70 text-xs">days</span>
                    </div>
                )}
                <div className="flex flex-col p-2 bg-black/20 rounded-lg text-white">
                    <span className="text-2xl font-bold">{countdownTime.hours.toString().padStart(2, "0")}</span>
                    <span className="text-white/70 text-xs">hours</span>
                </div>
                <div className="flex flex-col p-2 bg-black/20 rounded-lg text-white">
                    <span className="text-2xl font-bold">{countdownTime.minutes.toString().padStart(2, "0")}</span>
                    <span className="text-white/70 text-xs">min</span>
                </div>
                <div className="flex flex-col p-2 bg-black/20 rounded-lg text-white">
                    <span className="text-2xl font-bold">{countdownTime.seconds.toString().padStart(2, "0")}</span>
                    <span className="text-white/70 text-xs">sec</span>
                </div>
            </div>
        </div>
    );

    const DomainSelectionSection = () => (
        <div id="domain-selection" className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="rounded-2xl h-96 bg-gray-800 flex items-center justify-center overflow-hidden">
                <video 
                    src="./CreativeTeam.mp4" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                >
                    Your browser does not support the video tag.
                </video>
            </div>
            <div className="rounded-2xl p-6 bg-orange-600 h-96 flex flex-col justify-center items-center">
                <div className="flex justify-center items-center w-full">
                    <img src={domains} className="w-8 relative bottom-2 right-1" />
                    <h2 className="text-2xl text-white font-bold mb-4 text-center font-naruto">YOUR DOMAIN</h2>
                </div>
                {!team.Domain ? (
                    <div className="text-center">
                        {DomainOpen ? (
                            <button
                                onClick={() => setIsDomainModalOpen(true)}
                                className="px-8 py-4 bg-white/20 hover:bg-white/30 transition-colors rounded-xl text-white font-bold"
                            >
                                Select Your Domain
                            </button>
                        ) : (
                            <div className="flex flex-col items-center space-y-4">
                                <CountdownDisplay />
                                <button
                                    disabled={true}
                                    className="px-8 py-4 bg-white/20 opacity-60 cursor-not-allowed transition-colors rounded-xl text-white font-bold"
                                >
                                    Domain Selection Locked
                                </button>
                            </div>
                        )}
                        <DomainSelectionModal />
                    </div>
                ) : (
                    <div className="bg-white/20 p-6 rounded-xl w-full max-w-md text-white">
                        <h3 className="text-xl font-bold mb-2">{team?.Domain || domain}</h3>
                        <p>
                            {DomainData.find((i) => i.name === team.Domain)?.description}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    const EventTracker = () => {
        const eventMilestones = [
            { name: 'Domain Selection', time: '2025-08-20T10:00:00' },
            { name: 'Lunch Break', time: '2025-08-20T12:30:00' },
            { name: 'First Review', time: '2025-08-20T18:00:00' },
            { name: 'Dinner Break', time: '2025-08-20T20:00:00' },
            { name: 'Mid-Point Evaluation', time: '2025-08-21T02:00:00' },
            { name: 'Final Presentation', time: '2025-08-21T09:00:00' },
        ];

        const lastCompletedIndex = eventMilestones.slice().reverse().findIndex(event => new Date(event.time) < currentTime);
        const currentStageIndex = lastCompletedIndex !== -1 ? eventMilestones.length - 1 - lastCompletedIndex : -1;
    
        return (
            <div className="bg-gray-800/70 rounded-2xl p-6 border border-orange-500/30 h-full">
                <div className="flex justify-center items-center gap-3 mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <h2 className="text-2xl text-center font-bold font-naruto text-orange-400">EVENT TRACKER</h2>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-8 md:space-y-0 md:space-x-2">
                    {eventMilestones.map((event, index) => {
                        const isCompleted = index <= currentStageIndex;
                        const isActive = index === currentStageIndex + 1;
        
                        return (
                            <React.Fragment key={index}>
                                <div className="flex flex-col items-center text-center w-full md:w-auto">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                                        isCompleted ? 'bg-green-500 border-green-700' : 
                                        isActive ? 'bg-orange-500 border-orange-700 animate-pulse' : 
                                        'bg-gray-600 border-gray-800'
                                    }`}>
                                        {isCompleted ? <span className="text-white text-xl font-bold">✓</span> : <span className="text-white font-bold">{index + 1}</span>}
                                    </div>
                                    <div className="mt-2 w-32">
                                        <p className={`font-bold transition-colors text-sm ${isCompleted ? 'text-green-400' : isActive ? 'text-orange-400' : 'text-gray-400'}`}>{event.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(event.time).toLocaleTimeString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
        
                                {index < eventMilestones.length - 1 && (
                                    <div className={`flex-1 h-1.5 w-full md:w-auto mt-[-2rem] md:mt-0 md:mb-12 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen text-white flex flex-col font-sans" style={{ backgroundImage: `url('https://images.alphacoders.com/691/691465.jpg')`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            <Navbar />
            <NotificationBell />

            {/* Render Modals at the top level */}
            {team && <AttendanceModal isOpen={isAttendanceModalOpen} onClose={() => setIsAttendanceModalOpen(false)} team={team} attendanceClass={attendanceClass} attendanceIcon={attendanceIcon} />}
            <LeaderboardModal isOpen={isLeaderboardModalOpen} onClose={() => setIsLeaderboardModalOpen(false)} leaderboard={leaderboard} />
            <AssistanceModal
                isOpen={isAssistanceModalOpen}
                onClose={() => setIsAssistanceModalOpen(false)}
                isSubmittingIssue={isSubmittingIssue}
                issueError={issueError}
                issueText={issueText}
                setIssueText={setIssueText}
                handleIssueSubmit={handleIssueSubmit}
            />
            <DomainSelectionModal />
            <ReminderModal isOpen={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)} reminderText={activeReminder} />

            <div className="relative z-10 pt-32 px-2">
                {loading ? (
                    <div className="w-full h-[80vh] flex flex-col justify-center items-center">
                        <div className="animate-pulse"><img src={lod} className="w-32 h-32 sm:w-48 sm:h-48 rounded-full" /></div>
                        <p className="text-center text-xl sm:text-2xl mt-6 font-bold font-naruto text-orange-400">Loading Mission Details...</p>
                    </div>
                ) : (
                    team ? (
                        <div className="w-full max-w-7xl p-2 sm:p-6 mx-auto">
                            
                            <div id="team-profile" className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-10 border border-orange-500/20">
                               <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-4xl animate-bounce">
                                            👋
                                        </div>
                                        <div>
                                            <h1 className="text-2xl sm:text-3xl font-bold text-white font-naruto">
                                                Welcome, <span className="text-orange-300">{team.teamname}!</span>
                                            </h1>
                                            <p className="text-gray-300 text-sm sm:text-base">Let's build something amazing together.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* --- Action Center --- */}
                            <div id="action-center" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                                <div
                                    onClick={() => setIsLeaderboardModalOpen(true)}
                                    className="bg-gray-800/60 p-6 rounded-2xl border border-orange-500/30 hover:border-orange-500 hover:bg-gray-800/90 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center"
                                >
                                    <div className="text-5xl mb-3">🏆</div>
                                    <h3 className="text-xl font-bold text-orange-400 font-naruto">View Scoreboard</h3>
                                    <p className="text-gray-400 text-sm mt-1">Check your team's current rank.</p>
                                </div>

                                <div
                                    onClick={() => setIsAttendanceModalOpen(true)}
                                    className="bg-gray-800/60 p-6 rounded-2xl border border-blue-500/30 hover:border-blue-500 hover:bg-gray-800/90 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center"
                                >
                                    <img src={attd} className="w-12 h-12 mb-3 filter grayscale hover:grayscale-0 transition-all" alt="Attendance"/>
                                    <h3 className="text-xl font-bold text-blue-400 font-naruto">Track Attendance</h3>
                                    <p className="text-gray-400 text-sm mt-1">See your team's check-in status.</p>
                                </div>

                                <div
                                    onClick={() => setIsAssistanceModalOpen(true)}
                                    className="bg-gray-800/60 p-6 rounded-2xl border border-green-500/30 hover:border-green-500 hover:bg-gray-800/90 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center"
                                >
                                    <div className="text-5xl mb-3">🙋‍♂️</div>
                                    <h3 className="text-xl font-bold text-green-400 font-naruto">Request Help</h3>
                                    <p className="text-gray-400 text-sm mt-1">Need assistance? Contact organizers.</p>
                                </div>
                            </div>
                            
                            <div id="team-members" className="w-full min-h-[464px] bg-gray-800/60 rounded-2xl border border-orange-500/30 flex flex-col md:flex-row justify-center items-center p-4">
                                <div className="flex flex-col w-full md:w-1/2 p-4">
                                    <div className="flex justify-center w-full items-center mb-6">
                                        <img src={profile} className="w-10 mr-3" />
                                        <h2 className="text-orange-400 text-2xl font-bold tracking-wider font-naruto">
                                            TEAM PROFILE
                                        </h2>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500">
                                            <div className="flex items-center gap-4">
                                                <div className="w-[50px] h-[50px] flex justify-center items-center bg-yellow-400/70 rounded-full border-2 border-yellow-400">
                                                    <img src={king} alt="Leader Icon"/>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-yellow-300 text-lg">{team.name} ({team.registrationNumber})</p>
                                                    <p className="text-white/70 text-sm">Team Leader</p>
                                                </div>
                                            </div>
                                        </div>
                                        {team.teamMembers.map((member, index) => (
                                            <div key={member.registrationNumber || index} className="bg-gray-700/50 backdrop-blur-sm rounded-xl p-3 border border-gray-600 hover:border-orange-500 transition-all duration-300">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-[50px] h-[50px] flex justify-center items-center bg-orange-500/20 rounded-full border border-orange-500/50 text-orange-300 font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white">{member.name}</p>
                                                        <p className="text-orange-400 text-sm">{member.registrationNumber}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <CameraSection />
                            </div>
                            
                            <div className="flex flex-col lg:flex-row justify-evenly gap-6 mt-10">
                                <DomainSelectionSection />
                                <div id="assistance-and-reminders" className="w-full lg:w-1/2 mt-10 lg:mt-0 flex flex-col gap-6">
                                    {/* Support Requests */}
                                    <div className="bg-gray-800/70 rounded-2xl p-4 md:p-6 border border-orange-500/30">
                                        <div className="flex justify-center items-center w-full mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                            <h2 className="text-xl md:text-2xl text-center font-bold font-naruto text-orange-400">
                                                SUPPORT REQUESTS
                                            </h2>
                                        </div>
                                        <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                                            {team.issues && team.issues.length > 0 ? (
                                                team.issues.slice().reverse().map((issue) => (
                                                    <div key={issue._id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                                        <div className="flex justify-between items-start gap-4">
                                                            <p className="text-gray-300 whitespace-pre-wrap flex-1">{issue.text}</p>
                                                            <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                                                                issue.status === 'Resolved' ? 'bg-green-500/30 text-green-300' : 'bg-yellow-500/30 text-yellow-300'
                                                            }`}>
                                                                {issue.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-500 text-xs mt-2 text-right">
    {
        // First, check if issue.createdAt exists and results in a valid date
        issue.timestamp && !isNaN(new Date(issue.timestamp))
            // If it's valid, format it
            ? new Date(issue.timestamp).toLocaleString()
            // Otherwise, show a clean fallback
            : '—'
    }
</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center text-gray-400 py-8 h-full flex items-center justify-center">
                                                    <p>You have not submitted any support requests yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Reminders List */}
                                    <div className="bg-gray-800/70 rounded-2xl p-4 md:p-6 border border-orange-500/30">
                                        <div className="flex justify-center items-center w-full mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                            <h2 className="text-xl md:text-2xl text-center font-bold font-naruto text-orange-400">
                                                REMINDERS
                                            </h2>
                                        </div>
                                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                            {reminders.length > 0 ? (
                                                reminders.slice().reverse().map((reminder, index) => (
                                                    <div key={index} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                                                        <p className="text-gray-300">{reminder.text}</p>
                                                        <p className="text-gray-500 text-xs mt-1 text-right">{reminder.time.toLocaleTimeString()}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center text-gray-400 py-8 h-full flex items-center justify-center">
                                                    <p>No reminders yet. Stay tuned!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* --- PPT Template Section --- */}
                                    <div className="bg-gray-800/70 rounded-2xl p-4 md:p-6 border border-purple-500/30">
                                        <div className="flex justify-center items-center w-full mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            <h2 className="text-xl md:text-2xl text-center font-bold font-naruto text-purple-400">
                                                PRESENTATION TEMPLATE
                                            </h2>
                                        </div>
                                        <div className="text-center">
                                            {pptData ? (
                                                <a
                                                    href={pptData.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                    className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                                >
                                                    Download "{pptData.fileName}"
                                                </a>
                                            ) : (
                                                <p className="text-gray-400 py-4">No template has been shared yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* --- Event Tracker Section --- */}
                            <div className="w-full mt-10">
                                <EventTracker />
                            </div>

                            {team.Domain && (
                                <div id="problem-statement" className="w-full mt-10">
                                    <div className="bg-gray-800/70 h-full rounded-2xl p-4 md:p-6 border border-orange-500/30">
                                        <div className="flex justify-center items-center w-full mb-4">
                                            <img src={prob} className="w-10 mr-3" />
                                            <h2 className="text-xl md:text-2xl text-center font-bold text-white font-naruto text-orange-400">
                                                PROBLEM STATEMENT
                                            </h2>
                                        </div>
                                        {problemError && (
                                            <div className="text-red-400 bg-red-900/30 p-3 rounded mb-4">
                                                {problemError}
                                            </div>
                                        )}
                                        {team.ProblemStatement ? (
                                            <div className="bg-gray-900/70 p-4 rounded-xl">
                                                <p className="text-white whitespace-pre-wrap">{team.ProblemStatement}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <textarea
                                                        placeholder="Describe your problem statement here..."
                                                        onChange={(e) => setProblemStatement(e.target.value)}
                                                        value={ProblemStatement}
                                                        maxLength={200}
                                                        className="w-full h-48 p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                                                    />
                                                    <div className="absolute bottom-2 right-2 text-gray-400 text-sm bg-black/20 px-2 py-1 rounded-full">
                                                        {ProblemStatement.length}/200
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        className="flex-1 bg-gray-600 hover:bg-gray-700 transition-all px-6 py-3 rounded-xl text-white font-medium disabled:opacity-50"
                                                        onClick={() => setProblemStatement("")}
                                                        disabled={!ProblemStatement.trim() || problemSubmitting}
                                                    >
                                                        Clear
                                                    </button>
                                                    <button
                                                        className="flex-1 bg-orange-600 hover:bg-orange-700 transition-all px-6 py-3 rounded-xl text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                                        onClick={handleProblemStatement}
                                                        disabled={problemSubmitting || !ProblemStatement.trim()}
                                                    >
                                                        {problemSubmitting ? (
                                                            <>
                                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                Submitting...
                                                            </>
                                                        ) : 'Submit Statement'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : (
                        <p className="text-center text-xl mt-10">Failed to load team data. Please try again later.</p>
                    )
                )}
                <footer className="mt-auto border-t border-gray-800">
                    <p className="text-center p-4 text-gray-400">Made with By Scorecraft KARE</p>
                </footer>
            </div>
        </div>
    );
}

export default TeamPanel;