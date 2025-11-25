# The Shai-Hulud Paradigm

> **Status:** Draft - Add your detailed threat analysis here  
> **Last Updated:** [DATE]  
> **Campaign:** shai-hulud-2025

---

## Executive Summary

<!-- 
Add a 2-3 paragraph summary of the Shai-Hulud npm worm campaign.
This document serves as the LONGFORM_THREAT_DOC input for the video pipeline.
-->

---

## Wave 1: September Genesis (Sept 8-15, 2025)

### Attack Vector
- Execution method: `postinstall` hooks
- Runtime: Node.js
- Package count: ~180-500 malicious packages

### Exfiltration Infrastructure
- Single GitHub repository: "Shai-Hulud"
- Data format: JSON files

### Technical Details
<!-- Add detailed technical analysis here -->

---

## Wave 2: "Sha1-Hulud: The Second Coming" (Nov 21-24, 2025)

### Evolution from Wave 1
- Execution method: `preinstall` hooks (earlier in lifecycle)
- Runtime: Bun-based BYOR (Bring Your Own Runtime)
- Self-hosted GitHub Actions runner: "SHA1HULUD"

### Exfiltration Infrastructure
- 25,000-28,000+ randomized GitHub repositories
- Repository description: "Sha1-Hulud: The Second Coming"
- JSON loot files:
  - `cloud.json`
  - `actionsSecrets.json`
  - `environment.json`
  - `truffleSecrets.json`
  - `contents.json`

### Scale of Impact
- 14,000+ unique secrets exfiltrated
- Affected: CI/CD pipelines, cloud credentials, API keys

### Technical Details
<!-- Add detailed technical analysis here -->

---

## Detection Indicators

### npm Package Indicators
- Suspicious `preinstall` or `postinstall` scripts
- References to Bun runtime in package.json
- Unusual network calls during install

### GitHub Indicators
- Self-hosted runners with name containing "SHA1HULUD"
- Repositories with description "Sha1-Hulud: The Second Coming"
- Sudden appearance of JSON files in unexpected repos

### Network/Host Indicators
<!-- Add IOCs here -->

---

## Remediation Playbook

### Immediate Actions
1. [ ] Audit recent npm installs for suspicious packages
2. [ ] Review CI/CD pipeline secrets
3. [ ] Check for unauthorized GitHub runners
4. [ ] Rotate potentially compromised credentials

### Long-term Hardening
1. [ ] Implement npm install script restrictions
2. [ ] Use lockfiles and integrity checking
3. [ ] Enable GitHub Actions security settings
4. [ ] Deploy secret scanning tools

---

## Strategic Implications

### Death of Reputation-Based Trust
<!-- Analysis of how this attack undermines traditional trust models -->

### Zero-Trust Pipeline Architecture
<!-- Recommendations for zero-trust CI/CD -->

---

## Sources

- [Semgrep: Sha1-Hulud: The Second Coming of the NPM Worm](https://semgrep.dev/blog/2025/digging-for-secrets-sha1-hulud-the-second-coming-of-the-npm-worm)
- <!-- Add additional sources -->

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| YYYY-MM-DD | [Name] | Initial draft |