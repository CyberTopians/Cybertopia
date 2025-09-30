'use strict';

/**
 * SSH Attack Summarizer - Fixed Version
 * - Gets src_ip and session directly from cowrie_json_sessions table
 * - Provides detailed explanations for "Suspicious SSH Activity"
 * - No more generic classifications
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

// Configuration
const config = {
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  TTY_DIR: process.env.TTY_DIR || null,
  LIMIT: process.env.LIMIT ? Number(process.env.LIMIT) : null,
  READ_TTY: process.env.NO_TTY ? false : true,
  BRUTE_WINDOW_SEC: process.env.BRUTE_WINDOW_SEC ? Number(process.env.BRUTE_WINDOW_SEC) : 480,
  BRUTE_THRESHOLD: process.env.BRUTE_THRESHOLD ? Number(process.env.BRUTE_THRESHOLD) : 4,
  BATCH_SIZE: 1000
};

// Validate required environment variables
if (!config.DB_NAME || !config.DB_USER || !config.DB_PASSWORD) {
  console.error('ERROR: DB_NAME, DB_USER, DB_PASSWORD must be set in .env');
  process.exit(1);
}

class SummarizerUtils {
  static parseTime(ts) {
    if (!ts) return null;
    try {
      const d = new Date(ts);
      return !isNaN(d.getTime()) ? d : null;
    } catch (e) {
      return null;
    }
  }

  static calculateDuration(start, end) {
    if (!start || !end) return null;
    try {
      const startTime = this.parseTime(start);
      const endTime = this.parseTime(end);
      if (!startTime || !endTime) return null;
      
      const durationMs = endTime.getTime() - startTime.getTime();
      return durationMs >= 0 ? Number((durationMs / 1000).toFixed(3)) : null;
    } catch (error) {
      return null;
    }
  }

  static validateIP(ip) {
    if (!ip || ip === 'unknown') return false;
    return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip);
  }

  static safeISOString(date) {
    return date && date.toISOString ? date.toISOString() : null;
  }

  static truncateIP(ip, maxLength = 45) {
    if (!ip) return 'unknown';
    return ip.length > maxLength ? ip.substring(0, maxLength) : ip;
  }

  static generateShortId(prefix = 's', length = 12) {
    return `${prefix}_${crypto.randomBytes(length).toString('hex').substring(0, length)}`;
  }
}

class AttackDetector {
  static getAttackPatterns() {
    return [
      // Privilege Escalation
      { id: 'sudo_su', label: 'Privilege Escalation', pattern: /\bsudo\s+su\b/i },
      { id: 'sudo_bash', label: 'Privilege Escalation', pattern: /\bsudo\s+bash\b/i },
      { id: 'find_suid', label: 'Privilege Escalation', pattern: /\bfind\s+.*-perm\s+-u=s/i },
      { id: 'cat_shadow', label: 'Privilege Escalation', pattern: /\bcat\s+\/etc\/shadow\b/i },
      
      // Persistence
      { id: 'ssh_key_add', label: 'Persistence', pattern: /echo\s+ssh-(rsa|dsa|ed25519).*>>\s*\.ssh\/authorized_keys/i },
      { id: 'crontab_add', label: 'Persistence', pattern: /crontab\s+-e|\bcrontab\s+.*\.[0-9]/i },
      { id: 'systemd_persistence', label: 'Persistence', pattern: /systemctl\s+(enable|start)/i },
      
      // Data Exfiltration
      { id: 'scp_transfer', label: 'Data Exfiltration', pattern: /\bscp\b.*@.*:/i },
      { id: 'sftp_transfer', label: 'Data Exfiltration', pattern: /\bsftp\b.*\b(get|put)\b/i },
      { id: 'wget_download', label: 'Data Exfiltration', pattern: /\bwget\b.*(http|ftp)/i },
      
      // Reconnaissance
      { id: 'ps_aux', label: 'Reconnaissance', pattern: /\bps\s+aux\b/i },
      { id: 'netstat_listen', label: 'Reconnaissance', pattern: /\bnetstat\s+-(an|tulpn)/i },
      { id: 'uname_system', label: 'Reconnaissance', pattern: /\buname\s+-a\b/i },
      { id: 'cat_proc', label: 'Reconnaissance', pattern: /\bcat\s+\/proc\/(version|cpuinfo)/i },
      
      // Lateral Movement
      { id: 'ssh_connect', label: 'Lateral Movement', pattern: /ssh\s+[^@]+@[^\s]+/i },
      { id: 'ssh_agent', label: 'Lateral Movement', pattern: /ssh\s+-A\b/i },
      
      // Malicious Tools
      { id: 'nmap_scan', label: 'Network Scanning', pattern: /\bnmap\b/i },
      { id: 'hydra_attack', label: 'Brute Force Tool', pattern: /\bhydra\b/i },
      { id: 'metasploit', label: 'Exploitation Tool', pattern: /\bmsfconsole\b/i }
    ];
  }

  static detectCommands(commands) {
    const detected = [];
    for (const cmd of commands) {
      for (const pattern of this.getAttackPatterns()) {
        if (pattern.pattern.test(cmd)) {
          detected.push(pattern.label);
        }
      }
    }
    return [...new Set(detected)]; // Remove duplicates
  }

  static isBenignCommand(cmd) {
    if (!cmd) return true;
    const benign = [
      /^exit$/i, /^logout$/i, /^clear$/i, /^pwd$/i, /^ls$/i, /^ll$/i,
      /^cd\s*$/, /^cd\s+~$/, /^cd\s+\.\.$/, /^help$/i, /^\?$/i,
      /^whoami$/i, /^id$/i, /^date$/i, /^uptime$/i, /^history$/i,
      /^echo\s+[a-zA-Z0-9\s]+$/i
    ];
    return benign.some(pattern => pattern.test(cmd.trim()));
  }
}

class SessionAnalyzer {
  static analyze(sessionEvents) {
    const analysis = {
      sessionId: sessionEvents[0]?.session || 'unknown',
      src_ip: sessionEvents.find(e => e.src_ip && e.src_ip !== 'unknown')?.src_ip || 'unknown',
      startTime: null,
      endTime: null,
      duration: null,
      hasSuccessLogin: false,
      hasFailedLogin: false,
      successLoginCount: 0,
      failedLoginCount: 0,
      commands: [],
      suspiciousCommands: [],
      detectedPatterns: [],
      username: null,
      password: null
    };

    // Extract timestamps and basic info
    const timestamps = [];
    for (const event of sessionEvents) {
      const timestamp = SummarizerUtils.parseTime(event.timestamp);
      if (timestamp) timestamps.push(timestamp);

      switch (event.event_type) {
        case 'cowrie.login.success':
          analysis.hasSuccessLogin = true;
          analysis.successLoginCount++;
          analysis.username = event.raw_obj?.username || analysis.username;
          analysis.password = event.raw_obj?.password || analysis.password;
          break;
        case 'cowrie.login.failed':
          analysis.hasFailedLogin = true;
          analysis.failedLoginCount++;
          analysis.username = event.raw_obj?.username || analysis.username;
          analysis.password = event.raw_obj?.password || analysis.password;
          break;
        case 'cowrie.command.input':
          const cmd = event.input || event.raw_obj?.input;
          if (cmd && !AttackDetector.isBenignCommand(cmd)) {
            analysis.commands.push(cmd);
          }
          break;
      }
    }

    // Calculate timing - only if we have valid timestamps
    const validTimestamps = timestamps.filter(ts => ts !== null);
    if (validTimestamps.length >= 2) {
      analysis.startTime = new Date(Math.min(...validTimestamps.map(t => t.getTime())));
      analysis.endTime = new Date(Math.max(...validTimestamps.map(t => t.getTime())));
      analysis.duration = SummarizerUtils.calculateDuration(analysis.startTime, analysis.endTime);
    }

    // Detect attack patterns
    analysis.detectedPatterns = AttackDetector.detectCommands(analysis.commands);
    analysis.suspiciousCommands = analysis.commands.filter(cmd => 
      AttackDetector.detectCommands([cmd]).length > 0
    );

    return analysis;
  }

  static generateSummary(analysis) {
    let purpose = 'Normal Session';
    let severity = 'Low';
    let summary = '';

    // Determine purpose and severity based on analysis
    if (analysis.detectedPatterns.length > 0) {
      purpose = analysis.detectedPatterns[0]; // Use first detected pattern
      severity = 'High';
      summary = `Detected ${analysis.detectedPatterns.join(', ')} activity`;
    } else if (analysis.hasSuccessLogin && analysis.commands.length > 0) {
      purpose = 'User Session with Commands';
      severity = 'Low';
      summary = `User session with ${analysis.commands.length} commands`;
    } else if (analysis.hasSuccessLogin) {
      purpose = 'Quick Login';
      severity = 'Low';
      summary = 'Successful login with no commands';
    } else if (analysis.hasFailedLogin) {
      purpose = 'Failed Login Attempt';
      severity = 'Low';
      summary = `Failed login attempt${analysis.failedLoginCount > 1 ? 's' : ''}`;
    } else {
      purpose = 'Connection Only';
      severity = 'Low';
      summary = 'Connection established with no login attempts';
    }

    // Add details to summary
    if (analysis.username) {
      summary += ` - username: ${analysis.username}`;
    }
    if (analysis.duration) {
      summary += ` - duration: ${analysis.duration}s`;
    }
    if (analysis.suspiciousCommands.length > 0) {
      summary += ` - suspicious commands: ${analysis.suspiciousCommands.length}`;
    }

    return { purpose, severity, summary };
  }
}

class CampaignDetector {
  static detectCredentialStuffing(sessionGroups) {
    const credentialMap = new Map();
    const campaigns = [];

    // Track credentials across all sessions
    for (const [sessionId, sessionEvents] of sessionGroups) {
      const analysis = SessionAnalyzer.analyze(sessionEvents);
      if (analysis.username && analysis.password) {
        const credKey = `${analysis.username}:${analysis.password}`;
        if (!credentialMap.has(credKey)) {
          credentialMap.set(credKey, []);
        }
        credentialMap.get(credKey).push({
          sessionId,
          src_ip: analysis.src_ip,
          timestamp: analysis.startTime,
          analysis
        });
      }
    }

    // Detect credential stuffing across IPs
    for (const [credKey, credEvents] of credentialMap.entries()) {
      const validEvents = credEvents.filter(e => e.src_ip !== 'unknown' && e.timestamp !== null);
      const uniqueIPs = new Set(validEvents.map(e => e.src_ip));
      
      if (uniqueIPs.size >= 2) {
        const [username, password] = credKey.split(':');
        const timestamps = validEvents.map(e => e.timestamp).filter(Boolean).sort((a, b) => a - b);
        
        const startTime = timestamps[0];
        const endTime = timestamps[timestamps.length - 1];
        const duration = SummarizerUtils.calculateDuration(startTime, endTime);

        // Use the actual IPs in the summary, not "unknown"
        const actualIPs = Array.from(uniqueIPs).filter(ip => ip !== 'unknown');
        
        // For credential stuffing, use the first IP as src_ip (truncated if needed)
        const mainIP = actualIPs.length > 0 ? SummarizerUtils.truncateIP(actualIPs[0]) : 'unknown';
        
        campaigns.push({
          session: SummarizerUtils.generateShortId('cred'),
          src_ip: mainIP, // Use first IP (truncated to 45 chars)
          start: SummarizerUtils.safeISOString(startTime),
          end: SummarizerUtils.safeISOString(endTime),
          duration_seconds: duration,
          purpose: 'SSH Credential Stuffing Across IPs',
          severity: 'High',
          summary: `Credential reuse: '${username}' with password '${password}' across ${actualIPs.length} IPs: ${actualIPs.join(', ')}`
        });
      }
    }

    return campaigns;
  }

  static detectBruteForce(sessionGroups) {
    const campaigns = [];
    const ipSessions = new Map();

    // Group sessions by IP
    for (const [sessionId, sessionEvents] of sessionGroups) {
      const analysis = SessionAnalyzer.analyze(sessionEvents);
      if (analysis.src_ip !== 'unknown' && analysis.startTime !== null) {
        if (!ipSessions.has(analysis.src_ip)) {
          ipSessions.set(analysis.src_ip, []);
        }
        ipSessions.get(analysis.src_ip).push(analysis);
      }
    }

    // Detect brute force per IP
    for (const [ip, sessions] of ipSessions.entries()) {
      // Filter out sessions without valid startTime and sort by startTime
      const validSessions = sessions.filter(s => s.startTime !== null)
                                   .sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
      
      let windowStart = 0;
      for (let i = 0; i < validSessions.length; i++) {
        const currentTime = validSessions[i].startTime;
        if (!currentTime) continue;

        // Move window start based on time window
        while (windowStart < i && 
               SummarizerUtils.calculateDuration(validSessions[windowStart].startTime, currentTime) > config.BRUTE_WINDOW_SEC) {
          windowStart++;
        }

        const windowSessions = validSessions.slice(windowStart, i + 1);
        const totalFailed = windowSessions.reduce((sum, s) => sum + s.failedLoginCount, 0);
        const totalSuccess = windowSessions.reduce((sum, s) => sum + s.successLoginCount, 0);

        if (totalFailed >= config.BRUTE_THRESHOLD || (totalFailed >= 2 && totalSuccess === 0)) {
          const startTime = windowSessions[0].startTime;
          const endTime = windowSessions[windowSessions.length - 1].startTime;
          const duration = SummarizerUtils.calculateDuration(startTime, endTime);

          // Skip if we don't have valid start/end times
          if (!startTime || !endTime) {
            windowStart = i + 1;
            continue;
          }

          let purpose, summary;
          if (totalFailed >= 3 && totalSuccess === 0) {
            purpose = 'SSH Brute Force Attack';
            summary = `Multiple failed login attempts (${totalFailed}) from ${ip} within ${Math.round(duration || 0)} seconds`;
          } else {
            purpose = 'Suspicious SSH Activity';
            summary = `Unusual login pattern: ${totalFailed} failed and ${totalSuccess} successful logins from ${ip} within ${Math.round(duration || 0)} seconds - indicates possible credential testing`;
          }

          campaigns.push({
            session: SummarizerUtils.generateShortId('brute'),
            src_ip: SummarizerUtils.truncateIP(ip), // Truncate IP to 45 chars
            start: SummarizerUtils.safeISOString(startTime),
            end: SummarizerUtils.safeISOString(endTime),
            duration_seconds: duration,
            purpose: purpose,
            severity: 'High',
            summary: summary
          });

          windowStart = i + 1;
        }
      }
    }

    return campaigns;
  }
}

class Summarizer {
  constructor() {
    this.client = new Client({
      host: config.DB_HOST,
      port: config.DB_PORT,
      database: config.DB_NAME,
      user: config.DB_USER,
      password: config.DB_PASSWORD
    });
  }

  async initialize() {
    try {
      await this.client.connect();
      await this.ensureSchema();
      return true;
    } catch (error) {
      console.error('Failed to initialize summarizer:', error.message);
      return false;
    }
  }

  async ensureSchema() {
    try {
      await this.client.query(`
        CREATE TABLE IF NOT EXISTS summaries (
          id SERIAL PRIMARY KEY,
          session VARCHAR(255) NOT NULL,
          src_ip VARCHAR(45) NOT NULL,
          start TIMESTAMP NULL,
          "end" TIMESTAMP NULL,
          duration_seconds NUMERIC(10,3) NULL,
          purpose VARCHAR(100) NOT NULL,
          severity VARCHAR(10) NOT NULL,
          summary TEXT NOT NULL
        );
      `);
      
      await this.client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS summaries_session_unique 
        ON summaries(session);
      `);
      
      await this.client.query(`
        DO $$ 
        BEGIN 
          ALTER TABLE cowrie_json_sessions ADD COLUMN IF NOT EXISTS is_summarized BOOLEAN DEFAULT FALSE;
        EXCEPTION 
          WHEN undefined_column THEN 
            ALTER TABLE cowrie_json_sessions ADD COLUMN is_summarized BOOLEAN DEFAULT FALSE;
        END $$;
      `);
      
      console.log('[INFO] Database schema verified');
    } catch (error) {
      console.error('Failed to ensure schema:', error.message);
      throw error;
    }
  }

  async getUnsummarizedEvents() {
    const limitClause = config.LIMIT ? `LIMIT ${config.LIMIT}` : '';
    const query = `
      SELECT id, timestamp, event_type, src_ip, session, raw 
      FROM cowrie_json_sessions 
      WHERE is_summarized IS NOT TRUE 
      ORDER BY session, timestamp ASC 
      ${limitClause};
    `;

    try {
      const result = await this.client.query(query);
      console.log(`[INFO] Found ${result.rows.length} unsummarized events`);
      return result.rows;
    } catch (error) {
      console.error('Failed to query events:', error.message);
      throw error;
    }
  }

  processEvents(events) {
    console.log('[INFO] Processing events...');
    
    return events.map(row => {
      let rawData = {};
      try {
        rawData = typeof row.raw === 'object' ? row.raw : JSON.parse(row.raw || '{}');
      } catch (e) {
        rawData = {};
      }

      return {
        id: row.id,
        timestamp: row.timestamp,
        event_type: row.event_type,
        src_ip: SummarizerUtils.truncateIP(row.src_ip), // Truncate IP to 45 chars
        session: row.session, // Use ACTUAL session from database
        raw_obj: rawData,
        input: rawData.input || null,
        username: rawData.username || null,
        password: rawData.password || null
      };
    });
  }

  groupEventsBySession(events) {
    console.log('[INFO] Grouping events by session...');
    const sessionGroups = new Map();
    
    for (const event of events) {
      if (!event.session || event.session === 'unknown') continue;
      
      if (!sessionGroups.has(event.session)) {
        sessionGroups.set(event.session, []);
      }
      sessionGroups.get(event.session).push(event);
    }
    
    // Sort events within each session by timestamp
    for (const [sessionId, sessionEvents] of sessionGroups) {
      sessionEvents.sort((a, b) => {
        const timeA = SummarizerUtils.parseTime(a.timestamp);
        const timeB = SummarizerUtils.parseTime(b.timestamp);
        return (timeA || 0) - (timeB || 0);
      });
    }
    
    console.log(`[INFO] Grouped events into ${sessionGroups.size} sessions`);
    return sessionGroups;
  }

  generateSummaries(events) {
    console.log('[INFO] Generating summaries...');
    const sessionGroups = this.groupEventsBySession(events);
    const summaries = [];

    // Detect campaigns first
    console.log('[INFO] Detecting attack campaigns...');
    const credentialCampaigns = CampaignDetector.detectCredentialStuffing(sessionGroups);
    const bruteForceCampaigns = CampaignDetector.detectBruteForce(sessionGroups);
    
    const campaigns = [...credentialCampaigns, ...bruteForceCampaigns];
    const campaignSessions = new Set(campaigns.map(c => c.session));

    // Add campaign summaries
    campaigns.forEach(campaign => {
      summaries.push(campaign);
      console.log(`[CAMPAIGN] ${campaign.summary}`);
    });

    // Process individual sessions not in campaigns
    console.log(`[INFO] Processing ${sessionGroups.size - campaignSessions.size} individual sessions...`);
    
    for (const [sessionId, sessionEvents] of sessionGroups) {
      if (campaignSessions.has(sessionId)) continue;

      const analysis = SessionAnalyzer.analyze(sessionEvents);
      const summaryInfo = SessionAnalyzer.generateSummary(analysis);

      // Ensure we use the actual IP from the database, not 'unknown'
      const actualIP = analysis.src_ip !== 'unknown' ? SummarizerUtils.truncateIP(analysis.src_ip) : 'unknown';

      summaries.push({
        session: sessionId,
        src_ip: actualIP, // Use actual IP from database (truncated)
        start: SummarizerUtils.safeISOString(analysis.startTime),
        end: SummarizerUtils.safeISOString(analysis.endTime),
        duration_seconds: analysis.duration,
        purpose: summaryInfo.purpose,
        severity: summaryInfo.severity,
        summary: summaryInfo.summary
      });

      console.log(`[SESSION] ${sessionId} (${actualIP}): ${summaryInfo.purpose} - ${summaryInfo.summary}`);
    }

    return summaries;
  }

  async saveSummaries(summaries, processedEventIds) {
    console.log('[INFO] Saving summaries to database...');
    
    if (summaries.length === 0) {
      console.log('[INFO] No summaries to save');
      return { success: 0, failed: 0 };
    }

    const insertSql = `
      INSERT INTO summaries (session, src_ip, start, "end", duration_seconds, purpose, severity, summary)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (session) DO UPDATE
        SET src_ip = EXCLUDED.src_ip,
            start = EXCLUDED.start,
            "end" = EXCLUDED."end",
            duration_seconds = EXCLUDED.duration_seconds,
            purpose = EXCLUDED.purpose,
            severity = EXCLUDED.severity,
            summary = EXCLUDED.summary
    `;

    let successfulInserts = 0;
    let failedInserts = 0;

    for (const summary of summaries) {
      try {
        await this.client.query(insertSql, [
          summary.session,
          summary.src_ip, // This now contains truncated IPs
          summary.start,
          summary.end,
          summary.duration_seconds,
          summary.purpose,
          summary.severity,
          summary.summary
        ]);
        successfulInserts++;
      } catch (error) {
        failedInserts++;
        console.error(`Insert failed for session ${summary.session}:`, error.message);
        
        // If it's still too long, use a fallback
        if (error.message.includes('value too long')) {
          try {
            await this.client.query(insertSql, [
              summary.session,
              'multiple_ips', // Fallback value
              summary.start,
              summary.end,
              summary.duration_seconds,
              summary.purpose,
              summary.severity,
              summary.summary
            ]);
            successfulInserts++;
            failedInserts--;
            console.log(`[RETRY] Success with fallback IP for session: ${summary.session}`);
          } catch (retryError) {
            console.error(`Retry also failed for session ${summary.session}:`, retryError.message);
          }
        }
      }
    }

    // Update is_summarized flags
    if (processedEventIds.length > 0 && successfulInserts > 0) {
      console.log(`[INFO] Updating is_summarized flags for ${processedEventIds.length} events...`);
      
      for (let i = 0; i < processedEventIds.length; i += config.BATCH_SIZE) {
        const batch = processedEventIds.slice(i, i + config.BATCH_SIZE);
        try {
          await this.client.query(`
            UPDATE cowrie_json_sessions 
            SET is_summarized = TRUE 
            WHERE id = ANY($1)
          `, [batch]);
        } catch (error) {
          console.error(`Failed to update batch:`, error.message);
        }
      }
      console.log('[INFO] Completed updating is_summarized flags');
    }

    return { success: successfulInserts, failed: failedInserts };
  }

  async close() {
    try {
      await this.client.end();
      console.log('[INFO] Database connection closed');
    } catch (error) {
      console.error('Error closing connection:', error.message);
    }
  }
}

// Main execution
async function main() {
  console.log('[INFO] Starting summarizer...');
  
  const summarizer = new Summarizer();
  
  try {
    if (!await summarizer.initialize()) {
      process.exit(1);
    }

    const eventRows = await summarizer.getUnsummarizedEvents();
    
    if (eventRows.length === 0) {
      console.log('[INFO] No unsummarized events found');
      await summarizer.close();
      process.exit(0);
    }

    const processedEvents = summarizer.processEvents(eventRows);
    const processedEventIds = processedEvents.map(ev => ev.id);

    const summaries = summarizer.generateSummaries(processedEvents);
    console.log(`[INFO] Generated ${summaries.length} summaries`);

    const result = await summarizer.saveSummaries(summaries, processedEventIds);
    
    const successRate = (result.success / summaries.length * 100).toFixed(1);
    console.log(`[SUMMARY] Completed: ${result.success}/${summaries.length} inserts (${successRate}% success rate)`);
    
    if (result.failed > 0) {
      console.log(`[WARNING] ${result.failed} inserts failed`);
      process.exit(1);
    } else {
      console.log('[SUCCESS] All operations completed successfully');
      process.exit(0);
    }

  } catch (error) {
    console.error('Fatal error in summarizer:', error);
    process.exit(2);
  } finally {
    await summarizer.close();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(2);
  });
}

module.exports = Summarizer;
