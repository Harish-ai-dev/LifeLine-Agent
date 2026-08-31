import sys

path = r'frontend/src/context/DashboardContext.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

old_code = r'''const getDocPromise = getDoc\(doc\(db, "users", user\.uid\)\);
\s+const timeoutPromise = new Promise\(\(_, reject\) => setTimeout\(\(\) => reject\(new Error\("Firestore timeout"\)\), 2000\)\);
\s+const userDoc = await Promise\.race\(\[getDocPromise, timeoutPromise\]\) as any;'''

new_code = '''const getDocPromise = getDoc(doc(db, "users", user.uid));
                let timeoutHandle: any;
                const timeoutPromise = new Promise((_, reject) => {
                  timeoutHandle = setTimeout(() => reject(new Error("Firestore timeout")), 2000);
                });
                
                const userDoc = await Promise.race([
                  getDocPromise.then(res => { clearTimeout(timeoutHandle); return res; }),
                  timeoutPromise
                ]) as any;'''

new_content = re.sub(old_code, new_code, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replaced:", content != new_content)
