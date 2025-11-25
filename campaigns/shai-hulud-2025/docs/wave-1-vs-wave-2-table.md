# Shai-Hulud: Wave 1 vs Wave 2 Comparison

## Quick Reference Table

| Capability | Wave 1 (Sept 2025) | Wave 2 (Nov 2025) | Impact |
|------------|-------------------|-------------------|--------|
| **Timeline** | Sept 8-15, 2025 | Nov 21-24, 2025 | - |
| **Lifecycle Hook** | `postinstall` | `preinstall` | Earlier execution, harder to audit |
| **Runtime** | Node.js (victim's) | Bun (bundled BYOR) | Evades Node.js security monitoring |
| **Package Count** | ~180-500 | Unknown (repo-based) | Scale shifted to exfil infrastructure |
| **Exfil Repos** | 1 ("Shai-Hulud") | 25,000-28,000+ | Massive redundancy, takedown-resistant |
| **Repo Identification** | Repo name | Description: "Sha1-Hulud: The Second Coming" | Programmatic identification |
| **CI/CD Targeting** | No | Yes (GitHub Actions) | Persistent infrastructure access |
| **Runner Name** | N/A | `SHA1HULUD` | Self-hosted runner compromise |
| **Dead Man's Switch** | No | Yes (`rm -rf ~`) | Anti-forensics, evidence destruction |
| **Secrets Exfiltrated** | ~3,000-5,000 | 14,000+ unique | 3-4x increase in yield |

## Technical Evolution Diagram

```
Wave 1 Architecture:
┌─────────────────────────────────────────────────────────┐
│  npm install malicious-pkg                              │
│       │                                                 │
│       ▼                                                 │
│  postinstall → Node.js → harvest.js                     │
│       │                                                 │
│       ▼                                                 │
│  HTTPS POST → github.com/attacker/Shai-Hulud            │
│       │                                                 │
│       ▼                                                 │
│  Single repo JSON files (cloud.json, secrets.json)      │
└─────────────────────────────────────────────────────────┘

Wave 2 Architecture:
┌─────────────────────────────────────────────────────────┐
│  npm install evolved-pkg                                │
│       │                                                 │
│       ▼                                                 │
│  preinstall → Bundled Bun Runtime → payload.ts          │
│       │                                                 │
│       ├──► Harvest credentials (expanded targets)       │
│       │                                                 │
│       ├──► Register SHA1HULUD runner (if CI detected)   │
│       │                                                 │
│       ▼                                                 │
│  HTTPS POST → random repo from 25k+ pool                │
│       │       Description: "Sha1-Hulud: The Second Com" │
│       │                                                 │
│       ▼                                                 │
│  JSON files: cloud.json, actionsSecrets.json,           │
│              environment.json, truffleSecrets.json,     │
│              contents.json                              │
│       │                                                 │
│       ▼                                                 │
│  [On detection] rm -rf ~ (dead man's switch)            │
└─────────────────────────────────────────────────────────┘
```

## Key Takeaways

### Why Preinstall Matters
- Executes **before** dependencies are resolved
- Runs at the earliest possible point in npm lifecycle
- Gives attacker control before any security audit can run

### Why BYOR (Bring Your Own Runtime) Matters
- **Evasion**: Security tools monitor Node.js, not Bun
- **Consistency**: No dependency on victim's Node version
- **Speed**: Bun's faster startup = quicker exfil
- **Sandbox escape**: Fresh runtime avoids Node.js sandboxing

### Why GitHub Actions Targeting Matters
- **Persistence**: Runner survives beyond job completion
- **Lateral Movement**: Access to CI/CD secrets
- **Supply Chain Depth**: Can inject into build artifacts
- **Stealth**: Looks like legitimate infrastructure

### Why Distributed Repos Matter
- **Redundancy**: 28k repos = 28k takedown requests
- **Evasion**: No single repo to monitor
- **Analysis Difficulty**: Must enumerate all repos by description
- **Ephemeral**: Attacker can create/destroy repos at will

## Detection Checklist

- [ ] Search GitHub for repos with description "Sha1-Hulud: The Second Coming"
- [ ] Audit npm packages for `preinstall` scripts (especially invoking non-Node runtimes)
- [ ] Check for bundled Bun binaries in `node_modules/`
- [ ] Review GitHub Actions runners for `SHA1HULUD` or variants
- [ ] Audit recent package-lock.json changes for new/suspicious packages

## Remediation Priority Matrix

| Action | Priority | Wave 1 | Wave 2 |
|--------|----------|--------|--------|
| Rotate npm tokens | 🔴 Critical | ✓ | ✓ |
| Rotate GitHub tokens | 🔴 Critical | ✓ | ✓ |
| Rotate cloud credentials | 🔴 Critical | ✓ | ✓ |
| Audit GitHub Actions runners | 🔴 Critical | - | ✓ |
| Enable `ignore-scripts` in npm | 🟠 High | ✓ | ✓ |
| Use `npm ci` with lockfile | 🟠 High | ✓ | ✓ |
| Sandbox CI/CD builds | 🟡 Medium | ✓ | ✓ |
| Implement dependency allowlist | 🟡 Medium | ✓ | ✓ |