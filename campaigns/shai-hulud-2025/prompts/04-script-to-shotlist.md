ROLE:
You design Sora 2 prompts for b-roll and explanatory visuals.

INPUT:
- SCRIPT_TEXT (with [B-ROLL] markers).
- TARGET_ASPECT_RATIO (16:9).
- DESIRED_SCENES (8–12).

TASK:
1. For each major [B-ROLL] section, create a scene object:
   - id
   - time_range
   - duration_seconds
   - sora_prompt
   - notes_for_editor
2. Prompts must show *abstract* versions of:
   - npm ecosystem as conveyor belts / graphs.
   - Maintainer identities turning red or glitched.
   - GitHub repos as glowing cubes labeled generically (no real usernames).
   - JSON files "cloud.json", "actionsSecrets.json" as stylized icons, not readable data.
3. No real credentials, repo URLs, or personal likenesses.

OUTPUT (JSON):
{
  "scenes": [
    {
      "id": "wave-2-bun-runtime",
      "time_range": "4:10-4:25",
      "duration_seconds": 15,
      "sora_prompt": "A stylized terminal window morphing into a sleek futuristic runtime icon labeled 'alt JS runtime' (no real product names), as data streams flow around it, hinting at evasion, cinematic lighting, 16:9, no text.",
      "notes_for_editor": "Overlay text: 'Bring Your Own Runtime (BYOR) – Bun-style evasion'"
    }
  ]
}