"""
StageLink Test Utilities & In-Memory MongoDB Mock
=================================================
Provides lightweight in-memory collection mocks for isolated unit testing
without requiring active internet connectivity to MongoDB Atlas.
"""

import copy
import re
from bson import ObjectId

class MockCursor:
    def __init__(self, docs):
        self.docs = list(docs)

    def sort(self, key, direction=1):
        def sort_val(d):
            return d.get(key) or ""
        self.docs.sort(key=sort_val, reverse=(direction == -1))
        return self

    def __iter__(self):
        return iter(self.docs)

    def __len__(self):
        return len(self.docs)


class MockCollection:
    def __init__(self, name="mock_collection", initial_docs=None):
        self.name = name
        self.docs = [copy.deepcopy(d) for d in (initial_docs or [])]

    def _matches(self, doc, query):
        if not query:
            return True
        for k, v in query.items():
            if k == "$or":
                if not any(self._matches(doc, cond) for cond in v):
                    return False
            elif k == "$and":
                if not all(self._matches(doc, cond) for cond in v):
                    return False
            elif isinstance(v, dict):
                field_val = doc.get(k)
                for op, op_val in v.items():
                    if op == "$in":
                        if field_val not in op_val:
                            return False
                    elif op == "$nin":
                        if field_val in op_val:
                            return False
                    elif op == "$ne":
                        if field_val == op_val:
                            return False
                    elif op == "$regex":
                        if not isinstance(field_val, str) or not re.search(op_val, field_val, re.IGNORECASE):
                            return False
                    elif op == "$exists":
                        if (k in doc) != op_val:
                            return False
            else:
                if isinstance(v, re.Pattern):
                    field_val = str(doc.get(k, ""))
                    if not v.search(field_val):
                        return False
                elif doc.get(k) != v:
                    return False
        return True

    def find_one(self, query=None, sort=None):
        cursor = self.find(query)
        if sort and len(sort) > 0:
            key, direction = sort[0]
            cursor.sort(key, direction)
        docs = list(cursor)
        return copy.deepcopy(docs[0]) if docs else None

    def find(self, query=None):
        matched = [copy.deepcopy(d) for d in self.docs if self._matches(d, query)]
        return MockCursor(matched)

    def insert_one(self, doc):
        d = copy.deepcopy(doc)
        if '_id' not in d:
            d['_id'] = ObjectId()
        self.docs.append(d)
        class InsertResult:
            def __init__(self, id_):
                self.inserted_id = id_
        return InsertResult(d['_id'])

    def update_one(self, query, update, upsert=False):
        for d in self.docs:
            if self._matches(d, query):
                self._apply_update(d, update)
                return
        if upsert:
            new_doc = copy.deepcopy(query)
            # Remove mongo operator keys from base doc
            new_doc = {k: v for k, v in new_doc.items() if not k.startswith('$')}
            self._apply_update(new_doc, update)
            if '_id' not in new_doc:
                new_doc['_id'] = ObjectId()
            self.docs.append(new_doc)

    def update_many(self, query, update):
        for d in self.docs:
            if self._matches(d, query):
                self._apply_update(d, update)

    def _apply_update(self, doc, update):
        for op, vals in update.items():
            if op == "$set":
                for k, v in vals.items():
                    doc[k] = copy.deepcopy(v)
            elif op == "$setOnInsert":
                for k, v in vals.items():
                    if k not in doc:
                        doc[k] = copy.deepcopy(v)
            elif op == "$push":
                for k, v in vals.items():
                    if k not in doc or not isinstance(doc[k], list):
                        doc[k] = []
                    doc[k].append(copy.deepcopy(v))
            elif op == "$inc":
                for k, v in vals.items():
                    doc[k] = doc.get(k, 0) + v

    def count_documents(self, query=None):
        return len(list(self.find(query)))

    def delete_one(self, query):
        for i, d in enumerate(self.docs):
            if self._matches(d, query):
                del self.docs[i]
                class DeleteResult:
                    deleted_count = 1
                return DeleteResult()
        class DeleteResult:
            deleted_count = 0
        return DeleteResult()

    def delete_many(self, query):
        initial_len = len(self.docs)
        self.docs = [d for d in self.docs if not self._matches(d, query)]
        class DeleteResult:
            def __init__(self, count):
                self.deleted_count = count
        return DeleteResult(initial_len - len(self.docs))

    def create_index(self, keys, **kwargs):
        return "idx_created"

