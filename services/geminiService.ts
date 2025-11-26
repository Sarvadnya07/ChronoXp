import { GoogleGenerativeAI } from "@google/generative-ai"

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""

const genAI = new GoogleGenerativeAI(API_KEY)

export const GeminiService = {
    async askGemini(prompt: string): Promise<string> {
        if (!API_KEY) {
            return "Error: Gemini API Key is missing. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables."
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" })
            const result = await model.generateContent(prompt)
            const response = await result.response
            return response.text()
        } catch (error) {
            console.error("Gemini API Error:", error)
            return "I'm having trouble connecting to my brain right now. Please try again later."
        }
    }
}
