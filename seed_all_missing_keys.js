const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Dictionary = require('./models/Dictionary');

dotenv.config();

const keys = [
  // Nav links
  {
    key: 'nav_home',
    translations: {
      vi: 'Trang chủ',
      en: 'Home'
    }
  },
  {
    key: 'nav_mobile',
    translations: {
      vi: 'Ứng dụng Di động',
      en: 'Mobile Apps'
    }
  },
  {
    key: 'nav_game',
    translations: {
      vi: 'Dự án Game',
      en: 'Game Portfolio'
    }
  },
  {
    key: 'nav_projects',
    translations: {
      vi: 'Dự án',
      en: 'Projects'
    }
  },
  {
    key: 'nav_blog',
    translations: {
      vi: 'Bài viết',
      en: 'Blog'
    }
  },
  {
    key: 'nav_contact',
    translations: {
      vi: 'Liên hệ',
      en: 'Contact'
    }
  },

  // Privacy Policy Page
  {
    key: 'privacy_title',
    translations: {
      vi: 'Chính sách bảo mật',
      en: 'Privacy Policy'
    }
  },
  {
    key: 'privacy_content',
    translations: {
      vi: `# Chính sách bảo mật

Chào mừng bạn đến với trang chính sách bảo mật của chúng tôi. Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn khi bạn sử dụng các sản phẩm và dịch vụ của chúng tôi.

### 1. Thông tin chúng tôi thu thập
Chúng tôi không thu thập thông tin cá nhân của bạn trừ khi bạn cung cấp trực tiếp qua các form liên hệ hoặc email.

### 2. Cách chúng tôi sử dụng thông tin
Thông tin được thu thập chỉ sử dụng nhằm mục đích phản hồi các yêu cầu và cải thiện trải nghiệm người dùng trên portfolio.

### 3. Cookies
Chúng tôi có thể sử dụng các cookie lưu trữ cấu hình giao diện cơ bản (như chế độ nền tối/sáng) trên trình duyệt của bạn.`,
      en: `# Privacy Policy

Your privacy is important to us. This privacy policy document outlines the types of personal information received and collected by our website and applications and how it is used.

### 1. Information Collection
We do not collect any personal identifier details without your explicit consent.

### 2. Log Files
Like many other Web sites, our website makes use of log files. The information inside the log files includes internet protocol (IP) addresses, type of browser, Internet Service Provider (ISP), date/time stamp, referring/exit pages, and number of clicks to analyze trends, administer the site, track user's movement around the site, and gather demographic information.`
    }
  },

  // Terms of Service Page
  {
    key: 'terms_title',
    translations: {
      vi: 'Điều khoản dịch vụ',
      en: 'Terms of Service'
    }
  },
  {
    key: 'terms_content',
    translations: {
      vi: `# Điều khoản dịch vụ

Khi truy cập và sử dụng trang web/games của tôi, bạn đồng ý với các điều khoản dưới đây:

### 1. Bản quyền tài sản trí tuệ
Tất cả trò chơi, ứng dụng di động, mã nguồn được chia sẻ trên trang web này đều thuộc bản quyền sở hữu trí tuệ của tôi. Bạn không được phân phối lại hoặc thương mại hóa chúng mà không có sự đồng ý bằng văn bản.

### 2. Sử dụng hợp pháp
Bạn đồng ý không phá hoại, spam API, hoặc cố tình làm quá tải máy chủ lưu trữ của chúng tôi.

### 3. Miễn trừ trách nhiệm
Các sản phẩm được cung cấp 'nguyên trạng'. Tôi không chịu trách nhiệm cho bất kỳ tổn thất phần cứng hay dữ liệu nào do việc cài đặt trò chơi hoặc ứng dụng từ website này.`,
      en: `# Terms of Service

Welcome to our website. If you continue to browse and use this website and our applications, you are agreeing to comply with and be bound by the following terms and conditions of use.

### 1. Use License
Permission is granted to temporarily download one copy of the materials (information or software) on our portfolio website for personal, non-commercial transitory viewing only.

### 2. Disclaimer
The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.`
    }
  },

  // Donation Page
  {
    key: 'donation_title',
    translations: {
      vi: 'Ủng hộ tác giả',
      en: 'Support My Work'
    }
  },
  {
    key: 'donation_content',
    translations: {
      vi: `# Hỗ trợ & Quyên góp

Nếu bạn yêu thích các sản phẩm ứng dụng di động hoặc trò chơi indie của mình, bạn có thể ủng hộ mình thông qua chuyển khoản ngân hàng hoặc các ví điện tử dưới đây. Sự đóng góp của bạn là động lực rất lớn giúp mình duy trì và phát triển thêm nhiều sản phẩm chất lượng hơn nữa!`,
      en: `# Support My Work

If you love my mobile applications or indie games, you can support me through bank transfer or the e-wallets listed below. Your contribution is a huge motivation to help me maintain and develop even more quality products!`
    }
  },
  {
    key: 'donation_bank_name',
    translations: {
      vi: 'Vietcombank',
      en: 'Vietcombank'
    }
  },
  {
    key: 'donation_account_number',
    translations: {
      vi: '999988887777',
      en: '999988887777'
    }
  },
  {
    key: 'donation_account_name',
    translations: {
      vi: 'VAN BA PHAT HUY',
      en: 'VAN BA PHAT HUY'
    }
  },
  {
    key: 'donation_branch',
    translations: {
      vi: 'Chi nhánh TP. Hồ Chí Minh',
      en: 'Ho Chi Minh City Branch'
    }
  },
  {
    key: 'donation_qr_code_url',
    translations: {
      vi: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=300',
      en: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=300'
    }
  },
  {
    key: 'donation_momo_name',
    translations: {
      vi: 'Ví MoMo',
      en: 'MoMo Wallet'
    }
  },
  {
    key: 'donation_momo_phone',
    translations: {
      vi: '0901234567',
      en: '0901234567'
    }
  },
  {
    key: 'donation_zalopay_name',
    translations: {
      vi: 'Ví ZaloPay',
      en: 'ZaloPay Wallet'
    }
  },
  {
    key: 'donation_zalopay_phone',
    translations: {
      vi: '0901234567',
      en: '0901234567'
    }
  },
  {
    key: 'donation_buymeacoffee_url',
    translations: {
      vi: 'https://buymeacoffee.com/huyportfolio',
      en: 'https://buymeacoffee.com/huyportfolio'
    }
  },
  {
    key: 'donation_kofi_url',
    translations: {
      vi: 'https://ko-fi.com/huyportfolio',
      en: 'https://ko-fi.com/huyportfolio'
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

  console.log('Seeding and auto-translation of missing keys complete.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
