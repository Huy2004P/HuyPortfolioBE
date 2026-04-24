const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Post = require('./models/Post');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
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

    console.log('Old data cleared.');

    // Seed User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await User.create({
      username: 'admin',
      password: hashedPassword
    });
    console.log('Admin user created (username: admin, password: admin123)');

    // Seed Projects
    await Project.create([
      {
        title: 'Lumicare Healthcare App',
        description: 'A comprehensive healthcare application enabling users to book appointments with doctors, manage their health records, and receive timely medical advice. Built with Flutter and Node.js.',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1000',
        projectUrl: 'https://github.com/example/lumicare',
        technologies: ['Flutter', 'Dart', 'Node.js', 'MongoDB', 'Firebase']
      },
      {
        title: 'E-commerce Platform',
        description: 'A scalable e-commerce solution featuring real-time inventory management, seamless payment gateway integration, and a responsive modern UI adhering to Apple design principles.',
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1000',
        projectUrl: 'https://github.com/example/ecommerce',
        technologies: ['React', 'Next.js', 'Tailwind CSS', 'Stripe', 'Express']
      },
      {
        title: 'Finance Tracker Dashboard',
        description: 'An intuitive financial tracking dashboard that provides interactive charts and analytics to help users monitor their daily expenses and manage their personal budgets effectively.',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000',
        projectUrl: 'https://github.com/example/finance-dashboard',
        technologies: ['Vue.js', 'TypeScript', 'Chart.js', 'PostgreSQL']
      }
    ]);
    console.log('Sample projects created.');

    // Seed Posts
    await Post.create([
      {
        title: 'The Beauty of Apple Design Principles in Web Apps',
        slug: 'apple-design-principles-web-apps',
        excerpt: 'How to apply the precision editorial system, whitespace philosophy, and binary section rhythm of Apple to your next web project.',
        content: `
          <h2>Introduction to Apple Design</h2>
          <p>Apple's web language is a precision editorial system that alternates between gallery-like calm and retail-density information blocks. The visual tone stays restrained: broad neutral canvases, quiet chrome, and product imagery given almost all of the expressive weight.</p>
          <p>In this post, we explore how to implement these characteristics into modern web development.</p>
          <h3>Key Characteristics</h3>
          <ul>
            <li><strong>Binary section rhythm:</strong> deep black scenes alternating with pale neutral fields.</li>
            <li><strong>Single blue accent:</strong> used strictly for action and link semantics.</li>
            <li><strong>Typography as stabilizer:</strong> SF Pro Display for heroes, SF Pro Text for utility.</li>
          </ul>
          <blockquote>"The interface is engineered to disappear so hardware, materials, and finish options become the narrative foreground."</blockquote>
        `,
        coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000',
        published: true
      },
      {
        title: 'Refactoring a Monolith Architecture: Lessons Learned',
        slug: 'refactoring-monolith-architecture',
        excerpt: 'My journey migrating a complex multi-module project into a simplified, flat architecture and centralizing dependency injection.',
        content: `
          <h2>The Monolith Challenge</h2>
          <p>Recently, I faced the challenge of migrating a complex multi-module Flutter project into a simplified, standalone "Feature-First" architecture. The goal was to eliminate dependencies on internal company modules and create a clean core.</p>
          <h3>Steps to Success</h3>
          <ol>
            <li><strong>Centralizing Routing:</strong> Moved all routes into a single unified <code>app_routes.dart</code> file.</li>
            <li><strong>Dependency Injection:</strong> Centralized DI into a robust <code>injection_container.dart</code>.</li>
            <li><strong>Feature Isolation:</strong> Moved all domain-specific logic into isolated feature folders.</li>
          </ol>
          <p>This refactor not only improved compilation time but drastically reduced cognitive load when onboarding new developers to the codebase.</p>
        `,
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000',
        published: true
      },
      {
        title: 'Understanding JWT Authentication Flow',
        slug: 'understanding-jwt-authentication-flow',
        excerpt: 'A comprehensive guide on how JSON Web Tokens work and how to securely implement them in your Node.js and React applications.',
        content: `
          <h2>What is a JWT?</h2>
          <p>JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object.</p>
          <p>This information can be verified and trusted because it is digitally signed.</p>
          <p>...</p>
        `,
        coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=1000',
        published: false
      }
    ]);
    console.log('Sample blog posts created.');

    console.log('Data seeding complete!');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

connectDB().then(() => seedData());
