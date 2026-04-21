# BRF Azure SWA — Deployment Handoff

**Client:** Built Right Fencing and Tree Planting Services  
**Domain:** builtrightfencing.ca  
**Repo:** `it-sidekick/site-brf-azure` (GitHub)  
**Date:** 2026-04-21  
**Priority:** Ship tonight

---

## What's already done

- Site is built: vanilla HTML/CSS/JS, no build step, lives at repo root
- GitHub Actions workflow committed at `.github/workflows/deploy.yml`
- Local staging live at `http://brf.its.lab`

---

## What you need to do (in order)

### Step 1 — Create the Azure Static Web App

In the **ITS Azure subscription** (or BRF's if they have one):

```
Azure Portal → Create a resource → Static Web App
```

| Field | Value |
|---|---|
| Subscription | ITS (billing to client later if needed) |
| Resource Group | `BRF-2026` (create new) |
| Name | `brf-builtrightfencing` |
| Plan type | **Free** |
| Region | `Canada Central` |
| Deployment source | **Other** (we manage the GitHub Action ourselves) |

Click **Review + Create → Create**.

> Do NOT use the GitHub integration wizard — the workflow is already written and committed.

---

### Step 2 — Get the deployment token

After the SWA is created:

```
Azure Portal → brf-builtrightfencing → Settings → API tokens
→ Manage deployment token → Copy
```

Or via CLI:
```bash
az staticwebapp secrets list \
  --name brf-builtrightfencing \
  --resource-group BRF-2026 \
  --query "properties.apiKey" -o tsv
```

---

### Step 3 — Add the secret to GitHub

```
github.com/it-sidekick/site-brf-azure
→ Settings → Secrets and variables → Actions
→ New repository secret
```

| Name | Value |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | (token from Step 2) |

---

### Step 4 — Trigger the first deploy

```bash
# From the site repo on Dereth:
cd /ops/sites/BRF/site-brf-azure
git push origin main
```

Or manually trigger via GitHub → Actions → "Deploy BRF (Built Right Fencing)" → Run workflow.

Watch the run. Expected result: green, site live at the AZ-assigned hostname (e.g. `https://purple-grass-abc123.azurestaticapps.net`).

Note that hostname — you need it for Step 5.

---

### Step 5 — Wire the custom domain

#### In Azure Portal

```
brf-builtrightfencing → Settings → Custom domains → + Add
```

Add both:
- `builtrightfencing.ca` (apex/root)
- `www.builtrightfencing.ca`

Azure will show you a **TXT validation record** for each. Copy them.

#### In DNS (registrar for builtrightfencing.ca)

You need to add these records. The registrar is unknown — ask the client or check their email for a domain registration receipt.

**For `www.builtrightfencing.ca`** (easier — CNAME):
| Type | Host | Value |
|---|---|---|
| CNAME | `www` | `<az-hostname>.azurestaticapps.net` |

**For apex `builtrightfencing.ca`** (root domain):

Azure SWA does not support A records for apex. Two options depending on registrar:

**Option A — Registrar supports ALIAS/ANAME** (preferred):
| Type | Host | Value |
|---|---|---|
| ALIAS or ANAME | `@` | `<az-hostname>.azurestaticapps.net` |

**Option B — Registrar is Cloudflare** (best option — use Cloudflare proxy):
| Type | Host | Value | Proxy |
|---|---|---|---|
| CNAME | `@` | `<az-hostname>.azurestaticapps.net` | Proxied (orange cloud) |

**Option C — Basic registrar, no ALIAS support:**  
Point the domain's nameservers to Cloudflare (free), then use Option B. This is the recommended long-term setup anyway for email routing.

**Validation TXT records** (add regardless of registrar):
| Type | Host | Value |
|---|---|---|
| TXT | `@` | (value shown in Azure portal for apex) |
| TXT | `www` | (value shown in Azure portal for www) |

DNS TTL changes propagate in minutes to hours. Once validated, Azure provisions SSL automatically.

---

### Step 6 — Verify

```bash
# After DNS propagates:
curl -I https://builtrightfencing.ca
curl -I https://www.builtrightfencing.ca

# Expected: HTTP/2 200, x-azure-ref header present
```

Also open in browser and confirm:
- Site loads correctly
- HTTPS padlock present
- Parallax scrolls (trees, fence)
- Contact form renders (action points to Formspree — still pending a real ID)

---

## Pending after tonight

| Item | Owner | Notes |
|---|---|---|
| Replace Formspree placeholder | Dev | Form `action` currently has `FORMSPREE_ID_PENDING`. Create account at formspree.io, get endpoint, update and push. |
| Cloudflare email routing | Ops | Set up `info@builtrightfencing.ca` or similar forwarding to client's Gmail. Requires nameservers on Cloudflare. |
| Update `ops_central` DB | Ops | `INSERT INTO infrastructure.deployments` — see CLAUDE.md for SQL template. Service type: `static-web-app`, environment: `production`. |

---

## Rollback

To pull the site down instantly:

```
Azure Portal → brf-builtrightfencing → Overview → Delete
```

Or disable the pipeline and the old SWA hostname goes 404. No data loss risk — site is static and source-controlled.

---

## Reference

- Workflow file: `.github/workflows/deploy.yml`
- ITS equivalent (proven pattern): `it-sidekick/site-its` → same `Azure/static-web-apps-deploy@v1` action
- Local staging: `http://brf.its.lab` (nginx on Dereth, always current with main)
- Client spec: `/data/obsidian-vault/ops/15 CLIENTS/Built Right Fencing and Tree Planting Services/docs/PRODUCT-SPEC-BRF-WEBSITE.md`
