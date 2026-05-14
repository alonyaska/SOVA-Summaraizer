import os

def find_exotic(root_dir):
    found_any = False
    for root, dirs, files in os.walk(root_dir):
        if any(ignored in root for ignored in ['node_modules', '.next', '.git', 'venv']):
            continue
        for file in files:
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'rb') as f:
                    content = f.read()
                
                for i, b in enumerate(content):
                    if b == 0x9E:
                        if i > 0 and content[i-1] == 0xD0: continue
                        print(f"!!! 0x9E found in {file_path} at {i}")
                        found_any = True
                    elif b == 0xAD: # Soft hyphen?
                        print(f"!!! 0xAD found in {file_path} at {i}")
                        found_any = True
            except:
                pass
    if not found_any:
        print("No exotic bytes found.")

if __name__ == "__main__":
    find_exotic(".")
