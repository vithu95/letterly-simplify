import { NextResponse } from "next/server"
import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import heicConvert from 'heic-convert'
import sharp from 'sharp'

// Use the correct types from heic-convert
interface ConversionOptions {
  buffer: Buffer | Uint8Array
  format: 'JPEG' | 'PNG'
  quality?: number
}

export async function POST(req: Request) {
  try {
    let text: string | undefined
    let language: string
    let imageBase64: string | undefined

    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const formData = await req.formData()
      const file = formData.get("file") as File
      
      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
      }

      // Check file type
      const supportedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/heic', 'image/heif']
      if (!supportedTypes.includes(file.type)) {
        return NextResponse.json({ 
          error: "Unsupported file type. Please upload a PDF, PNG, JPEG, or HEIC file." 
        }, { status: 400 })
      }

      let buffer: Buffer
      const arrayBuffer = await file.arrayBuffer()
      
      // Convert HEIC to JPEG if needed
      if (file.type === 'image/heic' || file.type === 'image/heif') {
        try {
          const inputBuffer = Buffer.from(arrayBuffer)
          
          const options: ConversionOptions = {
            buffer: inputBuffer,
            format: 'JPEG',
            quality: 1
          }
          
          const convert = heicConvert as unknown as (options: ConversionOptions) => Promise<Buffer>
          buffer = await convert(options)
        } catch (conversionError) {
          console.error('HEIC conversion error:', conversionError)
          return NextResponse.json({ 
            error: "Failed to process HEIC image. Please try converting it to JPEG first." 
          }, { status: 400 })
        }
      } else {
        // For non-HEIC files, use the original buffer
        buffer = Buffer.from(arrayBuffer)
      }

      // Process image and convert to base64 for OpenAI
      const processedBuffer = await processImage(buffer)
      imageBase64 = processedBuffer.toString('base64')
      language = "english" // Default to English for initial upload
    } else {
      const body = await req.json()
      text = body.text
      language = body.language
    }

    // Generate GPT response
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          `You are a translation assistant. Summarize the user's letter and list the important actions in simple ${language}. Also return the recognized text.`
      }
    ]

    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
          }
        ]
      })
    } else if (text) {
      messages.push({
        role: "user",
        content: text
      })
    }

    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools: [
        {
          type: "function",
          function: {
            name: "translation_summary",
            description:
              `Provides a ${language} summary in simple language of the input text or image along with a list of important actions and the recognized text.`,
            parameters: {
              type: "object",
              properties: {
                summary: {
                  type: "string",
                  description: `Summary of the text in ${language} in simple language`
                },
                actions: {
                  type: "array",
                  description:
                    "List of important actions based on the content for the user. Make sure to include all actions that are mentioned in the text.",
                  items: {
                    type: "string",
                    description:
                      "An important action that needs to be taken by the user."
                  }
                },
                ocrText: {
                  type: "string",
                  description: "The full text extracted from the letter"
                }
              },
              required: ["summary", "actions", "ocrText"],
              additionalProperties: false
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "translation_summary" } }
    });

    const functionCall = result.choices[0].message.tool_calls?.[0].function
    if (!functionCall || !functionCall.arguments) {
      throw new Error("Invalid response from OpenAI")
    }

    const parsedResult = JSON.parse(functionCall.arguments)

    return NextResponse.json({
      success: true,
      summary: parsedResult.summary,
      actions: parsedResult.actions,
      ocrText: text ?? parsedResult.ocrText,
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    )
  }
}

const processImage = async (buffer: Buffer) => {
  const processed = await sharp(buffer)
    .resize(1500, 2000, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .grayscale()
    .normalize()
    .sharpen()
    .jpeg({ quality: 60 })
    .toBuffer();
  return processed;
};





