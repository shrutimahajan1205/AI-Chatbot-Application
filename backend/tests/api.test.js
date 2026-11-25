const assert = require("assert");
const { app, server } = require("../src/server");
const { connectDB } = require("../src/config/db");

async function runTests() {
  console.log("▶ Starting API Integration Tests...\n");

  await connectDB();
  const PORT = 5055;
  await new Promise(resolve => server.listen(PORT, resolve));
  const baseUrl = `http://localhost:${PORT}/api`;

  let userToken = "";
  let adminToken = "";
  let conversationId = "";
  let messageId = "";

  try {
    // 1. Health check
    console.log("Test 1: Health check endpoint");
    const healthRes = await fetch(`${baseUrl}/health`);
    assert.strictEqual(healthRes.status, 200, "Health check should return 200");
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.status, "healthy");
    console.log("✔ Health check passed");

    // 2. Register regular user
    console.log("\nTest 2: User Registration");
    const testEmail = `vipul_${Date.now()}@example.com`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: `vipul_${Date.now().toString().slice(-4)}`,
        email: testEmail,
        password: "password123"
      })
    });
    assert.strictEqual(regRes.status, 201, "Registration should return 201");
    const regData = await regRes.json();
    assert.ok(regData.token, "Should return a JWT token");
    userToken = regData.token;
    console.log("✔ User registration passed");

    // 3. User Login
    console.log("\nTest 3: User Login");
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "password123"
      })
    });
    assert.strictEqual(loginRes.status, 200, "Login should return 200");
    const loginData = await loginRes.json();
    assert.ok(loginData.token, "Login should return JWT token");
    console.log("✔ User login passed");

    // 4. Create Conversation
    console.log("\nTest 4: Create Conversation Session");
    const convRes = await fetch(`${baseUrl}/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userToken}`
      },
      body: JSON.stringify({
        title: "Fullstack Architecture Chat",
        category: "coding",
        botName: "CodeMentor"
      })
    });
    assert.strictEqual(convRes.status, 201, "Create conversation should return 201");
    const convData = await convRes.json();
    assert.ok(convData.conversation._id, "Should return conversation ID");
    conversationId = convData.conversation._id;
    console.log("✔ Create conversation passed");

    // 5. Send Chat Message & AI Response
    console.log("\nTest 5: Chat Message & AI Response Generation");
    const chatRes = await fetch(`${baseUrl}/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userToken}`
      },
      body: JSON.stringify({
        conversationId,
        content: "Explain how WebSockets enable real-time bidirectional communication",
        category: "coding",
        botName: "CodeMentor"
      })
    });
    assert.strictEqual(chatRes.status, 200, "Send message should return 200");
    const chatData = await chatRes.json();
    assert.ok(chatData.userMessage, "Should have user message");
    assert.ok(chatData.botMessage, "Should have AI bot response");
    assert.ok(chatData.botMessage.content.length > 0, "Bot response should not be empty");
    messageId = chatData.botMessage._id;
    console.log("✔ Chat message & AI generation passed");

    // 6. Submit Message Rating & Feedback
    console.log("\nTest 6: Submit Rating & User Feedback");
    const fbRes = await fetch(`${baseUrl}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userToken}`
      },
      body: JSON.stringify({
        messageId,
        rating: 5,
        comment: "Outstanding explanation and clear architectural breakdown!"
      })
    });
    assert.strictEqual(fbRes.status, 201, "Feedback submission should return 201");
    const fbData = await fbRes.json();
    assert.strictEqual(fbData.feedback.rating, 5);
    console.log("✔ Rating and feedback submission passed");

    // 7. Login as Pre-seeded Admin & Test Admin Analytics
    console.log("\nTest 7: Admin Analytics Dashboard Access");
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "admin123"
      })
    });
    assert.strictEqual(adminLoginRes.status, 200, "Admin login should return 200");
    const adminLoginData = await adminLoginRes.json();
    adminToken = adminLoginData.token;

    const adminRes = await fetch(`${baseUrl}/admin/analytics`, {
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    assert.strictEqual(adminRes.status, 200, "Admin analytics should return 200");
    const adminData = await adminRes.json();
    assert.ok(adminData.analytics.totalMessages >= 2, "Analytics should track messages");
    assert.ok(adminData.analytics.totalConversations >= 1, "Analytics should track conversations");
    assert.strictEqual(adminData.analytics.avgRating, 5);
    console.log("✔ Admin analytics verified: Total Msgs=" + adminData.analytics.totalMessages + ", Avg Rating=" + adminData.analytics.avgRating);

    console.log("\n========================================================");
    console.log("🎉 ALL 7 INTEGRATION TESTS PASSED 100% SUCCESSFULLY!");
    console.log("========================================================\n");
  } catch (err) {
    console.error("❌ Test Failed:", err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
