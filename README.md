# 🛡 Cybersecurity Honeypot & OSINT Dashboard

## 📌 Overview
This project deploys a **Cowrie SSH/Telnet honeypot** to capture attacker activity, integrates **AbuseIPDB** to check for malicious IP addresses, uses **OSINT** methods to gather more information, and displays everything in a **web-based dashboard**.

The goal is to **simulate attacks, collect threat intelligence, and visualize it** for learning and analysis purposes.

---

## 🚀 Features
- **Honeypot Simulation:** Using Cowrie to mimic an SSH/Telnet server and log attacker actions.
- **Threat Intelligence Integration:** Query AbuseIPDB API to identify suspicious IP addresses.
- **OSINT Enrichment:** Use open-source intelligence tools (Shodan, WHOIS, IPinfo) for extra details.
- **Dashboard:** Frontend to visualize attack data, IP reputation scores, and geolocation maps.
- **Attack Simulation:** Penetration tester role to simulate SSH attacks for testing.

---

## 🏗 Project Architecture
1. **Cowrie Honeypot** – Collects logs of attacker commands and connection attempts.
2. **Log Parser** – Reads JSON logs from Cowrie and extracts IPs, timestamps, and commands.
3. **AbuseIPDB API Module** – Sends IPs to AbuseIPDB and stores results.
4. **OSINT Module** – Gathers additional info like hosting provider and location.
5. **Backend (Flask/Streamlit)** – Handles API calls, data storage, and log retrieval.
6. **Frontend Dashboard** – Displays data in tables, charts, and maps.

---

## 📂 File Structure
