import re
from typing import List, Dict, Any, Tuple
from urllib.parse import urlparse

class DeduplicationEngine:
    """
    Identifies duplicate listings across sources (Unstop, Devfolio, Devpost, direct sites).
    Maintains a single canonical record and tracks merged sources.
    """

    @staticmethod
    def normalize_text(text: str) -> set:
        """Tokenizes text into a set of normalized alphanumeric words."""
        cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
        words = set(cleaned.split())
        stop_words = {"the", "a", "an", "and", "or", "in", "on", "at", "for", "of", "to", "2025", "2026", "season", "edition", "annual"}
        return words - stop_words

    @classmethod
    def calculate_similarity(cls, title1: str, org1: str, title2: str, org2: str, url1: str = "", url2: str = "") -> float:
        """
        Computes composite similarity score between two listings:
        - Title Jaccard similarity (50%)
        - Organizer match (30%)
        - Domain match (20%)
        """
        words1 = cls.normalize_text(title1)
        words2 = cls.normalize_text(title2)
        
        # Jaccard similarity
        union = words1.union(words2)
        if not union:
            title_sim = 0.0
        else:
            intersection = words1.intersection(words2)
            title_sim = len(intersection) / len(union)

        # Organizer similarity
        org_words1 = cls.normalize_text(org1)
        org_words2 = cls.normalize_text(org2)
        org_union = org_words1.union(org_words2)
        org_sim = (len(org_words1.intersection(org_words2)) / len(org_union)) if org_union else 0.0

        # Domain similarity
        domain_sim = 0.0
        if url1 and url2:
            try:
                host1 = urlparse(url1).netloc.replace("www.", "").lower()
                host2 = urlparse(url2).netloc.replace("www.", "").lower()
                if host1 and host2 and host1 == host2:
                    domain_sim = 1.0
            except Exception:
                pass

        total_score = (title_sim * 0.50) + (org_sim * 0.30) + (domain_sim * 0.20)
        return round(total_score, 3)

    @classmethod
    def scan_for_duplicates(cls, new_item: Dict[str, Any], existing_items: List[Any], threshold: float = 0.70) -> List[Dict[str, Any]]:
        """
        Finds potential duplicate matches from existing opportunities.
        """
        matches = []
        for item in existing_items:
            sim = cls.calculate_similarity(
                new_item.get("title", ""),
                new_item.get("organizer", ""),
                item.title,
                item.organizer,
                new_item.get("direct_registration_url", ""),
                item.direct_registration_url
            )
            if sim >= threshold:
                matches.append({
                    "existing_id": item.id,
                    "existing_title": item.title,
                    "existing_organizer": item.organizer,
                    "similarity_score": sim,
                    "reason": f"{int(sim * 100)}% lexical and organizer match"
                })
        return sorted(matches, key=lambda x: x["similarity_score"], reverse=True)

deduplication_engine = DeduplicationEngine()
