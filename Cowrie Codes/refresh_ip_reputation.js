require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const ABUSE_API_KEY = process.env.ABUSEIPDB_API_KEY;
const IPINFO_TOKEN  = process.env.IPINFO_TOKEN;
const SHODAN_KEY    = process.env.SHODAN_API_KEY;

async function abuseipdbLookup(ip) {
  try {
    const url = `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90&verbose=true`;
    const resp = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Key: ABUSE_API_KEY,
      },
    });
    if (!resp.ok) {
      console.warn(`AbuseIPDB lookup failed for ${ip}: ${resp.status}`);
      return {
        abuse_score: null,
        abuse_reports: null,
        abuse_country: null,
        abuse_isp: null,
        abuse_domain: null,
        abuse_hostnames: null,
      };
    }
    const data = await resp.json();
    const d = data.data || {};

    return {
      abuse_score: d.abuseConfidenceScore ?? null,
      abuse_reports: d.totalReports ?? null,
      abuse_country: d.countryCode ?? null,
      abuse_isp: d.isp ?? null,
      abuse_domain: d.domain ?? null,
      abuse_hostnames: Array.isArray(d.hostnames) ? d.hostnames : null,
    };
  } catch (e) {
    console.error('AbuseIPDB error for', ip, e);
    return {
      abuse_score: null,
      abuse_reports: null,
      abuse_country: null,
      abuse_isp: null,
      abuse_domain: null,
      abuse_hostnames: null,
    };
  }
}

async function ipinfoLookup(ip) {
  try {
    const url = `https://ipinfo.io/${encodeURIComponent(ip)}?token=${IPINFO_TOKEN}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      console.warn(`IPinfo lookup failed ${ip}:`, resp.status);
      return { asn: null, asn_name: null, org: null, city: null };
    }
    const data = await resp.json();
    return {
      asn: data?.asn?.asn ?? null,
      asn_name: data?.asn?.name ?? null,
      org: data?.org ?? null,
      city: data?.city ?? null,
    };
  } catch (e) {
    console.error('IPinfo error for', ip, e);
    return { asn: null, asn_name: null, org: null, city: null };
  }
}

async function shodanLookup(ip) {
  if (!SHODAN_KEY) {
    return {
      shodan_ports: null,
      shodan_hostnames: null,
      shodan_org: null,
      shodan_isp: null,
      shodan_os: null,
      shodan_last_update: null,
      shodan_lat: null,
      shodan_lon: null,
      shodan_vulns: null,
    };
  }
  try {
    const endpoint = `https://api.shodan.io/shodan/host/${encodeURIComponent(ip)}?key=${encodeURIComponent(SHODAN_KEY)}`;
    const resp = await fetch(endpoint);
    if (!resp.ok) {
      console.warn(`Shodan lookup failed for ${ip}: ${resp.status}`);
      return {
        shodan_ports: null,
        shodan_hostnames: null,
        shodan_org: null,
        shodan_isp: null,
        shodan_os: null,
        shodan_last_update: null,
        shodan_lat: null,
        shodan_lon: null,
        shodan_vulns: null,
      };
    }
    const data = await resp.json();

    const ports = Array.isArray(data.ports) ? data.ports : [];
    const hostnames = Array.isArray(data.hostnames) ? data.hostnames : [];
    const org = data.org || data.organization || null;
    const isp = data.isp || null;
    const os = data.os || null;
    const lastUpdate = data.last_update ? new Date(data.last_update) : null;
    const latitude = data.latitude ?? data.location?.latitude ?? null;
    const longitude = data.longitude ?? data.location?.longitude ?? null;

    const vulnsSet = new Set();
    if (data.vulns && typeof data.vulns === 'object') {
      Object.keys(data.vulns).forEach(v => vulnsSet.add(v));
    }
    if (Array.isArray(data.data)) {
      for (const svc of data.data) {
        if (svc.vulns && typeof svc.vulns === 'object') {
          Object.keys(svc.vulns).forEach(v => vulnsSet.add(v));
        }
      }
    }
    const vulns = Array.from(vulnsSet);

    return {
      shodan_ports: ports.length ? ports : null,
      shodan_hostnames: hostnames.length ? hostnames : null,
      shodan_org: org,
      shodan_isp: isp,
      shodan_os: os,
      shodan_last_update: lastUpdate,
      shodan_lat: latitude,
      shodan_lon: longitude,
      shodan_vulns: vulns.length ? vulns : null,
    };
  } catch (e) {
    console.error('Shodan error for', ip, e);
    return {
      shodan_ports: null,
      shodan_hostnames: null,
      shodan_org: null,
      shodan_isp: null,
      shodan_os: null,
      shodan_last_update: null,
      shodan_lat: null,
      shodan_lon: null,
      shodan_vulns: null,
    };
  }
}

async function refreshIPs() {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT src_ip
      FROM cowrie_json_sessions
      WHERE src_ip IS NOT NULL
    `);

    for (const row of rows) {
      const ip = row.src_ip;
      console.log(`Refreshing ${ip}...`);

      const [abuse, info, shodan] = await Promise.all([
        abuseipdbLookup(ip),
        ipinfoLookup(ip),
        shodanLookup(ip),
      ]);

      await pool.query(
        `
        INSERT INTO report (
          ip, abuse_score, abuse_reports, abuse_country,
          abuse_isp, abuse_domain, abuse_hostnames,
          asn, asn_name, org, city,
          shodan_ports, shodan_hostnames, shodan_org, shodan_isp, shodan_os, shodan_last_update,
          shodan_lat, shodan_lon, shodan_vulns,
          created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4,
          $5, $6, $7,
          $8, $9, $10, $11,
          $12, $13, $14, $15, $16, $17,
          $18, $19, $20,
          NOW(), NOW()
        )
        ON CONFLICT (ip) DO UPDATE SET
          abuse_score = EXCLUDED.abuse_score,
          abuse_reports = EXCLUDED.abuse_reports,
          abuse_country = EXCLUDED.abuse_country,
          abuse_isp = EXCLUDED.abuse_isp,
          abuse_domain = EXCLUDED.abuse_domain,
          abuse_hostnames = EXCLUDED.abuse_hostnames,
          asn = EXCLUDED.asn,
          asn_name = EXCLUDED.asn_name,
          org = EXCLUDED.org,
          city = EXCLUDED.city,
          shodan_ports = EXCLUDED.shodan_ports,
          shodan_hostnames = EXCLUDED.shodan_hostnames,
          shodan_org = EXCLUDED.shodan_org,
          shodan_isp = EXCLUDED.shodan_isp,
          shodan_os = EXCLUDED.shodan_os,
          shodan_last_update = EXCLUDED.shodan_last_update,
          shodan_lat = EXCLUDED.shodan_lat,
          shodan_lon = EXCLUDED.shodan_lon,
          shodan_vulns = EXCLUDED.shodan_vulns,
          updated_at = NOW()
        `,
        [
          ip,
          abuse.abuse_score, abuse.abuse_reports, abuse.abuse_country,
          abuse.abuse_isp, abuse.abuse_domain, abuse.abuse_hostnames,
          info.asn, info.asn_name, info.org, info.city,
          shodan.shodan_ports, shodan.shodan_hostnames, shodan.shodan_org, shodan.shodan_isp, shodan.shodan_os, shodan.shodan_last_update,
          shodan.shodan_lat, shodan.shodan_lon, shodan.shodan_vulns
        ]
      );

      console.log(`Updated report for ${ip}`);
    }
  } catch (err) {
    console.error('Error fetching IPs:', err);
  } finally {
    await pool.end();
  }
}

refreshIPs();
