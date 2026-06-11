const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Dictionary = require('./models/Dictionary');

dotenv.config();

const keys = [
  // Projects Page
  {
    key: 'projects_subtitle',
    translations: {
      vi: 'Tuyển tập các sản phẩm và dự án cá nhân gần đây của tôi.',
      en: 'A collection of my recent work and side projects.'
    }
  },
  {
    key: 'lbl_search',
    translations: {
      vi: 'Tìm kiếm...',
      en: 'Search...'
    }
  },
  {
    key: 'lbl_filter_all',
    translations: {
      vi: 'Tất cả',
      en: 'All'
    }
  },
  {
    key: 'lbl_mobile',
    translations: {
      vi: 'Di động',
      en: 'Mobile'
    }
  },
  {
    key: 'lbl_game',
    translations: {
      vi: 'Trò chơi',
      en: 'Game'
    }
  },
  {
    key: 'lbl_web',
    translations: {
      vi: 'Trang web',
      en: 'Web'
    }
  },
  {
    key: 'lbl_other',
    translations: {
      vi: 'Khác',
      en: 'Other'
    }
  },
  {
    key: 'lbl_no_projects',
    translations: {
      vi: 'Không tìm thấy dự án nào.',
      en: 'No projects found.'
    }
  },
  {
    key: 'btn_clear_filters',
    translations: {
      vi: 'Xóa bộ lọc',
      en: 'Clear filters'
    }
  },
  {
    key: 'lbl_likes',
    translations: {
      vi: 'lượt thích',
      en: 'likes'
    }
  },
  {
    key: 'lbl_clicks',
    translations: {
      vi: 'lượt xem',
      en: 'clicks'
    }
  },
  {
    key: 'btn_demo',
    translations: {
      vi: 'Chạy thử (Demo)',
      en: 'Demo'
    }
  },
  {
    key: 'btn_apk',
    translations: {
      vi: 'Tải APK',
      en: 'APK'
    }
  },
  {
    key: 'btn_play_store',
    translations: {
      vi: 'Cửa hàng Play',
      en: 'Play Store'
    }
  },
  {
    key: 'btn_github',
    translations: {
      vi: 'Mã nguồn GitHub',
      en: 'GitHub'
    }
  },
  {
    key: 'lbl_prev',
    translations: {
      vi: 'Trước',
      en: 'Prev'
    }
  },
  {
    key: 'lbl_page',
    translations: {
      vi: 'Trang',
      en: 'Page'
    }
  },
  {
    key: 'lbl_next',
    translations: {
      vi: 'Sau',
      en: 'Next'
    }
  },

  // Blog Page
  {
    key: 'blog_title',
    translations: {
      vi: 'Góc chia sẻ',
      en: 'Writing'
    }
  },
  {
    key: 'blog_subtitle',
    translations: {
      vi: 'Những suy nghĩ về kỹ nghệ phần mềm, thiết kế và cuộc sống.',
      en: 'Thoughts on software engineering, design, and life.'
    }
  },
  {
    key: 'search_articles',
    translations: {
      vi: 'Tìm kiếm bài viết...',
      en: 'Search articles...'
    }
  },
  {
    key: 'no_articles_found',
    translations: {
      vi: 'Không tìm thấy bài viết nào.',
      en: 'No articles found.'
    }
  },
  {
    key: 'read_more',
    translations: {
      vi: 'Xem thêm',
      en: 'Read more'
    }
  },
  {
    key: 'lbl_general',
    translations: {
      vi: 'Chung',
      en: 'General'
    }
  },

  // Blog Detail & Comments
  {
    key: 'msg_comment_pending',
    translations: {
      vi: 'Bình luận của bạn đang chờ phê duyệt từ quản trị viên.',
      en: 'Your comment is pending approval.'
    }
  },
  {
    key: 'msg_comment_failed',
    translations: {
      vi: 'Gửi bình luận thất bại. Vui lòng thử lại.',
      en: 'Failed to submit comment.'
    }
  },
  {
    key: 'post_not_found',
    translations: {
      vi: 'Không tìm thấy bài viết.',
      en: 'Post not found.'
    }
  },
  {
    key: 'btn_reply',
    translations: {
      vi: 'Trả lời',
      en: 'Reply'
    }
  },
  {
    key: 'btn_back_to_blog',
    translations: {
      vi: 'Quay lại blog',
      en: 'Back to blog'
    }
  },
  {
    key: 'lbl_comments',
    translations: {
      vi: 'Bình luận',
      en: 'Comments'
    }
  },
  {
    key: 'lbl_no_comments',
    translations: {
      vi: 'Chưa có bình luận nào.',
      en: 'No comments yet.'
    }
  },
  {
    key: 'replying_to_comment',
    translations: {
      vi: '↳ Đang trả lời bình luận...',
      en: '↳ Replying to comment...'
    }
  },
  {
    key: 'lbl_leave_comment',
    translations: {
      vi: 'Để lại bình luận',
      en: 'Leave a comment'
    }
  },
  {
    key: 'lbl_optional',
    translations: {
      vi: 'tùy chọn',
      en: 'optional'
    }
  },
  {
    key: 'btn_submit',
    translations: {
      vi: 'Gửi bình luận',
      en: 'Submit'
    }
  },
  {
    key: 'btn_cancel',
    translations: {
      vi: 'Hủy',
      en: 'Cancel'
    }
  },

  // Contact Page
  {
    key: 'msg_contact_success',
    translations: {
      vi: 'Gửi tin nhắn thành công!',
      en: 'Message sent successfully!'
    }
  },
  {
    key: 'msg_contact_error',
    translations: {
      vi: 'Gửi tin nhắn thất bại. Vui lòng thử lại sau.',
      en: 'Failed to send. Please try again.'
    }
  },
  {
    key: 'contact_title',
    translations: {
      vi: 'Liên hệ',
      en: 'Get in touch'
    }
  },
  {
    key: 'contact_subtitle',
    translations: {
      vi: 'Bạn có ý tưởng dự án hoặc chỉ muốn giao lưu? Hãy gửi tin nhắn cho tôi.',
      en: "Have a project in mind or just want to say hi? I'd love to hear from you."
    }
  },
  {
    key: 'lbl_name',
    translations: {
      vi: 'Họ và tên',
      en: 'Name'
    }
  },
  {
    key: 'lbl_email',
    translations: {
      vi: 'Địa chỉ Email',
      en: 'Email'
    }
  },
  {
    key: 'lbl_subject',
    translations: {
      vi: 'Tiêu đề',
      en: 'Subject'
    }
  },
  {
    key: 'lbl_message',
    translations: {
      vi: 'Nội dung',
      en: 'Message'
    }
  },
  {
    key: 'lbl_sending',
    translations: {
      vi: 'Đang gửi...',
      en: 'Sending...'
    }
  },
  {
    key: 'btn_send_message',
    translations: {
      vi: 'Gửi tin nhắn',
      en: 'Send Message'
    }
  },

  // Newsletter Layout
  {
    key: 'msg_subscribed',
    translations: {
      vi: 'Đăng ký nhận tin thành công!',
      en: 'Subscribed!'
    }
  },
  {
    key: 'msg_subscribed_failed',
    translations: {
      vi: 'Email đã được đăng ký hoặc không hợp lệ.',
      en: 'Already subscribed or invalid email.'
    }
  },

  // Mobile Portfolio Page
  {
    key: 'mobile_branch_profile',
    translations: {
      vi: 'Lĩnh vực phát triển Di động',
      en: 'Mobile Branch Profile'
    }
  },
  {
    key: 'google_play_profile',
    translations: {
      vi: 'Hồ sơ Google Play',
      en: 'Google Play Profile'
    }
  },
  {
    key: 'app_store_profile',
    translations: {
      vi: 'Hồ sơ App Store',
      en: 'App Store Profile'
    }
  },
  {
    key: 'mobile_tech_specs',
    translations: {
      vi: 'Công nghệ di động sử dụng',
      en: 'Mobile Tech Specs'
    }
  },
  {
    key: 'mobile_projects',
    translations: {
      vi: 'Dự án di động',
      en: 'Mobile Projects'
    }
  },
  {
    key: 'no_mobile_projects',
    translations: {
      vi: 'Chưa có dự án di động nào được tải lên.',
      en: 'No mobile projects uploaded yet.'
    }
  },
  {
    key: 'cross_platform_app',
    translations: {
      vi: 'Ứng dụng đa nền tảng',
      en: 'Cross-Platform App'
    }
  },
  {
    key: 'tech_stack_built_with',
    translations: {
      vi: 'Công nghệ tích hợp',
      en: 'Tech Stack Built-with'
    }
  },
  {
    key: 'appetize_demo',
    translations: {
      vi: 'Chạy thử ảo lập',
      en: 'Appetize Demo'
    }
  },
  {
    key: 'google_play',
    translations: {
      vi: 'Google Play',
      en: 'Google Play'
    }
  },
  {
    key: 'app_store',
    translations: {
      vi: 'App Store',
      en: 'App Store'
    }
  },
  {
    key: 'download_apk',
    translations: {
      vi: 'Tải xuống APK',
      en: 'Download APK'
    }
  },
  {
    key: 'mobile_developer_chronicles',
    translations: {
      vi: 'Nhật ký lập trình viên di động',
      en: 'Mobile Developer Chronicles'
    }
  },
  {
    key: 'no_mobile_posts',
    translations: {
      vi: 'Chưa có bài viết nào về mảng phát triển ứng dụng di động.',
      en: 'No articles published on mobile development yet.'
    }
  },
  {
    key: 'read_article',
    translations: {
      vi: 'Đọc bài viết',
      en: 'Read article'
    }
  },
  {
    key: 'slide_indicator',
    translations: {
      vi: 'Hình ảnh',
      en: 'Slide'
    }
  },
  {
    key: 'hover_phone_hint',
    translations: {
      vi: '(Rê chuột hoặc click vào màn hình mô phỏng)',
      en: '(Hover or click on the smartphone screen)'
    }
  },

  // Game Portfolio Page
  {
    key: 'engine_systems_architecture',
    translations: {
      vi: 'Kiến trúc trò chơi & Động cơ',
      en: 'Engine & Systems Architecture'
    }
  },
  {
    key: 'my_games_collection',
    translations: {
      vi: 'Kho tàng trò chơi của tôi',
      en: 'My Games Collection'
    }
  },
  {
    key: 'no_games_found',
    translations: {
      vi: 'Chưa có trò chơi nào được tải lên.',
      en: 'No games uploaded yet.'
    }
  },
  {
    key: 'indie_game',
    translations: {
      vi: 'Trò chơi độc lập (Indie Game)',
      en: 'Indie Game'
    }
  },
  {
    key: 'playable_web_demo',
    translations: {
      vi: 'Chơi trực tuyến (Web)',
      en: 'Playable Web Demo'
    }
  },
  {
    key: 'itchio_page',
    translations: {
      vi: 'Trang Itch.io',
      en: 'Itch.io Page'
    }
  },
  {
    key: 'steam_store',
    translations: {
      vi: 'Cửa hàng Steam',
      en: 'Steam Store'
    }
  },
  {
    key: 'game_developer_chronicles',
    translations: {
      vi: 'Nhật ký phát triển trò chơi',
      en: 'Game Developer Chronicles'
    }
  },
  {
    key: 'no_game_posts',
    translations: {
      vi: 'Chưa có bài viết nào về mảng lập trình trò chơi.',
      en: 'No articles published on game development yet.'
    }
  },
  {
    key: 'watch_gameplay',
    translations: {
      vi: 'Xem gameplay',
      en: 'Watch Gameplay'
    }
  }
];

async function seed() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';
  console.log('Connecting to database...');
  await mongoose.connect(mongoUri);
  console.log('Connected.');

  for (const item of keys) {
    let entry = await Dictionary.findOne({ key: item.key });
    if (entry) {
      console.log(`Updating existing key: ${item.key}`);
      entry.translations = item.translations;
      await entry.save();
    } else {
      console.log(`Creating new key: ${item.key}`);
      entry = new Dictionary(item);
      await entry.save();
    }
    console.log(`Successfully processed and translated key: ${item.key}`);
  }

  console.log('Seeding and auto-translation of remaining UI keys complete.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
