# yolosint-wayfinder-ui

A stealthy web-based archive explorer for the YOLOSINT toolkit.

## Features
- Fetch and explore archived URLs from the Wayback Machine
- Build nested tree views of historical domains
- Archive your investigations into a browsable history
- Config-driven and easy to launch

## Setup
1. Install any static file server (e.g. serve)
   ```bash
   npm install -g serve
   ```

2. Run the server:
   ```bash
   serve .
   ```

3. Open in your browser:
   ```
   http://localhost:5000
   ```

Edit `config.json` to change the default domain, limits, or blocklist.
