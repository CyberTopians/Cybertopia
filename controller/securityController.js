
const axios = require('axios');

const getLogs = async (req, res) => {
    try {
        const [api1, api2] = await Promise.all([
            axios.get('http://207.154.242.175:3000/api/sessions'),  // sessions
            axios.get('http://207.154.242.175:3000/api/reports')   // abuse scores
        ]);

        // Normalize API 1 logs (sessions)
        const sessionLogs = Array.isArray(api1.data) ? api1.data.map(log => ({
            time: log.timestamp,
            ipAddress: log.src_ip,
            sessionID: log.session
        })) : [];

        // Normalize API 2 logs (abuse scores)
        const abuseLogs = Array.isArray(api2.data) ? api2.data.map(log => ({
            abuse_country: log.abuse_country,
            abuse_score: log.abuse_score
        })) : [];

        res.json({ sessionLogs, abuseLogs });
    } catch (err) {
        console.error("Error fetching logs:", err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getLogs };


