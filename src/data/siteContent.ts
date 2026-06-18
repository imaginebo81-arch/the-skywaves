import { coursesData, courseCategories, courseGradients } from "./courses";

export interface NavLink {
  label: string;
  to: string;
}

export interface NavDropdown {
  label: string;
  items: NavLink[];
}

export interface SiteContent {
  meta: {
    orgName: string;
    home: { title: string; description: string };
    logoUrl: string;
  };
  nav: {
    links: NavLink[];
    coursesDropdown: NavDropdown;
    verificationDropdown: NavDropdown;
  };
  hero: {
    headingLead: string;
    headingHighlight: string;
    subheading: string;
    primaryCta: { label: string; to: string };
    secondaryCta: { label: string; to: string };
    imageUrl: string;
  };
  trustIndicators: { icon: string; title: string; subtitle: string }[];
  featured: { heading: string; description: string };
  sections: {
    english: { heading: string; description: string };
    fashion: { heading: string; description: string };
    boutique: { heading: string; description: string };
    hypnosis: { heading: string; description: string };
  };
  marketingCourses: {
    id: string;
    title: string;
    description: string;
    category: string;
    image: string;
    academicCourseId: string | null;
  }[];
  courseCategories: string[];
  courseGradients: string[];
  testimonials: { name: string; role: string; quote: string; image: string }[];
  about: {
    title: string;
    description: string;
    heroHeading: string;
    heroSubheading: string;
    heroImage: string;
    storyBadge: string;
    storyHeading: string;
    storyParagraphs: string[];
    storyImage: string;
    valuesHeading: string;
    valuesDescription: string;
    values: { title: string; description: string }[];
  };
  contact: {
    title: string;
    description: string;
    heading: string;
    subheading: string;
    locationHeading: string;
    addressLines: string[];
    emailHeading: string;
    email: string;
    phoneHeading: string;
    phone: string;
    mapEmbedUrl: string;
  };
  enquiry: {
    heading: string;
    subheading: string;
    email: string;
    phone: string;
    courseOptions: string[];
  };
  footer: {
    tagline: string;
    copyright: string;
    quickLinks: NavLink[];
    courseLinks: NavLink[];
    bottomLinks: NavLink[];
  };
  legal: {
    privacy: { title: string; sections: { heading: string; body: string }[] };
    terms: { title: string; sections: { heading: string; body: string }[] };
  };
  verification: {
    student: { heading: string; description: string; refLabel: string; refPlaceholder: string };
    employee: {
      heading: string;
      description: string;
      refLabel: string;
      refPlaceholder: string;
      certificateTemplate: string;
    };
  };
}

const MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3422.09213798441!2d75.2333025!3d30.939991100000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a0e11a102a2cf%3A0x856c0e3f201ffaed!2sSkywaves%20Educare!5e0!3m2!1sen!2sin!4v1781803130462!5m2!1sen!2sin";

export const defaultSiteContent: SiteContent = {
  meta: {
    orgName: "Skywaves Educare",
    home: {
      title: "Skywaves Educare - Empowering Your Future",
      description:
        "Join Skywaves Educare for premium courses in Computer Science, English, Fashion Design, and Boutique Studies. Start your journey today!",
    },
    logoUrl:
      "https://res.cloudinary.com/dm3scoj2q/image/upload/v1781508181/Landscape_G_Logo_lhy1lo.png",
  },
  nav: {
    links: [
      { label: "Home", to: "/" },
      { label: "About Us", to: "/about-us" },
      { label: "Fashion", to: "/fashion" },
      { label: "Hypnosis", to: "/hypnosis" },
      { label: "Contact Us", to: "/contact" },
    ],
    coursesDropdown: {
      label: "Courses",
      items: [
        { label: "Computer Courses", to: "/courses?category=Diploma" },
        { label: "English Courses", to: "/courses?category=English" },
      ],
    },
    verificationDropdown: {
      label: "Verification",
      items: [
        { label: "Student Verification", to: "/verification" },
        { label: "Employment Verification", to: "/employment-verification" },
      ],
    },
  },
  hero: {
    headingLead: "Transform Your Skills Into a",
    headingHighlight: "Successful Career",
    subheading:
      "Trusted by learners across diverse fields, we provide quality education, professional guidance, and certifications that support long-term growth.",
    primaryCta: { label: "Explore Courses", to: "/courses" },
    secondaryCta: { label: "View Curriculum", to: "/courses" },
    imageUrl:
      "https://res.cloudinary.com/dm3scoj2q/image/upload/v1781505278/hero-3d-boy_dsrurq.png",
  },
  trustIndicators: [
    { icon: "History", title: "Serving since", subtitle: "2013" },
    { icon: "BadgeCheck", title: "Dual ISO", subtitle: "Certified" },
    { icon: "Globe", title: "Valid", subtitle: "Globally" },
    { icon: "CheckCircle", title: "Online", subtitle: "Verified" },
  ],
  featured: {
    heading: "All Courses",
    description: "Elevate your skills with our industry-relevant curriculum.",
  },
  sections: {
    english: {
      heading: "Basic to Advance English Courses",
      description: "Enhance your language skills for better communication and confidence.",
    },
    fashion: {
      heading: "Fashion Courses",
      description: "From concept sketches to runway execution and high-end boutique retail.",
    },
    boutique: {
      heading: "Boutique Courses",
      description: "Exclusive training for high-end fashion and retail.",
    },
    hypnosis: {
      heading: "Hypnosis Courses",
      description: "Master the art and science of clinical hypnotherapy.",
    },
  },
  marketingCourses: coursesData.map((c) => ({ ...c, academicCourseId: null })),
  courseCategories,
  courseGradients,
  testimonials: [
    {
      name: "Sarah J.",
      role: "CS Graduate",
      quote:
        "The curriculum is incredibly forward-thinking. I landed my dream job in tech within weeks of completing the CS track.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCyTwke8UDpdY9L_rx3C_nyy2L6lu-2Q9NrFa9TtNy-Zf6kiV6L3nDYHYQszrxd1ls-2xrmkaNHvjW0_YZOg9855WR9N1HYm34vvcLLhx2euHNZS5hedJVsRmEOCV3nhpmzQNMKkqkdfY7QWPkSYvBRxKr2POL1rHThDgDJnK2SeaC8Bt6SeVlYEjR1hLMwTSzlibWlDsYWh6YS3hJZcWijJjWOkE3lNbKhKH-4HtDfc2klzu_O1-dwUqmjZygXFB1kOplhJPBbrzw",
    },
    {
      name: "Marcus T.",
      role: "Design Alumnus",
      quote:
        "The fashion design workshop pushed my creative boundaries. The mentorship is truly unmatched.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBeMT-gTbTD6WQQahpFRXEz4ju12FRNDLSG7rBXbstjqZYpy2xqhvVKLsHXf--xR5xJEws6d0nVyNs8WKrvo8bcy-51diFMM0jMnC8XLFQeh_0s338BprQ9JcME13jqY4F5zclbK2XttApSd2-fxK55ZXQIyPT1DfKp0Jva-i0e6gRHwTKrWwsSFzb65YxGLSikxs0uUOTgeuLFs95KhKpy7aZgx3RY2WX-hLUReAMUC3rYH3vksqRRYesPGR40WAPXiOtC6ioNamw",
    },
    {
      name: "Elena R.",
      role: "Language Student",
      quote:
        "Learning a new language felt daunting, but the immersive approach here made it natural and fun.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAV7So-q2OyzXH9CGjgHD6331w1lkH2DfxFnI-81ggpar9q7LWzDNr6RPVMGCPPZShLgmw3HdSpIozzdeQipwyqR4JIZRcWVrdhh-v3NJAokkCWlMBP8OCfqmKOdSdgQwVS4ZOGhGOLY-9osVzGniLjyqTJ8x1IkZ5PQgyU5qrrleimxrcJq9k2xbLeOOG0fEMsX7s9Gcc8DqHr7iN6v_PM4Hf7Qx6ec250GqZh3OmN9FO3QBtluy5I30gwHcGZAEErBe7J_U7bx-o",
    },
    {
      name: "Aisha M.",
      role: "Boutique Owner",
      quote:
        "The boutique management course was exactly what I needed to launch my own brand. The practical insights were invaluable.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBeMT-gTbTD6WQQahpFRXEz4ju12FRNDLSG7rBXbstjqZYpy2xqhvVKLsHXf--xR5xJEws6d0nVyNs8WKrvo8bcy-51diFMM0jMnC8XLFQeh_0s338BprQ9JcME13jqY4F5zclbK2XttApSd2-fxK55ZXQIyPT1DfKp0Jva-i0e6gRHwTKrWwsSFzb65YxGLSikxs0uUOTgeuLFs95KhKpy7aZgx3RY2WX-hLUReAMUC3rYH3vksqRRYesPGR40WAPXiOtC6ioNamw",
    },
    {
      name: "David L.",
      role: "IT Professional",
      quote:
        "I was able to upskill while working full-time thanks to the flexible schedule and engaging pre-recorded sessions.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCyTwke8UDpdY9L_rx3C_nyy2L6lu-2Q9NrFa9TtNy-Zf6kiV6L3nDYHYQszrxd1ls-2xrmkaNHvjW0_YZOg9855WR9N1HYm34vvcLLhx2euHNZS5hedJVsRmEOCV3nhpmzQNMKkqkdfY7QWPkSYvBRxKr2POL1rHThDgDJnK2SeaC8Bt6SeVlYEjR1hLMwTSzlibWlDsYWh6YS3hJZcWijJjWOkE3lNbKhKH-4HtDfc2klzu_O1-dwUqmjZygXFB1kOplhJPBbrzw",
    },
    {
      name: "Karan S.",
      role: "Corporate Executive",
      quote:
        "The spoken English classes gave me the confidence to ace my interviews. I'm so grateful to the faculty.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAV7So-q2OyzXH9CGjgHD6331w1lkH2DfxFnI-81ggpar9q7LWzDNr6RPVMGCPPZShLgmw3HdSpIozzdeQipwyqR4JIZRcWVrdhh-v3NJAokkCWlMBP8OCfqmKOdSdgQwVS4ZOGhGOLY-9osVzGniLjyqTJ8x1IkZ5PQgyU5qrrleimxrcJq9k2xbLeOOG0fEMsX7s9Gcc8DqHr7iN6v_PM4Hf7Qx6ec250GqZh3OmN9FO3QBtluy5I30gwHcGZAEErBe7J_U7bx-o",
    },
  ],
  about: {
    title: "About Us - Skywaves Educare",
    description:
      "Learn about Skywaves Educare's mission, story, and core values in providing top-tier, industry-aligned education to our vibrant student community.",
    heroHeading: "Empowering the Next Generation of Innovators",
    heroSubheading:
      "At Skywaves Educare, we believe in accessible, high-quality education that bridges the gap between ambition and reality.",
    heroImage:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
    storyBadge: "Our Story",
    storyHeading: "A Legacy of Excellence in Education",
    storyParagraphs: [
      "Founded with a vision to democratize specialized education, Skywaves Educare has grown from a modest training institute into a premier educational hub. We identified a critical need for practical, industry-aligned training in emerging fields like Computer Science, Fashion Design, and Advanced Language Arts.",
      "Over the years, our dedicated faculty and dynamic curriculum have transformed thousands of lives, turning passionate learners into successful professionals and visionary entrepreneurs.",
    ],
    storyImage:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop",
    valuesHeading: "Our Core Values",
    valuesDescription:
      "The principles that guide our educational approach and institutional culture.",
    values: [
      { title: "Academic Rigor", description: "Maintaining the highest standards in our curriculum and instructional design." },
      { title: "Practical Focus", description: "Ensuring every lesson has real-world application and career relevance." },
      { title: "Inclusivity", description: "Fostering a welcoming environment for students from all backgrounds." },
      { title: "Continuous Growth", description: "Encouraging a lifelong love for learning and self-improvement." },
    ],
  },
  contact: {
    title: "Contact Us - Skywaves Educare",
    description:
      "Get in touch with Skywaves Educare for admissions, inquiries, or any educational guidance. We're here to help.",
    heading: "Contact Us",
    subheading:
      "We would love to hear from you. Reach out to our team for any inquiries, admissions details, or just to say hello.",
    locationHeading: "Our Location",
    addressLines: ["Near PNB Bank", "Adjoining Jio Mobile Office Street", "Dharamkot"],
    emailHeading: "Email",
    email: "skywaveseducare@gmail.com",
    phoneHeading: "Phone",
    phone: "Naveen Rajpoot | 95925-02100",
    mapEmbedUrl: MAP_EMBED,
  },
  enquiry: {
    heading: "Have Questions?",
    subheading:
      "Reach out to our admissions team. We're here to help you find the right path for your future.",
    email: "skywaveseducare@gmail.com",
    phone: "Naveen Rajpoot | 95925-02100",
    courseOptions: ["Computer Science", "Language Mastery", "Fashion Design", "Hypnotherapy", "Other"],
  },
  footer: {
    tagline:
      "Elevating knowledge, inspiring minds. Join our community of learners to create a better future.",
    copyright: "© 2024 The Skywaves Educare. Elevating Knowledge.",
    quickLinks: [
      { label: "Home", to: "/" },
      { label: "About Us", to: "/about-us" },
      { label: "Contact Us", to: "/contact" },
      { label: "Student Verification", to: "/verification" },
      { label: "Employment Verification", to: "/employment-verification" },
    ],
    courseLinks: [
      { label: "Computer Courses", to: "/courses?category=Diploma" },
      { label: "English Courses", to: "/courses?category=English" },
      { label: "Fashion", to: "/fashion" },
      { label: "Hypnosis", to: "/hypnosis" },
    ],
    bottomLinks: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms of Service", to: "/terms-of-service" },
      { label: "Contact Us", to: "/contact" },
      { label: "Admin", to: "/admin/login" },
    ],
  },
  legal: {
    privacy: {
      title: "Privacy Policy",
      sections: [
        {
          heading: "Introduction",
          body: "Welcome to Skywaves Educare. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.",
        },
        {
          heading: "The Data We Collect About You",
          body: "We may collect, use, store and transfer different kinds of personal data about you including Identity Data, Contact Data, Technical Data and Usage Data.",
        },
        {
          heading: "How We Use Your Personal Data",
          body: "We will only use your personal data when the law allows us to, most commonly to perform a contract with you, where it is necessary for our legitimate interests, or where we need to comply with a legal obligation.",
        },
        {
          heading: "Data Security",
          body: "We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.",
        },
        {
          heading: "Contact Us",
          body: "If you have any questions about this privacy policy or our privacy practices, please contact us.",
        },
      ],
    },
    terms: {
      title: "Terms of Service",
      sections: [
        { heading: "Agreement to Terms", body: "By accessing or using our services, you agree to be bound by these terms of service and all applicable laws and regulations." },
        { heading: "Educational Services", body: "Skywaves Educare provides educational courses and training. Course availability, content, and schedules are subject to change." },
        { heading: "User Accounts", body: "You are responsible for safeguarding your account and for any activities or actions under your account." },
        { heading: "Intellectual Property", body: "All course materials and content are the property of Skywaves Educare and protected by intellectual property laws." },
        { heading: "User Conduct", body: "You agree not to misuse the services or help anyone else do so, and to use the platform respectfully." },
        { heading: "Limitation of Liability", body: "Skywaves Educare shall not be liable for any indirect, incidental, or consequential damages arising from your use of the services." },
        { heading: "Contact Us", body: "If you have any questions about these terms, please contact us." },
      ],
    },
  },
  verification: {
    student: {
      heading: "Student Verification",
      description:
        "Please enter the student's date of birth and reference number to view their certification details.",
      refLabel: "Reference Number / Roll Number",
      refPlaceholder: "e.g. SW/CV/KK/1234",
    },
    employee: {
      heading: "Employment Verification",
      description:
        "Please enter the employee's date of birth and reference number to view their employment records.",
      refLabel: "Employment Reference Number",
      refPlaceholder: "e.g. SW/CV/KK/1234",
      certificateTemplate:
        "This is to certify that {{name}} was employed with Skywaves Educare as {{designation}} from {{joiningDate}} to {{leavingDate}}, rendering dedicated and exceptional service.",
    },
  },
};

export const SITE_CONTENT_KEYS = Object.keys(defaultSiteContent) as (keyof SiteContent)[];
