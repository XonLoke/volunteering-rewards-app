"""Generate a .docx version of the WATD proposal for the supervisor.
Run this on Windows: python generate_proposal_docx.py
Requires: pip install python-docx
"""

import sys
import os

# Use existing converter if available
converter_path = r"D:\sep_venv\md-to-docx"
if os.path.exists(converter_path):
    sys.path.insert(0, converter_path)
    from converter import convert_markdown_to_docx
else:
    print("Installing python-docx and using inline converter...")
    os.system("pip install python-docx --break-system-packages")
    # Write converter inline
    exec(open("converter.py").read()) if os.path.exists("converter.py") else None

# Read the markdown proposal
md_path = r"D:\c3000c\volunteering-rewards-app\PROPOSAL_WATD_METHOD.md"
with open(md_path, "r", encoding="utf-8") as f:
    md_content = f.read()

try:
    docx_bytes = convert_markdown_to_docx(md_content)
    output_path = r"D:\c3000c\volunteering-rewards-app\PROPOSAL_WATD_METHOD.docx"
    with open(output_path, "wb") as f:
        f.write(docx_bytes)
    print(f"Proposal generated: {output_path}")
except NameError:
    print("converter module not found. Run: cd /d D:\\sep_venv\\md-to-docx && pip install python-docx --break-system-packages")
    print("Then copy converter.py from that folder to D:\\c3000c\\volunteering-rewards-app\\")
