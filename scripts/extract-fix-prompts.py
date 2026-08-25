import os, re, html as htmlmod, sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
root = r"s:\S4-BUSINESS-INVOICE-TRACKER-firebase-v2"
os.chdir(root)
text = open("s4-all-fix-prompts.html", "r", encoding="utf-8").read()
heads = re.findall(r"<h3>(.*?)</h3>", text)
pres = re.findall(r"<pre[^>]*>(.*?)</pre>", text, re.S)
out = os.path.join(root, "scripts", "s4-all-fix-prompts-extracted.txt")
with open(out, "w", encoding="utf-8") as f:
    f.write(f"TOTAL={len(heads)}\n")
    for i, (h, p) in enumerate(zip(heads, pres)):
        title = re.sub("<[^>]+>", "", h)
        body = htmlmod.unescape(p)
        f.write(f"\n\n========== PROMPT {i + 1}: {title} ==========\n")
        f.write(body)
print("wrote", out, "prompts", len(heads))
