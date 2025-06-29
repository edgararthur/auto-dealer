# Authentication Debug Guide

## Quick Fixes to Try:

1. **Hard refresh**: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
2. **Clear browser data**: localStorage.clear() in console
3. **Check console**: Look for AuthContext logs and errors
4. **Wait 10 seconds**: Timeout should show retry button

## If still stuck, try bypassing auth temporarily:
Edit src/contexts/AuthContext.jsx line 20:
const [loading, setLoading] = useState(false); // Change true to false

This will skip authentication for testing.
