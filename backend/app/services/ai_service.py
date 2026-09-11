"""
UniPilot AI Service — OpenRouter client using free models only.

Primary  : google/gemini-2.0-flash-exp:free
Fallback : meta-llama/llama-3.1-8b-instruct:free
"""
import json
from typing import List, Dict, Any, Optional

import httpx

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
# Active 100% free models on OpenRouter (tested and confirmed working)
FREE_MODELS = [
    "nvidia/nemotron-3.5-lightning:free",
    "liquid/lfm-2.5-2.6b:free",
    "nex-agi/nex-n2.5-mini:free",
    "thinkingmachines/inkling:free",
    "google/gemma-4-26b-a4b-it:free",
]


def _get_key() -> str:
    from backend.app.core.config import settings
    return settings.OPENROUTER_API_KEY


def _headers(api_key: str) -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://unipilot.app",
        "X-Title": "UniPilot Academic Copilot",
    }


async def _post(model: str, messages: List[Dict], api_key: str,
                max_tokens: int = 1024, temperature: float = 0.7) -> Optional[str]:
    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            res = await client.post(
                OPENROUTER_URL, headers=_headers(api_key), json=payload
            )
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"].strip()
            else:
                print(f">> [AI:{model}] HTTP {res.status_code}: {res.text[:200]}")
        except Exception as e:
            print(f">> [AI:{model}] Error: {type(e).__name__}: {e}")
    return None


async def ask_ai(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 1024,
    temperature: float = 0.7,
    history: Optional[List[Dict]] = None,
) -> str:
    """
    Send a prompt to OpenRouter and return the text reply.
    Falls back to the secondary model if the primary fails.
    Returns an empty string if both fail or no API key is set.
    """
    api_key = _get_key()
    if not api_key:
        print(">> [AI] OPENROUTER_API_KEY not set — returning empty reply.")
        return ""

    messages = [{"role": "system", "content": system_prompt}]
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": user_prompt})

    # Try each available free model in order
    for model in FREE_MODELS:
        result = await _post(model, messages, api_key, max_tokens, temperature)
        if result:
            return result

    return ""


# ─── Convenience helpers ──────────────────────────────────────────────────────

COPILOT_SYSTEM = """\
You are UniPilot, an autonomous academic copilot AI for engineering college students in India.
You help students with attendance management, concept explanation, assignment tracking, study planning, and career advice.

Guidelines:
- Be concise, precise, and actionable (aim for < 200 words unless complexity demands more)
- For attendance queries, always calculate exact percentages with the formula: attended/held*100
- Use markdown bold and bullet points for clarity
- If you detect critical attendance issues (below 75%), warn clearly with ⚠️
- End each response with 2–3 concrete next-action suggestions
- Speak in a direct, helpful, peer-mentor tone — not robotic
"""

async def academic_chat(
    message: str,
    attendance_context: List[Dict[str, Any]],
    history: Optional[List[Dict]] = None,
) -> Dict[str, Any]:
    """Run the AI copilot for a student message with live attendance context."""
    att_text = "\n".join(
        f"- {s['name']} ({s.get('code','')}): {s['attended']}/{s['held']} classes "
        f"= {round(s['attended']/s['held']*100,1) if s['held'] else 0}% "
        f"(required {s.get('required',75)}%)"
        for s in attendance_context
    ) or "No attendance data available."

    user_prompt = f"Student attendance summary:\n{att_text}\n\nStudent question: {message}"

    reply = await ask_ai(
        system_prompt=COPILOT_SYSTEM,
        user_prompt=user_prompt,
        max_tokens=512,
        history=history,
    )

    if not reply:
        reply = (
            "I'm having trouble reaching the AI service right now. "
            "Please try again in a moment — I'm still tracking your attendance locally."
        )

    # Extract suggested actions from the reply if present, else generate generic ones
    suggested = ["Check Attendance page", "Open Study Planner", "Review Activity Feed"]
    return {"reply": reply, "suggested_actions": suggested}


NOTES_SUMMARY_SYSTEM = """\
You are an expert academic study assistant. Given a document title and subject,
produce a structured study summary as if you had read the actual document.
Format your output EXACTLY as JSON with this structure:
{
  "summary": "2-3 sentence overview paragraph",
  "key_takeaways": ["takeaway 1", "takeaway 2", "takeaway 3", "takeaway 4", "takeaway 5"],
  "formulas": ["formula or rule 1", "formula or rule 2"]
}
Make content accurate, detailed, and specific to the topic. No markdown outside the JSON.
"""

async def summarize_notes(doc_title: str, subject: str) -> Dict[str, Any]:
    """Generate a structured summary for a given document topic."""
    prompt = f'Document: "{doc_title}"\nSubject: {subject}\n\nGenerate the study summary JSON.'

    raw = await ask_ai(
        system_prompt=NOTES_SUMMARY_SYSTEM,
        user_prompt=prompt,
        max_tokens=800,
        temperature=0.4,
    )

    # Parse JSON from response
    try:
        # Strip markdown code fences if model wraps it
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        return json.loads(clean)
    except Exception:
        # Graceful fallback if parsing fails
        return {
            "summary": raw[:400] if raw else f"Summary of {doc_title} from {subject}.",
            "key_takeaways": ["See document for full content."],
            "formulas": [],
        }


FLASHCARD_SYSTEM = """\
You are an expert academic flashcard generator. Given a document title and subject,
generate exactly {count} high-quality study flashcards.
Format your output EXACTLY as a JSON array:
[
  {{"id": 1, "front": "precise question", "back": "complete accurate answer"}},
  {{"id": 2, "front": "...", "back": "..."}}
]
Make questions specific, testable, and at exam difficulty level. No markdown outside the JSON.
"""

async def generate_flashcards(doc_title: str, subject: str, count: int = 5) -> List[Dict]:
    """Generate flashcards for a given document topic."""
    system = FLASHCARD_SYSTEM.format(count=count)
    prompt = f'Document: "{doc_title}"\nSubject: {subject}\n\nGenerate {count} flashcard JSON array.'

    raw = await ask_ai(
        system_prompt=system,
        user_prompt=prompt,
        max_tokens=1200,
        temperature=0.5,
    )

    try:
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        cards = json.loads(clean)
        # Ensure each card has correct id
        return [{"id": i + 1, "front": c.get("front", ""), "back": c.get("back", "")}
                for i, c in enumerate(cards)]
    except Exception:
        return [{"id": 1, "front": f"What is the main concept in {doc_title}?",
                 "back": "AI generation failed — please try again."}]


BULLET_SYSTEM = """\
You are an expert ATS resume writer. Given an activity description and a bullet point,
rewrite the bullet point to be more impactful, quantified, and recruiter-ready.
Rules:
- Start with a strong action verb (Engineered, Architected, Spearheaded, Designed, etc.)
- Include a quantified result or metric where possible
- Keep it to ONE sentence, under 25 words
- Be specific to the technology/domain mentioned
- Return ONLY the rewritten bullet text, no explanation, no quotes.
"""

async def regenerate_bullet(original_bullet: str, context: str = "") -> str:
    """AI-rewrite a single resume bullet point."""
    prompt = f'Context: {context}\nOriginal bullet: {original_bullet}\n\nRewrite:'
    result = await ask_ai(
        system_prompt=BULLET_SYSTEM,
        user_prompt=prompt,
        max_tokens=100,
        temperature=0.8,
    )
    return result or original_bullet


ACTIVITY_BULLETS_SYSTEM = """\
You are an expert ATS resume writer for engineering students.
Given an activity (hackathon, internship, project, or course), generate exactly 3 recruiter-ready bullet points.
Format as a JSON array of 3 strings. Each bullet:
- Starts with a strong past-tense action verb
- Contains a specific technical detail
- Has a quantified result or impact where plausible
- Is one sentence, 15–25 words
Return ONLY the JSON array. No markdown outside it.
"""

async def generate_activity_bullets(title: str, activity_type: str, description: str) -> List[str]:
    """Generate 3 ATS bullet points for an activity."""
    prompt = (
        f"Activity type: {activity_type}\n"
        f"Title: {title}\n"
        f"Description: {description}\n\n"
        f"Generate 3 bullet points JSON array."
    )
    raw = await ask_ai(
        system_prompt=ACTIVITY_BULLETS_SYSTEM,
        user_prompt=prompt,
        max_tokens=300,
        temperature=0.7,
    )
    try:
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        bullets = json.loads(clean)
        return bullets[:3] if isinstance(bullets, list) else [raw]
    except Exception:
        return [
            f"Successfully completed {title} demonstrating expertise in {activity_type}.",
            "Applied technical engineering principles to deliver measurable project outcomes.",
            "Collaborated with cross-functional teams to implement structured milestone deliverables.",
        ]
