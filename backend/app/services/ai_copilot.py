from typing import Dict, Any, List

def answer_academic_query(message: str, user_attendance: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Simulates / answers student queries, with contextual reasoning around attendance & academics.
    """
    lower = message.lower()

    # Bunk / Attendance inquiry
    if "bunk" in lower or "attendance" in lower or "miss" in lower:
        # Check DBMS specifically or find lowest attendance subject
        dbms = next((s for s in user_attendance if "dbms" in s["name"].lower() or "database" in s["name"].lower()), None)
        if dbms:
            pct = (dbms["attended"] / dbms["held"]) * 100
            if pct < 75:
                return {
                    "reply": f"⚠️ **CRITICAL WARNING:** You cannot safely bunk DBMS today! Your current attendance is **{pct:.1f}%** ({dbms['attended']}/{dbms['held']} classes), which is already below the statutory 75% cutoff. Missing 1 more class will plummet you to **{((dbms['attended'])/(dbms['held']+1))*100:.1f}%**, placing you on the official exam debarment list.",
                    "suggested_actions": [
                        "Attend DBMS lecture at 10:30 AM in Lab 3B",
                        "View What-If Calculator on Attendance page",
                        "Set class reminder alarm"
                    ]
                }
        return {
            "reply": "Based on your current academic timetable and risk radar, you have adequate margins in Distributed Systems (85%), but your DBMS lecture is at 71.4% (Threshold: 75%). Please attend DBMS today!",
            "suggested_actions": ["Check Timetable", "Open Attendance Calculator"]
        }

    # Raft / Distributed systems query
    if "raft" in lower or "consensus" in lower:
        return {
            "reply": "💡 **Raft Consensus Quick Summary:**\n- **Leader Election:** Heartbeat timeout (150–300ms randomized) triggers election term.\n- **Log Replication:** Leader accepts client writes, appends to log, and broadcasts `AppendEntries` RPC to followers.\n- **Safety Invariant:** A leader never overwrites its own log; committed entries are guaranteed durable on a majority quorum.",
            "suggested_actions": [
                "Practice 4 Raft Flashcards",
                "Review LabCompaction code",
                "Ask for Leader Election failure simulation"
            ]
        }

    # Default autonomous copilot reply
    return {
        "reply": f"Understood! I've analyzed your academic workspace for '{message}'. Your upcoming deadlines are synced: Raft Consensus Lab (Tomorrow) and B+ Tree indexing homework (Thursday). How would you like to proceed?",
        "suggested_actions": [
            "Summarize lecture slides",
            "Generate flashcard quiz",
            "Optimize today's study blocks"
        ]
    }
