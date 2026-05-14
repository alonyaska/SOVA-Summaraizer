import os

def find_illegal_char():
    target = b'\x9e'
    for root, dirs, files in os.walk('.'):
        if any(d in root for d in ['venv', 'node_modules', '.next', '.git']):
            continue
        for file in files:
            if file.endswith(('.tsx', '.ts', '.css', '.js', '.mjs')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'rb') as f:
                        content = f.read()
                        if target in content:
                            print(f"FOUND in {path}")
                except Exception:
                    pass

if __name__ == "__main__":
    find_illegal_char()
