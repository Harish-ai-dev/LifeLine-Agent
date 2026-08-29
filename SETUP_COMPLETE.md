# LifeLine Agent Setup Complete ✅

## What Has Been Fixed

### 1. Dependency Installation (Fixed Python 3.14 resolver issue)
- Installed core packages individually to avoid `resolution-too-deep` error:
  ```
  pip install google-adk google-genai firebase-admin google-cloud-firestore fastapi uvicorn requests typer rich cryptography pydantic httpx
  pip install genkit>=0.9.0 streamlit
  pip install -e . --no-deps
  ```

### 2. start.bat Formatting Bug (Fixed)
- Fixed missing `echo` on line 16:
  ```diff
  -     - UI:   http://localhost:5173
  + echo    - UI:   http://localhost:5173
  ```

### 3. Data Files Created
- Created `data/hospitals.json` with 3 sample hospitals
- Created `data/hospitals_raw.json` with hospital place IDs

### 4. CLI Now Working
- `lifeline` command registered via `pip install -e .`
- Accessible via `python -m lifeline` as well
- All commands functional: `version`, `init`, `status`, `admin`, `run`, `ui`, `fetch-hospitals`, `seed`, `dispatch`, `test`, `logs`

## What You Need to Do Next

### 1. Get Real Hospital Data (Optional)
Run one of these:
```bash
# Try to fetch real data from OpenStreetMap (may timeout)
python -m lifeline fetch-hospitals

# Or use the sample data already created
```

### 2. Seed Hospital Data with Bed Counts
```bash
python -m lifeline seed
```

### 3. Start the System
**Option A: Single Terminal (Recommended)**
```bash
start.bat
```
This will start both backend (port 8000) and frontend (port 5173) in the same terminal window.

**Option B: Separate Terminals**
Terminal 1:
```bash
python -m lifeline run
```
Terminal 2:
```bash
cd frontend && npm run dev
```

### 4. Test the System
In a new terminal:
```bash
python -m lifeline dispatch
```

### 5. Access the Web UI
Open your browser to: http://localhost:5173

## Available CLI Commands
```
lifeline version     - Show version
lifeline init        - Setup wizard (API keys, Firebase)
lifeline status      - System health dashboard
lifeline admin       - Super Admin Panel
lifeline run         - Start API server (backend)
lifeline ui          - Launch Streamlit UI
lifeline fetch-hospitals - Get real hospital data
lifeline seed        - Add simulated bed data
lifeline dispatch    - Run full pipeline test
lifeline logs        - View Firestore audit logs
lifeline test        - Run test suite
```

## Troubleshooting

### If you get "lifeline: command not found":
- Run `python -m lifeline <command>` instead
- Or restart your terminal after `pip install -e .`

### If ports are already in use:
- Check what's running on ports 8000 and 5173
- Change ports in the source code if needed

### API Keys:
- Run `python -m lifeline init` or `python -m lifeline admin` to configure:
  - Gemini API key (for agents)
  - Firebase service account (for audit logging)

## System Architecture
- **Backend**: FastAPI on port 8000
- **Frontend**: React + Vite on port 5173  
- **Agents**: Google ADK with Gemini 2.5-flash
- **Pipeline**: Triage → Bed-Matching → Routing → Briefing
- **Data**: Hospital data from OpenStreetMap, simulated bed counts
- **Logging**: Firestore audit trail

The LifeLine Agent autonomous emergency dispatch system is now ready to use!