import re
ctx_path = r"c:\Users\shado\Documents\GitHub\LifeLine-Agent\frontend\src\context\DashboardContext.tsx"

with open(ctx_path, "r", encoding="utf-8") as f:
    content = f.read()

# Make sure setIsAuthLoading(false) is called in all branches of `if (user)`
auth_effect = """    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
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
            } else {
              console.warn("No user profile found in Firestore.");
            }
          }
        } catch (err) {
          console.error("Auth state processing error:", err);
        } finally {
          setIsAuthLoading(false);
        }
      } else {
        setCurrentUser(null);
        setAuthToken(null);
        setIsAuthLoading(false);
      }
    });"""

# Replace the current onAuthStateChanged block
content = re.sub(
    r"    const unsubscribe = onAuthStateChanged\(auth, async \(user\) => \{.*?\n\s*setIsAuthLoading\(false\);\n\s*\}\n\s*\}\);\n",
    auth_effect + "\n",
    content,
    flags=re.DOTALL
)

with open(ctx_path, "w", encoding="utf-8") as f:
    f.write(content)
print("DashboardContext auth effect patched!")
