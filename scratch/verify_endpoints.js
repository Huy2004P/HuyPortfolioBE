const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';

async function runTests() {
  console.log('====================================================');
  console.log('STARTING AUTOMATED COMPREHENSIVE API VERIFICATION');
  console.log('Target Base URL:', BASE_URL);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  let token = null;

  // Track created test IDs to clean up in finally block
  let testProjectId = null;
  let testPostId = null;
  let testCommentId = null;
  let testContactId = null;
  let testSubscriberId = null;
  let testScoreId = null;
  let originalProfileMain = null;

  // Helper function to print results
  function report(name, success, info = '') {
    if (success) {
      passed++;
      console.log(`[ OK ] ${name} ${info ? `(${info})` : ''}`);
    } else {
      failed++;
      console.log(`[FAIL] ${name} ${info ? `-> Error: ${info}` : ''}`);
    }
  }

  try {
    // 1. POST Auth Login (Admin)
    console.log('1. Testing admin login...');
    let loginRes;
    try {
      loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
      });
      if (loginRes.ok) {
        const data = await loginRes.json();
        token = data.token;
        report('POST /api/auth/login', true, 'Logged in & token retrieved');
      } else {
        const text = await loginRes.text();
        report('POST /api/auth/login', false, `Status ${loginRes.status}: ${text}`);
      }
    } catch (err) {
      report('POST /api/auth/login', false, err.message);
    }

    if (!token) {
      console.error('\nAborting tests: Admin token is required to test protected CRUD endpoints.');
      process.exit(1);
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. GET Profile Main
    console.log('\n2. Testing Profile GET and PUT (Auto-Translation verification)...');
    try {
      const getRes = await fetch(`${BASE_URL}/api/profile/main`);
      if (getRes.ok) {
        originalProfileMain = await getRes.json();
        report('GET /api/profile/main', true, `Original headline (vi): "${originalProfileMain.headline?.vi || originalProfileMain.headline}"`);
      } else {
        report('GET /api/profile/main', false, `Status ${getRes.status}`);
      }
    } catch (err) {
      report('GET /api/profile/main', false, err.message);
    }

    // Test Profile Update (PUT)
    if (originalProfileMain) {
      try {
        const testHeadline = {
          vi: 'Xin chào, đây là tiêu đề kiểm thử tự động.',
          en: '' // Blank so pre-save hook translates it
        };
        const putRes = await fetch(`${BASE_URL}/api/profile/main`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            headline: testHeadline,
            techStack: originalProfileMain.techStack,
            subHeadline: originalProfileMain.subHeadline,
            avatarUrl: originalProfileMain.avatarUrl,
            socialLinks: originalProfileMain.socialLinks
          })
        });
        if (putRes.ok) {
          const updated = await putRes.json();
          const translatedEn = updated.headline?.en;
          const translationSuccess = translatedEn && translatedEn.trim() !== '' && translatedEn !== testHeadline.vi;
          report('PUT /api/profile/main (Update and Auto-Translate)', translationSuccess, translationSuccess ? `Translated to: "${translatedEn}"` : 'Missing translation');
        } else {
          const text = await putRes.text();
          report('PUT /api/profile/main', false, `Status ${putRes.status}: ${text}`);
        }
      } catch (err) {
        report('PUT /api/profile/main', false, err.message);
      }
    }

    // 3. Projects CRUD Endpoints
    console.log('\n3. Testing Projects CRUD, likes, and clicks...');
    try {
      // Create Project
      const createRes = await fetch(`${BASE_URL}/api/projects`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: { vi: 'Dự án Kiểm thử API', en: '' },
          description: { vi: 'Mô tả dự án kiểm thử tự động tích hợp.', en: '' },
          projectType: 'game', // Set as game to test scores later
          technologies: ['Node.js', 'Express', 'Mongoose'],
          platforms: ['Web', 'PC']
        })
      });

      if (createRes.ok || createRes.status === 201) {
        const created = await createRes.json();
        testProjectId = created._id;
        report('POST /api/projects (Create)', !!testProjectId, `Project ID: ${testProjectId}, Translated Title (en): "${created.title?.en}"`);
      } else {
        const text = await createRes.text();
        report('POST /api/projects (Create)', false, `Status ${createRes.status}: ${text}`);
      }

      // Update Project (PUT)
      if (testProjectId) {
        const updateRes = await fetch(`${BASE_URL}/api/projects/${testProjectId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            title: { vi: 'Dự án Kiểm thử API Đã Cập Nhật', en: '' },
            description: { vi: 'Mô tả đã được thay đổi.', en: '' },
            projectType: 'game',
            technologies: ['Node.js', 'Express', 'Mongoose', 'MongoDB']
          })
        });
        if (updateRes.ok) {
          const updated = await updateRes.json();
          report('PUT /api/projects/:id (Update)', updated.title?.vi === 'Dự án Kiểm thử API Đã Cập Nhật', `Updated Title (en): "${updated.title?.en}"`);
        } else {
          report('PUT /api/projects/:id (Update)', false, `Status ${updateRes.status}`);
        }

        // Test Project Like (Public)
        const likeRes = await fetch(`${BASE_URL}/api/projects/${testProjectId}/like`, { method: 'POST' });
        if (likeRes.ok) {
          const likeData = await likeRes.json();
          report('POST /api/projects/:id/like', likeData.likesCount === 1, `Likes: ${likeData.likesCount}`);
        } else {
          report('POST /api/projects/:id/like', false, `Status ${likeRes.status}`);
        }

        // Test Project Click (Public)
        const clickRes = await fetch(`${BASE_URL}/api/projects/${testProjectId}/click`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destination: 'github' })
        });
        if (clickRes.ok) {
          const clickData = await clickRes.json();
          report('POST /api/projects/:id/click', clickData.clicks?.github === 1, `Clicks: ${clickData.clicks?.github}`);
        } else {
          report('POST /api/projects/:id/click', false, `Status ${clickRes.status}`);
        }
      }
    } catch (err) {
      report('Projects CRUD', false, err.message);
    }

    // 4. Game Scores API
    console.log('\n4. Testing Game Scores submissions...');
    if (testProjectId) {
      try {
        const scoreRes = await fetch(`${BASE_URL}/api/scores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerName: 'API Tester Bot',
            projectId: testProjectId,
            score: 9999
          })
        });

        if (scoreRes.status === 201 || scoreRes.ok) {
          const scoreData = await scoreRes.json();
          testScoreId = scoreData._id;
          report('POST /api/scores (Submit score)', !!testScoreId, `Score ID: ${testScoreId}, Score: ${scoreData.score}`);
        } else {
          const text = await scoreRes.text();
          report('POST /api/scores (Submit score)', false, `Status ${scoreRes.status}: ${text}`);
        }

        // GET Scores by project
        const getScoresRes = await fetch(`${BASE_URL}/api/scores/${testProjectId}`);
        if (getScoresRes.ok) {
          const scoresList = await getScoresRes.json();
          const hasBotScore = scoresList.some(s => s.playerName === 'API Tester Bot');
          report('GET /api/scores/:projectId', hasBotScore && scoresList.length > 0, `Loaded ${scoresList.length} scores`);
        } else {
          report('GET /api/scores/:projectId', false, `Status ${getScoresRes.status}`);
        }
      } catch (err) {
        report('Game Scores API', false, err.message);
      }
    } else {
      report('Game Scores API', false, 'Skipped (No game project ID)');
    }

    // 5. Posts CRUD Endpoints
    console.log('\n5. Testing Posts CRUD, excerpt and content translations...');
    try {
      const createPostRes = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: { vi: 'Bài viết kiểm thử tự động', en: '' },
          content: { vi: 'Nội dung chi tiết bài viết blog kiểm thử.', en: '' },
          excerpt: { vi: 'Tóm tắt bài viết blog.', en: '' },
          slug: `test-post-${Date.now()}`,
          category: 'general',
          published: true
        })
      });

      if (createPostRes.ok || createPostRes.status === 201) {
        const created = await createPostRes.json();
        testPostId = created._id;
        report('POST /api/posts (Create)', !!testPostId, `Post ID: ${testPostId}, Title (en): "${created.title?.en}"`);
      } else {
        const text = await createPostRes.text();
        report('POST /api/posts (Create)', false, `Status ${createPostRes.status}: ${text}`);
      }

      if (testPostId) {
        // Update Post (PUT)
        const updatePostRes = await fetch(`${BASE_URL}/api/posts/${testPostId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            title: { vi: 'Bài viết kiểm thử đã cập nhật', en: '' },
            slug: 'test-post-updated',
            content: { vi: 'Nội dung chi tiết đã cập nhật.', en: '' },
            excerpt: { vi: 'Tóm tắt mới.', en: '' }
          })
        });
        if (updatePostRes.ok) {
          const updated = await updatePostRes.json();
          report('PUT /api/posts/:id (Update)', updated.title?.vi === 'Bài viết kiểm thử đã cập nhật', `Updated Title (en): "${updated.title?.en}"`);
        } else {
          report('PUT /api/posts/:id (Update)', false, `Status ${updatePostRes.status}`);
        }

        // Post Like
        const postLikeRes = await fetch(`${BASE_URL}/api/posts/${testPostId}/like`, { method: 'POST' });
        if (postLikeRes.ok) {
          const postLikeData = await postLikeRes.json();
          report('POST /api/posts/:id/like', postLikeData.likesCount === 1, `Likes: ${postLikeData.likesCount}`);
        } else {
          report('POST /api/posts/:id/like', false, `Status ${postLikeRes.status}`);
        }
      }
    } catch (err) {
      report('Posts CRUD', false, err.message);
    }

    // 6. Comments API
    console.log('\n6. Testing Comments system...');
    if (testPostId) {
      try {
        const commentRes = await fetch(`${BASE_URL}/api/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: testPostId,
            playerName: 'API Comment Tester',
            email: 'commenter@test.com',
            content: 'API Test Comment',
            parentId: null
          })
        });
        if (commentRes.ok || commentRes.status === 201) {
          const comment = await commentRes.json();
          testCommentId = comment.data?._id || comment._id;
          report('POST /api/comments', !!testCommentId, testCommentId ? `Comment ID: ${testCommentId}` : 'No _id returned');
        } else {
          report('POST /api/comments', false, `Status ${commentRes.status}`);
        }

        // GET Admin comments
        const adminCommentsRes = await fetch(`${BASE_URL}/api/comments`, { headers });
        if (adminCommentsRes.ok) {
          const commentsList = await adminCommentsRes.json();
          const hasComment = commentsList.some(c => c._id === testCommentId);
          report('GET /api/comments (Admin)', hasComment, `Total comments: ${commentsList.length}`);
        } else {
          report('GET /api/comments (Admin)', false, `Status ${adminCommentsRes.status}`);
        }

        // Approve comment
        if (testCommentId) {
          const approveRes = await fetch(`${BASE_URL}/api/comments/${testCommentId}/status`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ status: 'approved' })
          });
          if (approveRes.ok) {
            const approved = await approveRes.json();
            const isApproved = (approved.data?.status || approved.status) === 'approved';
            report('PUT /api/comments/:id/status (Approve)', isApproved);
          } else {
            report('PUT /api/comments/:id/status (Approve)', false, `Status ${approveRes.status}`);
          }
        }

        // GET Public comments for post
        const publicCommentsRes = await fetch(`${BASE_URL}/api/comments/post/${testPostId}`);
        if (publicCommentsRes.ok) {
          const publicComments = await publicCommentsRes.json();
          const hasComment = publicComments.some(c => c._id === testCommentId);
          report('GET /api/comments/post/:postId (Public)', hasComment, `Approved comments for post: ${publicComments.length}`);
        } else {
          report('GET /api/comments/post/:postId (Public)', false, `Status ${publicCommentsRes.status}`);
        }
      } catch (err) {
        report('Comments API', false, err.message);
      }
    } else {
      report('Comments API', false, 'Skipped (No post ID)');
    }

    // 7. Pages API
    console.log('\n7. Testing Static Pages API...');
    try {
      const pageKey = 'test-static-page';
      const pagePutRes = await fetch(`${BASE_URL}/api/pages/${pageKey}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          title: { vi: 'Trang tĩnh kiểm thử', en: '' },
          content: { vi: 'Nội dung trang tĩnh kiểm thử.', en: '' },
          metadata: { customField: 'test' }
        })
      });

      if (pagePutRes.ok) {
        const page = await pagePutRes.json();
        report('PUT /api/pages/:key', page.key === pageKey, `Page Key: ${page.key}, Translated Title: "${page.title?.en}"`);

        // Fetch (GET) static page
        const pageGetRes = await fetch(`${BASE_URL}/api/pages/${pageKey}`);
        if (pageGetRes.ok) {
          const pageGet = await pageGetRes.json();
          report('GET /api/pages/:key', pageGet.title?.vi === 'Trang tĩnh kiểm thử');
        } else {
          report('GET /api/pages/:key', false, `Status ${pageGetRes.status}`);
        }
      } else {
        const text = await pagePutRes.text();
        report('PUT /api/pages/:key', false, `Status ${pagePutRes.status}: ${text}`);
      }
    } catch (err) {
      report('Pages API', false, err.message);
    }

    // 8. Contact API
    console.log('\n8. Testing Contact message submission...');
    try {
      const contactRes = await fetch(`${BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Contact Tester Bot',
          email: 'contact@test.com',
          subject: 'Integration message',
          message: 'Checking contact pipeline.'
        })
      });

      if (contactRes.ok || contactRes.status === 201) {
        const contact = await contactRes.json();
        testContactId = contact.data?._id || contact._id;
        report('POST /api/contact', !!testContactId, testContactId ? `Contact ID: ${testContactId}` : 'No _id returned');
      } else {
        report('POST /api/contact', false, `Status ${contactRes.status}`);
      }

      if (testContactId) {
        // Admin Messages GET
        const adminMsgRes = await fetch(`${BASE_URL}/api/contact`, { headers });
        if (adminMsgRes.ok) {
          const messages = await adminMsgRes.json();
          const hasMessage = messages.some(m => m._id === testContactId);
          report('GET /api/contact (Admin)', hasMessage, `Messages count: ${messages.length}`);
        } else {
          report('GET /api/contact (Admin)', false, `Status ${adminMsgRes.status}`);
        }

        // PUT mark message as read
        const readRes = await fetch(`${BASE_URL}/api/contact/${testContactId}/read`, {
          method: 'PUT',
          headers
        });
        if (readRes.ok) {
          const marked = await readRes.json();
          const isRead = marked.data ? marked.data.isRead : marked.isRead;
          report('PUT /api/contact/:id/read', isRead === true);
        } else {
          report('PUT /api/contact/:id/read', false, `Status ${readRes.status}`);
        }
      }
    } catch (err) {
      report('Contact API', false, err.message);
    }

    // 9. Subscribers API
    console.log('\n9. Testing Subscriber registrations...');
    try {
      const subscriberEmail = `sub-api-${Math.floor(Math.random() * 100000)}@test.com`;
      const subRes = await fetch(`${BASE_URL}/api/subscriber`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscriberEmail })
      });

      if (subRes.ok || subRes.status === 201) {
        report('POST /api/subscriber', true, `Subscribed: ${subscriberEmail}`);

        // GET Admin subscribers list
        const getSubsRes = await fetch(`${BASE_URL}/api/subscriber`, { headers });
        if (getSubsRes.ok) {
          const subs = await getSubsRes.json();
          const robSub = subs.find(s => s.email === subscriberEmail);
          if (robSub) testSubscriberId = robSub._id;
          report('GET /api/subscriber (Admin)', !!testSubscriberId, `Subscribers count: ${subs.length}`);
        } else {
          report('GET /api/subscriber (Admin)', false, `Status ${getSubsRes.status}`);
        }
      } else {
        report('POST /api/subscriber', false, `Status ${subRes.status}`);
      }
    } catch (err) {
      report('Subscribers API', false, err.message);
    }

    // 10. Dictionary API
    console.log('\n10. Testing Dictionary translations...');
    try {
      // PUT key update
      const dictPutRes = await fetch(`${BASE_URL}/api/dictionary/test_verification_key`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          key: 'test_verification_key',
          translations: {
            vi: 'Nút kiểm thử',
            en: ''
          }
        })
      });

      if (dictPutRes.ok) {
        const dict = await dictPutRes.json();
        report('PUT /api/dictionary/:key', true, `Key: 'test_verification_key', Translated: "${dict.item?.translations?.en || dict.translations?.en}"`);

        // GET flat translation map
        const flatRes = await fetch(`${BASE_URL}/api/dictionary/ja`);
        if (flatRes.ok) {
          const flatMap = await flatRes.json();
          report('GET /api/dictionary/:lang', !!flatMap['test_verification_key'], 'Flat map translation generated');
        } else {
          report('GET /api/dictionary/:lang', false, `Status ${flatRes.status}`);
        }

        // GET full translations list
        const fullRes = await fetch(`${BASE_URL}/api/dictionary`);
        if (fullRes.ok) {
          const fullList = await fullRes.json();
          report('GET /api/dictionary', Array.isArray(fullList) && fullList.length > 0, `Loaded: ${fullList.length} items`);
        } else {
          report('GET /api/dictionary', false, `Status ${fullRes.status}`);
        }
      } else {
        report('PUT /api/dictionary/:key', false, `Status ${dictPutRes.status}`);
      }
    } catch (err) {
      report('Dictionary API', false, err.message);
    }

    // 11. Upload API (Edge/Failure states verification)
    console.log('\n11. Testing Upload API validation...');
    try {
      const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` } // No body
      });
      // Expecting 400 since no file is uploaded
      report('POST /api/upload (Expect 400 No File)', uploadRes.status === 400);
    } catch (err) {
      report('POST /api/upload', false, err.message);
    }

    // 12. Admin Dashboard Stats
    console.log('\n12. Testing Admin dashboard stats retrieval...');
    try {
      const statsRes = await fetch(`${BASE_URL}/api/admin/dashboard-stats`, { headers });
      if (statsRes.ok) {
        const stats = await statsRes.json();
        const ok = stats && stats.counts && stats.engagement;
        report('GET /api/admin/dashboard-stats', ok, ok ? 'Stats retrieved successfully' : 'Incomplete stats fields');
      } else {
        report('GET /api/admin/dashboard-stats', false, `Status ${statsRes.status}`);
      }
    } catch (err) {
      report('GET /api/admin/dashboard-stats', false, err.message);
    }

    // 13. Password Change (Safe verify cycle)
    console.log('\n13. Testing Admin change-password flow...');
    try {
      // Step A: Change password
      const changeRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          currentPassword: 'admin123',
          newPassword: 'adminTesting123'
        })
      });

      if (changeRes.ok) {
        report('PUT /api/auth/change-password (To new password)', true);

        // Step B: Verify we can login with the new password
        const verifyLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'adminTesting123' })
        });
        const loginData = await verifyLoginRes.json();
        const newTempToken = loginData.token;
        report('POST /api/auth/login (With new password)', verifyLoginRes.ok && !!newTempToken);

        // Step C: Restore the original password using the temporary new token
        const restoreRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${newTempToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            currentPassword: 'adminTesting123',
            newPassword: 'admin123'
          })
        });
        report('PUT /api/auth/change-password (Restore original password)', restoreRes.ok);
      } else {
        const text = await changeRes.text();
        report('PUT /api/auth/change-password', false, `Status ${changeRes.status}: ${text}`);
      }
    } catch (err) {
      report('Password change flow', false, err.message);
    }

  } catch (err) {
    console.error('\nTest run encountered unexpected error:', err.message);
  } finally {
    // CLEANUP ACTIONS (Guaranteed to execute)
    console.log('\n====================================================');
    console.log('CLEANING UP AUTOMATED TEST ENTITIES...');
    console.log('====================================================');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Restore Main Profile
    if (originalProfileMain) {
      try {
        await fetch(`${BASE_URL}/api/profile/main`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            headline: originalProfileMain.headline,
            techStack: originalProfileMain.techStack,
            subHeadline: originalProfileMain.subHeadline,
            avatarUrl: originalProfileMain.avatarUrl,
            socialLinks: originalProfileMain.socialLinks
          })
        });
        report('Restored Main Profile headline', true);
      } catch (err) {
        report('Restored Main Profile headline', false, err.message);
      }
    }

    // Delete static page
    try {
      const pageKey = 'test-static-page';
      // Mongoose StaticPage doesn't have direct DELETE route, but let's check or see
      // If no delete route, it's ok. It won't hurt.
    } catch (err) {}

    // Delete game score (Note: We might need a direct model clear or delete route, if none, it is fine since it's targeted)
    // Delete comment
    if (testCommentId) {
      try {
        const res = await fetch(`${BASE_URL}/api/comments/${testCommentId}`, { method: 'DELETE', headers });
        report('Deleted Comment', res.ok);
      } catch (err) {
        report('Deleted Comment', false, err.message);
      }
    }

    // Delete blog post
    if (testPostId) {
      try {
        const res = await fetch(`${BASE_URL}/api/posts/${testPostId}`, { method: 'DELETE', headers });
        report('Deleted Blog Post', res.ok);
      } catch (err) {
        report('Deleted Blog Post', false, err.message);
      }
    }

    // Delete project
    if (testProjectId) {
      try {
        const res = await fetch(`${BASE_URL}/api/projects/${testProjectId}`, { method: 'DELETE', headers });
        report('Deleted Project', res.ok);
      } catch (err) {
        report('Deleted Project', false, err.message);
      }
    }

    // Delete contact message
    if (testContactId) {
      try {
        const res = await fetch(`${BASE_URL}/api/contact/${testContactId}`, { method: 'DELETE', headers });
        report('Deleted Contact Message', res.ok);
      } catch (err) {
        report('Deleted Contact Message', false, err.message);
      }
    }

    // Delete subscriber
    if (testSubscriberId) {
      try {
        const res = await fetch(`${BASE_URL}/api/subscriber/${testSubscriberId}`, { method: 'DELETE', headers });
        report('Deleted Subscriber', res.ok);
      } catch (err) {
        report('Deleted Subscriber', false, err.message);
      }
    }

    // Delete Dictionary test key
    try {
      // No direct delete route for dictionary key in our routes, but we can update it or leave it as it doesn't impact production UI
    } catch (err) {}

    console.log('\n====================================================');
    console.log(`TEST RUN SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runTests();
