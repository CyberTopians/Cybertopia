# Cybertopia - Cybersecurity Honeypot Platform

Cybertopia is a comprehensive cybersecurity platform that integrates Cowrie honeypot technology with advanced threat intelligence and visualization capabilities. The platform provides real-time monitoring, attack analysis, and detailed reporting for cybersecurity professionals.

## 🚀 Features

### Core Functionality
- **Real-time Honeypot Monitoring**: Cowrie SSH honeypot integration for capturing attacker activities
- **Threat Intelligence**: IP reputation checking using AbuseIPDB, Shodan, and IPInfo APIs
- **Attack Analysis**: Advanced pattern detection and attack classification
- **Data Visualization**: Interactive dashboard with security metrics and team organization
- **Session Summarization**: Automated analysis and summarization of attack sessions

### Security Capabilities
- **Attack Pattern Detection**: Identifies privilege escalation, persistence, data exfiltration, and reconnaissance activities
- **Brute Force Detection**: Advanced campaign detection for credential stuffing and brute force attacks
- **IP Intelligence**: Comprehensive IP reputation scoring and geolocation data
- **Session Tracking**: Detailed session analysis with duration and severity assessment

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Main Server**: Express.js server with CORS support for Angular frontend
- **API Endpoints**: RESTful APIs for home services and security data
- **Database Integration**: PostgreSQL connection with connection pooling
- **External APIs**: Integration with AbuseIPDB, Shodan, and IPInfo for threat intelligence

### Frontend (Angular 20)
- **Modern Angular**: Built with Angular 20 using standalone components
- **PrimeNG UI**: Professional UI components for data visualization
- **Responsive Design**: Mobile-friendly interface with SCSS styling
- **Organization Chart**: Interactive team structure visualization

### Cowrie Integration
- **Log Processing**: Real-time monitoring of Cowrie honeypot logs
- **Data Pipeline**: JSON log processing and PostgreSQL storage
- **Attack Summarization**: Automated analysis of attack patterns and behaviors
- **IP Reputation**: Continuous monitoring and updating of IP threat scores

## 📋 Prerequisites

- Node.js (v18 or higher)
- Angular CLI (v20.1.6)
- PostgreSQL (v12 or higher)
- Python 3.8+ (for Cowrie integration)
- Cowrie Honeypot (for SSH attack capture)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/CyberTopians/Cybertopia.git
cd Cybertopia
```

### 2. Backend Setup
```bash
# Install backend dependencies
npm install

# Install additional dependencies
npm install axios cors express pg
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Build the frontend
ng build
```

### 4. Database Configuration
Create a PostgreSQL database and configure the connection:
```bash
# Create database
createdb Cybertopia

# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=Cybertopia
export DB_USER=your_username
export DB_PASSWORD=your_password
```

### 5. Cowrie Integration Setup
```bash
# Install Python dependencies
pip install psycopg2-binary watchdog

# Configure Cowrie log monitoring
# Update the LOG_FILE path in cowrie_json_to_pg.py
```

### 6. Environment Variables
Create a `.env` file in the root directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Cybertopia
DB_USER=your_username
DB_PASSWORD=your_password

# API Keys for threat intelligence
ABUSEIPDB_API_KEY=your_abuseipdb_key
SHODAN_API_KEY=your_shodan_key
IPINFO_TOKEN=your_ipinfo_token

# Cowrie Configuration
TTY_DIR=/path/to/cowrie/tty
PORT=3000
```

## 🚀 Running the Application

### Development Mode

1. **Start the Backend Server**:
```bash
npm start
```

2. **Start the Frontend (in another terminal)**:
```bash
cd frontend
ng serve
```

3. **Start Cowrie Data Processing**:
```bash
# Start the log processor
python3 "Cowrie Codes/cowrie_json_to_pg.py"

# Start the summarizer
node "Cowrie Codes/summarizer.js"

# Start IP reputation refresh
node "Cowrie Codes/refresh_ip_reputation.js"
```

### Production Mode

1. **Build the Frontend**:
```bash
cd frontend
ng build --configuration production
```

2. **Start the Production Server**:
```bash
npm start
```

## 📊 API Endpoints

### Main Application
- `GET /api/home` - Retrieve home services and company information
- `GET /api/security` - Fetch security logs and threat data

### Cowrie Backend (Port 3000)
- `GET /api/events` - Latest 100 events from Cowrie sessions
- `GET /api/sessions` - Latest 100 unique sessions by IP
- `GET /api/reports` - IP reputation and threat intelligence data
- `GET /api/summaries` - Attack session summaries and analysis

## 🎯 Usage

### Home Dashboard
- View company services and cybersecurity offerings
- Explore team organization structure
- Navigate to security monitoring interface

### Security Dashboard
- Monitor real-time attack sessions
- View IP reputation scores and geolocation data
- Analyze attack patterns and threat intelligence
- Track session durations and severity levels

### Attack Analysis
The system automatically detects and categorizes various attack patterns:
- **Privilege Escalation**: sudo commands, SUID file searches
- **Persistence**: SSH key injection, cron job manipulation
- **Data Exfiltration**: SCP/SFTP transfers, file downloads
- **Reconnaissance**: System enumeration, network scanning
- **Brute Force**: Credential stuffing campaigns

## 🔧 Configuration

### Cowrie Honeypot
Configure Cowrie to output JSON logs to the specified path:
```json
{
  "output": "jsonlog",
  "jsonlog_file": "/home/cowrie/var/log/cowrie/cowrie.json"
}
```

### Database Schema
The application uses the following main tables:
- `cowrie_json_sessions` - Raw Cowrie event data
- `summaries` - Processed attack session summaries
- `report` - IP reputation and threat intelligence data

## 🛡️ Security Features

### Threat Intelligence Integration
- **AbuseIPDB**: IP reputation scoring and abuse reports
- **Shodan**: Device and service information
- **IPInfo**: Geolocation and ISP data

### Attack Detection
- Real-time pattern matching for malicious commands
- Campaign detection for coordinated attacks
- Session correlation and timeline analysis
- Severity assessment based on attack patterns

## 📁 Project Structure

```
Cybertopia/
├── controller/           # Backend controllers
├── routes/              # Express.js routes
├── frontend/            # Angular frontend application
├── Cowrie Codes/        # Cowrie integration scripts
├── public/              # Static assets
├── views/               # Pug templates
├── app.js               # Main Express application
├── bin/www              # Server startup script
└── package.json         # Backend dependencies
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common issues

---

**Cybertopia** - Catching Hackers Before They Catch You
