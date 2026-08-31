import re

ctx_path = r"c:\Users\shado\Documents\GitHub\LifeLine-Agent\frontend\src\context\DashboardContext.tsx"
with open(ctx_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add to DashboardContextType
if "isAuthLoading: boolean;" not in content:
    content = content.replace(
        "currentUser: AuthUser | null;",
        "currentUser: AuthUser | null;\n  isAuthLoading: boolean;"
    )

# 2. Add state
if "const [isAuthLoading, setIsAuthLoading]" not in content:
    content = content.replace(
        "const [authToken, setAuthToken] = useState<string | null>(null);",
        "const [authToken, setAuthToken] = useState<string | null>(null);\n  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);"
    )

# 3. Update useEffect
if "setIsAuthLoading(false);" not in content:
    content = re.sub(
        r"(if \(data\.hospitalId\) setActiveHospitalId\(data\.hospitalId\);\n\s*\})",
        r"\1\n          setIsAuthLoading(false);",
        content
    )
    content = re.sub(
        r"(setCurrentUser\(null\);\n\s*setAuthToken\(null\);)",
        r"\1\n        setIsAuthLoading(false);",
        content
    )

# 4. Add to value
if "isAuthLoading,\n" not in content:
    content = content.replace(
        "currentUser,\n",
        "currentUser,\n          isAuthLoading,\n"
    )

with open(ctx_path, "w", encoding="utf-8") as f:
    f.write(content)
print("DashboardContext isAuthLoading patched!")
