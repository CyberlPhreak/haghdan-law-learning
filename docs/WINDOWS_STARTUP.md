# Windows startup and dependency recovery

Use the repository folder with the committed `package-lock.json`:

```powershell
npm ci
npm run typecheck
npm test
npm run test:bilingual
npm run web -- --clear
```

The default development preview is `http://127.0.0.1:8084/`.

## Missing Expo plugins or an install that stops replacing packages

A missing `expo-web-browser` plugin is usually an incomplete installation, not a reason to remove the plugin from app configuration. This project declares the native packages it imports, including `expo-linking`.

On this Windows workstation, Controlled Folder Access blocked Node.js and Git from writing inside the Documents project directory. npm stalled replacing packages; Git fetch reported that it could not create a temporary pack file even though the directory existed.

To diagnose this specific case, inspect **Windows Security → Virus & threat protection → Protection history** for a blocked write to this repository. Confirm the executable and target path. With the owner's approval, use **Ransomware protection → Allow an app through Controlled folder access** for only the trusted executable shown by the event. Node version-manager installations and Git may use an underlying executable path different from the command shim on PATH.

Do not disable Defender, exclude the entire drive, or allow arbitrary executables. These app exceptions allow those tools to write to protected folders, so only the machine owner should approve them. Administrator approval is required; ordinary terminal sandbox elevation is not necessarily Windows administrator elevation.

After resolving the verified block, reinstall dependencies and rerun the checks above. Do not start a second installer while one is still running. Never delete application source, saved learner data, or `.git` as an installation repair.
