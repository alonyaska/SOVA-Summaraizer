import os

def find_specific_char(root_dir, char_code):
    # Search for char_code (0x9E) and UTF-8 sequence (0xC2 0x9E)
    patterns = [bytes([char_code]), b'\xc2' + bytes([char_code])]
    found = False
    
    for root, dirs, files in os.walk(root_dir):
        if any(ignored in root for ignored in ['node_modules', '.next', '.git']):
            continue
            
        for file in files:
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'rb') as f:
                    content = f.read()
                    
                for pattern in patterns:
                    if pattern in content:
                        # For b'\x9e', we check if it's part of a valid UTF-8 sequence
                        # like b'\xd0\x9e' (Cyrillic O). If it is, it's NOT our target.
                        # Our target is a STANDALONE 0x9E or b'\xc2\x9e'.
                        
                        start_idx = 0
                        while True:
                            idx = content.find(pattern, start_idx)
                            if idx == -1: break
                            
                            is_valid_cyrillic = False
                            if pattern == b'\x9e':
                                if idx > 0 and content[idx-1] == 0xD0:
                                    is_valid_cyrillic = True
                            
                            if not is_valid_cyrillic:
                                print(f"FOUND SUSPICIOUS {pattern!r} in {file_path}")
                                print(f"  At byte offset: {idx}")
                                start = max(0, idx - 10)
                                end = min(len(content), idx + 10)
                                print(f"  Context (hex): {content[start:end].hex(' ')}")
                                found = True
                            
                            start_idx = idx + 1
                        
            except Exception as e:
                pass
    
    if not found:
        print("No matches found for char code", hex(char_code))

if __name__ == "__main__":
    find_specific_char(".", 0x9E)
