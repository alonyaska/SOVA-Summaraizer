import os

def find_illegal_char(root_dir):
    # C1 control characters are 0x7F to 0x9F
    # U+009E is 0x9E
    target_extensions = ('.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.mjs', '.md')
    
    for root, dirs, files in os.walk(root_dir):
        if any(ignored in root for ignored in ['node_modules', '.next', '.git', 'venv', '__pycache__']):
            continue
            
        for file in files:
            if not file.endswith(target_extensions):
                continue
                
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'rb') as f:
                    content = f.read()
                    for b in content:
                        if 0x7F <= b <= 0x9F:
                            # Skip common UTF-8 leads if they are part of a valid sequence
                            # But 0x9E is a continuation byte or a C1 control
                            # In UTF-8, continuation bytes are 0x80-0xBF.
                            # So we need to be careful.
                            # However, a standalone 0x9E or a bad sequence will cause issues.
                            pass
                    
                    # Better way: find characters that are NOT valid UTF-8 or are C1 controls
                    # when decoded as UTF-8.
                    try:
                        text = content.decode('utf-8')
                        for i, char in enumerate(text):
                            cp = ord(char)
                            if 0x7F <= cp <= 0x9F and cp != 0x0A and cp != 0x0D and cp != 0x09:
                                print(f"FOUND Control Char U+{cp:04X} at {file_path}:{i}")
                                # Print surrounding text
                                start = max(0, i - 20)
                                end = min(len(text), i + 20)
                                context = text[start:end].replace('\n', ' ')
                                print(f"  Context: ...{context}...")
                    except UnicodeDecodeError as e:
                        print(f"UnicodeDecodeError in {file_path}: {e}")
            except Exception as e:
                pass

if __name__ == "__main__":
    find_illegal_char(".")

if __name__ == "__main__":
    find_illegal_char(".")
