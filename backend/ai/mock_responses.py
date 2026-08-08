import json
import re
import copy
from typing import Dict, Any

MOCK_SCENARIOS: Dict[str, Dict[str, Any]] = {
    "flood": {
        "classification": "EMERGENCY",
        "title": "Severe flooding with family trapped on roof",
        "description": "Family of 6 trapped on their rooftop due to rising river water levels. Urgent evacuation required.",
        "disaster_type": "FLOOD",
        "severity": "CRITICAL",
        "priority_score": 95,
        "location_text": "Subhas Nagar Sector 3, near Hanuman Temple, Cuttack",
        "affected_count_estimate": 6,
        "needs_evacuation": True,
        "needs_medical": False,
        "needs_shelter": True,
        "needs_food_water": True,
        "confidence": "High",
        "reasoning": "Rising floodwaters pose an immediate life threat to the family trapped on the roof. Boat rescue is critical.",
        "resources": [
            {"type": "BOAT", "quantity": 1},
            {"type": "RESCUE_TEAM", "quantity": 1},
            {"type": "RELIEF_KIT", "quantity": 6}
        ]
    },
    "fire": {
        "classification": "EMERGENCY",
        "title": "Relief camp kitchen electrical fire",
        "description": "Electrical short circuit in relief camp kitchen caused a structure fire. Smoke filling neighboring shelters.",
        "disaster_type": "FIRE",
        "severity": "HIGH",
        "priority_score": 85,
        "location_text": "Government High School Relief Camp, Ward 12, Puri",
        "affected_count_estimate": 50,
        "needs_evacuation": True,
        "needs_medical": True,
        "needs_shelter": False,
        "needs_food_water": False,
        "confidence": "High",
        "reasoning": "Active fire in relief camp can quickly spread to other shelters. Medical support needed for smoke inhalation.",
        "resources": [
            {"type": "RESCUE_TEAM", "quantity": 2},
            {"type": "VEHICLE", "quantity": 2},
            {"type": "MEDICAL_TEAM", "quantity": 1}
        ]
    },
    "medical": {
        "classification": "EMERGENCY",
        "title": "Pregnant woman in labor with road blocked",
        "description": "Woman in advanced labor at home. Access roads blocked by uprooted trees from cyclone. Requires medical evacuation.",
        "disaster_type": "CYCLONE",
        "severity": "HIGH",
        "priority_score": 88,
        "location_text": "Village Gopinathpur, block 4, Balasore district",
        "affected_count_estimate": 2,
        "needs_evacuation": True,
        "needs_medical": True,
        "needs_shelter": False,
        "needs_food_water": False,
        "confidence": "Medium",
        "reasoning": "Active childbirth with blocked medical access requires a specialized medical evacuation and tree-clearing team.",
        "resources": [
            {"type": "MEDICAL_TEAM", "quantity": 1},
            {"type": "VEHICLE", "quantity": 1},
            {"type": "RESCUE_TEAM", "quantity": 1}
        ]
    },
    "non_emergency": {
        "classification": "NON_EMERGENCY",
        "title": "None",
        "description": "None",
        "disaster_type": "NONE",
        "severity": "NONE",
        "priority_score": 0,
        "location_text": "None",
        "affected_count_estimate": 0,
        "needs_evacuation": False,
        "needs_medical": False,
        "needs_shelter": False,
        "needs_food_water": False,
        "confidence": "High",
        "reasoning": "No emergency or disaster-related information detected.",
        "resources": []
    },
    "uncertain": {
        "classification": "UNCERTAIN",
        "title": "Unclear Report",
        "description": "User requested help or contacted system, but did not specify emergency details.",
        "disaster_type": "NONE",
        "severity": "MEDIUM",
        "priority_score": 40,
        "location_text": "Unknown",
        "affected_count_estimate": 0,
        "needs_evacuation": False,
        "needs_medical": False,
        "needs_shelter": False,
        "needs_food_water": False,
        "confidence": "Low",
        "reasoning": "Insufficient information to determine the emergency type.",
        "resources": []
    },
    "default": {
        "classification": "EMERGENCY",
        "title": "General relief and food supply request",
        "description": "Villagers report lack of clean drinking water and baby food supplies following the cyclone storm surge.",
        "disaster_type": "CYCLONE",
        "severity": "MEDIUM",
        "priority_score": 60,
        "location_text": "Panchayat Office, Chandipur coastal road",
        "affected_count_estimate": 100,
        "needs_evacuation": False,
        "needs_medical": False,
        "needs_shelter": False,
        "needs_food_water": True,
        "confidence": "High",
        "reasoning": "Non-life-threatening shortage of food and drinking water. Logistics dispatch of relief packages required.",
        "resources": [
            {"type": "RELIEF_KIT", "quantity": 50},
            {"type": "WATER_SUPPLY", "quantity": 50},
            {"type": "VEHICLE", "quantity": 1}
        ]
    }
}

def extract_affected_count(content: str) -> int:
    content_lower = content.lower()
    
    word_to_num = {
        "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
        "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
        "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
        "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19, "twenty": 20
    }
    
    match_digit = re.search(r'(\d+)\s+(people|person|children|child|men|women|boy|girl|villager|trapped|stranded|stuck)', content_lower)
    if match_digit:
        return int(match_digit.group(1))
        
    for word, num in word_to_num.items():
        if re.search(rf'\b{word}\b\s+(people|person|children|child|men|women|boy|girl|villager|trapped|stranded|stuck)', content_lower):
            return num
            
    return 0

def get_mock_ai_response(content: str) -> Dict[str, Any]:
    content_lower = content.lower()
    
    non_emergency_words = ["hi", "hello", "name is", "pizza", "test"]
    uncertain_words = ["can anyone hear me", "please help", "help us"]

    matched_scenario = MOCK_SCENARIOS["default"]

    if "my name is payal" in content_lower or "send pizza" in content_lower:
        matched_scenario = MOCK_SCENARIOS["non_emergency"]
    elif "hello can anyone hear me" in content_lower or "please help" in content_lower and len(content_lower) < 20:
        matched_scenario = MOCK_SCENARIOS["uncertain"]
    elif "fire" in content_lower or "smoke" in content_lower or "burn" in content_lower:
        matched_scenario = MOCK_SCENARIOS["fire"]
    elif "flood" in content_lower or "trap" in content_lower or "water" in content_lower or "river" in content_lower:
        matched_scenario = MOCK_SCENARIOS["flood"]
    elif "pregnant" in content_lower or "labor" in content_lower or "medical" in content_lower or "hospital" in content_lower or "baby" in content_lower:
        matched_scenario = MOCK_SCENARIOS["medical"]
        
    response = copy.deepcopy(matched_scenario)
    
    if response["classification"] == "EMERGENCY":
        response["affected_count_estimate"] = extract_affected_count(content)
        
    return response

