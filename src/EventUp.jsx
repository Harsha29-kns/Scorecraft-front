import { useState } from "react";
import { io } from "socket.io-client";
import api from "./api";
const socket = io(api);

function EventUp() {
    const [event, setEvent] = useState("");

    const handleEvent = () => {
        socket.emit("eventupdates", event);
        setEvent("");
    };

    return (
        <div className="min-h-screen w-full bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full space-y-4 bg-gray-800 p-6 rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4">Create Event Update</h2>
                <textarea
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                    className="w-full h-40 p-3 bg-gray-700 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event details..."
                />
                <button
                    onClick={handleEvent}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
                >
                    Submit Update
                </button>
            </div>
            <div className=" bg-gray-600 rounded-3xl p-6">
                {`    <div class="max-w-4xl mx-auto bg-gray-800 bg-opacity-90 p-6 rounded-lg shadow-lg">
        <h2 class="text-3xl font-bold text-gray-100 mb-4">🔥 Hackathon Midway Review 🔥</h2>
        <h3 class="text-lg text-gray-300 mb-4">As the first review is all about fun, let’s make it even more exciting with your amazing PPTs! 🎉 You guys can download the template by clicking the button below! 🚀✨</h3>

        <table class="w-full border-collapse border border-gray-700">
            <thead>
                <tr class="bg-gray-700 text-gray-200">
                    <th class="border border-gray-600 p-2 text-left">📌 Criteria</th>
                    <th class="border border-gray-600 p-2 text-left">📖 Description</th>
                </tr>
            </thead>
            <tbody>
                <tr class="bg-gray-800">
                    <td class="border border-gray-700 p-2">💡 Problem Understanding & Clarity</td>
                    <td class="border border-gray-700 p-2">How clearly is the problem within the university/college identified? Is it well-defined and justified?</td>
                </tr>
                <tr class="bg-gray-900">
                    <td class="border border-gray-700 p-2">🛠️ Feasibility & Relevance of Solution</td>
                    <td class="border border-gray-700 p-2">Is the proposed solution realistically implementable in a university setting? Does it directly address the identified problem?</td>
                </tr>
                <tr class="bg-gray-800">
                    <td class="border border-gray-700 p-2">⚙️ Technical Approach & Feasibility</td>
                    <td class="border border-gray-700 p-2">Are the chosen technologies/tools appropriate? Is the implementation approach sound and achievable within the hackathon timeframe?</td>
                </tr>
                <tr class="bg-gray-900">
                    <td class="border border-gray-700 p-2">🚀 Prototype / Early Development Progress</td>
                    <td class="border border-gray-700 p-2">Has the team started coding or designing a working prototype? Is there visible progress beyond just an idea?</td>
                </tr>
            </tbody>
        </table>

        <div class="mt-6 text-center">
            <a href="https://res.cloudinary.com/dus9hgplo/raw/upload/v1741102606/InnovativeKare.pptx" download class="bg-red-600 text-white px-6 py-3 rounded-lg shadow hover:bg-red-700 text-lg font-bold flex items-center justify-center gap-2">
                📥 Download Template 🚀
            </a>
        </div>
    </div>

`}
<button onClick={()=>{
    navigator.clipboard.writeText(`<div class="max-w-4xl mx-auto bg-gray-800 bg-opacity-90 p-6 rounded-lg shadow-lg">
        <h2 class="text-3xl font-bold text-gray-100 mb-4">🔥 Hackathon Midway Review 🔥</h2>
        <h3 class="text-lg text-gray-300 mb-4">As the first review is all about fun, let’s make it even more exciting with your amazing PPTs! 🎉 You guys can download the template by clicking the button below! 🚀✨</h3>

        <table class="w-full border-collapse border border-gray-700">
            <thead>
                <tr class="bg-gray-700 text-gray-200">
                    <th class="border border-gray-600 p-2 text-left">📌 Criteria</th>
                    <th class="border border-gray-600 p-2 text-left">📖 Description</th>
                </tr>
            </thead>
            <tbody>
                <tr class="bg-gray-800">
                    <td class="border border-gray-700 p-2">💡 Problem Understanding & Clarity</td>
                    <td class="border border-gray-700 p-2">How clearly is the problem within the university/college identified? Is it well-defined and justified?</td>
                </tr>
                <tr class="bg-gray-900">
                    <td class="border border-gray-700 p-2">🛠️ Feasibility & Relevance of Solution</td>
                    <td class="border border-gray-700 p-2">Is the proposed solution realistically implementable in a university setting? Does it directly address the identified problem?</td>
                </tr>
                <tr class="bg-gray-800">
                    <td class="border border-gray-700 p-2">⚙️ Technical Approach & Feasibility</td>
                    <td class="border border-gray-700 p-2">Are the chosen technologies/tools appropriate? Is the implementation approach sound and achievable within the hackathon timeframe?</td>
                </tr>
                <tr class="bg-gray-900">
                    <td class="border border-gray-700 p-2">🚀 Prototype / Early Development Progress</td>
                    <td class="border border-gray-700 p-2">Has the team started coding or designing a working prototype? Is there visible progress beyond just an idea?</td>
                </tr>
            </tbody>
        </table>

        <div class="mt-6 text-center">
            <a href="https://res.cloudinary.com/dus9hgplo/raw/upload/v1741403183/PPT_Template_Innovate_KARE.pptx" download class="bg-red-600 text-white px-6 py-3 rounded-lg shadow hover:bg-red-700 text-lg font-bold flex items-center justify-center gap-2">
                📥 Download Template 🚀
            </a>
        </div>
    </div>`).then(()=>{console.log("done")})
}}>Copy</button>

            </div>
        </div>
    );
}

export default EventUp;