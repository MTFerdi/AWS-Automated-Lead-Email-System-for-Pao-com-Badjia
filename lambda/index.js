const { DynamoDBClient, QueryCommand, PutItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const crypto = require("crypto");

const db = new DynamoDBClient({});
const ses = new SESClient({});
const tableName = process.env.LEADS_TABLE;

// ============================================================
// LOAD EMAIL TEMPLATE (your exact email.html content)
// ============================================================

const emailTemplate = `
<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Pão com Badjia</title>
<style>
${/* your css is already inline inside the HTML, so nothing added here */""}
</style>
</head>
<body style="margin:0; padding:0; background:#f4f4f4;">
  
<!-- YOUR EXACT HTML BELOW -->
${require("fs").readFileSync("/mnt/data/email.html", "utf8")}
<!-- END OF EXACT HTML -->

</body>
</html>
`;

// ============================================================
// LAMBDA HANDLER
// ============================================================

exports.handler = async (event) => {
  console.log("Incoming event:", JSON.stringify(event));

  try {
    const body = JSON.parse(event.body || "{}");

    const email = (body.email || "").toLowerCase().trim();
    const name = (body.name || "").trim();
    const whatsapp = (body.whatsapp || "").trim();
    const source = (body.source || "website").trim();

    if (!email || !name || !whatsapp) {
      return response(400, { success: false, message: "Missing required fields" });
    }

    // ============================================================
    // 1️⃣ CHECK FOR DUPLICATE EMAIL
    // ============================================================

    let isDuplicate = false;

    try {
      const query = await db.send(
        new QueryCommand({
          TableName: tableName,
          IndexName: "email-index",
          KeyConditionExpression: "email = :email",
          ExpressionAttributeValues: {
            ":email": { S: email },
          },
        })
      );
      if (query.Items?.length > 0) isDuplicate = true;
    } catch {
      const scan = await db.send(
        new ScanCommand({
          TableName: tableName,
          FilterExpression: "email = :email",
          ExpressionAttributeValues: {
            ":email": { S: email },
          },
        })
      );
      if (scan.Items.length > 0) isDuplicate = true;
    }

    // Even duplicate leads get the confirmation email
    if (isDuplicate) {
      await sendUserEmail(name, email);
      return response(200, { success: true, duplicate: true });
    }

    // ============================================================
    // 2️⃣ STORE NEW LEAD
    // ============================================================

    const item = {
      id: { S: crypto.randomUUID() },
      name: { S: name },
      email: { S: email },
      whatsapp: { S: whatsapp },
      source: { S: source },
      createdAt: { S: new Date().toISOString() },
      ip: { S: event.requestContext?.http?.sourceIp || "unknown" },
      userAgent: { S: event.requestContext?.http?.userAgent || "unknown" },
    };

    await db.send(
      new PutItemCommand({
        TableName: tableName,
        Item: item,
      })
    );

    // ============================================================
    // 3️⃣ ALWAYS SEND INTERNAL EMAIL
    // ============================================================

    await sendInternalEmail(name, email, whatsapp, source);

    // ============================================================
    // 4️⃣ ALWAYS SEND CONFIRMATION EMAIL TO USER
    // ============================================================

    await sendUserEmail(name, email);

    return response(200, { success: true, duplicate: false });

  } catch (err) {
    console.error("Lambda error:", err);
    return response(500, { success: false, message: "Internal Server Error" });
  }
};

// ============================================================
// INTERNAL EMAIL
// ============================================================

async function sendInternalEmail(name, email, whatsapp, source) {
  const params = {
    Source: "apoio@paocombadjia.com",
    Destination: { ToAddresses: ["apoio@paocombadjia.com"] },
    Message: {
      Subject: { Data: "📥 Novo Lead — Pão Com Badjia" },
      Body: {
        Html: {
          Data: `
            <h2>Novo Lead Recebido</h2>
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>WhatsApp:</strong> ${whatsapp}</p>
            <p><strong>Origem:</strong> ${source}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleString()}</p>
          `
        }
      }
    }
  };

  await ses.send(new SendEmailCommand(params));
}

// ============================================================
// SEND EMAIL TO USER (Uses your exact email.html)
// ============================================================

async function sendUserEmail(name, email) {
  const personalizedHtml = emailTemplate.replace("{{NAME}}", name);

  const params = {
    Source: "apoio@paocombadjia.com",
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: "Recebemos a sua mensagem — Pão Com Badjia" },
      Body: {
        Html: {
          Data: personalizedHtml
        }
      }
    }
  };

  await ses.send(new SendEmailCommand(params));
}

// ============================================================
// HTTP RESPONSE
// ============================================================

function response(status, body) {
  return {
    statusCode: status,
    headers: {
      "Access-Control-Allow-Origin": "https://paocombadjia.com",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "OPTIONS,POST"
    },
    body: JSON.stringify(body),
  };
}
