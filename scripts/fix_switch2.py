import os
ctx_path = r"c:\Users\shado\Documents\GitHub\LifeLine-Agent\frontend\src\context\DashboardContext.tsx"
with open(ctx_path, "r", encoding="utf-8") as f:
    content = f.read()

target = "    }, [router]);"
replacement = "    }, [router]);\n\n    const switchUserRole = useCallback((role: UserRole) => { console.warn('switchUserRole is deprecated'); }, []);"

# I'll find the last occurrence of the target in the auth block or just inject it.
auth_block = "const logout = useCallback(() => {"
idx = content.find(auth_block)
if idx != -1:
    idx2 = content.find("}, [router]);", idx)
    if idx2 != -1:
        content = content[:idx2 + 13] + "\n\n    const switchUserRole = useCallback((role: UserRole) => { console.warn('switchUserRole is deprecated'); }, []);" + content[idx2 + 13:]

with open(ctx_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Injected switchUserRole")
