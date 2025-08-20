import axios from "axios";
import { useEffect, useState } from "react";
import api from "./api";

function Leaderboard() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState("FinalScore");
    const [sortDirection, setSortDirection] = useState("desc");

    useEffect(() => {
        async function data() {
            try {
                let res = await axios.get(`${api}/event/students`);
                res = await res.data;
                setTeams(res);
            } catch (error) {
                console.error("Error fetching teams:", error);
            } finally {
                setLoading(false);
            }
        }
        data();
    }, []);

    const sortTeams = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    const getSortedTeams = () => {
        return [...teams].sort((a, b) => {
            let valueA = a[sortField] || 0;
            let valueB = b[sortField] || 0;
            
            if (sortField.includes('.')) {
                const parts = sortField.split('.');
                let tempA = a;
                let tempB = b;
                
                for (const part of parts) {
                    tempA = tempA?.[part];
                    tempB = tempB?.[part];
                }
                
                valueA = tempA || 0;
                valueB = tempB || 0;
            }
            
            if (valueA === valueB) {
                return 0;
            }
            
            const comparison = valueA > valueB ? 1 : -1;
            return sortDirection === "asc" ? comparison : -comparison;
        });
    };

    const renderSortIcon = (field) => {
        if (sortField !== field) return null;
        return sortDirection === "asc" ? "↑" : "↓";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-xl font-semibold">Loading leaderboard data...</div>
            </div>
        );
    }

    const sortedTeams = getSortedTeams();

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Teams Leaderboard</h1>
                
                <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rank
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => sortTeams("teamname")}
                                >
                                    Team Name {renderSortIcon("teamname")}
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => sortTeams("Domain")}
                                >
                                    Domain {renderSortIcon("Domain")}
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => sortTeams("FirstReviewScore")}
                                >
                                    FirstScore {renderSortIcon("FirstReviewScore")}
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => sortTeams("FirstReviewScore")}
                                >
                                    SecoundScore {renderSortIcon("FirstReviewScore")}
                                </th>                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => sortTeams("FirstReviewScore")}
                                >
                                    Score {renderSortIcon("FirstReviewScore")}
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    FirstStatus
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    SecoundStatus
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedTeams.map((team, index) => (
                                <tr key={team._id} className={index % 2 === 0 ? "" : "bg-gray-50"}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {team.teamname || "—"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {team.Domain || "—"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {team.FirstReviewScore ? (
                                            <span className="font-semibold">{team.FirstReviewScore}</span>
                                        ) : (
                                            <span className="text-gray-500">Not scored</span>
                                        )}
                                    </td> <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {team.SecoundReviewScore ? (
                                            <span className="font-semibold">{team.SecoundReviewScore}</span>
                                        ) : (
                                            <span className="text-gray-500">Not scored</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {team.FinalScore ? (
                                            <span className="font-semibold">{team.FinalScore}</span>
                                        ) : (
                                            <span className="text-gray-500">Not scored</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {team.FirstReviewScore ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Reviewed
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {team.SecoundReviewScore ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Reviewed
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {sortedTeams.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No team data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Leaderboard;