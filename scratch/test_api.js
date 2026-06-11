const http = require('http');

// Helper to make HTTP requests
const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log("=== STARTING ADVANCED UPGRADE PACKAGE TESTS ===");
  
  try {
    // 0. Login to get Admin Token
    console.log("\n0. Logging in as Admin...");
    const loginRes = await request('POST', '/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    let token = null;
    if (loginRes.statusCode === 200 && loginRes.body.token) {
      token = loginRes.body.token;
      console.log("SUCCESS: Logged in and got JWT token!");
    } else {
      console.log("WARNING: Login failed, admin endpoints will be tested without token or might fail. Response:", loginRes.body);
    }

    // 1. Test Dictionary API
    console.log("\n1. Testing PUT /api/dictionary/:key (Admin)...");
    const dictPutRes = await request('PUT', '/api/dictionary/nav_home', {
      key: 'nav_home',
      translations: {
        vi: 'Trang chủ',
        en: 'Home',
        ja: 'ホーム',
        ko: '홈',
        zh: '首页'
      }
    }, token);
    console.log(`Status: ${dictPutRes.statusCode}`);
    console.log("Response:", dictPutRes.body);

    console.log("\n2. Testing GET /api/dictionary (Public full translations)...");
    const dictGetRes = await request('GET', '/api/dictionary');
    console.log(`Status: ${dictGetRes.statusCode}`);
    console.log("Response length:", Array.isArray(dictGetRes.body) ? dictGetRes.body.length : 0);

    console.log("\n3. Testing GET /api/dictionary/:lang (Public flat translation map)...");
    const dictLangRes = await request('GET', '/api/dictionary/ja');
    console.log(`Status: ${dictLangRes.statusCode}`);
    console.log("Flat Map for 'ja':", dictLangRes.body);

    // 2. Test Contact Form & Telegram Notify
    console.log("\n4. Testing POST /api/contact (Contact Form Submission)...");
    const contactRes = await request('POST', '/api/contact', {
      name: 'Tester Bot',
      email: 'test@example.com',
      subject: 'Automated Test Message',
      message: 'Hello, this is an automated integration test message checking Mongoose save and Telegram bot notify!'
    });
    console.log(`Status (Expected 201): ${contactRes.statusCode}`);
    console.log("Response:", contactRes.body);

    // 3. Test Newsletter Subscription
    console.log("\n5. Testing POST /api/subscriber (Newsletter Submission)...");
    const testEmail = `sub-${Date.now()}@test.com`;
    const subRes = await request('POST', '/api/subscriber', {
      email: testEmail
    });
    console.log(`Status (Expected 201): ${subRes.statusCode}`);
    console.log("Response:", subRes.body);

    // 4. Test Projects localizations, claps and clicks
    console.log("\n6. Fetching projects to test clicks, likes and changelogs...");
    const projectsList = await request('GET', '/api/projects');
    const projects = Array.isArray(projectsList.body) ? projectsList.body : (projectsList.body.data || []);
    
    if (projects.length > 0) {
      const project = projects[0];
      const projectId = project._id || project.id;
      console.log(`Targeting project ID: ${projectId} - Title: ${JSON.stringify(project.title)}`);

      // Test Like Project
      console.log(`\n7. Testing POST /api/projects/${projectId}/like...`);
      const likeRes = await request('POST', `/api/projects/${projectId}/like`);
      console.log(`Status: ${likeRes.statusCode}`);
      console.log("Response:", likeRes.body);

      // Test Click Tracking
      console.log(`\n8. Testing POST /api/projects/${projectId}/click...`);
      const clickRes = await request('POST', `/api/projects/${projectId}/click`, {
        destination: 'apk'
      });
      console.log(`Status: ${clickRes.statusCode}`);
      console.log("Response:", clickRes.body);
    } else {
      console.log("No projects found to test claps & clicks.");
    }

    // 5. Test Blog Post localization & comment system
    console.log("\n9. Fetching posts to test comments...");
    const postsList = await request('GET', '/api/posts');
    const posts = Array.isArray(postsList.body) ? postsList.body : (postsList.body.data || []);

    if (posts.length > 0) {
      const post = posts[0];
      const postId = post._id || post.id;
      console.log(`Targeting post ID: ${postId} - Title: ${JSON.stringify(post.title)}`);

      // Test Like Post
      console.log(`\n10. Testing POST /api/posts/${postId}/like...`);
      const likePostRes = await request('POST', `/api/posts/${postId}/like`);
      console.log(`Status: ${likePostRes.statusCode}`);
      console.log("Response:", likePostRes.body);

      // Test Comments submission
      console.log(`\n11. Testing POST /api/comments (Public)...`);
      const commentRes = await request('POST', '/api/comments', {
        postId: postId,
        playerName: 'Gamer Pro',
        email: 'gamer@example.com',
        content: 'Wow! This game updates are awesome. Very good developer portfolio!'
      });
      console.log(`Status (Expected 201): ${commentRes.statusCode}`);
      console.log("Response:", commentRes.body);

      // Fetch comments for this post
      console.log(`\n12. Testing GET /api/comments/post/${postId} (Public)...`);
      const getCommentsRes = await request('GET', `/api/comments/post/${postId}`);
      console.log(`Status: ${getCommentsRes.statusCode}`);
      console.log("Approved comments count:", getCommentsRes.body.length);
    } else {
      console.log("No posts found to test comments.");
    }

    // 6. Test Admin Dashboard Stats
    if (token) {
      console.log("\n13. Testing GET /api/admin/dashboard-stats (Admin Only)...");
      const statsRes = await request('GET', '/api/admin/dashboard-stats', null, token);
      console.log(`Status: ${statsRes.statusCode}`);
      console.log("Dashboard Stats:", JSON.stringify(statsRes.body, null, 2));
    }

    console.log("\n=== ALL TESTS COMPLETED ===");
  } catch (err) {
    console.error("Test execution failed. Is the server running on port 5000?", err.message);
  }
};

runTests();
