import re
rg_path = r"c:\Users\shado\Documents\GitHub\LifeLine-Agent\frontend\src\components\RoleGuard.tsx"

with open(rg_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add isAuthLoading to destructuring
content = content.replace("const { currentUser, authToken, logout } = useDashboard();", "const { currentUser, authToken, logout, isAuthLoading } = useDashboard();")

# Update logic
new_logic = """  useEffect(() => {
    if (!isAuthLoading && (!authToken || !currentUser)) {
      router.push('/');
    }
  }, [authToken, currentUser, isAuthLoading, router]);

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Activity className="w-6 h-6 animate-spin text-slate-400" /></div>;
  }

  if (!authToken || !currentUser) {
    return null; // Let the redirect trigger
  }"""

content = re.sub(
    r"  useEffect\(\(\) => \{.*?if \(\!authToken \|\| \!currentUser\) \{.*?\};",
    new_logic,
    content,
    flags=re.DOTALL
)

with open(rg_path, "w", encoding="utf-8") as f:
    f.write(content)
print("RoleGuard patched!")
