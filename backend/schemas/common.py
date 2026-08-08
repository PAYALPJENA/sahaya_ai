from pydantic import BaseModel
from typing import Generic, TypeVar, List

T = TypeVar('T')

class PaginationParams(BaseModel):
    page: int = 1
    limit: int = 20

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    limit: int

class MessageResponse(BaseModel):
    message: str
