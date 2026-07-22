const fs = require('fs');

async function testUpload() {
  const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
  
  // Create a 1x1 png image
  const imgBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
  
  let body = `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="file"; filename="test.png"\r\n`;
  body += `Content-Type: image/png\r\n\r\n`;
  
  const payload = Buffer.concat([
    Buffer.from(body, "utf8"),
    imgBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`, "utf8")
  ]);

  try {
    const res = await fetch("http://localhost:3000/api/analyze/image", {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: payload
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testUpload();
