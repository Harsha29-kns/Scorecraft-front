import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io } from "socket.io-client"; 
import api from './api';

// --- Constants ---
const narutoBgImage = "https://images6.alphacoders.com/605/605598.jpg";
const narutoGifUrl = "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHpqeHMwY3dyYmt1amF0MDF0NzNjY2R5M2Jha21rMHRnNWN6OGVhZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xVxio2tNLAM5q/giphy.gif";
const narutoMusicUrl = "/music/naruto-reg.mp3";

// --- Socket.IO Connection ---
const socket = io(api); 

// --- Music Player Component ---
const MusicPlayer = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (isPlaying) {
      audioEl.play().catch(() => {
        console.warn("Autoplay was prevented by the browser.");
        setIsPlaying(false);
      });
    } else {
      audioEl.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audioEl = audioRef.current;
    return () => {
      if (audioEl) {
        audioEl.pause();
      }
    };
  }, []);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="absolute top-4 right-4 z-20">
      <audio ref={audioRef} src={audioUrl} loop playsInline />
      <button
        onClick={togglePlayPause}
        className="w-12 h-12 bg-orange-500/80 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-orange-400/50 hover:bg-orange-600 transition-all"
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? (
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        ) : (
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        )}
      </button>
    </div>
  );
};



function Form() {
  const [formData, setFormData] = useState({
    name: '', email: '', registrationNumber: '', teamname: '', type: '', room: '', year: '', department: '', section: '',
    teamMembers: Array(4).fill({ name: '', registrationNumber: '', type: '', room: '', year: '', department: '', section: '' })
  });
  const [errors, setErrors] = useState({});
  const nav = useNavigate();
  
  
  const [isRegClosed, setIsRegClosed] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Connecting to server...");

  
  useEffect(() => {
    
    socket.on('registrationStatus', (status) => {
        if (status.isClosed) {
            setIsRegClosed(true);
                        setStatusMessage(
                <div>
                    <p>The registration slots are all filled.</p>
                    <p className="text-sm mt-1 opacity-90">
                        If any slots are extended, the organizer will inform you.
                    </p>
                    <div className="mt-3 text-xs text-left w-full">
                       <p>- Thank you</p>
                       <p>- Scorecraft Team</p>
                    </div>
                </div>
            );
        } else {
            setIsRegClosed(false);
            setStatusMessage(`${status.count} out of ${status.limit} spots filled. Registrations are open!`);
        }
    });

    // Request the initial status when the form loads
    socket.emit('check');

    const savedData = localStorage.getItem('formData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    
    // Cleanup the listener when the component unmounts
    return () => {
        socket.off('registrationStatus');
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'type' && value === "Day's Scholar") {
      setFormData({ ...formData, [name]: value, room: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTeamMemberChange = (index, e) => {
    const { name, value } = e.target;
    const updatedTeamMembers = formData.teamMembers.map((member, i) =>
      i === index
        ? { ...member, [name]: value, ...(name === 'type' && value === "Day's Scholar" ? { room: '' } : {}) }
        : member
    );
    setFormData({ ...formData, teamMembers: updatedTeamMembers });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration Number is required';
    if (!formData.teamname) newErrors.teamname = 'Team Name is required';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.section) newErrors.section = 'Section is required';

    if (formData.type !== "Day's Scholar" && !formData.room) {
      newErrors.room = 'Room Number is required';
    }

    formData.teamMembers.forEach((member, index) => {
      if (!member.name) newErrors[`teamMember${index}Name`] = `Member ${index + 1} Name is required`;
      if (!member.registrationNumber) newErrors[`teamMember${index}RegistrationNumber`] = `Member ${index + 1} Reg No is required`;
      if (!member.type) newErrors[`teamMember${index}Type`] = `Member ${index + 1} Type is required`;
      if (!member.year) newErrors[`teamMember${index}Year`] = `Member ${index + 1} Year is required`;
      if (!member.department) newErrors[`teamMember${index}Department`] = `Member ${index + 1} Dept is required`;
      if (!member.section) newErrors[`teamMember${index}Section`] = `Member ${index + 1} Section is required`;

      if (member.type !== "Day's Scholar" && !member.room) {
        newErrors[`teamMember${index}Room`] = `Member ${index + 1} Room No is required`;
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Safeguard to prevent submission if the form is closed
    if (isRegClosed) {
      setErrors({ form: "Sorry, registrations are currently closed." });
      return;
    }
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      nav("/payment", { state: formData });
      console.log("Form data submitted:", formData);
    }
  };

  const inputStyles = "w-full h-12 rounded-lg p-3 bg-gray-800/60 border-2 border-orange-500/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all disabled:bg-gray-700/50 disabled:cursor-not-allowed disabled:opacity-60";
  const labelStyles = "block mb-2 text-lg font-medium text-orange-300";
  const errorStyles = "text-red-400 text-sm mt-1";

  return (
    <div
      className="home relative w-full min-h-screen p-4 sm:p-8 flex items-center justify-center"
      style={{
        backgroundImage: `url('${narutoBgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      <MusicPlayer audioUrl={narutoMusicUrl} />

      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <motion.div
          className="hidden lg:flex items-center justify-center p-4"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <img src={narutoGifUrl} alt="Naruto Animation" className="rounded-2xl shadow-2xl border-4 border-orange-500/50 max-w-sm w-full" />
        </motion.div>

        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <form
            className="border-2 border-orange-500/50 rounded-2xl bg-gray-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-lg max-h-[90vh] overflow-y-auto"
            onSubmit={handleSubmit}
            noValidate
          >
            <h1 className="font-naruto text-4xl md:text-5xl font-bold mb-4 text-center text-orange-500">
              Register Your Ninja Team
            </h1>
            
            {/* --- 5. DISPLAY THE LIVE STATUS BANNER --- */}
            <div style={{
                textAlign: 'center', padding: '0.75rem', marginBottom: '2rem', borderRadius: '8px',
                fontWeight: 'bold', fontSize: '1.1rem',
                backgroundColor: isRegClosed ? '#7f1d1d' : '#166534',
                border: `1px solid ${isRegClosed ? '#991b1b' : '#14532d'}`
            }}>
                {statusMessage}
            </div>
            
            {errors.form && <p className={`text-center mb-4 ${errorStyles}`}>{errors.form}</p>}

            <h2 className="font-naruto text-2xl text-orange-400 border-b-2 border-orange-500/30 pb-2 mb-6">Team Leader's Scroll</h2>

            {/* --- 6. ADD 'disabled' PROP TO ALL INPUTS AND SELECTS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className={labelStyles} htmlFor="teamname">Team Name / Clan</label>
                <input id="teamname" name="teamname" value={formData.teamname} onChange={handleChange} placeholder="e.g., Team 7" className={inputStyles} disabled={isRegClosed} />
                {errors.teamname && <p className={errorStyles}>{errors.teamname}</p>}
              </div>
              <div>
                <label className={labelStyles} htmlFor="name">Lead Shinobi Name</label>
                <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Naruto Uzumaki" className={inputStyles} disabled={isRegClosed} />
                {errors.name && <p className={errorStyles}>{errors.name}</p>}
              </div>
              <div>
                <label className={labelStyles} htmlFor="email">Lead's Email</label>
                <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="shinobi@konoha.com" className={inputStyles} disabled={isRegClosed} />
                {errors.email && <p className={errorStyles}>{errors.email}</p>}
              </div>
              <div>
                <label className={labelStyles} htmlFor="registrationNumber">Registration No.</label>
                <input id="registrationNumber" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="Your Ninja ID" className={inputStyles} disabled={isRegClosed} />
                {errors.registrationNumber && <p className={errorStyles}>{errors.registrationNumber}</p>}
              </div>
              <div>
                <label className={labelStyles} htmlFor="year">Year</label>
                <select id="year" name="year" value={formData.year} onChange={handleChange} className={inputStyles} disabled={isRegClosed}>
                    <option value="">Select Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                </select>
                {errors.year && <p className={errorStyles}>{errors.year}</p>}
              </div>
               <div>
                <label className={labelStyles} htmlFor="department">Department</label>
                <select id="department" name="department" value={formData.department} onChange={handleChange} className={inputStyles} disabled={isRegClosed}>
                    <option value="">Select Department</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                </select>
                {errors.department && <p className={errorStyles}>{errors.department}</p>}
              </div>
              <div>
                <label className={labelStyles} htmlFor="section">Section</label>
                <input id="section" name="section" value={formData.section} onChange={handleChange} placeholder="e.g., A" className={inputStyles} disabled={isRegClosed} />
                {errors.section && <p className={errorStyles}>{errors.section}</p>}
              </div>
              <div>
                <label className={labelStyles} htmlFor="type">Type (Hostel/Day)</label>
                <select id="type" name="type" value={formData.type} onChange={handleChange} className={inputStyles} disabled={isRegClosed}>
                  <option value="">Select Type</option>
                  <option value="Day's Scholar">Day's Scholar</option>
                  <option value="Mh-1">Mh-1</option><option value="Mh-2">Mh-2</option><option value="Mh-3">Mh-3</option>
                  <option value="Mh-4">Mh-4</option><option value="Mh-5">Mh-5</option><option value="Mh-6">Mh-6</option>
                  <option value="Mh-7">Mh-7</option><option value="Lh-1">Lh-1</option><option value="Lh-2">Lh-2</option>
                  <option value="Lh-3">Lh-3</option><option value="Lh-4">Lh-4</option>
                </select>
                {errors.type && <p className={errorStyles}>{errors.type}</p>}
              </div>
              {formData.type !== "Day's Scholar" && (
                <div>
                  <label className={labelStyles} htmlFor="room">Room Number</label>
                  <input id="room" name="room" value={formData.room} onChange={handleChange} placeholder="Barracks Number" className={inputStyles} disabled={isRegClosed} />
                  {errors.room && <p className={errorStyles}>{errors.room}</p>}
                </div>
              )}
            </div>

            <h2 className="font-naruto text-2xl text-orange-400 border-b-2 border-orange-500/30 pb-2 mb-6 mt-10">Assemble Your Squad</h2>

            {formData.teamMembers.map((member, index) => (
              <div key={index} className="mb-8 p-4 border border-gray-700/50 rounded-lg bg-black/20">
                <p className="text-xl font-bold text-gray-300 mb-4">Squad Member {index + 1}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelStyles} htmlFor={`memberName${index}`}>Shinobi Name</label>
                    <input id={`memberName${index}`} name="name" value={member.name} onChange={(e) => handleTeamMemberChange(index, e)} placeholder="Member's Name" className={inputStyles} disabled={isRegClosed} />
                    {errors[`teamMember${index}Name`] && <p className={errorStyles}>{errors[`teamMember${index}Name`]}</p>}
                  </div>
                  <div>
                    <label className={labelStyles} htmlFor={`memberReg${index}`}>Registration No.</label>
                    <input id={`memberReg${index}`} name="registrationNumber" value={member.registrationNumber} onChange={(e) => handleTeamMemberChange(index, e)} placeholder="Member's Ninja ID" className={inputStyles} disabled={isRegClosed} />
                    {errors[`teamMember${index}RegistrationNumber`] && <p className={errorStyles}>{errors[`teamMember${index}RegistrationNumber`]}</p>}
                  </div>
                   <div>
                    <label className={labelStyles} htmlFor={`memberYear${index}`}>Year</label>
                    <select id={`memberYear${index}`} name="year" value={member.year} onChange={(e) => handleTeamMemberChange(index, e)} className={inputStyles} disabled={isRegClosed}>
                        <option value="">Select Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                    </select>
                    {errors[`teamMember${index}Year`] && <p className={errorStyles}>{errors[`teamMember${index}Year`]}</p>}
                  </div>
                  <div>
                    <label className={labelStyles} htmlFor={`memberDepartment${index}`}>Department</label>
                    <select id={`memberDepartment${index}`} name="department" value={member.department} onChange={(e) => handleTeamMemberChange(index, e)} className={inputStyles} disabled={isRegClosed}>
                        <option value="">Select Department</option>
                        <option value="CSE">CSE</option>
                        <option value="IT">IT</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                        <option value="MECH">MECH</option>
                    </select>
                    {errors[`teamMember${index}Department`] && <p className={errorStyles}>{errors[`teamMember${index}Department`]}</p>}
                  </div>
                  <div>
                    <label className={labelStyles} htmlFor={`memberSection${index}`}>Section</label>
                    <input id={`memberSection${index}`} name="section" value={member.section} onChange={(e) => handleTeamMemberChange(index, e)} placeholder="e.g., B" className={inputStyles} disabled={isRegClosed} />
                    {errors[`teamMember${index}Section`] && <p className={errorStyles}>{errors[`teamMember${index}Section`]}</p>}
                  </div>
                  <div>
                    <label className={labelStyles} htmlFor={`memberType${index}`}>Type</label>
                    <select id={`memberType${index}`} name="type" value={member.type} onChange={(e) => handleTeamMemberChange(index, e)} className={inputStyles} disabled={isRegClosed}>
                      <option value="">Select Type</option>
                      <option value="Day's Scholar">Day's Scholar</option>
                      <option value="Mh-1">Mh-1</option><option value="Mh-2">Mh-2</option><option value="Mh-3">Mh-3</option>
                      <option value="Mh-4">Mh-4</option><option value="Mh-5">Mh-5</option><option value="Mh-6">Mh-6</option>
                      <option value="Lh-1">Lh-1</option><option value="Lh-2">Lh-2</option>
                      <option value="Lh-3">Lh-3</option><option value="Lh-4">Lh-4</option>
                    </select>
                    {errors[`teamMember${index}Type`] && <p className={errorStyles}>{errors[`teamMember${index}Type`]}</p>}
                  </div>
                  {member.type !== "Day's Scholar" && (
                    <div>
                      <label className={labelStyles} htmlFor={`memberRoom${index}`}>Room Number</label>
                      <input id={`memberRoom${index}`} name="room" value={member.room} onChange={(e) => handleTeamMemberChange(index, e)} placeholder="Barracks Number" className={inputStyles} disabled={isRegClosed} />
                      {errors[`teamMember${index}Room`] && <p className={errorStyles}>{errors[`teamMember${index}Room`]}</p>}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <motion.button
              type="submit"
              className="w-full h-14 mt-6 rounded-lg bg-orange-500 text-white text-xl font-bold border-2 border-orange-600 hover:bg-orange-600 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
              whileHover={{ scale: isRegClosed ? 1 : 1.05 }}
              whileTap={{ scale: isRegClosed ? 1 : 0.98 }}
              disabled={isRegClosed}
            >
              {isRegClosed ? 'REGISTRATIONS CLOSED' : 'Proceed to Next Mission'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default Form;