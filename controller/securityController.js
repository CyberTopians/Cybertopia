const axios = require('axios');

const getLogs = async (req, res) => {
    try {
        const response = await axios.get('http://207.154.242.175:3000/api/events');

        // Normalize into { logs: [...] }
        const logs = response.data.map(log => ({
            ID: log.id,        // rename
            time: log.timestamp        // rename

        }));

        res.status(200).json({ logs }); // ✅ always wrap in { logs: [] }
    } catch (err) {
        console.error(err);
        res.status(500).json({ logs: [] }); // ✅ fail safe
    }
};

module.exports = { getLogs };