import os

def check_file(path):
    try:
        with open(path, 'rb') as f:
            content = f.read()
        
        # We are looking for 0x9E specifically
        # But let's also check for other C1 controls
        for i, b in enumerate(content):
            if b == 0x9E:
                # Check if it's part of Cyrillic O (0xD0 0x9E)
                if i > 0 and content[i-1] == 0xD0:
                    continue
                # Check if it's part of some other valid UTF-8 sequence?
                # 0x9E is a continuation byte (0x80-0xBF)
                # So it must be preceded by a lead byte.
                # Lead bytes for 2-byte: 0xC2-0xDF
                # Lead bytes for 3-byte: 0xE0-0xEF
                # Lead bytes for 4-byte: 0xF0-0xF4
                
                is_valid_utf8 = False
                if i > 0:
                    prev = content[i-1]
                    if 0xC2 <= prev <= 0xDF:
                        is_valid_utf8 = True
                    elif i > 1:
                        prev2 = content[i-2]
                        if 0xE0 <= prev2 <= 0xEF:
                            is_valid_utf8 = True
                        elif i > 2:
                             prev3 = content[i-3]
                             if 0xF0 <= prev3 <= 0xF4:
                                 is_valid_utf8 = True
                
                if not is_valid_utf8:
                    print(f"!!! ILLEGAL BYTE 0x9E at {path}:{i}")
                    # Print context
                    start = max(0, i - 10)
                    end = min(len(content), i + 10)
                    print(f"  Context: {content[start:end].hex(' ')}")
                    
    except Exception as e:
        pass

def main():
    for root, dirs, files in os.walk('.'):
        if any(x in root for x in ['.git', 'node_modules', '.next', 'venv']):
            continue
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.mjs')):
                check_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
