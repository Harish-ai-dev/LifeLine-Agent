import re
import os

ctx_path = r"c:\Users\shado\Documents\GitHub\LifeLine-Agent\frontend\src\context\DashboardContext.tsx"

with open(ctx_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Firebase auth imports
if "onAuthStateChanged" not in content:
    content = content.replace(
        'import { collection, query, where, onSnapshot } from "firebase/firestore";',
        'import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";\nimport { getFirebaseAuth } from "@/lib/firebase";\nimport { onAuthStateChanged, signOut } from "firebase/auth";'
    )

# 2. Update Types
content = content.replace("currentUser: AuthUser;", "currentUser: AuthUser | null;")
content = content.replace("authToken: string;", "authToken: string | null;")

# 3. Replace state initialization
old_state = """  // ── AUTHENTICATION & PERSONA STATE (09-parallel-build-contract.md) ───────
  const [currentUser, setCurrentUser] = useState<AuthUser>(DEMO_USERS[0]);
  const [authToken, setAuthToken] = useState<string>(`lifeline_mock_${DEMO_USERS[0].role}_${DEMO_USERS[0].id}`);"""

new_state = """  // ── AUTHENTICATION & PERSONA STATE (09-parallel-build-contract.md) ───────
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);"""

content = content.replace(old_state, new_state)

# 4. Replace useEffect for auth (Wait, it's just `if (authToken && db)` right now)
# We will inject a new useEffect for Firebase Auth right before it.
auth_effect = """
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setAuthToken(token);
        
        const db = getFirebaseDb();
        if (db) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setCurrentUser({
              id: user.uid,
              username: data.name || user.email,
              role: data.role as UserRole,
              facility_id: data.hospitalId,
              donor_id: data.role === "blood_donor" ? user.uid : undefined,
            });
            if (data.hospitalId) setActiveHospitalId(data.hospitalId);
          }
        }
      } else {
        setCurrentUser(null);
        setAuthToken(null);
      }
    });

    return () => unsubscribe();
  }, []);
"""

if "onAuthStateChanged(auth" not in content:
    content = content.replace("useEffect(() => {\n    const db = getFirebaseDb();", auth_effect + "\n  useEffect(() => {\n    const db = getFirebaseDb();")


# 5. Replace login, logout, switchUserRole logic to use new patterns or remove them.
# The user wants demo accounts to still exist for Judges maybe? But the user says: "Real email/password fields... submitted to Firebase Auth directly."
# So `login` in context is not doing auth anymore. Let's just make it a no-op or remove it.
# Actually let's just rewrite the `login` function.
login_regex = re.compile(r"const login = useCallback\(\s*async \([^)]*\) => \{.*?\n\s*\},.*?\[.*?\]\n\s*\);", re.DOTALL)
new_login = """  const login = useCallback(
    async (username: string, role: UserRole, facilityId?: string, donorId?: string) => {
      // Login is now handled by LoginView.tsx via Firebase Auth
      // This is left as a fallback interface for legacy components
      console.warn("login() in DashboardContext is deprecated. Use Firebase Auth.");
    },
    []
  );"""
content = login_regex.sub(new_login, content)

logout_regex = re.compile(r"const logout = useCallback\(\(\) => \{.*?\n\s*\},.*?\[.*?\]\n\s*\);", re.DOTALL)
new_logout = """  const logout = useCallback(() => {
    const auth = getFirebaseAuth();
    if (auth) signOut(auth);
    router.push('/');
  }, [router]);"""
content = logout_regex.sub(new_logout, content)

switch_regex = re.compile(r"const switchUserRole = useCallback\(\s*\(role: UserRole\) => \{.*?\n\s*\},.*?\[.*?\]\n\s*\);", re.DOTALL)
new_switch = """  const switchUserRole = useCallback(
    (role: UserRole) => {
      console.warn("switchUserRole is deprecated with strict Firebase Auth");
    },
    []
  );"""
content = switch_regex.sub(new_switch, content)

with open(ctx_path, "w", encoding="utf-8") as f:
    f.write(content)
print("DashboardContext patched!")
