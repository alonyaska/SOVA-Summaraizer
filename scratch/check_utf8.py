import os

def check_utf8():
    for root, dirs, files in os.walk('.'):
        if any(d in root for d in ['venv', 'node_modules', '.next', '.git']):
            continue
        for file in files:
            if file.endswith(('.tsx', '.ts', '.css', '.js', '.mjs', '.json', '.md')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'rb') as f:
                        content = f.read()
                    content.decode('utf-8')
                except UnicodeDecodeError as e:
                    print(f"INVALID UTF-8 in {path}: {e}")
                    # Print exact byte and position
                    start = max(0, e.start - 10)
                    end = min(len(content), e.end + 10)
                    print(f"Bytes: {content[start:end]}")
                except Exception:
                    pass

if __name__ == "__main__":
    check_utf8()
