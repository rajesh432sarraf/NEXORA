from typing import List
from app.schemas.copilot import ChatMessage

class PromptBuilder:
    """
    Constructs the RAG prompt for Gemini, strictly enforcing context boundaries.
    """
    
    def build_prompt(self, question: str, retrieved_chunks: List[dict], history: List[ChatMessage]) -> str:
        
        context_texts = []
        for i, chunk in enumerate(retrieved_chunks):
            context_texts.append(f"[Source: {chunk['source']}]\n{chunk['text']}\n")
            
        context_block = "\n".join(context_texts) if context_texts else "No context available."
        
        history_texts = []
        # Include last 4 messages to preserve context but save tokens
        for msg in history[-4:]:
            role = "User" if msg.role == "user" else "Copilot"
            history_texts.append(f"{role}: {msg.content}")
            
        history_block = "\n".join(history_texts) if history_texts else "No prior history."
        
        prompt = f"""
        You are NEXORA, a highly intelligent AI Procurement Copilot.
        You assist EPC (Engineering, Procurement, and Construction) professionals.
        
        CRITICAL INSTRUCTIONS:
        1. You must answer the user's question ONLY using the provided RETRIEVED CONTEXT.
        2. If the answer is not contained in the RETRIEVED CONTEXT, say exactly: "I'm sorry, but I couldn't find the information in the uploaded procurement documents."
        3. Do NOT hallucinate, guess, or bring in outside knowledge.
        4. Keep your answers professional, concise, and accurate.
        
        === CONVERSATION HISTORY ===
        {history_block}
        
        === RETRIEVED CONTEXT ===
        {context_block}
        
        === CURRENT QUESTION ===
        User: {question}
        
        Response:
        """
        
        return prompt
