import os

def find_exact_codepoint():
    target = chr(0x9e)
    for root, dirs, files in os.walk('.'):
        if any(d in root for d in ['venv', 'node_modules', '.next', '.git']):
            continue
        for file in files:
            if file.endswith(('.tsx', '.ts', '.css', '.js', '.mjs', '.json', '.md', '.py')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if target in content:
                            print(f"FOUND codepoint U+009E in {path}")
                except Exception:
                    pass

if __name__ == "__main__":
    find_exact_codepoint()
