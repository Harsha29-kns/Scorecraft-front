import { motion, animate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import kalasalingam from "/public/kalasalingam.png";
import score from "/public/scorecraft.jpg";
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from './api';
import hackforge from "/public/hackforge.png";

const narutoBgImage = "https://images.alphacoders.com/605/605592.png";
const socket = io(api);

const narutoFontStyle = {
    fontFamily: "'Ninja Naruto', sans-serif",
};


function AnimatedCounter({ to }) {
    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
        const controls = animate(displayValue, to, {
            duration: 1,
            ease: "easeOut",
            onUpdate: (latest) => setDisplayValue(Math.round(latest)),
        });
        return () => controls.stop();
    }, [to]);
    return <span>{displayValue}</span>;
}


function CountdownTimer({ timeLeft }) {
    const gifUrl = "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bHFkeWJmYjcwZWl0dmhsZ2hnamFqbGU2N2NsaGVuMWdxZmE5aXd3OCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ohT97gdpR40vK/giphy.gif";

    return (
        <div className="text-center">
            <h3 className="text-2xl text-orange-400 mb-4 drop-shadow-[0_0_8px_rgba(255,140,0,0.9)]" style={narutoFontStyle}>
                Registration Opens In
            </h3>
            <div className="flex justify-center gap-4 text-white">
                {Object.entries(timeLeft).map(([label, value]) => (
                    <div key={label} className="flex flex-col items-center p-3 bg-black/40 rounded-lg min-w-[70px] shadow-lg">
                        <span className="text-5xl font-extrabold text-orange-400 drop-shadow-[0_0_10px_rgba(255,140,0,0.9)]">
                            {String(value).padStart(2, '0')}
                        </span>
                        <span className="text-xs uppercase tracking-widest">{label}</span>
                    </div>
                ))}
            </div>
            {/* --- GIF ADDED HERE --- */}
            <div className="mt-6">
                <img 
                    src={gifUrl} 
                    alt="Naruto countdown gif" 
                    className="mx-auto rounded-lg shadow-lg w-48 h-auto border-2 border-orange-500/50"
                />
            </div>
        </div>
    );
}

// --- Main Home Component ---
function Home() {
    const nav = useNavigate();
    // State related to registration slots is kept in case you want to use it elsewhere.
    const [teamCount, setTeamCount] = useState(0);
    const [regLimit, setRegLimit] = useState(60);
    const [isRegClosed, setIsRegClosed] = useState(true);
    const [regOpenTime, setRegOpenTime] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null);

    useEffect(() => {
        socket.on('registrationStatus', (status) => {
            setTeamCount(status.count);
            setRegLimit(status.limit);
            setIsRegClosed(status.isClosed);
            setRegOpenTime(status.openTime);
        });
        socket.emit('check');
        return () => socket.off('registrationStatus');
    }, []);

    useEffect(() => {
        if (!regOpenTime) {
            setTimeRemaining(null);
            return;
        }
        const intervalId = setInterval(() => {
            const difference = new Date(regOpenTime) - new Date();
            if (difference > 0) {
                setTimeRemaining({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeRemaining(null);
                setRegOpenTime(null);
                clearInterval(intervalId);
                socket.emit('check');
            }
        }, 1000);
        return () => clearInterval(intervalId);
    }, [regOpenTime]);

    return (
        <div
            className="home relative w-full min-h-screen py-12 px-4 overflow-y-auto"
            style={{ backgroundImage: `url('${narutoBgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 backdrop-blur-sm animate-pulse-slow"></div>

            <motion.div
                className="relative z-10 flex flex-col justify-start items-center w-full gap-12"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
            >
                {/* Header Card */}
                <motion.div
                    className="p-8 rounded-2xl bg-gray-900/70 border-2 border-orange-500/50 shadow-2xl max-w-3xl w-full text-center backdrop-blur-md"
                    initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, type: "spring" }}
                >
                    {/* Floating Logos */}
                    <div className="w-full flex justify-center items-center gap-6 mb-6">
                        <motion.img
                            src={kalasalingam}
                            className="w-20 h-20 object-contain bg-white/80 rounded-full p-1 shadow-lg"
                            alt="Kalasalingam Logo"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.img
                            src={score}
                            className="w-20 h-20 object-cover rounded-full border-2 border-orange-400 shadow-lg"
                            alt="Score Logo"
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>

                    <h2 className="text-2xl mt-2 text-orange-500 font-bold tracking-wider drop-shadow-lg">Scorecraft KARE Presents</h2>

                    <h1 className="text-6xl md:text-7xl font-black text-orange-500 my-4 tracking-widest drop-shadow-[0_0_15px_rgba(255,140,0,0.8)]" style={narutoFontStyle}>
                        <img src={hackforge} className="w-100 h-auto object-contain mx-auto" alt="Hackforge Icon" />
                    </h1>

                    {/* Countdown or Info Boxes */}
                    <div className="mt-8 w-full max-w-md mx-auto">
                        {timeRemaining ? (
                            <CountdownTimer timeLeft={timeRemaining} />
                        ) : (
                            // --- MODIFIED SECTION ---
                            <div className="flex justify-center items-center gap-4 flex-wrap">
                                {/* Box 1: Adventure Time */}
                                <div className="flex flex-col items-center justify-center p-4 bg-black/50 rounded-lg shadow-md min-w-[120px]">
                                    <span className="text-3xl font-bold text-white">24h</span>
                                    <span className="text-sm text-gray-300">Hackathon Time</span>
                                </div>

                                {/* Box 2: Treasure Pool */}
                                <div className="flex flex-col items-center justify-center p-4 bg-black/50 rounded-lg shadow-md min-w-[120px]">
                                    <span className="text-3xl font-bold text-white">₹10k+</span>
                                    <span className="text-sm text-gray-300">Treasure Pool</span>
                                </div>

                                {/* Box 3: Pirates Team */}
                                <div className="flex flex-col items-center justify-center p-4 bg-black/50 rounded-lg shadow-md min-w-[120px]">
                                    <span className="text-3xl font-bold text-white">50+</span>
                                    <span className="text-sm text-gray-300">Slots Team</span>
                                </div>
                            </div>
                            // --- END OF MODIFIED SECTION ---
                        )}
                    </div>
                </motion.div>

                {/* Register Button or Status */}
                <div className="mt-10 h-14 flex items-center justify-center">
                    {timeRemaining ? (
                        <p className="text-xl text-center text-cyan-300 font-semibold drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]" style={narutoFontStyle}>
                            Registrations will open soon...
                        </p>
                    ) : (
                        <motion.button
                            className="relative bg-orange-500 text-white border-2 border-orange-600 py-3 px-8 rounded-lg shadow-lg text-lg font-bold overflow-hidden"
                            whileHover={{ scale: !isRegClosed ? 1.1 : 1, rotate: !isRegClosed ? -2 : 0, y: !isRegClosed ? -3 : 0 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => nav("/registration")}
                            disabled={isRegClosed}
                        >
                            <span className="relative z-10">
                                {isRegClosed ? "Registrations Are Closed" : "Registrations Are Opened!"}
                            </span>
                            {!isRegClosed && (
                                <motion.div
                                    className="absolute inset-0 bg-orange-400/20"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                />
                            )}
                        </motion.button>
                    )}
                </div>

                {/* About Section */}
                <motion.div
                    className="max-w-5xl p-10 bg-gradient-to-b from-gray-900/90 via-black/80 to-gray-900/90 text-white rounded-3xl shadow-[0_0_30px_rgba(249,115,22,0.4)] border-2 border-orange-500/40 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1 }}
                >
                    <h1
                        className="text-4xl md:text-5xl font-extrabold mb-8 text-center text-orange-400 drop-shadow-[0_0_15px_rgba(255,140,0,0.9)]"
                        style={narutoFontStyle}
                    >
                        🍥 About the Event 🍥
                    </h1>

                    <div className="text-lg text-gray-200 space-y-6 leading-relaxed">
                        {[
                            "First come, first served! Only the first 60 teams to register will secure their spots.",
                            "Dive into full-day hackathon action with Scorecraft KARE's Hackforge!",
                            "Develop full-stack solutions in 24 hours.",
                            "Choose Your Domain: Pick from a curated set of domains revealed at the event.",
                            "Identify a real-world problem within your selected domain.",
                            "Develop an innovative solution to address the challenge.",
                            "Collaborate & Compete: Team up, share ideas, and push creative boundaries.",
                            "Become a legend and contribute to meaningful advancements in KARE."
                        ].map((text, idx) => (
                            <motion.div
                                key={idx}
                                className="flex items-start gap-3"
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.2 }}
                                viewport={{ once: true }}
                            >
                                <span className="text-orange-400 font-bold text-xl">🔥</span>
                                <p>{text}</p>
                            </motion.div>
                        ))}
                    </div>

                </motion.div>

                {/* ⚡ Final Info Section */}
                <motion.div
                    className="mt-10 max-w-5xl p-10 bg-gradient-to-b from-black/80 via-gray-900/80 to-black/80 text-white rounded-3xl shadow-[0_0_25px_rgba(249,115,22,0.4)] border-2 border-orange-500/30 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                >
                    <h1
                        className="text-4xl font-extrabold mb-8 text-center text-orange-400 drop-shadow-[0_0_15px_rgba(255,140,0,0.9)]"
                        style={narutoFontStyle}
                    >
                        ⚡ Important Information ⚡
                    </h1>

                    <div className="grid md:grid-cols-2 gap-6 text-gray-200">
                        {/* Registration & Verification */}
                        <motion.div
                            className="p-6 bg-black/50 border border-orange-500/30 rounded-2xl shadow-lg"
                            whileHover={{ scale: 1.03 }}
                        >
                            <h2 className="text-xl font-bold text-orange-400 mb-3">📩 Registration & Verification</h2>
                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                                <li>Team Lead gets a confirmation mail once registered (marked <span className="text-yellow-400 font-semibold">under verification</span>).</li>
                                <li>After <span className="text-green-400 font-semibold">payment verification</span>, Team Lead receives a final confirmation mail.:
                                    <ul className="list-decimal list-inside ml-5 mt-1 text-gray-400">
                                        <li>QR Codes for attendance ✅</li>
                                        <li>WhatsApp Group link 📲</li>
                                    </ul>
                                </li>
                                <li>Team members must be added via WhatsApp group.</li>
                                <li>All event updates will be shared in the WhatsApp group.</li>
                            </ul>
                        </motion.div>

                        {/* Hackathon Game Info */}
                        <motion.div
                            className="p-6 bg-black/50 border border-orange-500/30 rounded-2xl shadow-lg"
                            whileHover={{ scale: 1.03 }}
                        >
                            <h2 className="text-xl font-bold text-green-400 mb-3">🎮 Bonus Game Challenge</h2>
                            <p className="mb-3 text-gray-300">
                                During the <span className="text-orange-400 font-semibold">24hr Hackathon</span>, a fun mini-game will be conducted!
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                                <li>Teams earn <span className="text-yellow-300 font-semibold">extra scores</span>.</li>
                                <li>Special <span className="text-pink-400 font-semibold">game prizes</span> for winners.</li>
                                
                            </ul>
                        </motion.div>
                        {/* Support / Contact */}
                        <motion.div
                            className="p-6 bg-black/50 border border-orange-500/30 rounded-2xl shadow-lg md:col-span-2"
                            whileHover={{ scale: 1.03 }}
                        >
                            <h2 className="text-xl font-bold text-red-400 mb-3">🆘 Need Help?</h2>
                            <p className="text-gray-300">
                                If you face any issues during registration, payment, or event participation,
                                please reach out to the <span className="text-orange-400 font-semibold">Community Admins</span> for immediate support.
                            </p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* 🏆 Prizes & Rewards Section (Final) */}
                <motion.div
                    className="mt-10 max-w-4xl p-8 bg-gray-900/70 text-white rounded-2xl shadow-xl border-2 border-orange-500/30 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 1 }}
                >
                    <h1
                        className="text-3xl font-extrabold mb-6 text-center text-orange-400 drop-shadow-[0_0_10px_rgba(255,140,0,0.9)]"
                        style={narutoFontStyle}
                    >
                        🏆 Prizes & Rewards
                    </h1>

                    <p className="text-lg text-gray-300 mb-6 text-center">
                        Your hard work will be rewarded!
                        <span className="text-orange-400 font-semibold"> Top shinobi</span> will receive cash prizes,
                        and all participants will earn <span className="text-blue-300 font-semibold">scrolls of recognition</span>.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                        {[
                            { prize: "🏆 1st Prize: ₹5000 + 2 Credits", style: "bg-yellow-400/80 text-gray-900 border-yellow-500" },
                            { prize: "🥈 2nd Prize: ₹3000 + 2 Credits", style: "bg-gray-300/80 text-gray-800 border-gray-400" },
                            { prize: "🥉 3rd Prize: ₹2000 + 2 Credits", style: "bg-orange-300/80 text-gray-800 border-orange-400" },
                            { prize: "📜 Certificate + 2 Credits for All Participants", style: "bg-blue-300/80 text-gray-800 border-blue-400" },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ scale: 1.05, rotate: 1 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-4 rounded-lg font-bold shadow-lg border-2 ${item.style}`}
                            >
                                {item.prize}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default Home;