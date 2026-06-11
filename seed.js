const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Post = require('./models/Post');
const Profile = require('./models/Profile');
const StaticPage = require('./models/StaticPage');

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Post.deleteMany();
    await Profile.deleteMany();
    await StaticPage.deleteMany();

    console.log('Old data cleared.');

    // 1. Seed User (Admin)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await User.create({
      username: 'admin',
      password: hashedPassword
    });
    console.log('Admin user created (username: admin, password: admin123)');

    // 2. Seed Profiles (Main, Mobile, Game)
    await Profile.create([
      {
        profileType: 'main',
        headline: "Hi, I'm Huy - a passionate Creator building Mobile Apps & Games",
        subHeadline: "Welcome to my portfolio! I build premium cross-platform applications and engaging indie game experiences using cutting-edge technologies.",
        techStack: ['Flutter', 'Unity', 'Dart', 'C#', 'Node.js', 'MongoDB', 'Firebase'],
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        socialLinks: {
          github: 'https://github.com/Huy2004P',
          linkedin: 'https://linkedin.com/in/huy-portfolio',
          facebook: 'https://facebook.com/huy.portfolio',
          email: 'huy.contact@example.com'
        }
      },
      {
        profileType: 'mobile',
        headline: "Mobile App Developer | Specializing in Flutter & Cross-Platform",
        subHeadline: "I specialize in engineering performance-optimized, highly fluid, and natively compiled iOS and Android applications.",
        techStack: ['Flutter', 'Dart', 'Android SDK', 'iOS Deployment', 'Firebase SDK', 'RESTful APIs', 'BLoC State Management'],
        avatarUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=200',
        socialLinks: {
          github: 'https://github.com/Huy2004P',
          email: 'huy.mobile@example.com'
        }
      },
      {
        profileType: 'game',
        headline: "Indie Game Developer | Creating Immersive Virtual Worlds",
        subHeadline: "I design, program, and bring interactive experiences to life, centering on clean gameplay loops and rich aesthetics.",
        techStack: ['Unity', 'C#', 'Shaders (HLSL)', 'Godot', '2D/3D Math', 'Blender', 'Level Design', 'Itch.io Publishing'],
        avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200',
        socialLinks: {
          itchio: 'https://huy-games.itch.io',
          youtube: 'https://youtube.com/c/HuyGamesChannel',
          github: 'https://github.com/Huy2004P'
        }
      }
    ]);
    console.log('Sample profiles created (main, mobile, game).');

    // 3. Seed Projects
    await Project.create([
      {
        title: 'Lumicare Healthcare App',
        description: 'A comprehensive healthcare application enabling users to book appointments with doctors, manage their health records, and receive timely medical advice. Built with Flutter and Node.js.',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1000',
        screenshots: [
          'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=500',
          'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=500'
        ],
        projectType: 'mobile',
        projectUrl: 'https://github.com/example/lumicare',
        demoUrl: 'https://appetize.io/app/demo-lumicare',
        apkUrl: 'https://res.cloudinary.com/demo/raw/upload/v1/portfolio_apk/lumicare.apk',
        platforms: ['Android', 'iOS'],
        technologies: ['Flutter', 'Dart', 'Node.js', 'MongoDB', 'Firebase'],
        downloadUrls: {
          playStore: 'https://play.google.com/store/apps/details?id=com.example.lumicare',
          appStore: 'https://apps.apple.com/us/app/lumicare/id123456',
          apk: 'https://res.cloudinary.com/demo/raw/upload/v1/portfolio_apk/lumicare.apk'
        }
      },
      {
        title: 'Celestial Odyssey: 2D Space RPG',
        description: 'An action-packed indie game set in a procedurally generated galaxy. Players explore dynamic star systems, upgrade their spacecraft, and trade with alien civilisations. Built with Unity.',
        imageUrl: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&q=80&w=1000',
        screenshots: [
          'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&q=80&w=500',
          'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=500'
        ],
        projectType: 'game',
        engine: 'Unity',
        platforms: ['Windows', 'macOS', 'Web'],
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Dummy video link
        playableUrl: 'https://itch.io/embed-upload/1234567?color=333333',
        technologies: ['Unity', 'C#', 'HLSL Shaders', 'A* Pathfinding', 'FMOD'],
        downloadUrls: {
          itchio: 'https://huy-games.itch.io/celestial-odyssey',
          steam: 'https://store.steampowered.com/app/123456/Celestial_Odyssey/'
        }
      },
      {
        title: 'E-commerce Platform',
        description: 'A scalable e-commerce solution featuring real-time inventory management, seamless payment gateway integration, and a responsive modern UI.',
        imageUrl: 'https://images.unsplash.com/photo-1556624441-86a45744d5d?auto=format&fit=crop&q=80&w=1000',
        projectType: 'web',
        projectUrl: 'https://github.com/example/ecommerce',
        technologies: ['React', 'Next.js', 'Tailwind CSS', 'Stripe', 'Express']
      }
    ]);
    console.log('Sample projects created (mobile, game, web).');

    // 4. Seed Posts
    await Post.create([
      {
        title: 'The Beauty of Apple Design Principles in Web Apps',
        slug: 'apple-design-principles-web-apps',
        excerpt: 'How to apply the precision editorial system, whitespace philosophy, and binary section rhythm of Apple to your next web project.',
        category: 'general',
        tags: ['Design', 'UX', 'CSS'],
        content: `
          <h2>Introduction to Apple Design</h2>
          <p>Apple's web language is a precision editorial system that alternates between gallery-like calm and retail-density information blocks...</p>
        `,
        coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000',
        published: true
      },
      {
        title: 'State Management in Flutter: Comparing BLoC vs Riverpod',
        slug: 'state-management-flutter-bloc-riverpod',
        excerpt: 'An in-depth analysis of Flutter state management patterns, evaluating their performance, learning curves, and testability.',
        category: 'mobile',
        tags: ['Flutter', 'Dart', 'Architecture'],
        content: `
          <h2>Why State Management Matters</h2>
          <p>As Flutter applications scale, structure and dependency flows become vital. Today, we break down BLoC and Riverpod...</p>
        `,
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000',
        published: true
      },
      {
        title: 'Optimizing Draw Calls and Batches in Unity Mobile Games',
        slug: 'optimizing-draw-calls-unity-mobile',
        excerpt: 'Learn how to use GPU Instancing, Sprite Atlasing, and Static Batching to hit a constant 60 FPS on lower-end mobile devices.',
        category: 'game',
        tags: ['Unity', 'C#', 'Optimization', 'Graphics'],
        content: `
          <h2>Unity Graphics Pipeline Optimization</h2>
          <p>For game development, especially on mobile, keeping draw calls and GPU commands optimized is essential. Let's look at batching solutions...</p>
        `,
        coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=1000',
        published: true
      }
    ]);
    console.log('Sample blog posts created.');

    // 5. Seed Static Pages (Privacy, Terms, Donation)
    await StaticPage.create([
      {
        key: 'privacy',
        title: 'Privacy Policy - Chính sách bảo mật',
        content: `
          # Privacy Policy
          
          Chào mừng bạn đến với trang chính sách bảo mật của chúng tôi. Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn khi bạn sử dụng các sản phẩm và dịch vụ của chúng tôi.
          
          ### 1. Thông tin chúng tôi thu thập
          Chúng tôi không thu thập thông tin cá nhân của bạn trừ khi bạn cung cấp trực tiếp qua các form liên hệ hoặc email.
          
          ### 2. Cách chúng tôi sử dụng thông tin
          Thông tin được thu thập chỉ sử dụng nhằm mục đích phản hồi các yêu cầu và cải thiện trải nghiệm người dùng trên portfolio.
          
          ### 3. Cookies
          Chúng tôi có thể sử dụng các cookie lưu trữ cấu hình giao diện cơ bản (như chế độ nền tối/sáng) trên trình duyệt của bạn.
        `
      },
      {
        key: 'terms',
        title: 'Terms of Service - Điều khoản dịch vụ',
        content: `
          # Terms of Service
          
          Khi truy cập và sử dụng trang web/games của tôi, bạn đồng ý với các điều khoản dưới đây:
          
          ### 1. Bản quyền tài sản trí tuệ
          Tất cả trò chơi, ứng dụng di động, mã nguồn được chia sẻ trên trang web này đều thuộc bản quyền sở hữu trí tuệ của tôi. Bạn không được phân phối lại hoặc thương mại hóa chúng mà không có sự đồng ý bằng văn bản.
          
          ### 2. Sử dụng hợp pháp
          Bạn đồng ý không phá hoại, spam API, hoặc cố tình làm quá tải máy chủ lưu trữ của chúng tôi.
          
          ### 3. Miễn trừ trách nhiệm
          Các sản phẩm được cung cấp 'nguyên trạng'. Tôi không chịu trách nhiệm cho bất kỳ tổn thất phần cứng hay dữ liệu nào do việc cài đặt trò chơi hoặc ứng dụng từ website này.
        `
      },
      {
        key: 'donation',
        title: 'Support My Work - Donate',
        content: `
          # Quyên góp & Ủng hộ
          
          Nếu bạn yêu thích các trò chơi hoặc ứng dụng mã nguồn mở của mình, bạn có thể ủng hộ mình thông qua các phương thức dưới đây để mình có thêm động lực phát triển thêm nhiều dự án chất lượng khác!
          
          Xin chân thành cảm ơn sự đồng hành và hỗ trợ của các bạn!
        `,
        metadata: {
          bankTransfer: {
            bankName: 'Vietcombank',
            accountNumber: '999988887777',
            accountName: 'VAN BA PHAT HUY',
            branch: 'HCMC Branch',
            qrCodeUrl: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=300' // Mock QR code
          },
          eWallets: [
            { name: 'MoMo', phone: '0901234567', accountName: 'VAN BA PHAT HUY' },
            { name: 'ZaloPay', phone: '0901234567', accountName: 'VAN BA PHAT HUY' }
          ],
          externalPlatforms: {
            buyMeACoffee: 'https://buymeacoffee.com/huyportfolio',
            kofi: 'https://ko-fi.com/huyportfolio',
            patreon: 'https://patreon.com/huyportfolio'
          }
        }
      }
    ]);
    console.log('Static pages seeded (privacy, terms, donation).');

    console.log('Data seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

connectDB().then(() => seedData());
