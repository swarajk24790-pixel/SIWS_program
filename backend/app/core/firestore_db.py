"""
Local SQLite-only database service.
Replaces previous Firestore synchronization with pure SQLite persistence.
"""
from typing import Dict, Any, List, Optional

class FirestoreService:
    """No-op stub to safely handle any legacy calls without errors."""
    def __init__(self):
        self.db = None
        self.is_connected = False

    def get_document(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        return None

    def set_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        return True

    def query_collection(self, collection: str, filters: Optional[List[tuple]] = None) -> List[Dict[str, Any]]:
        return []

    def delete_document(self, collection: str, doc_id: str) -> bool:
        return True

firestore_service = FirestoreService()
