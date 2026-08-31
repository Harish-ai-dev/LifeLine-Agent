import re

login_path = r"c:\Users\shado\Documents\GitHub\LifeLine-Agent\frontend\src\components\auth\LoginView.tsx"

with open(login_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace handleLogin logic
handle_regex = re.compile(r"const handleSubmit = async \(e: React.FormEvent\) => \{.*?\n\s*// --- End of handleSubmit ---", re.DOTALL)
# Wait, let's just find `const handleSubmit = async (e: React.FormEvent) => { ... }`
# It's better to just do a string replace since we know the approximate structure
handle_login_start = "const handleSubmit = async (e: React.FormEvent) => {"
handle_login_end = "setIsLoading(false);\n  };"

new_handle = """const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      setSuccess(`Authenticating with Firebase...`);
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase Auth is missing.");
      await signInWithEmailAndPassword(auth, username.trim(), password);
      
      // Wait a moment for onAuthStateChanged to propagate
      setTimeout(() => {
        if (portal.role === 'hospital_staff') router.push('/hospital');
        else if (portal.role === 'government_authority') router.push('/government');
        else if (portal.role === 'blood_donor') router.push('/donor');
      }, 500);

    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };"""

content = re.sub(r"const handleSubmit = async \(e: React\.FormEvent\) => \{.*?\n\s*setIsLoading\(false\);\n\s*\};", new_handle, content, flags=re.DOTALL)

with open(login_path, "w", encoding="utf-8") as f:
    f.write(content)
print("LoginView patched!")
