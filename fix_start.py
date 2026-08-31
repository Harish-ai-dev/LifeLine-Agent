import sys

with open('start.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if line.startswith('def run_adk_web'):
        new_lines.append(line)
        new_lines.append('    """Start Google ADK Web UI server if available."""\n')
        new_lines.append('    python = find_python()\n')
        new_lines.append('    adk_script = f"import sys; from google.adk.cli import main; sys.argv=[\'adk\', \'web\', \'--port\', \'{port}\', \'lifeline_adk\']; main()"\n')
        new_lines.append('    cmd = [python, "-W", "ignore", "-c", adk_script]\n')
        skip = True
    elif skip and line.strip() == 'env = {':
        skip = False
        new_lines.append(line)
    elif not skip:
        new_lines.append(line)

with open('start.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
