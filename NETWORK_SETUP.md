# Network Setup Guide

## For Local Network Testing (Friends on Same WiFi)

### Step 1: Find Your Local IP Address
**Windows:**
1. Open Command Prompt
2. Run: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x or 10.0.x.x)

**Example:** `192.168.1.100`

### Step 2: Update Your `.env` File
Replace `localhost` with your IP address:

```env
# PostgreSQL Database (keep localhost - only server needs this)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=postgres

# Application
PORT=4001
VITE_SERVER_URL=http://192.168.1.100:4001  # <-- YOUR IP HERE

# Socket.io
VITE_SOCKET_URL=http://192.168.1.100  # <-- YOUR IP HERE
VITE_SOCKET_PORT=4001
VITE_CLIENT_URL=http://192.168.1.100  # <-- YOUR IP HERE
VITE_CLIENT_PORT=5173
```

### Step 3: Configure Server to Accept External Connections
Update your server to listen on all network interfaces:

**In your server code** (usually `server/src/index.ts` or similar):
```typescript
// Change from:
app.listen(4001, 'localhost', ...)

// To:
app.listen(4001, '0.0.0.0', ...)
// 0.0.0.0 means "listen on all network interfaces"
```

### Step 4: Configure Firewall
Allow incoming connections on ports 4001 and 5173:

**Windows:**
1. Open "Windows Defender Firewall"
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Choose "Port" → TCP → Specific ports: `4001,5173`
5. Allow the connection
6. Apply to all profiles (Domain, Private, Public)
7. Name it "Game Room Dev Server"

**Or use PowerShell (as Administrator):**
```powershell
New-NetFirewallRule -DisplayName "Game Room Dev Server" -Direction Inbound -LocalPort 4001,5173 -Protocol TCP -Action Allow
```

### Step 5: Restart Your Dev Servers
```bash
# Stop all running servers (Ctrl+C)
# Then restart:
npm run dev
```

### Step 6: Share URL with Friends
Your friends should access:
- Frontend: `http://192.168.1.100:5173`
- They'll automatically connect to the backend and WebSocket

## For Internet Testing (Friends on Different Networks)

You'll need to expose your local server to the internet using one of these options:

### Option 1: ngrok (Easiest)
```bash
# Install ngrok: https://ngrok.com/download
# Expose port 4001:
ngrok http 4001

# ngrok will give you a URL like: https://abc123.ngrok.io
# Update your .env:
VITE_SERVER_URL=https://abc123.ngrok.io
VITE_SOCKET_URL=https://abc123.ngrok.io
```

### Option 2: Cloudflare Tunnel
```bash
# Install: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/
cloudflared tunnel --url http://localhost:4001
```

### Option 3: Port Forwarding (Advanced)
1. Log into your router
2. Forward port 4001 to your computer's local IP
3. Find your public IP: https://whatismyipaddress.com
4. Use your public IP in the .env file
5. ⚠️ **Security Warning:** This exposes your server to the internet!

## Testing Checklist

- [ ] Updated `.env` with correct IP addresses
- [ ] Fixed hardcoded `localhost` in `api.ts` (already done ✅)
- [ ] Server listening on `0.0.0.0` instead of `localhost`
- [ ] Firewall allows ports 4001 and 5173
- [ ] Restarted dev servers after .env changes
- [ ] Can access `http://YOUR_IP:5173` from another device
- [ ] Can create account and login from another device

## Troubleshooting

**"Connection refused" or "Cannot connect":**
- Check firewall settings
- Verify server is running
- Make sure you're using the correct IP address
- Ensure both devices are on the same WiFi network

**"Mixed content" error:**
- Use HTTPS with ngrok/Cloudflare tunnel
- Or ensure all URLs use HTTP (not HTTPS)

**Changes not reflected:**
- Restart dev server after .env changes
- Clear browser cache
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
