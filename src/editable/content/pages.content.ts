import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: 'Curated collections, resources, and tools',
      description: 'Discover curated collections of resources, tools, and links organized for easy browsing and discovery.',
      openGraphTitle: 'Curated collections, resources, and tools',
      openGraphDescription: 'Discover curated collections of resources, tools, and links organized for easy browsing.',
      keywords: ['collections', 'curated resources', 'bookmarks', 'resource discovery', 'tools'],
    },
    hero: {
      badge: 'Discover curated resources',
      title: ['Curated collections of', 'resources worth saving.'],
      description: 'Browse verified resources, tools, and links organized into collections by curators who care about quality.',
      primaryCta: { label: 'Browse collections', href: '/sbm' },
      secondaryCta: { label: 'Learn more', href: '/about' },
      searchPlaceholder: 'Search collections, resources, and tools',
      focusLabel: 'Focus',
      featureCardBadge: 'latest resources',
      featureCardTitle: 'New resources shape the discovery feed.',
      featureCardDescription: 'Recently submitted resources appear first so the best new finds surface quickly.',
    },
    intro: {
      badge: 'How it works',
      title: 'Resources organized into collections, verified and easy to browse.',
      paragraphs: [
        'Every resource is reviewed and organized into a collection so you can discover tools, references, and links without wading through noise.',
        'Collections group related resources together — making it easy to explore an entire topic, compare tools, or find the right reference quickly.',
        'Whether you are looking for a specific tool or exploring a new topic, collections give you a starting point that is already organized.',
      ],
      sideBadge: 'At a glance',
      sidePoints: [
        'Curated collections organized by topic and use case.',
        'Verified resources with trust signals and metadata.',
        'Clean browsing designed for fast discovery.',
        'Submit resources and build your own collections.',
      ],
      primaryLink: { label: 'Browse collections', href: '/sbm' },
      secondaryLink: { label: 'Submit a resource', href: '/create' },
    },
    cta: {
      badge: 'Start curating',
      title: 'Know a great resource? Share it with the community.',
      description: 'Submit resources, build collections, and help curators organize the best tools and references on the web.',
      primaryCta: { label: 'Submit a resource', href: '/create' },
      secondaryCta: { label: 'Contact us', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'Browse the newest posts in this section.',
    },
  },
  about: {
    badge: 'About us',
    title: 'A better way to discover and organize resources.',
    description: `${slot4BrandConfig.siteName} is a platform for curating, organizing, and discovering the best resources, tools, and references across the web.`,
    paragraphs: [
      'We believe the best resources are found through trusted curation, not algorithms. Every collection on this platform is built by real curators who care about quality and relevance.',
      'Whether you are a developer looking for tools, a designer exploring references, or a researcher gathering sources — our collections give you a head start.',
    ],
    values: [
      {
        title: 'Quality over quantity',
        description: 'Every resource is reviewed before it joins a collection. We prioritize useful, verified, and well-described links over volume.',
      },
      {
        title: 'Organized discovery',
        description: 'Collections group related resources together so you can explore topics deeply without jumping between disconnected search results.',
      },
      {
        title: 'Community-driven curation',
        description: 'Curators submit and organize resources, building collections that help others discover tools and references faster.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'Have a question or want to collaborate?',
    description: 'Reach out about resource submissions, collection partnerships, curation questions, or anything else.',
    formTitle: 'Send a message',
  },

  search: {
    metadata: {
      title: 'Search',
      description: 'Search collections, resources, and tools across the platform.',
    },
    hero: {
      badge: 'Search collections',
      title: 'Find resources, tools, and collections faster.',
      description: 'Use keywords, categories, and filters to discover resources from every collection on the platform.',
      placeholder: 'Search by keyword, topic, or resource name',
    },
    resultsTitle: 'Browse all resources',
  },
  create: {
    metadata: {
      title: 'Submit',
      description: 'Submit a new resource to the platform.',
    },
    locked: {
      badge: 'Curator access',
      title: 'Login to submit resources.',
      description: 'Use your account to submit resources, build collections, and contribute to the platform.',
    },
    hero: {
      badge: 'Submit a resource',
      title: 'Add a resource to the collections.',
      description: 'Choose a type, add details, and submit a resource with a link, summary, and description.',
    },
    formTitle: 'Resource details',
    submitLabel: 'Submit resource',
    successTitle: 'Resource submitted successfully.',
  },
  auth: {
    login: {
      metadataDescription: 'Login to your account.',
      badge: 'Curator access',
      title: 'Welcome back, curator.',
      description: 'Login to continue submitting resources, managing collections, and building your curator profile.',
      formTitle: 'Login',
      submitLabel: 'Continue',
      noAccount: 'No account matched these details. Create an account first, then login.',
      success: 'Login successful. Redirecting...',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Create an account.',
      badge: 'Join as a curator',
      title: 'Start curating resources today.',
      description: 'Create an account to submit resources, build collections, and join the community of curators.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created successfully. Redirecting...',
      loginCta: 'Login',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related articles',
      fallbackTitle: 'Article details',
    },
    listing: {
      relatedTitle: 'Related listings',
      fallbackTitle: 'Listing details',
    },
    image: {
      relatedTitle: 'Related visuals',
      fallbackTitle: 'Image details',
    },
    profile: {
      relatedTitle: 'Their collections',
      fallbackDescription: 'Profile details will appear here once available.',
      visitButton: 'Visit official site',
    },
  },
} as const
