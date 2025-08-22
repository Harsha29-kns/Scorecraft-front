import { motion, animate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import kalasalingam from "/public/kalasalingam.png";
import score from "/public/scorecraft.jpg";
import { useState, useEffect } from 'react';
import axios from 'axios';
import api from './api';
import { io } from 'socket.io-client';

const narutoBgImage = "https://images.alphacoders.com/605/605592.png";

const narutoFontStyle = {
    fontFamily: "'Ninja Naruto', sans-serif",
};

// --- NEW: Helper component for animating the team count number ---
function AnimatedCounter({ to }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, to, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
    });
    // Cleanup function to stop the animation if the component unmounts
    return () => controls.stop();
  }, [to]); // Rerun animation if the `to` value changes

  return <span>{displayValue}</span>;
}


function Home() {
    const nav = useNavigate();
    const [teamCount, setTeamCount] = useState(null);

    useEffect(() => {
        const fetchTeamCount = async () => {
            try {
                const response = await axios.get(`${api}/event/teams/count`);
                setTeamCount(response.data.count);
            } catch (error) {
                console.error("Failed to fetch team count:", error);
            }
        };
        fetchTeamCount();

        const socket = io(api);
        socket.on('updateTeamCount', (newCount) => {
            setTeamCount(newCount);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const registrationsAreOpen = teamCount !== null && teamCount < 60;

    return (
        <div 
            className="home relative w-full min-h-screen py-12 px-4 overflow-y-auto"
            style={{
                backgroundImage: `url('${narutoBgImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

            <motion.div 
                className="relative z-10 flex flex-col justify-start items-center w-full gap-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <motion.div 
                    className="p-8 rounded-2xl bg-gray-900/70 border-2 border-orange-500/50 shadow-2xl max-w-3xl w-full text-center backdrop-blur-md"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, type: "spring" }}
                >
                    <div className="w-full flex justify-center items-center gap-6 mb-6">
                        <img src={kalasalingam} className="w-20 h-20 object-contain bg-white/80 rounded-full p-1" alt="Kalasalingam Logo" />
                        <img src={score} className="w-20 h-20 object-cover rounded-full border-2 border-orange-400" alt="Score Logo" />
                    </div>
                    <h2 className="text-2xl mt-2 text-gray-300 tracking-wider">Scorecraft KARE Presents</h2>
                    <h1 
                        className="text-6xl md:text-7xl font-black text-orange-500 my-4 tracking-widest"
                        style={narutoFontStyle}
                    >
                        HackForge
                    </h1>

                    {/* --- NEW & IMPROVED: Registration Status UI --- */}
                    <div className="mt-8 w-full max-w-md mx-auto">
                        <div className="text-center mb-4">
                            <h3 className="text-2xl text-orange-400" style={narutoFontStyle}>Available Squad Slots</h3>
                        </div>
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between text-gray-300">
                                <div>
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-orange-500 text-white">
                                        {teamCount !== null ? `${Math.round((teamCount / 60) * 100)}% Full` : 'Loading...'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-bold text-white">
                                        {teamCount !== null ? <AnimatedCounter to={teamCount} /> : '...'} / 60
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-700 border-2 border-gray-600">
                                <motion.div 
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-orange-400 to-orange-600"
                                    initial={{ width: '0%' }}
                                    animate={{ width: teamCount !== null ? `${(teamCount / 60) * 100}%` : '0%' }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                >
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    <motion.button 
                        className="mt-10 bg-orange-500 text-white border-2 border-orange-600 py-3 px-8 rounded-lg shadow-lg text-lg font-bold hover:bg-orange-600 hover:shadow-orange-400/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                        whileHover={{ scale: registrationsAreOpen ? 1.1 : 1, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => nav("/registration")}
                        disabled={!registrationsAreOpen}
                    >
                        {registrationsAreOpen ? "Register Now, Believe It!" : "Registrations Are Closed"}
                    </motion.button>
                </motion.div>

                <motion.div 
                    className="max-w-4xl p-8 bg-gray-900/70 text-white rounded-2xl shadow-xl border-2 border-orange-500/30 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1 }}
                >
                    <h1 className="text-3xl font-extrabold mb-6 text-center text-orange-400" style={narutoFontStyle}>
                        About the Event
                    </h1>
                    <div className="text-lg text-gray-200 space-y-4">
                        {[
                            "Unleash your inner ninja and receive a random domain.",
                            "Identify a real-world problem within your assigned village (domain).",
                            "Develop an innovative jutsu (solution) to address the challenge.",
                            "Foster critical thinking, problem-solving, and creativity.",
                            "Become a legend and contribute to meaningful advancements in KARE."
                        ].map((text, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <span className="text-orange-400 font-bold text-xl">🍥</span>
                                <p>{text}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div 
                    className="mt-4 max-w-4xl p-8 bg-gray-900/70 text-white rounded-2xl shadow-xl border-2 border-orange-500/30 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 1 }}
                >
                    <h1 className="text-3xl font-extrabold mb-6 text-center text-orange-400" style={narutoFontStyle}>
                        Prizes & Rewards
                    </h1>
                    <p className="text-lg text-gray-300 mb-6 text-center">Your hard work will be rewarded! Top shinobi will receive cash prizes, and all participants will earn scrolls of recognition.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-yellow-400/80 rounded-lg font-bold text-gray-900 shadow-lg border-2 border-yellow-500">🏆 1st Prize: ₹7000 + 2 Credits</div>
                        <div className="p-4 bg-gray-300/80 rounded-lg font-bold text-gray-800 shadow-md border-2 border-gray-400">🥈 2nd Prize: ₹5000 + 2 Credits</div>
                        <div className="p-4 bg-orange-300/80 rounded-lg font-bold text-gray-800 shadow-md border-2 border-orange-400">🥉 3rd Prize: ₹3000 + 2 Credits</div>
                        <div className="p-4 bg-blue-300/80 rounded-lg font-bold text-gray-800 shadow-md border-2 border-blue-400">📜 Certificate + 2 Credits for All Participants</div>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
}

export default Home;