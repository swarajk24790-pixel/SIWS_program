import os
import json
from typing import Dict, Any, List, Optional
from backend.app.core.config import settings


class FirestoreService:
    """
    Hybrid Firestore/SQLite service.
    Firestore is only initialised when credentials are explicitly provided via
    FIREBASE_CREDENTIALS_JSON or FIREBASE_CREDENTIALS_PATH env vars.
    Without credentials the service silently operates in local-only mode —
    all writes are no-ops and all reads return None / [] so the SQLite layer
    is the single source of truth.
    """

    def __init__(self):
        self.db = None
        self.is_connected = False
        self._init_firestore()

    def _init_firestore(self):
        cred_json_str = os.getenv("FIREBASE_CREDENTIALS_JSON", "").strip() or settings.FIREBASE_CREDENTIALS_JSON
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "").strip() or settings.FIREBASE_CREDENTIALS_PATH

        # Only attempt Firebase connection when credentials are explicitly set
        if not cred_json_str and not cred_path:
            print(">> [Firestore] No credentials set — running in local SQLite-only mode.")
            return

        try:
            # Lazy import — avoids any Google network probes at import time
            import firebase_admin
            from firebase_admin import credentials, firestore

            if cred_json_str:
                cred_dict = json.loads(cred_json_str)
                cred = credentials.Certificate(cred_dict)
            elif os.path.isfile(cred_path):
                cred = credentials.Certificate(cred_path)
            else:
                print(f">> [Firestore] Credential file '{cred_path}' not found — local mode.")
                return

            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)

            self.db = firestore.client()
            self.is_connected = True
            print(">> [Firestore] Connected successfully.")

        except Exception as e:
            # Never crash the server — fall back to local mode
            print(f">> [Firestore] Init warning ({type(e).__name__}): {e}. Local SQLite mode active.")
            self.db = None
            self.is_connected = False

    # ─── Generic collection helpers ───────────────────────────────────────────

    def get_document(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        if not self.is_connected or not self.db:
            return None
        try:
            doc = self.db.collection(collection).document(doc_id).get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            print(f">> [Firestore] Read error {collection}/{doc_id}: {e}")
            return None

    def set_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        if not self.is_connected or not self.db:
            return False
        try:
            self.db.collection(collection).document(doc_id).set(data, merge=True)
            return True
        except Exception as e:
            print(f">> [Firestore] Write error {collection}/{doc_id}: {e}")
            return False

    def query_collection(
        self, collection: str, filters: Optional[List[tuple]] = None
    ) -> List[Dict[str, Any]]:
        if not self.is_connected or not self.db:
            return []
        try:
            ref = self.db.collection(collection)
            if filters:
                for field, op, val in filters:
                    ref = ref.where(field, op, val)
            docs = ref.stream()
            return [{**d.to_dict(), "id": d.id} for d in docs]
        except Exception as e:
            print(f">> [Firestore] Query error {collection}: {e}")
            return []

    def delete_document(self, collection: str, doc_id: str) -> bool:
        if not self.is_connected or not self.db:
            return False
        try:
            self.db.collection(collection).document(doc_id).delete()
            return True
        except Exception as e:
            print(f">> [Firestore] Delete error {collection}/{doc_id}: {e}")
            return False


firestore_service = FirestoreService()
