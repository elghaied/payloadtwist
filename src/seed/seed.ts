import type { Payload } from 'payload'

import { devUser } from './credentials.js'
import { seedImages } from './seed-images.js'

export const seed = async (payload: Payload) => {
  // Seed dev user if needed
  const { totalDocs: userCount } = await payload.count({
    collection: 'users',
    where: { email: { equals: devUser.email } },
  })
  if (!userCount) {
    await payload.create({ collection: 'users', data: devUser })
  }

  // Skip if already seeded
  const { totalDocs: catCount } = await payload.count({ collection: 'categories' })
  if (catCount > 0) return

  console.log('Seeding showcase data...')

  // 1. Images
  const img = await seedImages(payload)

  // 2. Categories
  const categoryData = [
    { title: 'Technology', description: 'Latest in tech and software', color: '#3B82F6', icon: 'bolt' as const },
    { title: 'Design', description: 'UI/UX, graphic design, and visual arts', color: '#8B5CF6', icon: 'star' as const },
    { title: 'Business', description: 'Strategy, management, and growth', color: '#10B981', icon: 'globe' as const },
    { title: 'Tutorial', description: 'Step-by-step guides and how-tos', color: '#F59E0B', icon: 'book' as const },
    { title: 'News', description: 'Industry updates and announcements', color: '#EF4444', icon: 'heart' as const },
  ]

  const categories: Record<string, number> = {}
  for (const cat of categoryData) {
    const doc = await payload.create({ collection: 'categories', data: cat })
    categories[cat.title] = doc.id as number
  }

  // 3. Team Members
  const teamData = [
    {
      firstName: 'Sarah', lastName: 'Chen', email: 'sarah@example.com',
      role: 'editor' as const, department: 'engineering' as const, featured: true,
      bio: 'Full-stack engineer with 8 years of experience building web applications. Passionate about developer tools and open source.',
      startDate: '2022-03-15',
      photo: img['person-1.jpg'],
      socialLinks: [
        { platform: 'github' as const, url: 'https://github.com/sarahchen' },
        { platform: 'twitter' as const, url: 'https://twitter.com/sarahchen' },
      ],
    },
    {
      firstName: 'Marcus', lastName: 'Rivera', email: 'marcus@example.com',
      role: 'author' as const, department: 'design' as const, featured: true,
      bio: 'Senior product designer focused on design systems and component libraries. Previously at Figma and Stripe.',
      startDate: '2021-08-01',
      photo: img['person-2.jpg'],
      socialLinks: [
        { platform: 'linkedin' as const, url: 'https://linkedin.com/in/marcusrivera' },
      ],
    },
    {
      firstName: 'Emily', lastName: 'Watson', email: 'emily@example.com',
      role: 'admin' as const, department: 'product' as const, featured: false,
      bio: 'Product manager bridging the gap between engineering and business. Data-driven decision maker.',
      startDate: '2023-01-10',
      photo: img['person-3.jpg'],
      socialLinks: [],
    },
    {
      firstName: 'James', lastName: 'Kim', email: 'james@example.com',
      role: 'author' as const, department: 'engineering' as const, featured: false,
      bio: 'Backend engineer specializing in APIs and database optimization. Writes about scalability patterns.',
      startDate: '2022-11-20',
      socialLinks: [
        { platform: 'github' as const, url: 'https://github.com/jameskim' },
      ],
    },
    {
      firstName: 'Ana', lastName: 'Lopez', email: 'ana@example.com',
      role: 'contributor' as const, department: 'marketing' as const, featured: true,
      bio: 'Content strategist and technical writer. Makes complex topics accessible to everyone.',
      startDate: '2023-06-05',
      socialLinks: [
        { platform: 'twitter' as const, url: 'https://twitter.com/analopez' },
        { platform: 'website' as const, url: 'https://analopez.dev' },
      ],
    },
  ]

  const teamMembers: Record<string, number> = {}
  for (const member of teamData) {
    const doc = await payload.create({ collection: 'team-members', data: member })
    teamMembers[member.firstName] = doc.id as number
  }

  // 4. Posts
  const richTextContent = (paragraphs: string[]) => ({
    root: {
      type: 'root',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        children: [{ type: 'text', text, version: 1 }],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      })),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  })

  const postData = [
    {
      title: 'Building a Modern Design System',
      slug: 'building-modern-design-system',
      author: teamMembers['Marcus'],
      categories: [categories['Design'], categories['Tutorial']],
      tags: ['design systems', 'components', 'CSS'],
      excerpt: 'A comprehensive guide to creating scalable design systems that grow with your product.',
      content: richTextContent([
        'Design systems are the backbone of consistent user interfaces. They provide a shared language between designers and developers.',
        'In this guide, we will walk through the process of building a design system from scratch, covering tokens, components, and documentation.',
        'The key to a successful design system is starting small and iterating. Begin with your most-used components and expand from there.',
      ]),
      featuredImage: img['blog-design.jpg'],
      publishDate: '2024-01-15',
      status: 'published' as const,
      featured: true,
      readTime: 8,
    },
    {
      title: 'Introduction to Payload CMS',
      slug: 'introduction-payload-cms',
      author: teamMembers['Sarah'],
      categories: [categories['Technology'], categories['Tutorial']],
      tags: ['payload', 'cms', 'typescript'],
      excerpt: 'Everything you need to know to get started with Payload CMS in your Next.js project.',
      content: richTextContent([
        'Payload CMS is a headless content management system built with TypeScript. It gives you full control over your data model and admin UI.',
        'Unlike traditional CMS platforms, Payload runs alongside your Next.js application, sharing the same codebase and deployment.',
        'With features like auto-generated TypeScript types, access control, and hooks, Payload makes building content-driven applications a joy.',
      ]),
      featuredImage: img['hero-code.jpg'],
      publishDate: '2024-02-20',
      status: 'published' as const,
      featured: true,
      readTime: 6,
    },
    {
      title: 'Scaling Your Startup: Lessons Learned',
      slug: 'scaling-startup-lessons',
      author: teamMembers['Emily'],
      categories: [categories['Business']],
      tags: ['startup', 'growth', 'management'],
      excerpt: 'Practical advice from scaling a product team from 5 to 50 people.',
      content: richTextContent([
        'Scaling a startup is as much about people as it is about technology. The processes that work for a team of 5 break down at 20.',
        'We learned to invest in documentation early, establish clear ownership, and create feedback loops that surface problems before they become crises.',
      ]),
      publishDate: '2024-03-10',
      status: 'published' as const,
      featured: false,
      readTime: 5,
    },
    {
      title: 'Advanced TypeScript Patterns',
      slug: 'advanced-typescript-patterns',
      author: teamMembers['James'],
      categories: [categories['Technology']],
      tags: ['typescript', 'patterns', 'advanced'],
      excerpt: 'Deep dive into branded types, conditional types, and template literal types.',
      content: richTextContent([
        'TypeScript is more than just adding types to JavaScript. Advanced patterns like branded types let you encode business rules at the type level.',
        'Conditional types and template literal types open up possibilities for type-safe APIs that catch errors before runtime.',
      ]),
      featuredImage: img['blog-tech.jpg'],
      publishDate: '2024-04-05',
      status: 'published' as const,
      featured: false,
      readTime: 12,
    },
    {
      title: 'The Future of Web Development',
      slug: 'future-web-development',
      author: teamMembers['Ana'],
      categories: [categories['Technology'], categories['News']],
      tags: ['web', 'trends', 'future'],
      excerpt: 'Emerging trends and technologies shaping the future of the web platform.',
      content: richTextContent([
        'The web platform is evolving rapidly. From WebAssembly to container queries, new capabilities are changing how we build for the web.',
        'In this article, we explore the trends that will define web development over the next five years.',
      ]),
      publishDate: '2024-05-01',
      status: 'draft' as const,
      featured: false,
      readTime: 7,
    },
    {
      title: 'Designing for Accessibility',
      slug: 'designing-accessibility',
      author: teamMembers['Marcus'],
      categories: [categories['Design'], categories['News']],
      tags: ['accessibility', 'a11y', 'inclusive design'],
      excerpt: 'Why accessibility should be a core part of your design process, not an afterthought.',
      content: richTextContent([
        'Accessibility is not a feature — it is a fundamental aspect of quality software. One in four adults in the US has a disability.',
        'This guide covers practical techniques for making your web applications accessible to everyone, from semantic HTML to ARIA patterns.',
      ]),
      publishDate: '2024-05-15',
      status: 'published' as const,
      featured: true,
      readTime: 9,
    },
  ]

  for (const post of postData) {
    await payload.create({ collection: 'posts', data: post })
  }

  // 5. Products
  const productData = [
    {
      name: 'Pro Wireless Headphones',
      sku: 'HDP-001',
      price: 299.99,
      compareAtPrice: 349.99,
      description: richTextContent([
        'Premium wireless headphones with active noise cancellation and 30-hour battery life.',
        'Features custom 40mm drivers, multipoint Bluetooth connection, and a comfortable over-ear design.',
      ]),
      inStock: true,
      category: categories['Technology'],
      images: img['product-headphones.jpg'] ? [img['product-headphones.jpg']] : [],
      variants: [
        { name: 'Midnight Black', color: '#1a1a1a', size: 'm' as const, price: 299.99 },
        { name: 'Arctic White', color: '#f5f5f5', size: 'm' as const, price: 299.99 },
        { name: 'Navy Blue', color: '#1e3a5f', size: 'l' as const, price: 319.99 },
      ],
      specifications: { weight: '250g', driver: '40mm', battery: '30 hours', connectivity: 'Bluetooth 5.3' },
      location: [-122.4194, 37.7749] as [number, number],
      rating: '5' as const,
      embedCode: '<div class="product-badge">Best Seller</div>',
    },
    {
      name: 'Developer Laptop Stand',
      sku: 'LST-002',
      price: 89.99,
      compareAtPrice: 119.99,
      description: richTextContent([
        'Ergonomic aluminum laptop stand with adjustable height and angle. Keeps your laptop cool and your posture healthy.',
      ]),
      inStock: true,
      category: categories['Technology'],
      images: img['product-laptop.jpg'] ? [img['product-laptop.jpg']] : [],
      variants: [
        { name: 'Silver', color: '#c0c0c0', size: 'm' as const, price: 89.99 },
        { name: 'Space Gray', color: '#4a4a4a', size: 'l' as const, price: 99.99 },
      ],
      specifications: { material: 'Aluminum alloy', maxWeight: '10kg', height: '12-20cm' },
      location: [-74.006, 40.7128] as [number, number],
      rating: '4' as const,
      embedCode: '<div class="product-badge">New Arrival</div>',
    },
    {
      name: 'Mirrorless Camera Kit',
      sku: 'CAM-003',
      price: 1299.00,
      compareAtPrice: 1499.00,
      description: richTextContent([
        'Full-frame mirrorless camera with 24.2MP sensor, 4K video, and in-body image stabilization.',
        'Kit includes 28-70mm lens, extra battery, and carrying case.',
      ]),
      inStock: true,
      category: categories['Technology'],
      images: img['product-camera.jpg'] ? [img['product-camera.jpg']] : [],
      variants: [
        { name: 'Body Only', color: '#2d2d2d', size: 'm' as const, price: 999.00 },
        { name: 'With Kit Lens', color: '#2d2d2d', size: 'l' as const, price: 1299.00 },
      ],
      specifications: { sensor: '24.2MP Full Frame', video: '4K 60fps', iso: '100-51200', weight: '650g' },
      location: [-118.2437, 34.0522] as [number, number],
      rating: '5' as const,
      embedCode: '<div class="product-badge">Pro Choice</div>',
    },
    {
      name: 'Smart Fitness Watch',
      sku: 'WCH-004',
      price: 249.99,
      description: richTextContent([
        'Advanced fitness watch with heart rate monitoring, GPS, and 7-day battery life. Water resistant to 50m.',
      ]),
      inStock: false,
      category: categories['Technology'],
      images: img['product-watch.jpg'] ? [img['product-watch.jpg']] : [],
      variants: [
        { name: 'Small', color: '#333333', size: 's' as const, price: 249.99 },
        { name: 'Large', color: '#333333', size: 'l' as const, price: 269.99 },
        { name: 'Rose Gold - Small', color: '#b76e79', size: 's' as const, price: 279.99 },
      ],
      specifications: { display: '1.4" AMOLED', battery: '7 days', waterResistance: '50m', gps: true },
      location: [-87.6298, 41.8781] as [number, number],
      rating: '4' as const,
      embedCode: '<div class="product-badge">Coming Soon</div>',
    },
  ]

  const productIds: number[] = []
  for (const product of productData) {
    const doc = await payload.create({ collection: 'products', data: product })
    productIds.push(doc.id as number)
  }

  // Set relatedProducts (self-references)
  if (productIds.length >= 4) {
    await payload.update({ collection: 'products', id: productIds[0], data: { relatedProducts: [productIds[1], productIds[2]] } })
    await payload.update({ collection: 'products', id: productIds[1], data: { relatedProducts: [productIds[0], productIds[3]] } })
    await payload.update({ collection: 'products', id: productIds[2], data: { relatedProducts: [productIds[0], productIds[3]] } })
    await payload.update({ collection: 'products', id: productIds[3], data: { relatedProducts: [productIds[1], productIds[2]] } })
  }

  // 6. Pages
  const pageData = [
    {
      title: 'Home',
      slug: 'home',
      heroImage: img['hero-office.jpg'],
      status: 'published' as const,
      publishDate: '2024-01-01',
      content: richTextContent(['Welcome to our platform. We build tools that help developers create beautiful admin experiences.']),
      layout: [
        {
          blockType: 'hero' as const,
          heading: 'Build Beautiful Admin Panels',
          subheading: 'Customize every aspect of your Payload CMS admin UI with our visual theme editor.',
          image: img['hero-office.jpg'],
          ctaLabel: 'Get Started',
          ctaLink: '/editor',
          style: 'fullWidth' as const,
        },
        {
          blockType: 'stats' as const,
          items: [
            { value: '22', label: 'Field Types', suffix: '+' },
            { value: '149', label: 'Components', suffix: '' },
            { value: '100', label: 'Customizable', suffix: '%' },
          ],
        },
        {
          blockType: 'content' as const,
          content: richTextContent(['Our visual editor lets you tweak every CSS variable and component style in real time. No code required.']),
        },
        {
          blockType: 'cta' as const,
          heading: 'Ready to get started?',
          text: 'Try the theme editor now and see your changes reflected instantly.',
          buttonLabel: 'Open Editor',
          buttonLink: '/editor',
          style: 'highlight' as const,
        },
      ],
      meta: { metaTitle: 'PayloadTwist - Visual Theme Editor', metaDescription: 'A visual CSS theme editor for Payload CMS admin panel.' },
    },
    {
      title: 'About',
      slug: 'about',
      heroImage: img['hero-team.jpg'],
      status: 'published' as const,
      publishDate: '2024-01-01',
      content: richTextContent(['Learn more about our mission to make Payload CMS theming accessible to everyone.']),
      layout: [
        {
          blockType: 'hero' as const,
          heading: 'About PayloadTwist',
          subheading: 'We believe admin panels should be as beautiful as the products they manage.',
          image: img['hero-team.jpg'],
          style: 'centered' as const,
        },
        {
          blockType: 'content' as const,
          content: richTextContent([
            'PayloadTwist started as a side project to scratch our own itch. We were tired of writing custom SCSS for every Payload project.',
            'Today, it is a full-featured visual editor that generates production-ready custom.scss files for any Payload CMS project.',
          ]),
        },
        {
          blockType: 'quote' as const,
          quote: 'The best admin panel is one that feels like it was built just for your brand.',
          author: 'Sarah Chen',
          role: 'Lead Engineer',
          image: img['person-1.jpg'],
        },
      ],
      meta: { metaTitle: 'About - PayloadTwist', metaDescription: 'Learn about the team behind PayloadTwist.' },
    },
    {
      title: 'Services',
      slug: 'services',
      status: 'published' as const,
      publishDate: '2024-01-01',
      content: richTextContent(['Explore our range of services for Payload CMS customization.']),
      layout: [
        {
          blockType: 'hero' as const,
          heading: 'Our Services',
          subheading: 'From simple theme tweaks to full admin customization.',
          style: 'split' as const,
        },
        {
          blockType: 'stats' as const,
          items: [
            { value: '500', label: 'Projects Completed', suffix: '+' },
            { value: '50', label: 'Happy Clients', suffix: '+' },
            { value: '99', label: 'Satisfaction Rate', suffix: '%' },
          ],
        },
        {
          blockType: 'cta' as const,
          heading: 'Need a custom theme?',
          text: 'We offer professional Payload CMS theming services.',
          buttonLabel: 'Contact Us',
          buttonLink: '/contact',
          style: 'standard' as const,
        },
      ],
      meta: { metaTitle: 'Services - PayloadTwist', metaDescription: 'Professional Payload CMS theming services.' },
    },
    {
      title: 'Contact',
      slug: 'contact',
      status: 'draft' as const,
      content: richTextContent(['Get in touch with our team.']),
      layout: [
        {
          blockType: 'hero' as const,
          heading: 'Get In Touch',
          subheading: 'We would love to hear from you.',
          style: 'centered' as const,
        },
        {
          blockType: 'content' as const,
          content: richTextContent([
            'Email us at hello@payloadtwist.dev or reach out on social media.',
            'We typically respond within 24 hours.',
          ]),
        },
      ],
      meta: { metaTitle: 'Contact - PayloadTwist', metaDescription: 'Get in touch with the PayloadTwist team.' },
    },
  ]

  const pageIds: Record<string, number> = {}
  for (const page of pageData) {
    const doc = await payload.create({ collection: 'pages', data: page })
    pageIds[page.slug] = doc.id as number
  }

  // 7. Globals
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'PayloadTwist',
      siteDescription: 'A visual CSS theme editor for Payload CMS admin panel',
      contactEmail: 'hello@payloadtwist.dev',
      socialLinks: [
        { platform: 'github' as const, url: 'https://github.com/payloadtwist' },
        { platform: 'twitter' as const, url: 'https://twitter.com/payloadtwist' },
      ],
      analytics: { enabled: true, trackingId: 'G-EXAMPLE123' },
      maintenanceMode: { enabled: false, message: 'We are performing scheduled maintenance. Please check back soon.' },
    },
  })

  await payload.updateGlobal({
    slug: 'main-menu',
    data: {
      items: [
        { label: 'Home', type: 'page' as const, page: pageIds['home'], newTab: false },
        { label: 'About', type: 'page' as const, page: pageIds['about'], newTab: false },
        { label: 'Services', type: 'page' as const, page: pageIds['services'], newTab: false },
        { label: 'Contact', type: 'page' as const, page: pageIds['contact'], newTab: false },
        { label: 'GitHub', type: 'link' as const, url: 'https://github.com/payloadtwist', newTab: true },
      ],
    },
  })

  console.log('Seed complete!')
}
