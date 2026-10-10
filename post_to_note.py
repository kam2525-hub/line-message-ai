import os
import sys

# note-auto-drafter を読み込み
drafter_dir = os.path.abspath(r"C:\Users\akeer.AKERU\.gemini\antigravity\scratch\note-auto-drafter")
if drafter_dir not in sys.path:
    sys.path.append(drafter_dir)

try:
    from ai_writer import parse_title_and_body
    from draft_note import draft_to_note

    note_draft_path = os.path.join(os.path.dirname(__file__), "note_draft.md")
    with open(note_draft_path, "r", encoding="utf-8") as f:
        content = f.read()

    title, body = parse_title_and_body(content)
    print(f"[*] タイトル: {title}")
    print("[*] noteへの自動下書き流し込みを開始します...")
    draft_to_note(title, body, keep_browser_open=True)
    print("[OK] noteの下書き保存が完了しました！")
except Exception as e:
    print(f"[エラー] {e}")

