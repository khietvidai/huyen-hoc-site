import json
import os
import urllib.request
import urllib.error

API_BASE = "https://api.yilore.lichen.xin"

def get_tokens():
    with open("data/yilore_scan/yilore_blueprint.json", "r", encoding="utf-8") as f:
        bp = json.load(f)
    sess = bp.get("authData", {}).get("session", {})
    return sess.get("access_token"), sess.get("refresh_token")

def api_call(path, method="GET", token=None, body=None, lang="en"):
    url = API_BASE + path
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Accept-Language": "en-US,en;q=0.9" if lang == "en" else "zh-TW,zh;q=0.9",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = resp.read().decode("utf-8", errors="ignore")
            try:
                return resp.status, json.loads(raw)
            except Exception:
                return resp.status, raw
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="ignore")
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, raw
    except Exception as e:
        return 0, str(e)

def main():
    access_token, refresh_token = get_tokens()
    print("Testing access_token...")
    st, me = api_call("/api/v1/auth/me", "GET", access_token)
    print("GET /api/v1/auth/me ->", st)
    if st == 401 and refresh_token:
        print("Refreshing token...")
        st_ref, ref_data = api_call("/api/v1/auth/refresh-token", "POST", None, {"refresh_token": refresh_token})
        print("POST /api/v1/auth/refresh-token ->", st_ref, str(ref_data)[:300])
        if st_ref == 200 and isinstance(ref_data, dict):
            access_token = (
                ref_data.get("session", {}).get("access_token")
                or ref_data.get("data", {}).get("session", {}).get("access_token")
                or ref_data.get("access_token")
                or access_token
            )
            st, me = api_call("/api/v1/auth/me", "GET", access_token)
            print("Retried GET /api/v1/auth/me ->", st)

    results = {}
    endpoints_get = [
        ("auth_me_en", "/api/v1/auth/me", "en"),
        ("auth_me_zh", "/api/v1/auth/me", "zh-TW"),
        ("credits_balance", "/api/v1/credits/balance", "en"),
        ("subscription_status", "/api/v1/subscription/status", "en"),
        ("payment_products", "/api/v1/payment/products", "en"),
        ("daily_guidance_records", "/api/v1/daily-guidance/records", "en"),
        ("question_records_interpreted", "/api/v1/question-records?status=interpreted", "en"),
        ("question_records_all", "/api/v1/question-records", "en"),
        ("oracle_conversations", "/api/v1/oracle/conversations", "en"),
        ("relationship_profiles", "/api/v1/relationship-profiles", "en"),
        ("daily_plans", "/api/v1/daily-plans?date=2026-10-20&timezone=Asia/Shanghai", "en"),
        ("prompt_configs_models", "/api/v1/prompt-configs/models", "en"),
    ]

    for key, ep, lang in endpoints_get:
        s, d = api_call(ep, "GET", access_token, None, lang)
        print(f"GET {ep} ({lang}) -> {s}")
        results[key] = {"status": s, "data": d}

    # Fetch full reading reports via POST /api/v1/answer/get
    reading_ids = [
        "16813bd0-b255-48bb-82f4-bdb5967105ec",
        "b72d4ac3-30ce-4125-b707-d9140c2b0722",
    ]
    results["reading_reports"] = {}
    for rid in reading_ids:
        s, d = api_call("/api/v1/answer/get", "POST", access_token, {"reading_id": rid}, "zh-TW")
        print(f"POST /api/v1/answer/get ({rid}) -> {s}")
        results["reading_reports"][rid] = d

    # Fetch all conversation messages, facts, context_refs
    conv_ids = [
        "592076b9-e879-4835-8fa9-e74cd8a55ad7",
        "604d031e-4153-4d7d-86a7-1f5e1b3b4808",
        "bc953b1f-f17e-46e5-884d-7f8ade346eb6",
    ]
    results["conversations_detail"] = {}
    for cid in conv_ids:
        s_msg, d_msg = api_call(f"/api/v1/oracle/conversations/{cid}/messages", "GET", access_token)
        s_facts, d_facts = api_call(f"/api/v1/oracle/conversations/{cid}/facts", "GET", access_token)
        s_refs, d_refs = api_call(f"/api/v1/oracle/conversations/{cid}/context_refs", "GET", access_token)
        print(f"Conversation {cid}: messages={s_msg}, facts={s_facts}, refs={s_refs}")
        results["conversations_detail"][cid] = {
            "messages": d_msg,
            "facts": d_facts,
            "context_refs": d_refs,
        }

    # Test auspicious-days/score-day and auspicious-days/workbench-pick
    s_score, d_score = api_call("/api/v1/auspicious-days/score-day", "POST", access_token, {
        "date": "2026-10-20",
        "timezone": "Asia/Shanghai",
        "apply_profile": True
    }, "en")
    print("POST /api/v1/auspicious-days/score-day ->", s_score)
    results["auspicious_score_day"] = d_score

    s_pick, d_pick = api_call("/api/v1/auspicious-days/workbench-pick", "POST", access_token, {
        "start_date": "2026-10-20",
        "end_date": "2026-10-20",
        "timezone": "Asia/Shanghai",
        "granularity": "hour",
        "apply_profile": True,
        "intent_id": "contract",
        "task_tag": "meeting",
        "user_narrative": "Meeting"
    }, "en")
    print("POST /api/v1/auspicious-days/workbench-pick ->", s_pick)
    results["auspicious_workbench_pick_meeting"] = d_pick

    os.makedirs("data/yilore_scan/scraped", exist_ok=True)
    with open("data/yilore_scan/scraped/api_full_dump.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print("Saved data/yilore_scan/scraped/api_full_dump.json")

if __name__ == "__main__":
    main()
