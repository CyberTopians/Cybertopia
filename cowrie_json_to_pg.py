#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import time
import json
import signal
import sys
from pathlib import Path

import psycopg2
from psycopg2 import pool, extras
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# ----------------------------
# Configuration
# ----------------------------
LOG_FILE = "/home/cowrie/var/log/cowrie/cowrie.json"
DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "cowrie"
DB_USER = "cowrie"
DB_PASSWORD = "cybertopia"
TABLE_NAME = "public.cowrie_json_sessions"

POOL_MINCONN = 1
POOL_MAXCONN = 5

# ----------------------------
# Create / manage connection pool
# ----------------------------
def create_pool():
    try:
        return psycopg2.pool.SimpleConnectionPool(
            POOL_MINCONN, POOL_MAXCONN,
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
    except Exception as e:
        print("FATAL: Could not create Postgres connection pool:", e)
        raise

pg_pool = create_pool()

# Ensure table exists
def ensure_table():
    conn = None
    try:
        conn = pg_pool.getconn()
        cur = conn.cursor()
        cur.execute(f"""
        CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
            id SERIAL PRIMARY KEY,
            event_type TEXT,
            timestamp TIMESTAMP WITH TIME ZONE,
            src_ip TEXT,
            src_port INTEGER,
            username TEXT,
            password TEXT,
            session TEXT,
            raw JSONB
        )
        """)
        conn.commit()
        cur.close()
    except Exception as e:
        print("Error ensuring table exists:", e)
        if conn:
            pg_pool.putconn(conn, close=True)
            conn = None
    finally:
        if conn:
            pg_pool.putconn(conn)

# ----------------------------
# Insert function
# ----------------------------
def insert_event(event):
    """
    Safely insert event. Uses psycopg2.extras.Json to store JSONB.
    Keeps pool healthy by closing broken connections.
    """
    conn = None
    try:
        conn = pg_pool.getconn()
        cur = conn.cursor()
        cur.execute(f"""
            INSERT INTO {TABLE_NAME}
            (event_type, timestamp, src_ip, src_port, username, password, session, raw)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            event.get("eventid"),
            event.get("timestamp"),
            event.get("src_ip"),
            event.get("src_port"),
            event.get("username"),
            event.get("password"),
            event.get("session"),
            extras.Json(event)   # adapt to JSONB
        ))
        conn.commit()
        cur.close()
        print(f"[DB] Inserted event: {event.get('eventid')} (session: {event.get('session')})")
    except Exception as e:
        print("[ERROR] inserting event:", e)
        # If connection is in a bad state, close it
        if conn:
            try:
                pg_pool.putconn(conn, close=True)
            except Exception:
                pass
            conn = None
    finally:
        if conn:
            try:
                pg_pool.putconn(conn)
            except Exception as e:
                print("[WARN] Failed to return connection to pool:", e)

# ----------------------------
# Watchdog handler + rotation detection
# ----------------------------
class CowrieLogHandler(FileSystemEventHandler):
    def __init__(self, logfile_path):
        super().__init__()
        self.logfile_path = logfile_path
        self._position = 0
        self._inode = None
        self._ensure_initial_position()

    def _ensure_initial_position(self):
        """
        When starting, set initial position to EOF so we don't reprocess the whole log.
        If you want to start from beginning, set self._position = 0 explicitly.
        """
        try:
            if os.path.exists(self.logfile_path):
                st = os.stat(self.logfile_path)
                self._inode = st.st_ino
                # start at EOF to avoid reprocessing existing historical entries
                self._position = st.st_size
                print(f"[INIT] Log exists. Starting at EOF (pos={self._position}, inode={self._inode})")
            else:
                self._position = 0
                self._inode = None
                print("[INIT] Log does not exist yet. Waiting for creation.")
        except Exception as e:
            print("[WARN] Initial position setup error:", e)
            self._position = 0
            self._inode = None

    def on_modified(self, event):
        # Only care about modifications to the target log file
        try:
            if os.path.abspath(event.src_path) != os.path.abspath(self.logfile_path):
                return
        except Exception:
            return

        self._process_log_file()

    def on_created(self, event):
        # If the log file is created, start reading it
        try:
            if os.path.abspath(event.src_path) == os.path.abspath(self.logfile_path):
                print("[EVENT] Log file created:", self.logfile_path)
                # reset inode/position for new file
                self._inode = None
                self._position = 0
                self._process_log_file()
        except Exception:
            pass

    def _process_log_file(self):
        try:
            if not os.path.exists(self.logfile_path):
                return

            st = os.stat(self.logfile_path)
            # rotation/truncation detection: inode changed or size < stored position
            if self._inode is None:
                self._inode = st.st_ino

            if st.st_ino != self._inode:
                # file rotated/replaced
                print(f"[ROTATION] Detected rotation/new file. Old inode != new inode ({self._inode} -> {st.st_ino})")
                self._inode = st.st_ino
                self._position = 0

            if st.st_size < self._position:
                # file truncated (e.g., logrotate)
                print(f"[TRUNCATION] File was truncated (size {st.st_size} < pos {self._position}). Resetting pos to 0.")
                self._position = 0

            with open(self.logfile_path, "r", encoding="utf-8", errors="replace") as f:
                f.seek(self._position)
                read_any = False
                for line in f:
                    read_any = True
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        data = json.loads(line)
                        insert_event(data)
                    except json.JSONDecodeError:
                        # Malformed JSON line -- print a shortened preview
                        print(f"[WARN] Skipping bad JSON (preview): {line[:160]}")
                    except Exception as e:
                        print("[ERROR] Unexpected error processing line:", e)
                # update position only after successful read loop
                new_pos = f.tell()
                if read_any:
                    print(f"[INFO] Advanced file position {self._position} -> {new_pos}")
                self._position = new_pos
        except FileNotFoundError:
            # log file was removed between exists check and open
            print("[WARN] Log file disappeared while trying to read it.")
            self._inode = None
            self._position = 0
        except PermissionError as e:
            print("[ERROR] Permission denied reading log file:", e)
        except Exception as e:
            print("[ERROR] Unexpected error in _process_log_file:", e)

# ----------------------------
# Main / startup / graceful shutdown
# ----------------------------
def main():
    ensure_table()
    print("Monitoring Cowrie JSON log and forwarding to PostgreSQL...")

    handler = CowrieLogHandler(LOG_FILE)
    observer = Observer()

    watch_dir = os.path.dirname(LOG_FILE) or "."
    observer.schedule(handler, path=watch_dir, recursive=False)

    # handle SIGTERM/SIGINT to gracefully stop
    stop_requested = {"flag": False}
    def _signal_handler(signum, frame):
        print(f"\n[SHUTDOWN] Signal {signum} received, stopping...")
        stop_requested["flag"] = True
        observer.stop()

    signal.signal(signal.SIGINT, _signal_handler)
    signal.signal(signal.SIGTERM, _signal_handler)

    observer.start()
    try:
        # Keep main loop simple; Watchdog runs in background threads
        while not stop_requested["flag"]:
            time.sleep(1)
    except KeyboardInterrupt:
        print("[SHUTDOWN] KeyboardInterrupt received.")
        observer.stop()
    finally:
        observer.join(timeout=5)
        try:
            if pg_pool:
                pg_pool.closeall()
                print("[DB] Connection pool closed.")
        except Exception as e:
            print("[WARN] Error closing DB pool:", e)

if __name__ == "__main__":
    main()
