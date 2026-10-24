import json
from datetime import datetime

def fmt_ts(iso_str):
    if not iso_str:
        return "10/20 04:47"
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        # Convert to UTC+8 as displayed in Yilore web app
        from datetime import timezone, timedelta
        dt8 = dt.astimezone(timezone(timedelta(hours=8)))
        return dt8.strftime("%m/%d %H:%M")
    except Exception:
        return "10/20 04:47"

def main():
    with open("data/yilore_scan/scraped/api_full_dump.json", "r", encoding="utf-8") as f:
        api = json.load(f)

    raw_msgs = api["conversations_detail"]["592076b9-e879-4835-8fa9-e74cd8a55ad7"]["messages"]["data"]

    # Transform raw_msgs into YiloreChatMessage[]
    chat_messages = []
    for m in raw_msgs:
        mid = m["id"]
        role = m["role"]
        content = m.get("content") or ""
        ts = fmt_ts(m.get("created_at"))

        if role == "system":
            if content.startswith("{"):
                try:
                    obj = json.loads(content)
                    t = obj.get("__type")
                    if t == "quick_lot_card":
                        pos = obj.get("position", 4)
                        tier_raw = obj.get("luck_tier", "ping")
                        tier = "下签" if tier_raw == "xia" else ("上签" if tier_raw == "shang" else "中平")
                        is_en = "-en.webp" in (obj.get("gua_frontimage_url") or "")
                        front_local = f"/yilore-cards/en/{pos}a-en.webp" if is_en else f"/yilore-cards/hant/{pos}a.webp"
                        back_local = f"/yilore-cards/en/{pos}b-en.webp" if is_en else f"/yilore-cards/hant/{pos}b.webp"
                        # Attach quickLot to previous or new assistant message
                        chat_messages.append({
                            "id": mid,
                            "role": "assistant",
                            "content": f"【靈籤】{obj.get('gua_name', '')} · {obj.get('gua_card_title', '')}（{tier}）",
                            "timestamp": ts,
                            "type": "lot_card",
                            "lotHexagramNumber": pos,
                            "quickLot": {
                                "position": pos,
                                "guaName": obj.get("gua_name", ""),
                                "cardTitle": obj.get("gua_card_title", ""),
                                "guaCi": obj.get("gua_ci", ""),
                                "luckTier": tier,
                                "frontUrl": front_local,
                                "backUrl": back_local,
                            }
                        })
                    elif t == "report_card":
                        rid = obj.get("readingId")
                        chat_messages.append({
                            "id": mid,
                            "role": "assistant",
                            "content": f"📊 {obj.get('title', '解讀報告')}：{obj.get('opening', '')}",
                            "timestamp": ts,
                            "type": "divination_result",
                            "readingIdRef": rid,
                        })
                except Exception:
                    pass
            continue

        chat_messages.append({
            "id": mid,
            "role": "user" if role == "user" else "assistant",
            "content": content,
            "timestamp": ts,
        })

    print(f"Transformed {len(chat_messages)} chat messages from 42 raw API records.")
    with open("data/yilore_scan/scraped/transformed_chat_messages.json", "w", encoding="utf-8") as f:
        json.dump(chat_messages, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
