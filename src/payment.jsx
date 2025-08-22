import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import api from "./api"; // Assuming this is your API config
import Modal from "./Model"; // Assuming this is your Modal component
import done from "/public/1cbd3594bb5e8d90924a105d4aae924c.gif";
import qr from "/public/qr1.jpg"; // Your QR code image
import anotherQr from "/public/qr2.png"; // A second QR code image
import { io } from "socket.io-client";

const narutoBgImage = "https://images6.alphacoders.com/605/605598.jpg";
const narutoMusicUrl = "https://vgmsite.com/soundtracks/naruto-shippuden-ultimate-ninja-storm-4/xvyyfppc/1-01.%20Spiral%20of%20Fire.mp3";

const paymentOptions = [
    { qrCode: qr, upiId: "check1@okhdfcbank" },
    { qrCode: anotherQr, upiId: "check2@okaxis" },
];

const MusicPlayer = ({ audioUrl }) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const audioRef = useRef(null);

    useEffect(() => {
        const audioEl = audioRef.current;
        if (isPlaying) {
            audioEl.play().catch(error => {
                console.warn("Autoplay was prevented by the browser. User must interact to play music.");
                setIsPlaying(false);
            });
        } else {
            audioEl.pause();
        }
    }, [isPlaying]);
    
    useEffect(() => {
        const audioEl = audioRef.current;
        return () => {
            if(audioEl) audioEl.pause();
        }
    }, []);

    const togglePlayPause = () => setIsPlaying(!isPlaying);

    return (
        <div className="absolute top-4 right-4 z-30">
            <audio ref={audioRef} src={audioUrl} loop autoPlay playsInline />
            <button
                onClick={togglePlayPause}
                className="w-12 h-12 bg-orange-500/80 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-orange-400/50 hover:bg-orange-600 transition-all"
                aria-label={isPlaying ? 'Pause music' : 'Play music'}
            >
                {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                )}
            </button>
        </div>
    );
};

const NarutoLoader = () => (
    <div className="flex flex-col items-center justify-center text-center">
        <img 
            src="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MTA2anV5cjV1OTJsNWoxcDg3bDJtbTBlcnAwY3Nxcjg3bzE2c2swMCZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/u3BZwClQTqY2Q/giphy.gif"
            alt="Loading..."
            className="w-48 h-auto"
        />
        <p className="text-orange-400 text-xl font-naruto mt-4">Verifying Mission Details...</p>
    </div>
);

function Payment() {
    const location = useLocation();
    const data = location.state || JSON.parse(localStorage.getItem('paymentData')) || { teamMembers: [] };
    
    const [upiId, setUpi] = useState(data.upiId || '');
    const [transtationId, setTxn] = useState(data.transtationId || '');
    const [errors, setErrors] = useState({ upiId: '', transtationId: '', imgUrl: '' });
    const [imgUrl, setImgUrl] = useState(data.imgUrl || '');
    const [loading, setLoading] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [error, setError] = useState("");
    const [close, setClose] = useState(false);
    const [currentQrIndex, setCurrentQrIndex] = useState(0);
    const [isUploaderReady, setIsUploaderReady] = useState(false);
    const wid = useRef();
    const socketRef = useRef();

    const totalMembers = 1 + (data.teamMembers?.filter(m => m.name).length || 0);
    const totalPrice = totalMembers * 350;

    useEffect(() => {
        if (window.cloudinary) {
            let myWidget = window.cloudinary.createUploadWidget(
                {
                    cloudName: "ductmfmke",
                    uploadPreset: "score-pay",
                },
                (error, result) => {
                    if (!error && result && result.event === "success") {
                        setImgUrl(result.info.secure_url);
                    } else if (error) {
                        setError("Image upload failed! Please try again.");
                    }
                }
            );
            wid.current = myWidget;
            setIsUploaderReady(true);
        } else {
            console.error("Cloudinary script not loaded");
        }

        socketRef.current = io(api);
        
        // --- THIS LISTENER HANDLES THE REAL-TIME CLOSING ---
        socketRef.current.on("registrationStatus", (status) => {
            if (status === "stop") {
                setClose(true);
            }
        });
        
        // Emit an event to check the status when the page loads
        socketRef.current.emit("check");

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('paymentData', JSON.stringify({ ...data, upiId, transtationId, imgUrl }));
    }, [data, upiId, transtationId, imgUrl]);

    const validate = () => {
        let valid = true;
        let newErrors = { upiId: '', transtationId: '', imgUrl: '' };

        if (!upiId) {
            newErrors.upiId = 'Your UPI ID is required for verification.';
            valid = false;
        }
        if (!transtationId) {
            newErrors.transtationId = 'Transaction ID is required.';
            valid = false;
        }
        if (!imgUrl) {
            newErrors.imgUrl = 'Please upload a screenshot of your payment.';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            setLoading(true);
            axios.post(`${api}/event/register`, { ...data, upiId, transtationId, imgUrl })
                .then((res) => {
                    setTimeout(() => {
                        setLoading(false);
                        setIsDone(true);
                        localStorage.removeItem('paymentData');
                        localStorage.removeItem('formData');
                    }, 2000);
                })
                .catch((err) => {
                     setTimeout(() => {
                        setLoading(false);
                        // --- UPDATED: Show specific error if registration is full ---
                        if (err.response && err.response.status === 403) {
                             setClose(true); // Trigger the closed view
                        } else {
                            setError("Registration failed! The server might be down or your team is already registered. Please contact support.");
                        }
                    }, 2000);
                });
        }
    };

    const handleNewQr = () => {
        setCurrentQrIndex((prevIndex) => (prevIndex + 1) % paymentOptions.length);
    };

    const handleUploadClick = () => {
        if (wid.current && isUploaderReady) {
            wid.current.open();
        } else {
            setError("Uploader is not ready yet. Please try again in a moment.");
        }
    };

    const inputStyles = "w-full h-12 rounded-lg p-3 bg-gray-800/60 border-2 border-orange-500/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all";
    const labelStyles = "block mb-2 text-lg font-medium text-orange-300";
    const errorStyles = "text-red-400 text-sm mt-1";

    // --- UPDATED: The message displayed when registrations are full ---
    if (close) {
        return (
            <div className="bg-black w-full h-screen text-white text-xl flex flex-col justify-center items-center text-center p-4">
                <h1 className="text-3xl font-bold text-orange-400">Registrations Are Now Full!</h1>
                <p className="mt-4 max-w-2xl">
                    The 60-team limit has been reached. If you have already completed the payment, please contact the Scorecraft team to finalize your registration.
                </p>
                <a href="mailto:support@scorecraft.com" className="mt-6 text-orange-400 text-2xl underline hover:text-orange-500">
                    Contact Scorecraft Team
                </a>
            </div>
        );
    }

    return (
        <div
            className="home relative w-full min-h-screen py-12 px-4 overflow-y-auto flex items-center justify-center"
            style={{ backgroundImage: `url('${narutoBgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
            <MusicPlayer audioUrl={narutoMusicUrl} />
             <Link to="/registration" className="absolute top-4 left-4 z-20 text-orange-300 hover:text-orange-400 transition-colors flex items-center gap-2 bg-black/30 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                Back to Form
            </Link>
            
            <motion.div
                className="relative z-10 w-full max-w-4xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <form
                    className="border-2 border-orange-500/50 rounded-2xl bg-gray-900/80 p-8 shadow-2xl backdrop-blur-lg max-h-[90vh] overflow-y-auto"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <h1 className="font-naruto text-4xl md:text-5xl font-bold mb-2 text-center text-orange-500">
                        Final Mission: Payment
                    </h1>
                    <p className="text-center text-lg text-gray-300 mb-8">(₹350 per person)</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col items-center bg-black/20 p-6 rounded-lg border border-gray-700/50">
                            <div className="w-full flex justify-between items-center mb-4">
                                <h3 className="font-naruto text-2xl text-orange-400">Scan to Pay</h3>
                                <button type="button" onClick={handleNewQr} className="text-sm bg-orange-500/80 text-white py-1 px-3 rounded-md hover:bg-orange-600 transition-colors">New QR</button>
                            </div>
                            <img src={paymentOptions[currentQrIndex].qrCode} alt="Payment QR Code" className="w-56 h-56 object-contain rounded-lg border-2 border-orange-500/50" />
                            <div className="mt-4 text-center">
                                <p className="text-gray-300">Or pay to UPI ID:</p>
                                <p className="text-orange-400 font-bold text-lg tracking-wider bg-gray-800 px-4 py-2 rounded-md mt-2">{paymentOptions[currentQrIndex].upiId}</p>
                            </div>
                            <a href={paymentOptions[currentQrIndex].qrCode} download="payment-qr" className="mt-4 text-orange-300 hover:text-orange-400 underline transition-colors">
                                Download QR
                            </a>
                            <p className="text-xs text-gray-400 mt-4 text-center">
                                If the payment limit is reached, click "New QR" or try the UPI ID directly.
                            </p>
                        </div>

                        <div>
                            <div className="bg-black/20 p-6 rounded-lg border border-gray-700/50 mb-6">
                                <h3 className="font-naruto text-2xl text-orange-400 mb-4">Mission Briefing</h3>
                                <p className="text-gray-300">Team: <span className="font-bold text-white">{data.teamname || 'N/A'}</span></p>
                                <p className="text-gray-300">Total Shinobi: <span className="font-bold text-white">{totalMembers}</span></p>
                                <hr className="my-3 border-gray-700"/>
                                <p className="text-2xl text-white">Total Amount:</p>
                                <p className="text-4xl font-bold text-orange-500">₹{totalPrice}</p>
                            </div>

                            <div>
                                <label className={labelStyles} htmlFor="upiId">Your UPI ID</label>
                                <input id="upiId" name="upiId" value={upiId} onChange={(e) => setUpi(e.target.value)} placeholder="Enter your UPI ID" className={inputStyles} />
                                {errors.upiId && <p className={errorStyles}>{errors.upiId}</p>}
                            </div>

                            <div className="mt-4">
                                <label className={labelStyles} htmlFor="transtationId">Transaction ID</label>
                                <input id="transtationId" name="transtationId" value={transtationId} onChange={(e) => setTxn(e.target.value)} placeholder="Enter the transaction reference number" className={inputStyles} />
                                {errors.transtationId && <p className={errorStyles}>{errors.transtationId}</p>}
                            </div>
                            
                            <div className="mt-4">
                                <label className={labelStyles}>Payment Screenshot</label>
                                {!imgUrl ? (
                                    <button type="button" onClick={handleUploadClick} disabled={!isUploaderReady} className="w-full h-12 rounded-lg bg-orange-500/20 border-2 border-dashed border-orange-500/50 text-orange-300 hover:bg-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isUploaderReady ? "Upload Screenshot" : "Uploader Loading..."}
                                    </button>
                                ) : (
                                    <div className="text-center">
                                        <img src={imgUrl} alt="Screenshot preview" className="w-full max-h-40 object-contain rounded-lg mb-2"/>
                                        <button type="button" onClick={handleUploadClick} disabled={!isUploaderReady} className="text-orange-300 hover:text-orange-400 underline disabled:opacity-50">
                                            Re-upload
                                        </button>
                                    </div>
                                )}
                                {errors.imgUrl && <p className={errorStyles}>{errors.imgUrl}</p>}
                            </div>
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        className="w-full h-14 mt-8 rounded-lg bg-orange-500 text-white text-xl font-bold border-2 border-orange-600 hover:bg-orange-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                    >
                        {loading ? (
                             <div className="flex items-center gap-3">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Verifying Mission...</span>
                            </div>
                        ) : "Complete Mission"}
                    </motion.button>
                </form>
            </motion.div>

        {(loading || isDone || error) && (
                <Modal>
                    {loading && <NarutoLoader />}
                    
                    {isDone && (
                        <motion.div 
                            className="text-center text-white bg-gray-900/80 border-2 border-orange-500/50 rounded-2xl shadow-2xl p-8 max-w-lg w-full"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <img src={done} alt="Success" className="w-32 h-32 mx-auto" />
                            <h2 className="text-3xl font-naruto text-orange-400 mt-4">Mission Complete!</h2>
                            <p className="mt-3 text-gray-300">Your submission has been received and is now under verification. You will get a confirmation email once it's approved.</p>
                            <Link to="/">
                                <button className="mt-8 bg-orange-500 px-8 py-3 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">Return to Village</button>
                            </Link>
                        </motion.div>
                    )}

                    {error && (
                         <motion.div 
                            className="text-center text-white bg-gray-900/80 border-2 border-red-500/50 rounded-2xl shadow-2xl p-8 max-w-lg w-full"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-3xl font-naruto text-red-500">Mission Failed!</h2>
                            <p className="mt-3 text-gray-300">{error}</p>
                            <button onClick={() => setError("")} className="mt-8 bg-orange-500 px-8 py-3 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">
                                Try Again
                            </button>
                        </motion.div>
                    )}
                </Modal>
            )}
        </div>
    );
}

export default Payment;