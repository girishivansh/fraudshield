import { Groq } from "groq-sdk";

async function run() {
  console.log("Key starts with:", process.env.GROQ_API_KEY?.substring(0, 5));
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  try {
    const res = await client.chat.completions.create({
      model: "llama-3.2-90b-vision-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What's in this image?" },
            { type: "image_url", image_url: { url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" } }
          ]
        }
      ],
      temperature: 0,
    });
    console.log("Success:", res.choices[0].message);
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
