import re

with open('lib/yt-summarizer.ts', 'rb') as f:
    content = f.read()

matches = re.findall(b'timecode:\s*"(.*?)"', content)
for m in matches:
    print(f"Timecode: {m.decode('utf-8', errors='ignore')} | Hex: {m.hex(' ')}")
