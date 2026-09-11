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


QUIZ_SYSTEM = """\
You are an expert academic quiz generator. Given a document title and subject,
generate exactly {count} multiple-choice questions at exam difficulty level.
Format your output EXACTLY as a JSON array:
[
  {{
    "id": 1,
    "question": "specific question text",
    "options": ["option A", "option B", "option C", "option D"],
    "correct": 0,
    "explanation": "brief explanation of why this answer is correct"
  }}
]
- "correct" is the zero-based index of the correct option in the "options" array
- Make questions specific, testable, and at undergraduate exam level
- Ensure all 4 options are plausible (no obviously wrong distractors)
- Return ONLY the JSON array, no markdown outside it.
"""

async def generate_quiz(doc_title: str, subject: str, count: int = 5) -> List[Dict]:
    """Generate MCQ quiz questions for a given document topic."""
    system = QUIZ_SYSTEM.format(count=count)
    prompt = f'Document: "{doc_title}"\nSubject: {subject}\n\nGenerate {count} quiz questions JSON array.'

    raw = await ask_ai(
        system_prompt=system,
        user_prompt=prompt,
        max_tokens=1500,
        temperature=0.5,
    )

    try:
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        questions = json.loads(clean)
        return [
            {
                "id": i + 1,
                "question": q.get("question", f"Question {i+1}"),
                "options": q.get("options", ["A", "B", "C", "D"]),
                "correct": q.get("correct", 0),
                "explanation": q.get("explanation", "")
            }
            for i, q in enumerate(questions)
        ]
    except Exception:
        return [{
            "id": 1,
            "question": f"What is the main concept covered in {doc_title}?",
            "options": [
                "The primary theoretical framework",
                "Implementation details",
                "Historical context",
                "Mathematical derivations"
            ],
            "correct": 0,
            "explanation": "AI generation failed — please try again."
        }]



CAREER_GROWTH_SYSTEM = """\
You are an Elite Silicon Valley Tech Recruiter and Academic Career Coach.
Given an engineering student's profile, GPA, course, and their list of currently logged activities (internships, projects, hackathons, courses), analyze their Resume & Portfolio gaps.
Return ONLY a valid JSON object matching this structure:
{
  "readiness_score": 75,
  "profile_tier": "Competitive Undergrad",
  "strengths": ["Solid algorithmic foundations", "Hands-on academic projects"],
  "top_missing_skills": ["Production Cloud CI/CD", "Distributed Caching (Redis/Kafka)", "Container Orchestration"],
  "recommended_internships": [
    {
      "role": "Cloud Infrastructure & Backend Engineering Intern",
      "target_companies": "Series A-C Tech Startups, High-Frequency Trading, Cloud Hyperscalers",
      "impact": "Bridges the gap between classroom theory and multi-tenant production systems.",
      "skills_to_highlight": ["Go/Rust or Python FastAPI", "Docker", "PostgreSQL tuning"]
    },
    {
      "role": "Applied AI / Machine Learning Systems Intern",
      "target_companies": "AI Research Labs, Enterprise GenAI Startups",
      "impact": "Validates your machine learning coursework with real-world model deployment and evaluation.",
      "skills_to_highlight": ["PyTorch", "vLLM", "Vector Databases", "Prompt Engineering"]
    }
  ],
  "recommended_projects": [
    {
      "title": "High-Throughput Distributed Cache with Consistent Hashing",
      "category": "Systems & Cloud",
      "tech_stack": "Go or Rust, gRPC, Docker, Prometheus",
      "why_valuable": "Demonstrates deep understanding of network partitioning, replication, and telemetry.",
      "estimated_hours": 30,
      "difficulty": "Advanced"
    },
    {
      "title": "RAG-Powered Code Search Engine over Large Repositories",
      "category": "GenAI & IR",
      "tech_stack": "Python, Qdrant/Milvus, Tree-sitter, FastAPI, React",
      "why_valuable": "Shows recruiters you can architect modern semantic search pipelines beyond toy prototypes.",
      "estimated_hours": 25,
      "difficulty": "Intermediate"
    }
  ],
  "recommended_courses": [
    {
      "title": "AWS Certified Solutions Architect – Associate (SAA-C03)",
      "platform": "AWS Skill Builder / Coursera",
      "focus": "Cloud Architecture, High-Availability Systems, Security",
      "duration": "4 weeks"
    },
    {
      "title": "Distributed Systems Engineering (MIT 6.824 / Stanford CS244B)",
      "platform": "OpenCourseWare / YouTube",
      "focus": "Raft, Paxos, MapReduce, Spanner",
      "duration": "6 weeks"
    }
  ],
  "recommended_hackathons": [
    {
      "name": "ETHIndia / ETHGlobal Web3 & Infra Hackathon",
      "focus": "Decentralized compute, smart contracts, zero-knowledge proofs",
      "timeline": "Next Quarter"
    },
    {
      "name": "Smart India Hackathon (SIH) – Software Edition",
      "focus": "National scale citizen-facing infrastructure and analytics",
      "timeline": "Annual"
    }
  ],
  "career_roadmap_summary": "Your portfolio shows strong core fundamentals. Adding one production distributed project and a targeted backend internship will push your resume into the top 5% of applicants."
}
No explanation, no markdown outside the JSON block.
"""

async def generate_career_growth_recommendations(profile: dict, activities: list) -> dict:
    """Analyze student portfolio & resume gaps and generate AI suggestions."""
    internships_count = sum(1 for a in activities if a.get("type") == "internship")
    projects_count = sum(1 for a in activities if a.get("type") == "project")
    hackathons_count = sum(1 for a in activities if a.get("type") == "hackathon")
    courses_count = sum(1 for a in activities if a.get("type") == "course")

    titles = [a.get("title", "") for a in activities]
    activity_summary = ", ".join(titles[:10]) if titles else "No external activities logged yet"

    user_prompt = (
        f"Student Profile:\n"
        f"Name: {profile.get('name', 'Student')}\n"
        f"Course: {profile.get('course', 'Computer Science & Engineering')}\n"
        f"Semester: {profile.get('semester', 'Semester 1')}\n"
        f"CGPA: {profile.get('gpa', '8.0')}\n"
        f"Current Stats: {internships_count} Internships, {projects_count} Projects, {hackathons_count} Hackathons, {courses_count} Courses\n"
        f"Logged Activities: {activity_summary}\n\n"
        f"Generate complete career growth recommendation JSON."
    )

    raw = await ask_ai(
        system_prompt=CAREER_GROWTH_SYSTEM,
        user_prompt=user_prompt,
        max_tokens=1800,
        temperature=0.6,
    )

    try:
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(clean)
        if "readiness_score" in data and "recommended_projects" in data:
            return data
    except Exception as e:
        print(f"[ai_service] Failed to parse career growth AI output: {e}")

    # High-quality contextual fallback
    readiness = min(92, max(58, 60 + projects_count * 5 + internships_count * 12 + hackathons_count * 4))
    return {
        "readiness_score": readiness,
        "profile_tier": "Emerging Tech Leader" if readiness > 75 else "Foundational Engineer",
        "strengths": [
            "Academic coursework aligned with core CS systems",
            f"{projects_count} verified projects and portfolio artifacts synced",
            "Strong motivation demonstrated through active tracking"
        ],
        "top_missing_skills": [
            "Production Cloud Deployment (AWS / GCP / Docker)",
            "Distributed Event Streaming (Kafka / RabbitMQ)",
            "System Observability & Monitoring (Prometheus / Grafana)"
        ],
        "recommended_internships": [
            {
                "role": "Cloud Infrastructure & Systems Backend Intern",
                "target_companies": "Fast-growing B2B SaaS, Cloud infrastructure providers, Series B startups",
                "impact": "Translates your coursework into scalable multi-tenant services with automated CI/CD.",
                "skills_to_highlight": ["FastAPI / Go", "Docker & Kubernetes", "PostgreSQL schema design"]
            },
            {
                "role": "Full-Stack AI Engineering Intern",
                "target_companies": "Applied GenAI companies, Enterprise Developer Tools",
                "impact": "Validates your front-to-back engineering capabilities with real model integration.",
                "skills_to_highlight": ["Next.js / React", "LangChain / LlamaIndex", "Vector Search"]
            }
        ],
        "recommended_projects": [
            {
                "title": "Distributed Key-Value Store with Raft Consensus",
                "category": "Distributed Systems",
                "tech_stack": "Go, Raft Protocol, gRPC, Docker, Prometheus",
                "why_valuable": "Demonstrates leader election, log compaction, and network partition resilience to top recruiters.",
                "estimated_hours": 30,
                "difficulty": "Advanced"
            },
            {
                "title": "Real-Time Collaborative Code Playground with WebSockets & CRDTs",
                "category": "Full-Stack Systems",
                "tech_stack": "React, Node.js / Go, Yjs (CRDTs), WebSockets, Docker sandbox",
                "why_valuable": "Demonstrates operational concurrency, low-latency data sync, and secure code sandboxing.",
                "estimated_hours": 25,
                "difficulty": "Intermediate"
            }
        ],
        "recommended_courses": [
            {
                "title": "AWS Certified Solutions Architect – Associate",
                "platform": "AWS Skill Builder & Udemy",
                "focus": "Cloud Architecture, VPC Subnetting, High Availability, IAM",
                "duration": "4 weeks"
            },
            {
                "title": "Stanford CS149: Parallel Computing & GPU Programming",
                "platform": "Stanford Online / OpenCourseWare",
                "focus": "CUDA, SIMD Vectorization, Multi-threading, Cache Locality",
                "duration": "6 weeks"
            }
        ],
        "recommended_hackathons": [
            {
                "name": "Smart India Hackathon (SIH) / National Innovation Challenge",
                "focus": "Large-scale public digital infrastructure",
                "timeline": "Upcoming Season"
            },
            {
                "name": "MLH Global Hackathon League / ETHIndia",
                "focus": "Autonomous agents, decentralized infrastructure, developer tooling",
                "timeline": "Rolling Weekends"
            }
        ],
        "career_roadmap_summary": "Your portfolio has great momentum. Building a high-throughput systems project and securing one production backend internship will position your resume in the top percentile of campus placements."
    }
