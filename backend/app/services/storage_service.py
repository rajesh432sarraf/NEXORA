import os
import shutil
import uuid
from fastapi import UploadFile
from app.core.config import settings

class StorageService:
    @staticmethod
    async def save_upload_file(upload_file: UploadFile) -> str:
        """
        Saves the uploaded file to the local storage directory and returns the file path.
        """
        extension = os.path.splitext(upload_file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{extension}"
        file_path = os.path.join(settings.STORAGE_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
            
        return file_path

    @staticmethod
    def delete_file(file_path: str):
        if os.path.exists(file_path):
            os.remove(file_path)
