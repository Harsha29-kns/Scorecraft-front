import axios from "axios";
import api from "./src/api.js"
import { io } from "socket.io-client";
// Configuration
const config = {
    apiRequests: 400,  // Number of API requests to send
    socketEvents: 350, // Number of socket events to emit
    concurrentRequests: 50, // How many concurrent requests
    logFrequency: 25,  // Log every X requests
    socketEndpoint: api,
    apiEndpoints: [
        '/event/students',
    ]
};
const socket = io(config.socketEndpoint, {
    reconnection: true,
    reconnectionAttempts: 5,
});
socket.on("domainSelected",(res)=>{
    console.log(res)
})
console.log('🚀 Starting stress test...');
console.log(`API Requests: ${config.apiRequests} | Socket Events: ${config.socketEvents}`);
console.log('----------------------------------------------');

// Track performance metrics
const metrics = {
    apiStartTime: 0,
    apiEndTime: 0,
    socketStartTime: 0,
    socketEndTime: 0,
    apiSuccess: 0,
    apiFailures: 0,
    socketSuccess: 0,
    socketFailures: 0,
    apiResponseTimes: [],
};


// Helper functions
const getRandomEndpoint = () => {
    const endpoints = config.apiEndpoints;
    return endpoints[Math.floor(Math.random() * endpoints.length)];
};

const calculateStats = (times) => {
    if (times.length === 0) return { avg: 0, min: 0, max: 0 };
    
    const sum = times.reduce((a, b) => a + b, 0);
    const avg = sum / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    return { avg, min, max };
};

// Execute API stress test
async function runApiTest() {
    console.log('⚡ Starting API stress test...');
    metrics.apiStartTime = Date.now();
    
    const requests = [];
    const total = config.apiRequests;
    
    for (let i = 0; i < total; i++) {
        const requestPromise = (async () => {
            const endpoint = getRandomEndpoint();
            const startTime = Date.now();
            
            try {
                await axios.get(`${api}${endpoint}`);
                const responseTime = Date.now() - startTime;
                metrics.apiResponseTimes.push(responseTime);
                metrics.apiSuccess++;
                
                if (i % config.logFrequency === 0) {
                    console.log(`✅ API Request ${i+1}/${total} completed (${responseTime}ms) - ${endpoint}`);
                }
                
            } catch (error) {
                metrics.apiFailures++;
                console.error(`❌ API Request ${i+1}/${total} failed - ${endpoint} - ${error.message}`);
            }
        })();
        
        requests.push(requestPromise);
        
        // Control concurrency
        if (requests.length >= config.concurrentRequests) {
            await Promise.all(requests);
            requests.length = 0;
        }
    }
    
    // Wait for remaining requests
    if (requests.length > 0) {
        await Promise.all(requests);
    }
    
    metrics.apiEndTime = Date.now();
    console.log('✅ API stress test completed!');
}

// Execute Socket stress test
async function runSocketTest() {
    console.log('⚡ Starting Socket stress test...');
    metrics.socketStartTime = Date.now();
    
    return new Promise((resolve) => {
        const socket = io(config.socketEndpoint, {
            reconnection: true,
            reconnectionAttempts: 5,
        });
        
        socket.on('connect', async () => {
            console.log('🔌 Socket connected');
            
            const events = [                
                'domainSelected',
            ];
            
            // Send socket events
            for (let i = 0; i < config.socketEvents; i++) {
                const event = events[Math.floor(Math.random() * events.length)];
                const payload = { 
                    id: "67b32ce9fb460dd92d9e8706", domain: "1"
                };

                
                try {
                    socket.emit(event, payload);
                    metrics.socketSuccess++;
                    
                    if (i % config.logFrequency === 0) {
                        console.log(`✅ Socket Event ${i+1}/${config.socketEvents} sent - ${event}`);
                    }
                    
                    // Add small delay to prevent flooding
                    await new Promise(r => setTimeout(r, 10));
                    
                } catch (error) {
                    metrics.socketFailures++;
                    console.error(`❌ Socket Event ${i+1}/${config.socketEvents} failed - ${event}`);
                }
            }
            
            metrics.socketEndTime = Date.now();
            console.log('✅ Socket stress test completed!');
            
            // Disconnect and resolve
            socket.disconnect();
            resolve();
        });
        
        socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            metrics.socketEndTime = Date.now();
            resolve();
        });
        
        socket.on('error', (error) => {
            console.error('❌ Socket error:', error);
        });
        
        // Timeout safeguard
        setTimeout(() => {
            if (socket.connected) {
                socket.disconnect();
            }
            console.log('⚠️ Socket test timeout reached');
            metrics.socketEndTime = Date.now();
            resolve();
        }, 60000); // 1 minute timeout
    });
}

// Print results
function printResults() {
    console.log('\n----------------------------------------------');
    console.log('📊 STRESS TEST RESULTS');
    console.log('----------------------------------------------');
    
    // API Results
    const apiDuration = (metrics.apiEndTime - metrics.apiStartTime) / 1000;
    const apiStats = calculateStats(metrics.apiResponseTimes);
    
    console.log('\n🔹 API TEST:');
    console.log(`Total Requests: ${config.apiRequests}`);
    console.log(`Successful: ${metrics.apiSuccess} | Failed: ${metrics.apiFailures}`);
    console.log(`Success Rate: ${((metrics.apiSuccess / config.apiRequests) * 100).toFixed(2)}%`);
    console.log(`Duration: ${apiDuration.toFixed(2)} seconds`);
    console.log(`Requests Per Second: ${(metrics.apiSuccess / apiDuration).toFixed(2)}`);
    console.log(`Response Time (avg): ${apiStats.avg.toFixed(2)}ms | min: ${apiStats.min}ms | max: ${apiStats.max}ms`);
    
    // Socket Results
    const socketDuration = (metrics.socketEndTime - metrics.socketStartTime) / 1000;
    
    console.log('\n🔹 SOCKET TEST:');
    console.log(`Total Events: ${config.socketEvents}`);
    console.log(`Successful: ${metrics.socketSuccess} | Failed: ${metrics.socketFailures}`);
    console.log(`Success Rate: ${((metrics.socketSuccess / config.socketEvents) * 100).toFixed(2)}%`);
    console.log(`Duration: ${socketDuration.toFixed(2)} seconds`);
    console.log(`Events Per Second: ${(metrics.socketSuccess / socketDuration).toFixed(2)}`);
    
    console.log('\n----------------------------------------------');
}

// Main execution
async function runStressTest() {
    try {
        // await runApiTest();
        await runSocketTest();
        printResults();
    } catch (error) {
        console.error('❌ Stress test failed:', error);
    }
}

runStressTest();
