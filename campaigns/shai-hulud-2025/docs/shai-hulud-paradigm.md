# The Shai-Hulud Paradigm: A Supply Chain Worm Analysis

> **Status:** Complete Technical Analysis  
> **Author:** Threat Research Team  
> **Last Updated:** November 2025  
> **Campaign:** shai-hulud-2025  
> **Classification:** Educational / Defensive Research

---

## Executive Summary

The Shai-Hulud campaign represents a watershed moment in software supply chain security: the emergence of a **true supply chain worm** within the npm ecosystem. Unlike traditional supply chain attacks that compromise specific packages or organizations, Shai-Hulud demonstrated autonomous propagation capabilities—infected developer environments would spawn new malicious packages without direct attacker intervention.

This analysis covers two distinct operational waves:
- **Wave 1 (September 8-15, 2025)**: Genesis phase using postinstall hooks and Node.js runtime
- **Wave 2 (November 21-24, 2025)**: "The Second Coming" with preinstall hooks, Bun BYOR runtime, and GitHub Actions infiltration

The campaign exfiltrated an estimated 14,000+ unique secrets through 25,000-28,000+ disposable GitHub repositories, marking the largest coordinated secret theft in npm history.

---

## Table of Contents

1. [Threat Classification](#threat-classification)
2. [Wave 1: September Genesis](#wave-1-september-genesis)
3. [Wave 2: The Second Coming](#wave-2-the-second-coming)
4. [Technical Deep Dive](#technical-deep-dive)
5. [Exfiltration Infrastructure](#exfiltration-infrastructure)
6. [Detection Indicators](#detection-indicators)
7. [Remediation Playbook](#remediation-playbook)
8. [Strategic Implications](#strategic-implications)
9. [Timeline of Events](#timeline-of-events)
10. [Sources and Attribution](#sources-and-attribution)

---

## Threat Classification

### What Makes This a "Worm"?

Traditional supply chain attacks follow a **static infection model**:
1. Attacker compromises Package A
2. Users install Package A → get infected
3. Infection scope is limited to Package A's user base

Shai-Hulud introduced **autonomous propagation**:
1. Attacker seeds initial malicious packages
2. Developer D installs malicious package → environment harvested
3. Developer D's credentials used to publish NEW malicious packages
4. New packages infect Developer E, F, G... → cycle repeats

This self-replicating behavior is the hallmark of a computer worm, now operating at the supply chain layer.

### Attack Surface

| Vector | Wave 1 | Wave 2 |
|--------|--------|--------|
| npm Registry | ✓ | ✓ |
| GitHub Repositories | Exfil only | Exfil + Runner compromise |
| CI/CD Pipelines | Indirect | Direct (Actions runners) |
| Cloud Credentials | ✓ | ✓ |
| Local Development | ✓ | ✓ |

---

## Wave 1: September Genesis

### Timeline
- **September 8, 2025**: First malicious packages detected
- **September 10-12, 2025**: Peak publication rate (~50-80 packages/day)
- **September 15, 2025**: npm security team intervenes, bulk removal

### Technical Characteristics

**Execution Method**: `postinstall` lifecycle hooks in package.json
```json
{
  "scripts": {
    "postinstall": "node ./scripts/setup.js"
  }
}
```

**Runtime**: Node.js (standard npm environment)

**Package Count**: ~180-500 malicious packages (vendor estimates vary)

**Naming Convention**: Typosquatting popular packages
- `lodash-utils` → `1odash-utils`
- `express-core` → `express-c0re`
- `react-hooks` → `react-h00ks`

### Payload Behavior

1. **Environment Harvesting**
   - Read `.env`, `.npmrc`, `.gitconfig`
   - Enumerate `process.env` for secrets
   - Scan for cloud provider credentials (AWS, GCP, Azure)
   
2. **Credential Theft**
   - npm tokens from `.npmrc`
   - GitHub tokens from git credential helpers
   - SSH keys from `~/.ssh/`

3. **Exfiltration**
   - Single GitHub repository: `Shai-Hulud`
   - JSON file uploads with victim metadata
   - Rate-limited to avoid detection

### Blast Radius (Wave 1)

| Metric | Estimate |
|--------|----------|
| Packages published | 180-500 |
| Victims (unique IPs) | 2,000-5,000 |
| Secrets exfiltrated | ~3,000-5,000 |
| npm tokens compromised | ~500-1,000 |

---

## Wave 2: The Second Coming

### Timeline
- **November 21, 2025**: New wave detected with evolved TTPs
- **November 22-23, 2025**: Massive repository creation detected
- **November 24, 2025**: Public disclosure by Semgrep
- **November 25+, 2025**: Ongoing remediation

### Technical Evolution from Wave 1

Wave 2 demonstrated significant operational maturity:

| Capability | Wave 1 | Wave 2 |
|------------|--------|--------|
| Lifecycle hook | postinstall | **preinstall** |
| Runtime | Node.js | **Bun (BYOR)** |
| Exfil repos | 1 | **25,000-28,000+** |
| Repo identification | Named | **Description-based** |
| CI/CD targeting | No | **Yes (GitHub Actions)** |
| Dead man's switch | No | **Yes (`rm -rf ~`)** |

### Bring Your Own Runtime (BYOR)

The most significant evolution: bundling a complete Bun runtime.

**Why Bun?**
1. **Evasion**: Security tools monitor Node.js execution, not Bun
2. **Speed**: Faster startup = quicker exfil before detection
3. **Self-contained**: No dependency on victim's Node version
4. **API compatibility**: Can execute Node.js code

**Implementation**:
```json
{
  "scripts": {
    "preinstall": "./node_modules/.bin/bun run ./install.ts"
  },
  "bundledDependencies": ["bun-binary"]
}
```

### Preinstall vs Postinstall

**Wave 1 (postinstall)**:
- Executes AFTER package installation
- Dependencies already resolved
- Can be skipped with `--ignore-scripts`

**Wave 2 (preinstall)**:
- Executes BEFORE main installation
- Runs earlier in lifecycle = earlier exfil
- Harder to detect in dependency audit
- Still blockable with `--ignore-scripts`

### GitHub Actions Runner Compromise

Wave 2 introduced a new attack vector: self-hosted GitHub Actions runners.

**Runner Name**: `SHA1HULUD` (note the "1" replacing "I")

**Attack Flow**:
1. Malicious package executes in CI environment
2. Payload detects GitHub Actions environment variables
3. Registers a new self-hosted runner named `SHA1HULUD`
4. Runner persists beyond job completion
5. Attacker gains persistent CI/CD access

**Detection Markers**:
```yaml
# Check for unauthorized runners
# Repository Settings → Actions → Runners
# Look for: SHA1HULUD, SHA1-HULUD, variants
```

### Dead Man's Switch

Wave 2 included an aggressive anti-forensics mechanism:

```bash
# Triggered on detection or analysis attempt
rm -rf ~
```

This attempts to wipe the user's home directory, destroying:
- Evidence of infection
- Victim's legitimate files
- Potential forensic artifacts

---

## Technical Deep Dive

### Package Structure (Wave 2)

```
malicious-package/
├── package.json
├── node_modules/
│   └── .bun/
│       └── bun-linux-x64  # Embedded Bun binary
├── install.ts            # TypeScript payload
├── loader.js             # Node.js wrapper
└── README.md             # Social engineering content
```

### Payload Execution Flow

```
npm install malicious-pkg
    │
    ▼
preinstall hook triggers
    │
    ▼
Bundled Bun runtime executes install.ts
    │
    ├──► Harvest environment variables
    ├──► Scan for credential files
    ├──► Extract npm/GitHub tokens
    ├──► Enumerate cloud credentials
    │
    ▼
HTTPS POST to random GitHub repo
    │
    ▼
(Optional) Register SHA1HULUD runner
    │
    ▼
(On detection) rm -rf ~
```

### Credential Harvesting Targets

**Environment Variables**:
- `NPM_TOKEN`, `NPM_AUTH_TOKEN`
- `GITHUB_TOKEN`, `GH_TOKEN`, `GITHUB_PAT`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `GOOGLE_APPLICATION_CREDENTIALS`
- `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`
- `DOCKER_PASSWORD`, `DOCKER_AUTH`
- CI-specific: `CIRCLE_TOKEN`, `TRAVIS_TOKEN`, `GITLAB_TOKEN`

**File Targets**:
- `~/.npmrc` - npm authentication
- `~/.gitconfig` - Git user config
- `~/.git-credentials` - Stored credentials
- `~/.ssh/id_rsa`, `~/.ssh/id_ed25519` - SSH keys
- `~/.aws/credentials` - AWS credentials
- `~/.config/gcloud/` - GCP credentials
- `~/.azure/` - Azure credentials
- `.env`, `.env.local`, `.env.production` - App secrets

---

## Exfiltration Infrastructure

### Wave 1: Single Repository Model

- **Repository**: `github.com/[attacker]/Shai-Hulud`
- **Method**: Direct file commits via GitHub API
- **Format**: JSON files with victim data
- **Limitation**: Single point of detection/takedown

### Wave 2: Distributed Repository Swarm

**Scale**: 25,000-28,000+ GitHub repositories

**Identification Method**: Repository description
```
"Sha1-Hulud: The Second Coming"
```

**Repository Naming**: Random alphanumeric strings
- No predictable pattern
- Created programmatically
- Disposable (expect takedown)

**JSON File Schema**:

```json
// cloud.json
{
  "aws": {
    "access_key_id": "AKIA...",
    "secret_access_key": "...",
    "region": "us-east-1"
  },
  "gcp": {...},
  "azure": {...}
}

// actionsSecrets.json
{
  "repository": "victim/repo",
  "secrets": [
    {"name": "NPM_TOKEN", "value": "..."},
    {"name": "DEPLOY_KEY", "value": "..."}
  ]
}

// environment.json
{
  "hostname": "dev-machine.local",
  "username": "developer",
  "env_vars": {...},
  "npm_version": "10.x",
  "node_version": "20.x"
}

// truffleSecrets.json
{
  "git_history_secrets": [
    {"file": "config.js", "commit": "abc123", "secret": "..."}
  ]
}

// contents.json
{
  "files_harvested": [
    {"path": "~/.npmrc", "content": "..."},
    {"path": "~/.ssh/id_rsa", "content": "..."}
  ]
}
```

---

## Detection Indicators

### npm Package Indicators

**High Confidence**:
- `preinstall` scripts invoking non-standard runtimes
- Bundled Bun or Deno binaries in `node_modules`
- `.ts` files in preinstall chain (unusual for npm)
- Package names with character substitutions (0→o, 1→l, etc.)

**Medium Confidence**:
- Recently published packages with install scripts
- Packages with few downloads but wide dependency trees
- Missing source repository links
- Sparse or templated README content

### GitHub Indicators

**Repository Level**:
- Repos with description containing "Sha1-Hulud" or "Second Coming"
- Repos with only JSON files (no source code)
- Mass-created repos with random names
- Repos created by accounts with no prior history

**Actions Level**:
- Self-hosted runners with name `SHA1HULUD` or variants
- Runners appearing without explicit configuration
- Unexpected runner registrations in audit logs

### Network Indicators

**Domains/IPs**: (Varies, ephemeral infrastructure)
- Monitor for unexpected GitHub API calls
- Outbound connections during `npm install`
- Large POST requests to `api.github.com`

### Host Indicators

**Files Created**:
- Unexpected binaries in `node_modules/.bin/`
- Bun runtime in `node_modules/.bun/`
- Modified `~/.bashrc`, `~/.zshrc` for persistence

**Process Indicators**:
- `bun` processes during npm operations
- Network connections from npm subprocess
- File access to credential stores during install

---

## Remediation Playbook

### Immediate Response (0-24 hours)

#### If You Suspect Infection:

1. **Isolate the Machine**
   ```bash
   # Disconnect from network immediately
   # Do NOT run further npm commands
   ```

2. **Preserve Evidence**
   ```bash
   # Copy npm cache and logs before they're destroyed
   cp -r ~/.npm /secure/location/
   cp -r ~/.npm/_logs /secure/location/
   ```

3. **Identify Affected Packages**
   ```bash
   # Check recent installs
   cat ~/.npm/_logs/*.log | grep -i "preinstall\|postinstall"
   
   # Review package-lock.json changes
   git diff package-lock.json
   ```

4. **Rotate ALL Credentials**
   - npm tokens: `npm token revoke` + regenerate
   - GitHub tokens: Settings → Developer settings → Revoke all
   - Cloud credentials: Rotate immediately via provider console
   - SSH keys: Generate new keys, update all services

5. **Audit GitHub Actions**
   ```bash
   # Check for unauthorized runners
   gh api repos/{owner}/{repo}/actions/runners
   
   # Remove any SHA1HULUD runners
   gh api -X DELETE repos/{owner}/{repo}/actions/runners/{runner_id}
   ```

### Short-term Hardening (1-7 days)

1. **Enable npm Script Restrictions**
   ```bash
   # Project-level
   echo "ignore-scripts=true" >> .npmrc
   
   # Global (careful: breaks legitimate postinstall)
   npm config set ignore-scripts true
   ```

2. **Implement Lockfile Integrity**
   ```bash
   # Always use lockfile
   npm ci  # Instead of npm install
   
   # Enable integrity checking
   npm config set package-lock-only true
   ```

3. **Audit Dependencies**
   ```bash
   npm audit
   npm audit fix
   
   # Use additional tools
   npx socket-security
   npx snyk test
   ```

4. **Review Recent Package Additions**
   ```bash
   # Git history of package.json
   git log -p package.json | grep "^\+"
   ```

### Long-term Security Posture

1. **Zero-Trust Dependency Model**
   - Assume all packages are potentially malicious
   - Sandbox npm install in CI/CD
   - Use container isolation for builds

2. **Secret Management**
   - Never store secrets in environment files
   - Use vault solutions (HashiCorp, AWS Secrets Manager)
   - Implement secret rotation automation

3. **CI/CD Hardening**
   - Use ephemeral runners only
   - Disable self-hosted runner registration
   - Implement Actions workflow restrictions
   - Enable repository rulesets

4. **Dependency Governance**
   - Maintain allowlist of trusted packages
   - Require security review for new dependencies
   - Monitor for dependency hijacking (subdomain takeover, expired maintainer emails)

---

## Strategic Implications

### Death of Reputation-Based Trust

Traditional npm security relied on signals:
- Package download counts
- Maintainer history
- Community reviews

Shai-Hulud weaponized these signals:
- Compromised maintainer accounts published malicious updates
- Popular package typosquats inherited perceived trust
- Automated propagation scaled faster than reputation systems

**Implication**: Download counts and maintainer history are no longer reliable trust indicators.

### The Worm Threshold

Shai-Hulud crossed a critical threshold: **self-sustaining propagation**.

Once enough developer credentials were harvested:
- New packages could be published automatically
- Infection spread without attacker intervention
- Traditional takedown became "whack-a-mole"

**Implication**: Supply chain security must shift from reactive (detect & remove) to proactive (prevent execution).

### Zero-Trust Pipeline Architecture

The only sustainable defense is **zero-trust at every layer**:

```
[Developer Workstation]
    │
    ▼ Sandboxed npm install
[Build Container]
    │
    ▼ No network access during install
[Artifact Registry]
    │
    ▼ Signed, verified builds only
[Production Environment]
```

---

## Timeline of Events

| Date | Event |
|------|-------|
| Sept 8, 2025 | First Wave 1 packages detected |
| Sept 10-12, 2025 | Peak infection rate (Wave 1) |
| Sept 15, 2025 | npm mass removal of Wave 1 packages |
| Sept-Nov 2025 | Quiet period; attacker infrastructure evolution |
| Nov 21, 2025 | Wave 2 detection begins |
| Nov 22, 2025 | Mass GitHub repo creation observed |
| Nov 23, 2025 | Semgrep researchers identify pattern |
| Nov 24, 2025 | Public disclosure: "Sha1-Hulud: The Second Coming" |
| Nov 25+, 2025 | Industry-wide remediation efforts |

---

## Sources and Attribution

### Primary Sources

1. **Semgrep Security Research**
   - [Sha1-Hulud: The Second Coming of the NPM Worm](https://semgrep.dev/blog/2025/digging-for-secrets-sha1-hulud-the-second-coming-of-the-npm-worm)
   - First detailed public analysis
   - Repository pattern identification

2. **Sysdig Threat Research**
   - Technical analysis of BYOR technique
   - Bun runtime forensics

3. **OX Security**
   - GitHub Actions runner compromise analysis
   - SHA1HULUD detection indicators

4. **GitGuardian**
   - Secret exposure quantification
   - 14k+ unique secrets estimate

5. **Socket Security**
   - Package detection heuristics
   - Typosquatting pattern analysis

### Attribution Notes

- **Attribution**: Unknown threat actor(s)
- **Motivation**: Likely financial (credential resale, cryptomining, ransomware staging)
- **Sophistication**: High (novel TTPs, operational security, scale)
- **Naming**: "Shai-Hulud" references the sandworms from Frank Herbert's Dune; attacker self-identified with this name

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-11-24 | Threat Research | Initial Wave 2 analysis |
| 2025-11-25 | Threat Research | Added detection indicators, remediation playbook |
| 2025-11-25 | Threat Research | Complete technical deep dive |

---

*This document is maintained as the authoritative source for the Shai-Hulud campaign video pipeline. Updates should be committed as new intelligence becomes available.*