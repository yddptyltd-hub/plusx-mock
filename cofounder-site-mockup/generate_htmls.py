import os

data = {
    "protocol_name": "PlusX LPX",
    "one_sentence": "Liquidity protocol on PulseChain — managed bid/ask, NTZ-shaped LP. Every number verified on-chain.",
    "kpis": [
        {"label": "Total TVL (USD)", "value": "$951,356"},
        {"label": "Active LPX pools", "value": "35"},
        {"label": "Liquidity providers", "value": "920"},
        {"label": "Avg 30-day APR", "value": "7.04%"},
        {"label": "Cumulative swaps", "value": "~198,000"},
        {"label": "Total LPX-routed volume", "value": "$38.1M"},
        {"label": "PLSX burn contribution", "value": "$19,060"}
    ],
    "pools": [
        {"pair": "WPLS / DAI(ETH)", "tvl": "$815.4k", "apr": "6.6%", "vol": "$141"},
        {"pair": "uPLS / DAI(ETH)", "tvl": "$2.6k", "apr": "9.5%", "vol": "$921"},
        {"pair": "PLSX / DAI(ETH)", "tvl": "$81.3k", "apr": "7.6%", "vol": "$1,635"},
        {"pair": "HEX / DAI(ETH)", "tvl": "$46.1k", "apr": "9.8%", "vol": "$15.2k"},
        {"pair": "INC / DAI(ETH)", "tvl": "$25.2k", "apr": "8.7%", "vol": "$1,103"}
    ],
    "defensibility": "Methodology page lives at /methodology/ — every number traces to either DexScreener live API or LPX_MAIN reserves at block 26640264 (tx 0x229f26314a43a295d8d681d50f7b2c094d198eab2284dd259bbaf9a3b8fc8135). Snapshot date 2026-03-20.",
    "nav": ["LPX", "uDEX", "ValidatorX", "Portfolio", "Docs"],
    "tagline": 'Every dollar traceable to an on-chain transaction · <a href="/methodology/">methodology</a>'
}

def write_v01():
    # v01: KPI strip, Top horizontal nav, pool table dominant, monochrome + deep blue, methodology link inline next to TVL, all-sans modern
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PlusX LPX - Dashboard</title>
<style>
  :root {{ --bg: #ffffff; --text: #1a1a1a; --text-muted: #6b7280; --border: #e5e7eb; --accent: #1e3a8a; --bg-alt: #f9fafb; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 0; line-height: 1.5; }}
  header {{ border-bottom: 1px solid var(--border); padding: 0 24px; height: 64px; display: flex; align-items: center; justify-content: space-between; }}
  .nav-links {{ display: flex; gap: 24px; }}
  .nav-links a {{ text-decoration: none; color: var(--text-muted); font-size: 14px; font-weight: 500; }}
  .nav-links a.active {{ color: var(--text); font-weight: 600; border-bottom: 2px solid var(--accent); padding-bottom: 21px; }}
  .btn-primary {{ background: var(--accent); color: #fff; border: none; padding: 8px 16px; border-radius: 4px; font-size: 14px; font-weight: 500; cursor: pointer; }}
  main {{ max-width: 1200px; margin: 0 auto; padding: 48px 24px; }}
  h1 {{ font-size: 24px; margin: 0 0 8px 0; font-weight: 600; }}
  .pitch {{ color: var(--text-muted); font-size: 16px; margin-bottom: 32px; max-width: 800px; }}
  .kpi-strip {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 16px; }}
  @media (max-width: 768px) {{ .kpi-strip {{ grid-template-columns: repeat(2, 1fr); }} .nav-links {{ display: none; }} }}
  .kpi-card {{ border: 1px solid var(--border); padding: 24px; border-radius: 8px; background: var(--bg); }}
  .kpi-label {{ color: var(--text-muted); font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }}
  .kpi-value {{ font-size: 32px; font-weight: 600; color: var(--text); margin: 0; }}
  .kpi-inline-link {{ font-size: 12px; color: var(--accent); text-decoration: none; margin-left: 8px; font-weight: normal; }}
  .tagline {{ font-size: 13px; color: var(--text-muted); margin-bottom: 48px; border-bottom: 1px solid var(--border); padding-bottom: 24px; }}
  .tagline a {{ color: var(--accent); text-decoration: none; }}
  .secondary-kpis {{ display: flex; gap: 48px; margin-bottom: 48px; flex-wrap: wrap; }}
  .sec-kpi {{ display: flex; flex-direction: column; }}
  .sec-kpi .label {{ font-size: 13px; color: var(--text-muted); }}
  .sec-kpi .value {{ font-size: 18px; font-weight: 600; }}
  .table-container {{ overflow-x: auto; }}
  table {{ width: 100%; border-collapse: collapse; text-align: left; }}
  th {{ font-size: 13px; color: var(--text-muted); border-bottom: 1px solid var(--border); padding: 12px 16px; font-weight: 500; }}
  td {{ padding: 16px; border-bottom: 1px solid var(--border); font-size: 14px; font-weight: 500; }}
  tr:hover td {{ background: var(--bg-alt); cursor: pointer; }}
  .defensibility {{ margin-top: 64px; font-size: 12px; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 24px; }}
</style>
</head>
<body>
  <header>
    <div style="display:flex; align-items:center; gap:48px;">
      <div style="font-weight:700; font-size:18px;">PlusX</div>
      <div class="nav-links">
        <a href="#" class="active">LPX</a>
        <a href="#">uDEX</a>
        <a href="#">ValidatorX</a>
        <a href="#">Portfolio</a>
        <a href="#">Docs</a>
      </div>
    </div>
    <button class="btn-primary">Connect Wallet</button>
  </header>
  <main>
    <h1>{data['protocol_name']}</h1>
    <p class="pitch">{data['one_sentence']}</p>

    <div class="kpi-strip">
      <div class="kpi-card">
        <div class="kpi-label">Total TVL (USD)</div>
        <div class="kpi-value">{data['kpis'][0]['value']}<a href="/methodology/" class="kpi-inline-link">methodology ↗</a></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Avg 30-day APR</div>
        <div class="kpi-value">{data['kpis'][3]['value']}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Total Volume</div>
        <div class="kpi-value">{data['kpis'][5]['value']}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Active Pools</div>
        <div class="kpi-value">{data['kpis'][1]['value']}</div>
      </div>
    </div>
    <div class="tagline">{data['tagline']}</div>

    <div class="secondary-kpis">
      <div class="sec-kpi"><span class="label">Liquidity providers</span><span class="value">{data['kpis'][2]['value']}</span></div>
      <div class="sec-kpi"><span class="label">Cumulative swaps</span><span class="value">{data['kpis'][4]['value']}</span></div>
      <div class="sec-kpi"><span class="label">PLSX burn</span><span class="value">{data['kpis'][6]['value']}</span></div>
    </div>

    <h2 style="font-size:16px; margin-bottom:16px;">Top Pools (Snapshot)</h2>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Pool</th>
            <th>TVL</th>
            <th>APR</th>
            <th>Volume 24h</th>
          </tr>
        </thead>
        <tbody>
          {''.join(f"<tr><td>{p['pair']}</td><td>{p['tvl']}</td><td>{p['apr']}</td><td>{p['vol']}</td></tr>" for p in data['pools'])}
        </tbody>
      </table>
    </div>

    <div class="defensibility">
      {data['defensibility']}
    </div>
  </main>
</body>
</html>"""
    with open("cofounder-site-mockup/variations/v01/index.html", "w") as f: f.write(html)

def write_v02():
    # v02: split-screen, left sidebar, pool cards grid, all data points visible, two-accent (teal + red), contract addrs in footer, classic enterprise serif headers + sans body, top-right + per-pool action
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PlusX LPX</title>
<style>
  :root {{ --bg: #f0f2f5; --bg-card: #ffffff; --text: #2d3748; --text-muted: #718096; --border: #cbd5e0; --accent: #0f766e; --accent-red: #e53e3e; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--text); margin: 0; display: flex; height: 100vh; overflow: hidden; }}
  h1, h2, h3, .serif {{ font-family: "Georgia", "Times New Roman", serif; }}
  .sidebar {{ width: 240px; background: var(--bg-card); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 24px 0; }}
  .brand {{ padding: 0 24px 24px; font-size: 20px; font-weight: bold; border-bottom: 1px solid var(--border); margin-bottom: 24px; }}
  .nav-item {{ padding: 12px 24px; color: var(--text-muted); text-decoration: none; font-size: 14px; font-weight: 500; }}
  .nav-item.active {{ color: var(--accent); background: #e6fffa; border-right: 3px solid var(--accent); }}
  .main-content {{ flex: 1; overflow-y: auto; display: flex; flex-direction: column; }}
  .topbar {{ height: 64px; background: var(--bg-card); border-bottom: 1px solid var(--border); display: flex; justify-content: flex-end; align-items: center; padding: 0 32px; position: sticky; top: 0; z-index: 10; }}
  .btn-primary {{ background: var(--accent); color: white; border: none; padding: 8px 16px; border-radius: 4px; font-size: 14px; cursor: pointer; }}
  .btn-outline {{ background: transparent; color: var(--accent); border: 1px solid var(--accent); padding: 4px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; }}
  .content-wrapper {{ padding: 32px; max-width: 1400px; margin: 0 auto; width: 100%; box-sizing: border-box; }}
  .split-hero {{ display: flex; gap: 32px; margin-bottom: 48px; align-items: flex-start; }}
  .hero-pitch {{ flex: 1; }}
  .hero-pitch h1 {{ font-size: 32px; margin: 0 0 16px 0; color: #1a202c; }}
  .hero-pitch p {{ font-size: 16px; color: var(--text-muted); line-height: 1.6; }}
  .hero-kpis {{ flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }}
  .kpi-mini {{ background: var(--bg-card); border: 1px solid var(--border); padding: 16px; border-radius: 4px; }}
  .kpi-mini-label {{ font-size: 12px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }}
  .kpi-mini-value {{ font-size: 20px; font-weight: 600; font-family: monospace; }}
  .kpi-warning {{ color: var(--accent-red); font-size: 11px; margin-top: 4px; display: block; }}
  .cards-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; margin-bottom: 48px; }}
  .pool-card {{ background: var(--bg-card); border: 1px solid var(--border); padding: 20px; border-radius: 4px; display: flex; flex-direction: column; }}
  .pool-header {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 12px; }}
  .pool-name {{ font-weight: 600; font-size: 15px; }}
  .pool-stats {{ display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }}
  .stat-row {{ display: flex; justify-content: space-between; font-size: 13px; }}
  .stat-row span:first-child {{ color: var(--text-muted); }}
  .stat-row span:last-child {{ font-weight: 600; font-family: monospace; }}
  .footer-ribbon {{ background: #2d3748; color: #a0aec0; padding: 16px 32px; font-size: 11px; display: flex; flex-direction: column; gap: 8px; }}
  .footer-ribbon a {{ color: #e2e8f0; }}
  @media (max-width: 768px) {{ body {{ flex-direction: column; overflow: auto; }} .sidebar {{ width: 100%; height: auto; border-right: none; border-bottom: 1px solid var(--border); padding: 16px 0; }} .nav-item {{ display: inline-block; padding: 8px 16px; }} .split-hero {{ flex-direction: column; }} .topbar {{ display: none; }} }}
</style>
</head>
<body>
  <div class="sidebar">
    <div class="brand">PlusX Dashboard</div>
    <a href="#" class="nav-item active">LPX Protocol</a>
    <a href="#" class="nav-item">uDEX</a>
    <a href="#" class="nav-item">ValidatorX</a>
    <a href="#" class="nav-item">Portfolio</a>
    <a href="#" class="nav-item">Documentation</a>
  </div>
  <div class="main-content">
    <div class="topbar"><button class="btn-primary">Connect Wallet</button></div>
    <div class="content-wrapper">
      <div class="split-hero">
        <div class="hero-pitch">
          <h1>{data['protocol_name']}</h1>
          <p>{data['one_sentence']}</p>
          <div style="margin-top:16px; font-size:13px; color:var(--text-muted);">{data['tagline']}</div>
        </div>
        <div class="hero-kpis">
          {"".join(f"<div class='kpi-mini'><div class='kpi-mini-label'>{k['label']}</div><div class='kpi-mini-value'>{k['value']}</div></div>" for k in data['kpis'])}
          <div class='kpi-mini'><div class='kpi-mini-label'>Status</div><div class='kpi-mini-value' style='color:var(--accent);'>Operational</div></div>
        </div>
      </div>

      <h2 class="serif" style="font-size:20px; border-bottom: 1px solid var(--border); padding-bottom: 8px; margin-bottom: 24px;">Active Pools</h2>
      <div class="cards-grid">
        {"".join(f'''
        <div class="pool-card">
          <div class="pool-header"><div class="pool-name">{p['pair']}</div><button class="btn-outline">Deposit</button></div>
          <div class="pool-stats">
            <div class="stat-row"><span>TVL</span><span>{p['tvl']}</span></div>
            <div class="stat-row"><span>APR</span><span style="color:var(--accent);">{p['apr']}</span></div>
            <div class="stat-row"><span>Vol 24h</span><span>{p['vol']}</span></div>
          </div>
        </div>
        ''' for p in data['pools'])}
      </div>
    </div>
    <div class="footer-ribbon">
      <div>{data['defensibility']}</div>
      <div>Contract Addresses: LPX_MAIN 0x123...456 | ROUTER 0x789...012</div>
    </div>
  </div>
</body>
</html>"""
    with open("cofounder-site-mockup/variations/v02/index.html", "w") as f: f.write(html)

def write_v03():
    # v03: Single big TVL centered, sticky nav logo+wallet, full-bleed pool list w sparklines, only 1 hero KPI, subtle gradient bg, verified badge, monospace numbers, slide-out CTA
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PlusX LPX</title>
<style>
  :root {{ --bg: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); --text: #0f172a; --text-muted: #64748b; --border: #e2e8f0; --accent: #3b82f6; }}
  body {{ font-family: "Inter", -apple-system, sans-serif; background: var(--bg); color: var(--text); margin: 0; min-height: 100vh; }}
  .mono {{ font-family: "SF Mono", "Consolas", monospace; }}
  nav {{ position: sticky; top: 0; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); height: 60px; display: flex; justify-content: space-between; align-items: center; padding: 0 24px; z-index: 50; }}
  .nav-left {{ font-weight: 700; display: flex; align-items: center; gap: 16px; }}
  .dropdown {{ position: relative; display: inline-block; }}
  .dropdown-content {{ display: none; position: absolute; background-color: #fff; min-width: 160px; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.1); border: 1px solid var(--border); border-radius: 4px; padding: 8px 0; z-index: 1; top: 100%; }}
  .dropdown:hover .dropdown-content {{ display: block; }}
  .dropdown-content a {{ color: var(--text); padding: 8px 16px; text-decoration: none; display: block; font-size: 14px; }}
  .dropdown-content a:hover {{ background-color: #f1f5f9; }}
  .btn-menu {{ background: none; border: 1px solid var(--border); padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 14px; }}
  .btn-wallet {{ background: #0f172a; color: #fff; border: none; padding: 8px 16px; border-radius: 999px; font-weight: 500; cursor: pointer; font-size: 14px; }}
  .hero {{ padding: 80px 24px; text-align: center; }}
  .hero-tvl-label {{ font-size: 14px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }}
  .hero-tvl-value {{ font-size: 72px; font-weight: 700; margin: 0 0 16px 0; letter-spacing: -0.02em; }}
  .badge {{ display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 500; margin-bottom: 24px; }}
  .pool-list {{ max-width: 1000px; margin: 0 auto; padding: 0 24px 80px; }}
  .pool-row {{ display: flex; align-items: center; justify-content: space-between; padding: 20px 0; border-bottom: 1px solid var(--border); }}
  .pool-row:hover {{ background: rgba(255,255,255,0.5); }}
  .pool-info {{ display: flex; flex-direction: column; gap: 4px; width: 25%; }}
  .pool-name {{ font-weight: 600; font-size: 16px; }}
  .pool-meta {{ font-size: 13px; color: var(--text-muted); }}
  .pool-stat {{ width: 20%; text-align: right; display: flex; flex-direction: column; gap: 4px; }}
  .stat-val {{ font-size: 16px; font-weight: 500; }}
  .stat-lbl {{ font-size: 12px; color: var(--text-muted); }}
  .sparkline {{ width: 100px; height: 30px; margin-left: auto; }}
  .slide-out-cta {{ position: fixed; bottom: 24px; right: 24px; background: #fff; border: 1px solid var(--border); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); padding: 16px; border-radius: 8px; display: flex; gap: 16px; align-items: center; z-index: 100; }}
  @media (max-width: 768px) {{ .hero-tvl-value {{ font-size: 48px; }} .pool-stat {{ width: auto; }} .sparkline {{ display: none; }} .pool-row {{ flex-wrap: wrap; gap: 16px; }} }}
  .def-footer {{ max-width: 1000px; margin: 0 auto; padding: 24px; font-size: 12px; color: var(--text-muted); text-align: center; border-top: 1px solid var(--border); }}
</style>
</head>
<body>
  <nav>
    <div class="nav-left">
      <span>PlusX</span>
      <div class="dropdown">
        <button class="btn-menu">Menu ▾</button>
        <div class="dropdown-content">
          <a href="#">LPX</a>
          <a href="#">uDEX</a>
          <a href="#">ValidatorX</a>
          <a href="#">Portfolio</a>
          <a href="#">Docs</a>
        </div>
      </div>
    </div>
    <button class="btn-wallet">Connect Wallet</button>
  </nav>

  <div class="hero">
    <div class="hero-tvl-label">Total Value Locked</div>
    <div class="hero-tvl-value mono">{data['kpis'][0]['value']}</div>
    <div class="badge">Verified at block 26640264</div>
    <p style="color:var(--text-muted); max-width:600px; margin:0 auto;">{data['one_sentence']} <br><br> {data['tagline']}</p>
  </div>

  <div class="pool-list">
    <div style="font-size: 18px; font-weight: 600; margin-bottom: 16px; border-bottom: 2px solid var(--text); padding-bottom: 8px;">Active Pools</div>
    {"".join(f'''
    <div class="pool-row">
      <div class="pool-info"><span class="pool-name">{p['pair']}</span></div>
      <div class="pool-stat"><span class="stat-val mono">{p['tvl']}</span><span class="stat-lbl">TVL</span></div>
      <div class="pool-stat"><span class="stat-val mono">{p['apr']}</span><span class="stat-lbl">APR</span></div>
      <div class="pool-stat"><span class="stat-val mono">{p['vol']}</span><span class="stat-lbl">24h Vol</span></div>
      <svg class="sparkline" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,20 Q25,5 50,25 T100,10" fill="none" stroke="var(--accent)" stroke-width="2"/></svg>
    </div>
    ''' for p in data['pools'])}
  </div>

  <div class="def-footer">{data['defensibility']}</div>

  <div class="slide-out-cta">
    <div>
      <div style="font-weight:600; font-size:14px;">Ready to provide liquidity?</div>
      <div style="font-size:12px; color:var(--text-muted);">Connect your wallet to start.</div>
    </div>
    <button class="btn-wallet">Connect</button>
  </div>
</body>
</html>"""
    with open("cofounder-site-mockup/variations/v03/index.html", "w") as f: f.write(html)

def write_v04():
    # v04: exec summary + small KPIs, top horiz + sec tabs, exec report layout (sections), grid + 5 pools, color-by-section, audit firm date stamp, varied weights Inter, CTA replaced w Open Methodology
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PlusX LPX Report</title>
<style>
  :root {{ --bg: #ffffff; --text: #000000; --text-muted: #555555; --border: #000000; }}
  body {{ font-family: "Inter", sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 0; }}
  header {{ padding: 24px 48px; border-bottom: 2px solid var(--border); display: flex; justify-content: space-between; align-items: flex-end; }}
  .brand-logo {{ font-size: 24px; font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase; }}
  .header-actions {{ display: flex; gap: 16px; }}
  .btn-sec {{ border: 1px solid var(--border); background: #fff; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; text-transform: uppercase; }}
  .btn-prim {{ background: var(--border); color: #fff; border: none; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; text-transform: uppercase; }}
  .tabs {{ padding: 0 48px; border-bottom: 1px solid #eaeaea; display: flex; gap: 32px; background: #fafafa; }}
  .tabs a {{ padding: 16px 0; color: var(--text-muted); text-decoration: none; font-size: 14px; font-weight: 500; text-transform: uppercase; }}
  .tabs a.active {{ color: var(--text); border-bottom: 2px solid var(--text); font-weight: 700; }}
  main {{ padding: 48px; max-width: 1200px; margin: 0 auto; }}
  .report-header {{ margin-bottom: 48px; }}
  .audit-stamp {{ font-family: monospace; font-size: 12px; border: 1px solid var(--border); display: inline-block; padding: 4px 8px; margin-bottom: 24px; font-weight: 600; background: #f0f0f0; }}
  .exec-summary {{ font-size: 18px; line-height: 1.6; font-weight: 400; max-width: 800px; margin-bottom: 32px; }}
  .section-group {{ margin-bottom: 64px; }}
  .section-title {{ font-size: 14px; text-transform: uppercase; font-weight: 800; border-bottom: 1px solid var(--border); padding-bottom: 8px; margin-bottom: 24px; color: #333; }}
  .grid-3 {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }}
  .stat-box {{ border-left: 2px solid var(--border); padding-left: 16px; }}
  .stat-lbl {{ font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 8px; }}
  .stat-val {{ font-size: 28px; font-weight: 800; }}
  table {{ width: 100%; border-collapse: collapse; }}
  th, td {{ padding: 16px 8px; border-bottom: 1px solid #eaeaea; text-align: left; font-size: 14px; }}
  th {{ font-weight: 700; text-transform: uppercase; font-size: 12px; color: var(--text-muted); border-bottom: 1px solid var(--border); }}
  td {{ font-weight: 500; }}
  .bg-section-1 {{ background: #fafafa; padding: 32px; margin: -32px -32px 32px -32px; }}
  @media (max-width: 768px) {{ header, .tabs, main {{ padding-left: 24px; padding-right: 24px; }} .grid-3 {{ grid-template-columns: 1fr; }} }}
</style>
</head>
<body>
  <header>
    <div class="brand-logo">PlusX LPX</div>
    <div class="header-actions">
      <button class="btn-sec" onclick="window.location.href='/methodology/'">Open Methodology</button>
      <button class="btn-prim">Connect Wallet</button>
    </div>
  </header>
  <div class="tabs">
    <a href="#" class="active">Executive Overview</a>
    <a href="#">Pools Data</a>
    <a href="#">Methodology</a>
  </div>
  <main>
    <div class="report-header">
      <div class="audit-stamp">AS OF DATE: 2026-03-20 | BLK: 26640264</div>
      <div class="exec-summary">
        <strong>Executive Summary:</strong> {data['one_sentence']} Currently managing {data['kpis'][0]['value']} in Total Value Locked across {data['kpis'][1]['value']} active pools. {data['tagline']}
      </div>
    </div>

    <div class="section-group bg-section-1">
      <div class="section-title">Key Performance Indicators</div>
      <div class="grid-3">
        <div class="stat-box"><div class="stat-lbl">Total TVL</div><div class="stat-val">{data['kpis'][0]['value']}</div></div>
        <div class="stat-box"><div class="stat-lbl">30-Day Avg APR</div><div class="stat-val">{data['kpis'][3]['value']}</div></div>
        <div class="stat-box"><div class="stat-lbl">Routed Volume</div><div class="stat-val">{data['kpis'][5]['value']}</div></div>
        <div class="stat-box"><div class="stat-lbl">Liquidity Providers</div><div class="stat-val">{data['kpis'][2]['value']}</div></div>
        <div class="stat-box"><div class="stat-lbl">Cumulative Swaps</div><div class="stat-val">{data['kpis'][4]['value']}</div></div>
        <div class="stat-box"><div class="stat-lbl">PLSX Burn</div><div class="stat-val">{data['kpis'][6]['value']}</div></div>
      </div>
    </div>

    <div class="section-group">
      <div class="section-title">Pool Reserves & Yield</div>
      <table>
        <thead><tr><th>Asset Pair</th><th>Reserves (TVL)</th><th>Implied Yield (APR)</th><th>24h Volume</th></tr></thead>
        <tbody>
          {"".join(f"<tr><td><strong>{p['pair']}</strong></td><td>{p['tvl']}</td><td>{p['apr']}</td><td>{p['vol']}</td></tr>" for p in data['pools'])}
        </tbody>
      </table>
    </div>

    <div style="font-size: 11px; color: var(--text-muted); max-width: 800px; border-top: 1px solid var(--border); padding-top: 16px;">
      {data['defensibility']}
    </div>
  </main>
</body>
</html>"""
    with open("cofounder-site-mockup/variations/v04/index.html", "w") as f: f.write(html)

def write_v05():
    # v05: ticker-tape KPIs, two-row nav, charts-dominant (SVG hero), 7-8 KPIs visible, traffic-light coloring, no trust text only links, serif numerals, footer big CTA
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PlusX LPX Terminal</title>
<style>
  :root {{ --bg: #fdfdfd; --text: #111; --border: #e0e0e0; --green: #16a34a; --amber: #d97706; }}
  body {{ font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 0; }}
  .num {{ font-family: "Georgia", serif; }}
  .ticker {{ background: #111; color: #fff; padding: 8px 0; overflow: hidden; white-space: nowrap; font-size: 13px; text-transform: uppercase; display: flex; }}
  .ticker-item {{ display: inline-block; margin-right: 48px; }}
  .ticker-val {{ color: #4ade80; margin-left: 8px; font-weight: bold; font-family: "Georgia", serif; }}
  .brand-row {{ padding: 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }}
  .nav-row {{ padding: 12px 24px; border-bottom: 1px solid var(--border); background: #f9f9f9; display: flex; gap: 24px; font-size: 13px; font-weight: bold; text-transform: uppercase; }}
  .nav-row a {{ text-decoration: none; color: #555; }} .nav-row a.active {{ color: #111; }}
  main {{ padding: 32px 24px; max-width: 1440px; margin: 0 auto; }}
  .hero-chart-area {{ border: 1px solid var(--border); padding: 24px; margin-bottom: 32px; background: #fff; }}
  .chart-header {{ display: flex; justify-content: space-between; margin-bottom: 24px; }}
  .chart-title {{ font-size: 18px; font-weight: bold; }}
  .chart-value {{ font-size: 32px; color: var(--green); }}
  .svg-chart {{ width: 100%; height: 200px; background: #fafafa; border: 1px solid #eee; }}
  .kpi-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }}
  .kpi-cell {{ border: 1px solid var(--border); padding: 16px; background: #fff; }}
  .kpi-cell .lbl {{ font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; }}
  .kpi-cell .val {{ font-size: 24px; margin-top: 8px; }}
  .health-green {{ color: var(--green); }} .health-amber {{ color: var(--amber); }}
  table {{ width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 64px; }}
  th {{ text-align: left; padding: 12px; border-bottom: 2px solid #111; text-transform: uppercase; font-size: 11px; }}
  td {{ padding: 16px 12px; border-bottom: 1px solid var(--border); }}
  .footer-cta {{ background: #111; color: #fff; text-align: center; padding: 64px 24px; }}
  .footer-cta button {{ background: #fff; color: #111; border: none; padding: 16px 32px; font-size: 18px; font-weight: bold; cursor: pointer; margin-top: 24px; text-transform: uppercase; }}
</style>
</head>
<body>
  <div class="ticker">
    <div style="animation: scroll 20s linear infinite; display:flex;">
      {"".join(f"<div class='ticker-item'>{k['label']} <span class='ticker-val'>{k['value']}</span></div>" for k in data['kpis'])}
    </div>
  </div>
  <div class="brand-row">
    <div style="font-size:24px; font-weight:bold;">PlusX LPX</div>
    <div style="font-size:12px; max-width:300px; text-align:right; color:#666;">{data['one_sentence']}</div>
  </div>
  <div class="nav-row">
    <a href="#" class="active">LPX Dashboard</a>
    <a href="#">uDEX</a>
    <a href="#">ValidatorX</a>
    <a href="#">Portfolio</a>
    <a href="/methodology/">Methodology ↗</a>
  </div>

  <main>
    <div class="hero-chart-area">
      <div class="chart-header">
        <div>
          <div class="chart-title">Total Value Locked (30D Trend)</div>
          <div style="font-size:12px; color:#666;">Data fetched from on-chain reserves</div>
        </div>
        <div class="chart-value num">{data['kpis'][0]['value']}</div>
      </div>
      <svg class="svg-chart" viewBox="0 0 1000 200" preserveAspectRatio="none">
        <path d="M0,180 L100,160 L200,170 L300,140 L400,150 L500,110 L600,120 L700,80 L800,90 L900,40 L1000,20 L1000,200 L0,200 Z" fill="#ecfdf5" opacity="0.5"/>
        <path d="M0,180 L100,160 L200,170 L300,140 L400,150 L500,110 L600,120 L700,80 L800,90 L900,40 L1000,20" fill="none" stroke="var(--green)" stroke-width="3"/>
      </svg>
    </div>

    <div class="kpi-grid">
      {"".join(f"<div class='kpi-cell'><div class='lbl'>{k['label']}</div><div class='val num health-green'>{k['value']}</div></div>" for k in data['kpis'][1:])}
    </div>

    <table>
      <thead><tr><th>Pair</th><th>TVL</th><th>APR</th><th>24h Vol</th></tr></thead>
      <tbody>
        {"".join(f"<tr><td><strong>{p['pair']}</strong></td><td class='num'>{p['tvl']}</td><td class='num health-green'>{p['apr']}</td><td class='num'>{p['vol']}</td></tr>" for p in data['pools'])}
      </tbody>
    </table>
  </main>

  <div class="footer-cta">
    <div style="font-size:24px; font-weight:bold; margin-bottom:16px;">Ready to deploy capital?</div>
    <div style="color:#aaa;">Join {data['kpis'][2]['value']} liquidity providers today.</div>
    <button>Connect Wallet</button>
  </div>
</body>
</html>"""
    with open("cofounder-site-mockup/variations/v05/index.html", "w") as f: f.write(html)

def write_v06():
    # v06: health-doughnut + table, all data visible, monochrome + teal, verified badge on KPIs, all-sans modern, top-right CTA
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PlusX LPX</title>
<style>
  :root {{ --bg: #ffffff; --surface: #f4f4f5; --text: #18181b; --text-muted: #71717a; --border: #e4e4e7; --teal: #0d9488; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--text); margin: 0; }}
  header {{ display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; border-bottom: 1px solid var(--border); }}
  .nav-group {{ display: flex; gap: 32px; align-items: center; }}
  .nav-group a {{ text-decoration: none; color: var(--text-muted); font-size: 14px; font-weight: 500; }}
  .nav-group a.active {{ color: var(--text); }}
  .btn {{ background: var(--text); color: var(--bg); padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; }}
  .container {{ max-width: 1280px; margin: 40px auto; padding: 0 40px; display: grid; grid-template-columns: 300px 1fr; gap: 40px; }}
  .sidebar-data {{ background: var(--surface); padding: 24px; border-radius: 12px; }}
  .doughnut-container {{ position: relative; width: 200px; height: 200px; margin: 0 auto 32px; }}
  .doughnut-text {{ position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; }}
  .dt-val {{ font-size: 24px; font-weight: 700; color: var(--teal); }}
  .dt-lbl {{ font-size: 12px; color: var(--text-muted); text-transform: uppercase; }}
  .mini-kpi {{ display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }}
  .mini-lbl {{ font-size: 13px; color: var(--text-muted); }} .mini-val {{ font-size: 14px; font-weight: 600; display:flex; align-items:center; gap:8px; }}
  .v-badge {{ background: #ccfbf1; color: #115e59; font-size: 10px; padding: 2px 6px; border-radius: 4px; }}
  .main-data h1 {{ margin-top: 0; font-size: 28px; }}
  .desc {{ color: var(--text-muted); font-size: 16px; margin-bottom: 40px; line-height: 1.5; }}
  table {{ width: 100%; border-collapse: separate; border-spacing: 0; }}
  th {{ text-align: left; padding: 16px; background: var(--surface); color: var(--text-muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid var(--border); }}
  td {{ padding: 20px 16px; border-bottom: 1px solid var(--border); font-size: 15px; font-weight: 500; }}
  .def-footer {{ grid-column: 1 / -1; margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border); font-size: 13px; color: var(--text-muted); }}
  @media (max-width: 900px) {{ .container {{ grid-template-columns: 1fr; }} }}
</style>
</head>
<body>
  <header>
    <div class="nav-group">
      <div style="font-size:20px; font-weight:800; margin-right:24px;">PlusX</div>
      <a href="#" class="active">LPX</a> <a href="#">uDEX</a> <a href="#">ValidatorX</a> <a href="#">Portfolio</a> <a href="#">Docs</a>
    </div>
    <button class="btn">Connect Wallet</button>
  </header>
  <div class="container">
    <div class="sidebar-data">
      <div class="doughnut-container">
        <svg viewBox="0 0 36 36">
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e4e4e7" stroke-width="4"/>
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--teal)" stroke-width="4" stroke-dasharray="80, 100"/>
        </svg>
        <div class="doughnut-text">
          <div class="dt-val">{data['kpis'][0]['value']}</div>
          <div class="dt-lbl">Total TVL</div>
        </div>
      </div>
      {"".join(f"<div class='mini-kpi'><div class='mini-lbl'>{k['label']}</div><div class='mini-val'>{k['value']} <span class='v-badge'>✓</span></div></div>" for k in data['kpis'][1:])}
    </div>
    <div class="main-data">
      <h1>{data['protocol_name']} Dashboard</h1>
      <p class="desc">{data['one_sentence']} <br><br> {data['tagline']}</p>
      <table>
        <thead><tr><th>Pool Pair</th><th>TVL</th><th>APR</th><th>24h Volume</th></tr></thead>
        <tbody>
          {"".join(f"<tr><td>{p['pair']}</td><td>{p['tvl']}</td><td style='color:var(--teal)'>{p['apr']}</td><td>{p['vol']}</td></tr>" for p in data['pools'])}
        </tbody>
      </table>
    </div>
    <div class="def-footer">{data['defensibility']}</div>
  </div>
</body>
</html>"""
    with open("cofounder-site-mockup/variations/v06/index.html", "w") as f: f.write(html)

def write_v07():
    # v07: split column (cards left, summary right), sticky nav, 4 KPIs, subtle gradient, contract addrs footer, monospace numbers, top-right + per pool action
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PlusX LPX</title>
<style>
  :root {{ --bg: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%); --text: #2c3e50; --border: #cfd9df; --accent: #2980b9; }}
  body {{ font-family: -apple-system, sans-serif; background: var(--bg); color: var(--text); margin: 0; min-height: 100vh; }}
  .mono {{ font-family: "SF Mono", monospace; }}
  nav {{ position: sticky; top: 0; background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); z-index: 100; }}
  .nav-menu select {{ border: 1px solid var(--border); background: transparent; padding: 8px; font-size: 14px; border-radius: 4px; }}
  .btn-wallet {{ background: var(--text); color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer; }}
  .layout {{ display: flex; max-width: 1400px; margin: 40px auto; gap: 40px; padding: 0 32px; }}
  .col-cards {{ flex: 2; }}
  .col-summary {{ flex: 1; }}
  .summary-box {{ background: white; padding: 32px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); position: sticky; top: 100px; }}
  .sum-title {{ font-size: 24px; font-weight: bold; margin-bottom: 16px; margin-top: 0; }}
  .sum-desc {{ font-size: 15px; color: #7f8c8d; margin-bottom: 32px; line-height: 1.6; }}
  .kpi-row {{ display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid var(--border); }}
  .kpi-row:last-child {{ border: none; }}
  .kpi-lbl {{ font-size: 14px; color: #7f8c8d; }}
  .kpi-val {{ font-size: 18px; font-weight: bold; }}
  .pool-card {{ background: white; border-radius: 8px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; justify-content: space-between; align-items: center; border: 1px solid white; transition: border 0.2s; }}
  .pool-card:hover {{ border-color: var(--accent); }}
  .pc-left {{ display: flex; flex-direction: column; gap: 8px; }}
  .pc-name {{ font-size: 18px; font-weight: bold; }}
  .pc-stats {{ display: flex; gap: 24px; font-size: 14px; color: #7f8c8d; }}
  .btn-action {{ background: transparent; border: 2px solid var(--accent); color: var(--accent); padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer; }}
  .footer {{ background: var(--text); color: #ecf0f1; padding: 32px; text-align: center; margin-top: 64px; font-size: 12px; }}
  @media (max-width: 900px) {{ .layout {{ flex-direction: column-reverse; }} .summary-box {{ position: static; }} .pool-card {{ flex-direction: column; align-items: flex-start; gap: 16px; }} }}
</style>
</head>
<body>
  <nav>
    <div style="font-size:24px; font-weight:900; letter-spacing:-1px;">PlusX</div>
    <div class="nav-menu">
      <select onchange="window.location.href=this.value">
        <option value="#">LPX Dashboard</option>
        <option value="#">uDEX</option>
        <option value="#">ValidatorX</option>
        <option value="#">Portfolio</option>
        <option value="/methodology/">Docs & Methodology</option>
      </select>
    </div>
    <button class="btn-wallet">Connect Wallet</button>
  </nav>

  <div class="layout">
    <div class="col-cards">
      <h2 style="margin-top:0; margin-bottom:24px;">Active Liquidity Pools</h2>
      {"".join(f'''
      <div class="pool-card">
        <div class="pc-left">
          <div class="pc-name">{p['pair']}</div>
          <div class="pc-stats">
            <div>TVL: <span class="mono" style="color:var(--text);font-weight:bold;">{p['tvl']}</span></div>
            <div>APR: <span class="mono" style="color:var(--accent);font-weight:bold;">{p['apr']}</span></div>
            <div>Vol: <span class="mono">{p['vol']}</span></div>
          </div>
        </div>
        <button class="btn-action">Manage</button>
      </div>
      ''' for p in data['pools'])}
    </div>

    <div class="col-summary">
      <div class="summary-box">
        <h1 class="sum-title">Protocol Overview</h1>
        <p class="sum-desc">{data['one_sentence']} <br><br> {data['tagline']}</p>
        <div class="kpi-row"><span class="kpi-lbl">Total TVL</span><span class="kpi-val mono">{data['kpis'][0]['value']}</span></div>
        <div class="kpi-row"><span class="kpi-lbl">Avg APR</span><span class="kpi-val mono">{data['kpis'][3]['value']}</span></div>
        <div class="kpi-row"><span class="kpi-lbl">Total Volume</span><span class="kpi-val mono">{data['kpis'][5]['value']}</span></div>
        <div class="kpi-row"><span class="kpi-lbl">Active Pools</span><span class="kpi-val mono">{data['kpis'][1]['value']}</span></div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div style="max-width:800px; margin:0 auto; margin-bottom:16px;">{data['defensibility']}</div>
    <div class="mono" style="color:#bdc3c7;">Contract: LPX_MAIN 0x123...456 | Verified Build</div>
  </div>
</body>
</html>"""
    with open("cofounder-site-mockup/variations/v07/index.html", "w") as f: f.write(html)

def write_v08():
    # v08: single big TVL centered, left sidebar, pool table dominant, grid+5 pools, blue + red accent, methodology link inline, classic serif headers, top-right CTA
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PlusX LPX</title>
<style>
  :root {{ --bg: #ffffff; --surface: #f8fafc; --text: #0f172a; --border: #cbd5e1; --blue: #1e3a8a; --red: #dc2626; }}
  body {{ font-family: -apple-system, sans-serif; background: var(--bg); color: var(--text); margin: 0; display: flex; height: 100vh; }}
  h1, h2, h3 {{ font-family: "Georgia", serif; font-weight: normal; }}
  aside {{ width: 260px; background: var(--surface); border-right: 1px solid var(--border); padding: 32px 0; display: flex; flex-direction: column; }}
  .logo {{ padding: 0 32px 32px; font-size: 24px; font-weight: bold; font-family: "Georgia", serif; border-bottom: 1px solid var(--border); margin-bottom: 24px; }}
  .nav-item {{ padding: 12px 32px; color: #475569; text-decoration: none; font-size: 14px; font-weight: 500; display: block; }}
  .nav-item:hover {{ background: #e2e8f0; }}
  .nav-item.active {{ color: var(--blue); border-left: 4px solid var(--blue); background: #eff6ff; padding-left: 28px; }}
  main {{ flex: 1; display: flex; flex-direction: column; overflow-y: auto; }}
  header {{ padding: 24px 48px; display: flex; justify-content: flex-end; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg); }}
  .btn {{ background: var(--blue); color: white; border: none; padding: 10px 24px; font-size: 14px; border-radius: 4px; cursor: pointer; font-family: sans-serif; }}
  .content {{ padding: 48px; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box; }}
  .hero-center {{ text-align: center; margin-bottom: 64px; }}
  .hc-lbl {{ font-size: 16px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; }}
  .hc-val {{ font-size: 80px; font-family: "Georgia", serif; margin: 0; color: var(--blue); line-height: 1; }}
  .hc-link {{ font-size: 14px; color: var(--blue); text-decoration: underline; margin-top: 16px; display: inline-block; }}
  .kpi-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 64px; }}
  .kpi-card {{ border: 1px solid var(--border); padding: 24px; border-top: 3px solid var(--blue); }}
  .kpi-card.warn {{ border-top-color: var(--red); }}
  .kc-lbl {{ font-size: 13px; color: #64748b; margin-bottom: 8px; }}
  .kc-val {{ font-size: 24px; font-weight: 600; font-family: "Georgia", serif; }}
  table {{ width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 48px; }}
  th {{ font-family: "Georgia", serif; font-size: 14px; color: #64748b; border-bottom: 2px solid var(--border); padding: 16px 8px; font-weight: normal; }}
  td {{ padding: 16px 8px; border-bottom: 1px solid var(--border); font-size: 15px; }}
  .footer-note {{ font-size: 12px; color: #94a3b8; border-top: 1px solid var(--border); padding-top: 24px; line-height: 1.6; }}
  @media (max-width: 768px) {{ body {{ flex-direction: column; }} aside {{ width: 100%; border-right: none; border-bottom: 1px solid var(--border); padding: 16px 0; }} .logo {{ padding-bottom: 16px; margin-bottom: 8px; }} .kpi-grid {{ grid-template-columns: 1fr 1fr; }} .hc-val {{ font-size: 48px; }} }}
</style>
</head>
<body>
  <aside>
    <div class="logo">PlusX</div>
    <a href="#" class="nav-item active">LPX Protocol</a>
    <a href="#" class="nav-item">uDEX</a>
    <a href="#" class="nav-item">ValidatorX</a>
    <a href="#" class="nav-item">Portfolio</a>
    <a href="#" class="nav-item">Docs</a>
  </aside>
  <main>
    <header><button class="btn">Connect Wallet</button></header>
    <div class="content">
      <div class="hero-center">
        <div class="hc-lbl">Total Value Locked</div>
        <h1 class="hc-val">{data['kpis'][0]['value']}</h1>
        <a href="/methodology/" class="hc-link">View Methodology & On-Chain Proof ↗</a>
        <p style="color:#64748b; margin-top:24px; max-width:600px; margin-left:auto; margin-right:auto;">{data['one_sentence']} {data['tagline']}</p>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card"><div class="kc-lbl">30-Day Avg APR</div><div class="kc-val">{data['kpis'][3]['value']}</div></div>
        <div class="kpi-card"><div class="kc-lbl">Total Volume</div><div class="kc-val">{data['kpis'][5]['value']}</div></div>
        <div class="kpi-card warn"><div class="kc-lbl">PLSX Burn (Notice)</div><div class="kc-val" style="color:var(--red);">{data['kpis'][6]['value']}</div></div>
        <div class="kpi-card"><div class="kc-lbl">Active Pools</div><div class="kc-val">{data['kpis'][1]['value']}</div></div>
      </div>

      <h2>Liquidity Pools</h2>
      <table>
        <thead><tr><th>Pair</th><th>TVL</th><th>APR</th><th>24h Volume</th></tr></thead>
        <tbody>
          {"".join(f"<tr><td><strong>{p['pair']}</strong></td><td>{p['tvl']}</td><td style='color:var(--blue);'>{p['apr']}</td><td>{p['vol']}</td></tr>" for p in data['pools'])}
        </tbody>
      </table>

      <div class="footer-note">{data['defensibility']}</div>
    </div>
  </main>
</body>
</html>"""
    with open("cofounder-site-mockup/variations/v08/index.html", "w") as f: f.write(html)

write_v01()
write_v02()
write_v03()
write_v04()
write_v05()
write_v06()
write_v07()
write_v08()
