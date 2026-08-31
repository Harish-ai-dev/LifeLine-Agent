import os

ctx_path = r"c:\Users\shado\Documents\GitHub\LifeLine-Agent\frontend\src\context\DashboardContext.tsx"

with open(ctx_path, "r", encoding="utf-8") as f:
    content = f.read()

target = """    const logout = useCallback(() => {
      const auth = getFirebaseAuth();
      if (auth) signOut(auth);
      router.push('/');
    }, [router]);"""

replacement = """    const logout = useCallback(() => {
      const auth = getFirebaseAuth();
      if (auth) signOut(auth);
      router.push('/');
    }, [router]);

    const switchUserRole = useCallback((role: UserRole) => {
      console.warn('switchUserRole is deprecated');
    }, []);"""

if target in content:
    content = content.replace(target, replacement)
    with open(ctx_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Replaced!")
else:
    print("Target not found")
