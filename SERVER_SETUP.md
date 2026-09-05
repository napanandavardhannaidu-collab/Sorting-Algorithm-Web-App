# 🚀 SortBench Server - 24/7 Setup Guide

## ✅ What's Installed

Your SortBench app is now configured to run **24/7** even when VS Code is closed using PM2 (Process Manager for Node.js).

### Current Status
- **Server**: Running via PM2
- **URL**: `http://localhost:3000/`
- **Network Access**: `http://YOUR_IP:3000/`
- **Status**: Production build (optimized & fast)

---

## 📋 Setup Instructions

### Option 1: Auto-Start on Windows Boot (Recommended)

1. **Copy the batch file to Windows Startup folder:**
   ```
   Copy: start-sortbench-server.bat
   To: C:\Users\prash\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
   ```

2. **Restart your computer** - Server will auto-start automatically

3. **Verify it's running:**
   ```powershell
   npx pm2 status
   ```

### Option 2: Manual Start After Closing VS Code

If you didn't set up auto-start, run this command:
```powershell
cd C:\Users\prash\Downloads\sorting algo web app
npx pm2 resurrect
```

---

## 🎮 Managing the Server

### Check Server Status
```powershell
npx pm2 status
```

### View Server Logs
```powershell
npx pm2 logs sorting-app-server
```

### Stop the Server
```powershell
npx pm2 stop sorting-app-server
```

### Restart the Server
```powershell
npx pm2 restart sorting-app-server
```

### Delete the Server (permanent removal)
```powershell
npx pm2 delete sorting-app-server
```

---

## 🌐 Access from Other Devices

### Find Your Computer's IP Address
```powershell
ipconfig
```
Look for "IPv4 Address" under your network adapter (usually starts with 192.168.x.x or 10.x.x.x)

### Access from Other Devices
- **Same Network (recommended)**: `http://YOUR_IP:3000/`
  - Example: `http://192.168.1.100:3000/`
  
- **Same Computer (localhost)**: `http://localhost:3000/`

- **Port Forwarding (advanced)**: If you want to access from outside your network:
  - Requires router configuration
  - Not recommended for security reasons

---

## 📊 Server Specifications

- **Framework**: Express.js (lightweight & fast)
- **Build**: Optimized production build (Vite)
- **Memory**: ~50-60 MB
- **Port**: 3000 (fixed)
- **Auto-restart**: Yes (if crashes, auto-restarts)
- **Max Memory**: 500 MB (auto-restarts if exceeded)

---

## 🔍 Troubleshooting

### Server won't start
```powershell
# Kill all node processes
taskkill /IM node.exe /F

# Restart
npx pm2 start ecosystem.config.cjs
```

### Port 3000 already in use
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID YOUR_PID /F
```

### Can't access from other devices
1. Make sure firewall allows port 3000
2. Check if server is running: `npx pm2 status`
3. Verify IP address: `ipconfig`
4. Try: `http://192.168.x.x:3000/` (not just localhost)

---

## 📝 Files Created

- `ecosystem.config.cjs` - PM2 configuration
- `server.mjs` - Express server (production)
- `start-sortbench-server.bat` - Windows auto-start script
- `dist/` - Production build (optimized static files)

---

## 🎯 Next Steps

1. **Set up auto-start** (copy batch file to Startup folder)
2. **Find your IP address** (`ipconfig` command)
3. **Test access** from another device: `http://YOUR_IP:3000/`
4. **Verify logs** if having issues: `npx pm2 logs sorting-app-server`

---

## 💡 Tips

- Server runs in background - no terminal needed
- Multiple users on same network can access simultaneously
- If you make code changes, rebuild: `npm run build`
- PM2 automatically restarts if server crashes
- Check logs for debugging: `npx pm2 logs sorting-app-server --lines 100`

---

**Your SortBench app is now production-ready and running 24/7!** 🎉
