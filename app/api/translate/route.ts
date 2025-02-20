import { NextResponse } from "next/server"
import { createWorker } from "tesseract.js"
import OpenAI from 'openai'
import heicConvert from 'heic-convert'
import sharp from 'sharp'

// Use the correct types from heic-convert
interface ConversionOptions {
  buffer: ArrayBufferLike
  format: 'JPEG' | 'PNG'
  quality?: number
}

export async function POST(req: Request) {
  try {
    let text: string
    let language: string

    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const formData = await req.formData()
      const file = formData.get("file") as File
      
      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
      }

      // Check file type
      const supportedTypes = [
        'image/jpeg', 
        'image/png', 
        'application/pdf',
        'image/heic',
        'image/heif'
      ]
      if (!supportedTypes.includes(file.type)) {
        return NextResponse.json({ 
          error: "Unsupported file type. Please upload a PDF, PNG, JPEG, or HEIC file." 
        }, { status: 400 })
      }

      let arrayBuffer = await file.arrayBuffer()
      
      // Convert HEIC to JPEG if needed
      if (file.type === 'image/heic' || file.type === 'image/heif') {
        try {
          // Convert ArrayBuffer to Buffer for heic-convert
          const inputBuffer = Buffer.from(arrayBuffer)
          
          const options: ConversionOptions = {
            buffer: inputBuffer,  // Use Buffer instead of ArrayBuffer
            format: 'JPEG',
            quality: 1
          }
          
          const convert = heicConvert as unknown as (options: ConversionOptions) => Promise<Buffer>
          const convertedBuffer = await convert(options)
          
          // Update arrayBuffer with the converted buffer
          arrayBuffer = convertedBuffer.buffer
        } catch (conversionError) {
          console.error('HEIC conversion error:', conversionError)
          return NextResponse.json({ 
            error: "Failed to process HEIC image. Please try converting it to JPEG first." 
          }, { status: 400 })
        }
      }

      // Convert ArrayBuffer to Buffer and process image
      const buffer = Buffer.from(new Uint8Array(arrayBuffer))
      const processedBuffer = await processImage(buffer)
      
      // Initialize worker with correct options
      const worker = await createWorker('deu')
      
      // Perform OCR
      const { data: { text: ocrText } } = await worker.recognize(processedBuffer)
      await worker.terminate()
      
      text = ocrText
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

    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            `You are a translation assistant. Translate the following letter, which the user received into a summary and list the important actions mentioned in it in simple ${language}.`
        },
        {
          role: "user",
          content: text
        }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "translation_summary",
            description:
              `Provides a ${language} summary in simple language of the input text along with a list of important actions.`,
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
                }
              },
              required: ["summary", "actions"],
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
      ocrText: text,
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
    .jpeg({ quality: 90 })
    .toBuffer();
  return processed;
};





