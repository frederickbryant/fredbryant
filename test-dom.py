import urllib.request
import re

html_content = open("index.html").read()
# Check if there are exactly 4 `<section class="section`
sections = re.findall(r'<section [^>]*class="[^"]*section[^"]*"', html_content)
print(f"Found {len(sections)} sections")
for i, s in enumerate(sections):
    print(f"Section {i}: {s}")
