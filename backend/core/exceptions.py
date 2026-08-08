from fastapi import HTTPException, status

class SahayaException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)

class EntityNotFoundException(SahayaException):
    def __init__(self, entity_name: str, entity_id: any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{entity_name} with identifier {entity_id} not found"
        )

class InvalidTransitionException(SahayaException):
    def __init__(self, from_status: str, to_status: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid state transition from {from_status} to {to_status}"
        )

class UnauthorizedException(SahayaException):
    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail
        )

class ForbiddenException(SahayaException):
    def __init__(self, detail: str = "Permission denied"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )
