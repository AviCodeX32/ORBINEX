import re
import socket
import ipaddress
from urllib.parse import urlparse
from typing import Optional

BLOCKED_IP_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),   # Link-local / Cloud metadata (AWS, GCP, Azure)
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
]

BLOCKED_HOSTNAMES = {
    "localhost",
    "metadata.google.internal",
    "metadata.internal",
    "169.254.169.254",
    "instance-data",
    "kubernetes.default"
}

PROMPT_INJECTION_PATTERNS = [
    r"(?i)ignore\s+(?:all\s+)?previous\s+instructions",
    r"(?i)system\s+prompt\s+override",
    r"(?i)you\s+are\s+now\s+in\s+developer\s+mode",
    r"(?i)disregard\s+the\s+above",
    r"(?i)repeat\s+after\s+me",
    r"(?i)output\s+the\s+following\s+secret",
    r"(?i)reveal\s+your\s+system\s+prompt",
    r"(?i)<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>",
]

def is_safe_external_url(url: str) -> bool:
    """
    Validates URL against SSRF (Server-Side Request Forgery) attacks.
    Ensures scheme is http/https and destination IP is not private or loopback.
    """
    if not url or not isinstance(url, str):
        return False

    try:
        parsed = urlparse(url)
        if parsed.scheme.lower() not in ("http", "https"):
            return False

        hostname = (parsed.hostname or "").lower()
        if not hostname or hostname in BLOCKED_HOSTNAMES:
            return False

        # Attempt DNS resolution check
        try:
            ip_str = socket.gethostbyname(hostname)
            ip_obj = ipaddress.ip_address(ip_str)

            for net in BLOCKED_IP_NETWORKS:
                if ip_obj in net:
                    return False

            if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local:
                return False
        except (socket.gaierror, socket.herror, ValueError):
            # If DNS resolution fails, allow if hostname has valid public structure
            if hostname.endswith(".internal") or hostname.endswith(".local"):
                return False

        return True
    except Exception:
        return False

def sanitize_for_llm(raw_text: str, max_chars: int = 3500) -> str:
    """
    Sanitizes external web content before passing to Gemini LLM to prevent prompt injection.
    Strips injection phrases, script tags, and bounds length.
    """
    if not raw_text:
        return ""

    sanitized = raw_text[:max_chars]

    for pattern in PROMPT_INJECTION_PATTERNS:
        sanitized = re.sub(pattern, "[Filtered Content]", sanitized)

    # Normalize whitespace
    sanitized = re.sub(r'[\r\n\t]+', ' ', sanitized)
    sanitized = re.sub(r'\s{2,}', ' ', sanitized)

    return sanitized.strip()
