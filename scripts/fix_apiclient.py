import re

api_path = r"c:\Users\shado\Documents\GitHub\LifeLine-Agent\frontend\src\utils\apiClient.ts"
with open(api_path, "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(r"\s*// Auth\s*async login\(payload: any\): Promise<any> \{.*?\n\s*\}", "", content, flags=re.DOTALL)

with open(api_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Removed login from apiClient")
