import os

def find_illegal_char_pos():
    target = b'\xd0\x9e'
    for root, dirs, files in os.walk('.'):
        if any(d in root for d in ['venv', 'node_modules', '.next', '.git']):
            continue
        for file in files:
            path = os.path.join(root, file)
            try:
                with open(path, 'rb') as f:
                    content = f.read()
                    if target in content:
                        print(f"FOUND capital O in {path}")
                        i = content.index(target)
                        line_no = content[:i].count(b'\n') + 1
                        print(f"Line: {line_no}")
                        start = max(0, i - 20)
                        end = min(len(content), i + 20)
                        print(f"Context: {content[start:end]}")
            except Exception:
                pass

if __name__ == "__main__":
    find_illegal_char_pos()
