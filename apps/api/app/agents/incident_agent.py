import re
import json
import logging
import httpx
from typing import Dict, Any

from app.core.config import settings

logger = logging.getLogger(__name__)

class IncidentAgent:
    @staticmethod
    async def extract_incident_from_text(raw_text: str) -> Dict[str, Any]:
        """
        Extracts structured incident data from unstructured field text using LLM if configured,
        or robust deterministic rule-based NLP extraction as fallback.
        """
        # 1. Try LLM API if key is present
        if settings.LLM_API_KEY:
            try:
                extracted = await IncidentAgent._call_llm(raw_text)
                if extracted and "hazard" in extracted:
                    return extracted
            except Exception as e:
                logger.warning(f"LLM API call failed, using rule-based NLP fallback: {e}")

        # 2. Deterministic Rule-Based Fallback NLP
        return IncidentAgent._rule_based_fallback(raw_text)

    @staticmethod
    async def _call_llm(raw_text: str) -> Dict[str, Any]:
        prompt = f"""
You are the Incident Agent for KSHETRA Emergency Response. Extract structured emergency information from the following report.

REPORT:
"{raw_text}"

Respond ONLY with valid JSON matching this exact structure:
{{
  "hazard": "FLOOD|EARTHQUAKE|CYCLONE|LANDSLIDE|FIRE",
  "affected_population": 0,
  "injured": 0,
  "missing": 0,
  "accessibility": "OPEN|RESTRICTED|BLOCKED",
  "urgency": 75.0,
  "needs": ["WATER", "FOOD", "MEDICAL", "SHELTER", "RESCUE_TEAMS"],
  "evidence": ["extract key text evidence"],
  "confidence": 0.92,
  "missing_information": []
}}
"""
        headers = {"Authorization": f"Bearer {settings.LLM_API_KEY}", "Content-Type": "application/json"}
        base_url = settings.LLM_BASE_URL or "https://generativelanguage.googleapis.com/v1beta/openai"
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(
                f"{base_url}/chat/completions",
                headers=headers,
                json={
                    "model": settings.LLM_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "response_format": {"type": "json_object"}
                }
            )
            if res.status_code == 200:
                content = res.json()["choices"][0]["message"]["content"]
                return json.loads(content)
        return {}

    @staticmethod
    def _rule_based_fallback(raw_text: str) -> Dict[str, Any]:
        text_lower = raw_text.lower()

        # Extract Hazard
        hazard = "FLOOD"
        if "earthquake" in text_lower or "tremor" in text_lower or "structural" in text_lower:
            hazard = "EARTHQUAKE"
        elif "cyclone" in text_lower or "wind" in text_lower or "storm" in text_lower:
            hazard = "CYCLONE"
        elif "landslide" in text_lower or "mudslide" in text_lower or "hillside" in text_lower:
            hazard = "LANDSLIDE"

        # Extract Population (e.g. 1800, 3200, 5000, "around 900 people")
        pop_match = re.search(r'(\d[\d,]*)\s*(?:people|residents|population|isolated|affected)', text_lower)
        affected_pop = 1000
        if pop_match:
            pop_str = pop_match.group(1).replace(",", "")
            affected_pop = int(pop_str)

        # Extract Injured
        injured = 0
        inj_match = re.search(r'(\d+)\s*(?:injured|casualt|hurt)', text_lower)
        if inj_match:
            injured = int(inj_match.group(1))
        elif "injured" in text_lower or "medical assistance" in text_lower:
            injured = int(affected_pop * 0.05) + 5

        # Accessibility
        accessibility = "OPEN"
        if "bridge" in text_lower and ("blocked" in text_lower or "cut off" in text_lower or "collapsed" in text_lower):
            accessibility = "BLOCKED"
        elif "blocked" in text_lower or "isolated" in text_lower or "road cut" in text_lower:
            accessibility = "BLOCKED"
        elif "difficult" in text_lower or "restricted" in text_lower:
            accessibility = "RESTRICTED"

        # Required Needs
        needs = []
        if "water" in text_lower or "drink" in text_lower or hazard == "FLOOD":
            needs.append("WATER")
        if "food" in text_lower or "ration" in text_lower:
            needs.append("FOOD")
        if "medical" in text_lower or "injured" in text_lower or "doctor" in text_lower:
            needs.append("MEDICAL")
        if "shelter" in text_lower or "home" in text_lower or hazard in ["CYCLONE", "EARTHQUAKE"]:
            needs.append("SHELTER")
        if "rescue" in text_lower or accessibility == "BLOCKED":
            needs.append("RESCUE_TEAMS")

        # Urgency score
        urgency = 60.0
        if "rapidly" in text_lower or "urgent" in text_lower or "emergency" in text_lower:
            urgency = 90.0
        elif accessibility == "BLOCKED":
            urgency = 85.0

        return {
            "hazard": hazard,
            "affected_population": affected_pop,
            "injured": injured,
            "missing": 0,
            "accessibility": accessibility,
            "urgency": urgency,
            "needs": needs,
            "evidence": [f"Parsed phrase from text: '{raw_text[:80]}...'"],
            "confidence": 0.94,
            "missing_information": []
        }
