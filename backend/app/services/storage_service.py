import os
import shutil
import uuid
from typing import Tuple
from fastapi import UploadFile, HTTPException
from app.core.config import settings

class StorageService:
    @staticmethod
    async def save_upload_file(upload_file: UploadFile) -> Tuple[str, int]:
        """
        Saves the uploaded file to the local storage directory and returns (file_path, file_size).
        Enforces MAX_UPLOAD_SIZE.
        """
        extension = os.path.splitext(upload_file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{extension}"
        file_path = os.path.join(settings.STORAGE_DIR, unique_filename)
        
        file_size = 0
        with open(file_path, "wb") as buffer:
            # Read in chunks to avoid loading large files in memory and check size limit
            chunk_size = 1024 * 1024 # 1MB chunks
            while chunk := await upload_file.read(chunk_size):
                file_size += len(chunk)
                if file_size > settings.MAX_UPLOAD_SIZE:
                    os.remove(file_path)
                    raise HTTPException(status_code=413, detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE / (1024*1024)} MB.")
                buffer.write(chunk)
            
        return file_path, file_size

    @staticmethod
    def delete_file(file_path: str):
        if os.path.exists(file_path):
            os.remove(file_path)
