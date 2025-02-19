import { NextResponse } from "next/server"
import { createWorker } from "tesseract.js"
import OpenAI from 'openai'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const language = formData.get("language") as string

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const worker = await createWorker("deu")
    const arrayBuffer = await file.arrayBuffer()
    const { data: { text: ocrText } } = await worker.recognize(arrayBuffer)
    await worker.terminate()
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const result = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            `You are a translation assistant. Translate the following German text into ${language}. Provide a summary and list the important actions mentioned in it.`
        },
        {
          role: "user",
          content: ocrText
        }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "translation_summary",
            description: `Provides a ${language} summary of the text along with a list of important actions.`,
            parameters: {
              type: "object",
              properties: {
                summary: {
                  type: "string",
                  description: `Summary of the text in ${language}`
                },
                actions: {
                  type: "array",
                  description: "List of important actions based on the content",
                  items: {
                    type: "string",
                    description: "An important action that needs to be taken"
                  }
                }
              },
              required: ["summary", "actions"]
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "translation_summary" } }
    });

    const functionCall = result.choices[0].message.tool_calls[0].function
    if (!functionCall || !functionCall.arguments) {
      throw new Error("Invalid response from OpenAI")
    }

    const parsedResult = JSON.parse(functionCall.arguments)
    return NextResponse.json({
      success: true,
      summary: parsedResult.summary,
      actions: parsedResult.actions,
      ocrText: ocrText,
    })

  } catch (error) {
    console.error("Error processing image:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}





