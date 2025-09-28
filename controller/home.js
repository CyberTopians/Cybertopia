const path = require('path')

getHome = async (req,res)=>{
    res.status(200).json({
        services: [
            { id: 1, name: "Web Development", description: "Our cybersecurity solutions are designed to keep your digital assets safe from evolving threats. We provide real-time monitoring and detailed reporting to ensure you always have visibility into potential risks. Our advanced protection detects and blocks malicious activities, including SQL injections, brute-force attempts, and malware attacks, while leveraging IP intelligence to uncover attacker identities—even when they hide behind VPNs. With our services, you gain clear, actionable security insights that empower confident, data-driven decisions." }
        ]
    });
};

module.exports ={getHome
};