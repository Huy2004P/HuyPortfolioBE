const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Dictionary = require('./models/Dictionary');

dotenv.config();

const keys = [
  // Core Tech Stack
  {
    key: 'Mobile: Flutter',
    translations: {
      vi: 'Di động: Flutter',
      en: 'Mobile: Flutter'
    }
  },
  {
    key: 'Web: Html - Css - Javascript',
    translations: {
      vi: 'Web: HTML - CSS - JavaScript',
      en: 'Web: HTML - CSS - JavaScript'
    }
  },
  {
    key: 'Database: MySQL - MongoDB - Firebase',
    translations: {
      vi: 'Cơ sở dữ liệu: MySQL - MongoDB - Firebase',
      en: 'Database: MySQL - MongoDB - Firebase'
    }
  },
  {
    key: 'Framework: Node JS',
    translations: {
      vi: 'Framework: Node JS',
      en: 'Framework: Node JS'
    }
  },
  {
    key: 'Workflow Automation: n8n',
    translations: {
      vi: 'Tự động hóa Quy trình: n8n',
      en: 'Workflow Automation: n8n'
    }
  },
  {
    key: 'Server: HomeServer',
    translations: {
      vi: 'Máy chủ: HomeServer',
      en: 'Server: HomeServer'
    }
  },

  // Footer & Newsletter
  {
    key: 'lbl_newsletter',
    translations: {
      vi: 'Bản tin',
      en: 'Newsletter'
    }
  },
  {
    key: 'txt_newsletter_desc',
    translations: {
      vi: 'Nhận thông báo về các dự án và bài viết mới.',
      en: 'Get notified about new projects and articles.'
    }
  },
  {
    key: 'lbl_newsletter_placeholder',
    translations: {
      vi: 'email@vi-du.com',
      en: 'email@example.com'
    }
  },
  {
    key: 'btn_subscribe',
    translations: {
      vi: 'Đăng ký',
      en: 'Subscribe'
    }
  },
  {
    key: 'nav_privacy',
    translations: {
      vi: 'Chính sách bảo mật',
      en: 'Privacy Policy'
    }
  },
  {
    key: 'nav_terms',
    translations: {
      vi: 'Điều khoản dịch vụ',
      en: 'Terms of Service'
    }
  },
  {
    key: 'nav_donation',
    translations: {
      vi: 'Ủng hộ & Quyên góp',
      en: 'Donate & Support'
    }
  },
  {
    key: 'footer_rights',
    translations: {
      vi: 'Huy Portfolio. Thiết kế bằng React & Tailwind.',
      en: 'Huy Portfolio. Crafted with React & Tailwind.'
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

  console.log('Dictionary seeding and auto-translation complete.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
