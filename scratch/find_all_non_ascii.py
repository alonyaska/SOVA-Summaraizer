import os

def find_non_ascii(root_dir):
    target_extensions = ('.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.mjs', '.py')
    found_any = False
    
    for root, dirs, files in os.walk(root_dir):
        if any(ignored in root for ignored in ['node_modules', '.next', '.git', 'venv']):
            continue
            
        for file in files:
            if not file.endswith(target_extensions):
                continue
                
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'rb') as f:
                    content = f.read()
                
                # Check for 0x9E specifically
                for i, b in enumerate(content):
                    if b == 0x9E:
                         # Skip if it's Cyrillic O (0xD0 0x9E)
                         if i > 0 and content[i-1] == 0xD0:
                             continue
                         print(f"!!! FOUND ILLEGAL 0x9E in {file_path} at byte {i}")
                         found_any = True
            except Exception as e:
                pass
                
    if not found_any:
        print("No illegal characters found in source files (including .py).")

if __name__ == "__main__":
    find_non_ascii(".")
