import os
import re

def find_cyrillic(root_dir):
    target_extensions = ('.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.mjs')
    cyrillic_pattern = re.compile(r'[а-яА-ЯёЁ]')
    
    for root, dirs, files in os.walk(root_dir):
        if any(ignored in root for ignored in ['node_modules', '.next', '.git', 'venv']):
            continue
            
        for file in files:
            if not file.endswith(target_extensions):
                continue
                
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                matches = cyrillic_pattern.findall(content)
                if matches:
                    print(f"File: {file_path}")
                    # Unique characters
                    unique_chars = sorted(list(set(matches)))
                    print(f"  Contains: {''.join(unique_chars)}")
                    
                    # Check for Cyrillic 'О'
                    if 'О' in matches:
                        print("  !!! FOUND CYRILLIC CAPITAL O")
            except Exception as e:
                pass

if __name__ == "__main__":
    find_cyrillic(".")
