import os

ignore_path = r"c:\Users\shado\Documents\GitHub\LifeLine-Agent\.gitignore"
with open(ignore_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

with open(ignore_path, "w", encoding="utf-8") as f:
    for line in lines:
        if "s t a r t" not in line and "\0" not in line and line.strip() != "start.bat":
            f.write(line)
    if "*.bat" not in [l.strip() for l in lines]:
        f.write("\n*.bat\n")
    f.write("start.bat\n")
print("Cleaned .gitignore")
