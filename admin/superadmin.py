"""
Super Admin Panel — LifeLine Agent
Streamlit-based admin UI for managing API keys and credentials securely.

Features:
  • First-run setup wizard (create admin account)
  • Hashed password authentication (bcrypt)
  • UI to set/update all API keys (stored encrypted, never hardcoded)
  • Session lock: keys are only in memory during the session

Run with:
    streamlit run admin/superadmin.py
"""

import streamlit as st
import sys
import os

# Make sure src/ is importable when run from project root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from admin.auth import (
    admin_exists,
    create_admin,
    verify_password,
    change_password,
)
from admin.config_manager import (
    load_config,
    save_config,
    get_key,
    KEY_LABELS,
    KEY_DESCRIPTIONS,
)

st.set_page_config(
    page_title="LifeLine Admin",
    page_icon="🚑",
    layout="centered",
)

# ── Session State Defaults ─────────────────────────────────────────────────────
if "authenticated" not in st.session_state:
    st.session_state.authenticated = False
if "active_tab" not in st.session_state:
    st.session_state.active_tab = "api_keys"


# ══════════════════════════════════════════════════════════════════════════════
# FIRST-RUN: No admin account exists yet → setup wizard
# ══════════════════════════════════════════════════════════════════════════════
def setup_wizard():
    st.title("🚑 LifeLine Agent — First-Time Setup")
    st.info(
        "No administrator account detected. Create your super admin credentials below. "
        "**These will never be stored in plain text.**"
    )

    with st.form("setup_form"):
        st.subheader("Create Super Admin Account")
        username = st.text_input("Admin username", placeholder="e.g. lifeline_admin")
        password = st.text_input("Password", type="password")
        password_confirm = st.text_input("Confirm password", type="password")
        submitted = st.form_submit_button("Create Account & Continue →")

    if submitted:
        if not username.strip():
            st.error("Username cannot be empty.")
        elif len(password) < 8:
            st.error("Password must be at least 8 characters.")
        elif password != password_confirm:
            st.error("Passwords do not match.")
        else:
            create_admin(username.strip(), password)
            st.success("Admin account created! Refresh the page to log in.")
            st.balloons()


# ══════════════════════════════════════════════════════════════════════════════
# LOGIN PAGE
# ══════════════════════════════════════════════════════════════════════════════
def login_page():
    st.title("🚑 LifeLine Agent — Admin Login")

    with st.form("login_form"):
        username = st.text_input("Username")
        password = st.text_input("Password", type="password")
        submitted = st.form_submit_button("Login")

    if submitted:
        if verify_password(username, password):
            st.session_state.authenticated = True
            st.session_state.admin_username = username
            st.rerun()
        else:
            st.error("❌ Invalid username or password.")


# ══════════════════════════════════════════════════════════════════════════════
# MAIN ADMIN PANEL (authenticated)
# ══════════════════════════════════════════════════════════════════════════════
def admin_panel():
    # ── Header ────────────────────────────────────────────────────────────────
    col1, col2 = st.columns([4, 1])
    with col1:
        st.title("🚑 LifeLine Agent — Super Admin Panel")
        st.caption(f"Logged in as **{st.session_state.get('admin_username', 'admin')}**")
    with col2:
        if st.button("🔒 Logout", use_container_width=True):
            st.session_state.authenticated = False
            st.rerun()

    st.divider()

    # ── Navigation Tabs ───────────────────────────────────────────────────────
    tab_keys, tab_status, tab_password = st.tabs(
        ["🔑 API Keys", "📊 System Status", "🔐 Change Password"]
    )

    # ────────────────────────────────────────────────────────────────────────
    # TAB 1: API Keys
    # ────────────────────────────────────────────────────────────────────────
    with tab_keys:
        st.subheader("Manage API Keys & Configuration")
        st.warning(
            "⚠️ All keys are stored encrypted on disk. They are **never written "
            "to source code or version control**. The `.admin_config.enc` file "
            "is listed in `.gitignore`."
        )

        config = load_config()

        with st.form("api_keys_form"):
            new_values = {}
            for key_name, label in KEY_LABELS.items():
                current = get_key(config, key_name)
                desc = KEY_DESCRIPTIONS.get(key_name, "")
                # Show masked current value if one exists
                placeholder = "••••••••" if current else f"Enter {label}"
                st.markdown(f"**{label}**")
                if desc:
                    st.caption(desc)
                new_values[key_name] = st.text_input(
                    label,
                    value="",
                    placeholder=placeholder,
                    type="password",
                    label_visibility="collapsed",
                    key=f"input_{key_name}",
                )

            save_btn = st.form_submit_button("💾 Save All Keys", type="primary")

        if save_btn:
            updated = 0
            for key_name, value in new_values.items():
                if value.strip():  # only update if user typed something
                    config[key_name] = value.strip()
                    updated += 1
            if updated:
                save_config(config)
                st.success(f"✅ {updated} key(s) saved and encrypted.")
            else:
                st.info("No changes — enter a value in any field to update it.")

        # Show which keys are currently set (masked)
        st.subheader("Current Key Status")
        config = load_config()
        for key_name, label in KEY_LABELS.items():
            current = get_key(config, key_name)
            if current:
                masked = current[:4] + "••••••••" + current[-4:] if len(current) > 8 else "••••••••"
                st.markdown(f"✅ **{label}**: `{masked}`")
            else:
                st.markdown(f"❌ **{label}**: *not set*")

    # ────────────────────────────────────────────────────────────────────────
    # TAB 2: System Status
    # ────────────────────────────────────────────────────────────────────────
    with tab_status:
        st.subheader("System Configuration Status")

        config = load_config()

        checks = {
            "Gemini API Key": "GEMINI_API_KEY",
            "GCP Project ID": "GCP_PROJECT_ID",
            "Firestore Collection": "FIRESTORE_COLLECTION",
            "Demo City": "DEMO_CITY",
        }

        all_ok = True
        for label, key in checks.items():
            val = get_key(config, key)
            if val:
                st.success(f"✅ {label} is configured")
            else:
                st.error(f"❌ {label} is NOT set — go to API Keys tab")
                all_ok = False

        st.divider()
        if all_ok:
            st.success("🟢 System is fully configured and ready to run.")
        else:
            st.warning("🟡 Some settings are missing. The pipeline may fail on incomplete config.")

        st.subheader("Config File Location")
        config_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", ".admin_config.enc")
        )
        st.code(config_path)
        st.caption("This file is AES-encrypted and excluded from git.")

    # ────────────────────────────────────────────────────────────────────────
    # TAB 3: Change Password
    # ────────────────────────────────────────────────────────────────────────
    with tab_password:
        st.subheader("Change Admin Password")

        with st.form("change_password_form"):
            current_pw = st.text_input("Current password", type="password")
            new_pw = st.text_input("New password (min 8 chars)", type="password")
            new_pw_confirm = st.text_input("Confirm new password", type="password")
            change_btn = st.form_submit_button("Update Password")

        if change_btn:
            username = st.session_state.get("admin_username", "")
            if not verify_password(username, current_pw):
                st.error("Current password is incorrect.")
            elif len(new_pw) < 8:
                st.error("New password must be at least 8 characters.")
            elif new_pw != new_pw_confirm:
                st.error("New passwords do not match.")
            else:
                change_password(username, new_pw)
                st.success("✅ Password updated successfully.")


# ══════════════════════════════════════════════════════════════════════════════
# ROUTER
# ══════════════════════════════════════════════════════════════════════════════
if not admin_exists():
    setup_wizard()
elif not st.session_state.authenticated:
    login_page()
else:
    admin_panel()

