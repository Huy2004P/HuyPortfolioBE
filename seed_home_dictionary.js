const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Dictionary = require('./models/Dictionary');

dotenv.config();

const keys = [
  {
    key: 'home_welcome_badge',
    translations: {
      vi: 'Chào mừng đến với không gian sáng tạo của tôi',
      en: 'Welcome to my creative space'
    }
  },
  {
    key: 'home_mobile_title',
    translations: {
      vi: 'Ứng dụng Di động',
      en: 'Mobile Applications'
    }
  },
  {
    key: 'home_mobile_desc',
    translations: {
      vi: 'Chuyên phát triển ứng dụng di động đa nền tảng chất lượng cao cho iOS & Android bằng Flutter.',
      en: 'Specializing in high-quality cross-platform mobile application development for iOS & Android using Flutter.'
    }
  },
  {
    key: 'home_mobile_cta',
    translations: {
      vi: 'Khám phá Ứng dụng',
      en: 'Explore Mobile Apps'
    }
  },
  {
    key: 'home_game_title',
    translations: {
      vi: 'Phát triển Game',
      en: 'Game Development'
    }
  },
  {
    key: 'home_game_desc',
    translations: {
      vi: 'Đam mê xây dựng các trò chơi độc lập (Indie Games). Sử dụng Unity và Godot Engine.',
      en: 'Passionate about building independent games (Indie Games) using Unity and Godot Engine.'
    }
  },
  {
    key: 'home_game_cta',
    translations: {
      vi: 'Vào phòng Game',
      en: 'Enter Game Room'
    }
  },
  {
    key: 'home_tech_title',
    translations: {
      vi: 'Công nghệ cốt lõi',
      en: 'Core Technologies'
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
