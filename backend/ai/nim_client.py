import requests
import json
from typing import Dict, Any
from backend.config import settings
from backend.ai.prompts import SYSTEM_TRIAGE_PROMPT, USER_TRIAGE_PROMPT_TEMPLATE
from backend.ai.mock_responses import get_mock_ai_response

def analyze_sos_report(content: str, name: str = None, location: str = None) -> Dict[str, Any]:
    # Fallback if NIM API key is not configured
    if not settings.NIM_API_KEY:
        print("[AI] NIM API key not configured. Using deterministic mock client.")
        return get_mock_ai_response(content)
        
    print(f"[AI] Calling NVIDIA NIM API ({settings.NIM_MODEL})")
    
    headers = {
        "Authorization": f"Bearer {settings.NIM_API_KEY}",
        "Content-Type": "application/json"
    }
    
    user_prompt = USER_TRIAGE_PROMPT_TEMPLATE.format(
        content=content,
        name=name or "Unknown Citizen",
        location=location or "Not specified"
    )
    
    payload = {
        "model": settings.NIM_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_TRIAGE_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.1,
        "top_p": 0.7,
        "max_tokens": 1024,
        "response_format": {"type": "json_object"}
    }
    
    try:
        response = requests.post(
            f"{settings.NIM_BASE_URL}/chat/completions",
            json=payload,
            headers=headers,
            timeout=4
        )
        
        if response.status_code != 200:
            print(f"[AI] NIM API error: Status {response.status_code}. Response: {response.text}. Falling back to mock.")
            return get_mock_ai_response(content)
            
        result = response.json()
        raw_text = result["choices"][0]["message"]["content"]
        
        # Parse the JSON response
        data = json.loads(raw_text)
        return data
        
    except Exception as e:
        print(f"[AI] Exception in NIM client: {str(e)}. Falling back to mock.")
        return get_mock_ai_response(content)
