import { useEffect, useState } from "react";
import axios from "axios";
import api from "./api";

function Pics(){

        const [teams, setTeams] = useState([]);
        const [loading, setLoading] = useState(true);
    
        useEffect(() => {       
            async function fetchData() {
                try {
                    let res = await axios.get(`${api}/event/students`);
                    setTeams(res.data);
                } catch (error) {
                    console.error("Error fetching teams:", error);
                } finally {
                    setLoading(false);
                }
            }
            
            fetchData();
        }, []);
    

    
    
    
    
        if (loading) {
            return (
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <div className="text-white text-xl font-semibold">Loading attendance data...</div>
                </div>
            );
        }

    
        return (
            <div className="min-h-screen bg-gray-900 text-white p-5">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">Detailed Attendance</h1>
                    </div>
                    
                 
                       
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Team</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">First Round</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-600">
                                    {teams.map((member, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{member.teamname || 'N/A'}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm">{member.Domain ? member.Domain : "N/A" }</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {member.GroupPic ? 
                                             (<img src={member?.GroupPic}/>):
                                             <p>Not uploaded</p>
                                            }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                
                </div>
        );
    }
    
export default Pics