// Content visible on https://www.paceupcareer.com on 2026-11-03, copied once
// from production (public items only: hidden courses and workshops, the test
// instructor and the Image table are left out). The seed does not read
// production again; edit this file to change local content.
//
// Storage files are referenced by key. In -dev mode the seed turns keys into
// public URLs of the -dev buckets (prisma/seed-files.json lists every key);
// otherwise it uses the /img fallback paths. Workshop dates are shifted at
// seed time so the last workshop is upcoming.
import type {
  CourseCategory,
  EbookCategory,
  TargetAudienceType,
  VideoCategory,
  WorkshopCategory
} from '@prisma/client';
import type { Prisma } from '@prisma/client';

export type SeedFile = { key: string; fallback?: string };

export type SeedMainVisual = {
  id: string;
  title: string;
  description: string | null;
  linkName: string | null;
  link: string | null;
  orderIndex: number;
};

export type SeedInstructor = {
  id: string;
  name: string;
  description: string | null;
  careers: Prisma.InputJsonValue;
  profileImage: SeedFile;
};

export type SeedVideo = {
  id: string;
  videoId: string;
  title: string | null;
  description: string | null;
  category: VideoCategory | null;
};

export type SeedSection = {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  videos: SeedVideo[];
};

export type SeedCourse = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  category: CourseCategory;
  targetAudienceTypes: TargetAudienceType[];
  processTitle: string | null;
  processContent: string | null;
  showOnMain: boolean;
  time: string | null;
  videoLink: string | null;
  visualTitle: string | null;
  visualTitle2: string | null;
  orderKey: string;
  thumbnail: SeedFile;
  recommendedLinks: { name: string; url: string }[];
  instructorIds: string[];
  sections: SeedSection[];
  reviews: { rating: number; content: string }[];
};

export type SeedEbook = {
  id: string;
  ebookId: string;
  title: string;
  subTitle: string | null;
  description: string | null;
  subDescription: string | null;
  price: number;
  category: EbookCategory;
  isMain: boolean;
  orderKey: string;
  time: string | null;
  visualTitle1: string | null;
  visualTitle2: string | null;
  tableOfContents: Prisma.InputJsonValue;
  recommendedLinks: Prisma.InputJsonValue | null;
  targetAudienceTypes: TargetAudienceType[];
  thumbnail: SeedFile;
  file: SeedFile;
};

export type SeedWorkshop = {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  price: number;
  locationOrUrl: string | null;
  category: WorkshopCategory;
  processContent: string | null;
  isMain: boolean;
  orderKey: string;
  thumbnail: SeedFile;
};

export const MAIN_VISUALS: SeedMainVisual[] = [
  {
    id: '04424d93-f7f8-4f3e-a0ae-9b4f4c0e41d8',
    title: 'Not sure where to start\nyour job search? Our Expertise',
    description: 'Help with skills, your resume, and interviews.',
    linkName: 'Browse courses',
    link: '/courses',
    orderIndex: 0
  },
  {
    id: 'a21d3e7e-8fa0-42ee-b10a-a7f4163ef1c7',
    title: 'Get your resume\nreviewed by pros',
    description: 'A clear resume that helps you land more interviews.',
    linkName: 'Get Started',
    link: '/courses',
    orderIndex: 1
  },
  {
    id: 'af96107f-c369-4976-869f-06fd00003093',
    title: 'Mock interviews\nwith local mentors',
    description: 'Honest feedback from people who hire in North America.',
    linkName: 'Join Workshop',
    link: '/workshops',
    orderIndex: 2
  }
];

export const INSTRUCTORS: SeedInstructor[] = [
  {
    id: 'cd0bf417-d5ff-4ab7-8dd2-6e6682189f77',
    name: 'Raphael. Lee',
    description:
      'I’ve been managing multicultural teams for ever 19 years. And blesses to lead and be part of the opening teams in global projects in various countries. Growing personal & professional goals by sharing visions with teammates became a part of my passion and a long-term goal in my life.',
    careers: [
      {
        period: '2019 ~',
        position: 'Managing Director at Pacemaker'
      },
      {
        period: '2015 ~ 2019',
        position: 'Director of Operations at Metanet'
      },
      {
        period: '2009 ~ 2014',
        position: 'Business Development Manager at People In Biz Corp.'
      },
      {
        period: '2004 ~ 2008',
        position: 'Purchaser at InterContinental Hotels Group'
      }
    ],
    profileImage: {
      key: 'ebd0ba18-00f0-41e3-ae4e-f72d104a1349.png',
      fallback: '/img/raphael.png'
    }
  },
  {
    id: 'f5b45574-ad41-4614-bd75-d15a885fe4ae',
    name: 'Sujin Ku',
    description:
      'Employer Strategy & Engagement Specialist at University of Toronto / Career Coach',
    careers: [
      {
        period: '2020 ~',
        position: 'Career Coach at U of T'
      },
      {
        period: '2015 ~ 2020',
        position: 'Employer Strategy Specialist'
      }
    ],
    profileImage: {
      key: '3bb482cb-e904-4e3d-b287-b264aa8a3999.png',
      fallback: '/img/instructor-image.png'
    }
  }
];

export const COURSES: SeedCourse[] = [
  {
    id: '5dbb593d-c63d-4902-be9c-9de72686dc3a',
    title: 'Resume + Interview Prep (All-in-One) - Volume 1',
    description:
      'Learn how recruiters evaluate resumes and interviews, based on real hiring examples from Canadian companies.',
    price: '2800',
    category: 'INTERVIEW',
    targetAudienceTypes: ['IT', 'GOVERNMENT'],
    processTitle: 'Step by Step: From a Strong Developer Resume to Interviews',
    processContent:
      'To land a developer role in North America, strong coding skills aren’t enough.\n Understanding job postings and what companies are truly looking for is just as important. With AI-driven productivity on the rise, developer job openings in North America have decreased by nearly 35% over the past five years, making hiring more competitive than ever.\n\nIf North American job postings feel unfamiliar, this course guides you through how to read them effectively. Using real English resumes from Pacemaker developers hired by Canadian companies, you’ll learn how to analyze job postings and reflect those insights directly in your resume.',
    showOnMain: true,
    time: '7 Hours',
    videoLink: 'https://vimeo.com/123456789',
    visualTitle: 'Chosen by Professionals',
    visualTitle2: 'From Differentiated Resumes to Confident Interviews',
    orderKey: 'a0',
    thumbnail: {
      key: 'home/online-course-1.png',
      fallback: '/img/online-course-1.png'
    },
    recommendedLinks: [
      {
        url: '/courses/d904cf22-c38b-4afe-bad3-55e64ee9388f',
        name: 'Recommended Course 2'
      }
    ],
    instructorIds: [
      'cd0bf417-d5ff-4ab7-8dd2-6e6682189f77',
      'f5b45574-ad41-4614-bd75-d15a885fe4ae'
    ],
    sections: [
      {
        id: '5297b9a4-dfed-4c4c-9ee9-afc309a60643',
        title: 'Case Studies of North American Developer Job Postings',
        description: null,
        orderIndex: 1,
        videos: [
          {
            id: 'cbc38342-729b-4ea7-a045-c2ffcb492131',
            videoId: '32ktrbrf3j',
            title: 'Session 1',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: '64682122-f753-4d58-8a67-35a8fb9f75ca',
            videoId: 'vidx-1-1-2',
            title: 'Session 2',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: 'e31fa81f-1535-41c8-8aab-91063f1402cb',
            videoId: 'vidx-1-1-3',
            title: 'Session 3',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: '5035197a-5bef-4f80-baee-9bf655fe03e6',
            videoId: 'vidx-1-1-4',
            title: 'Session 4',
            description: null,
            category: 'INTERVIEW'
          }
        ]
      },
      {
        id: '3c270c47-4e7f-4618-96aa-e6b8d836a448',
        title: 'Analysis of North American Developer Job Postings',
        description: null,
        orderIndex: 2,
        videos: [
          {
            id: 'd56b7773-d1f4-4797-b2b7-ba2fc1ddd12d',
            videoId: 'vidx-1-2-1',
            title: 'Session 1',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: '8203e33d-1377-4321-82e4-c3a0cb0c3c83',
            videoId: 'vidx-1-2-2',
            title: 'Session 2',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: 'dfc8e182-9a7c-4340-a875-10b4c8337477',
            videoId: 'vidx-1-2-3',
            title: 'Session 3',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: 'e8141b78-490d-478e-900f-35a74a5180df',
            videoId: 'vidx-1-2-4',
            title: 'Session 4',
            description: null,
            category: 'INTERVIEW'
          }
        ]
      },
      {
        id: '8d021746-3c1f-40c6-b41f-53e003362792',
        title: 'Actual Successful Resumes for North American Developer Jobs',
        description: null,
        orderIndex: 3,
        videos: [
          {
            id: 'ea341a69-dcad-4482-9462-026d2bbd9351',
            videoId: 'vidx-1-3-1',
            title: 'Session 1',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: '590afb31-8cd6-42ca-8531-eaaa237dd539',
            videoId: 'vidx-1-3-2',
            title: 'Session 2',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: '0220ba4e-25f7-4087-be6d-d374cba893e9',
            videoId: 'vidx-1-3-3',
            title: 'Session 3',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: 'b1b91b95-ca77-4c80-89ba-c1f0e1e82eae',
            videoId: 'vidx-1-3-4',
            title: 'Session 4',
            description: null,
            category: 'INTERVIEW'
          }
        ]
      }
    ],
    reviews: [
      {
        rating: 4.5,
        content:
          'I was lost with interview prep, but this course gave me confidence. The mock interview questions were very similar to real ones.'
      },
      {
        rating: 5,
        content:
          'I was impressed by the instructor’s advice based on their real experience. Highly recommend this to anyone preparing for a career abroad.'
      },
      {
        rating: 5,
        content:
          'This was incredibly helpful for writing my resume. Especially the ATS tips—I haven’t heard them anywhere else!'
      }
    ]
  },
  {
    id: 'd904cf22-c38b-4afe-bad3-55e64ee9388f',
    title: 'Resume + Interview Prep (All-in-One) - Volume 2',
    description:
      'Learn how recruiters evaluate resumes and interviews, based on real hiring examples from Canadian companies.',
    price: '2800',
    category: 'RESUME',
    targetAudienceTypes: ['IT', 'GOVERNMENT'],
    processTitle: 'Step by Step: From a Strong Developer Resume to Interviews',
    processContent:
      'To land a developer role in North America, strong coding skills aren’t enough.\n Understanding job postings and what companies are truly looking for is just as important. With AI-driven productivity on the rise, developer job openings in North America have decreased by nearly 35% over the past five years, making hiring more competitive than ever.\n\nIf North American job postings feel unfamiliar, this course guides you through how to read them effectively. Using real English resumes from Pacemaker developers hired by Canadian companies, you’ll learn how to analyze job postings and reflect those insights directly in your resume.',
    showOnMain: true,
    time: '7 Hours',
    videoLink: 'https://vimeo.com/123456789',
    visualTitle: 'Chosen by Professionals',
    visualTitle2: 'From Differentiated Resumes to Confident Interviews',
    orderKey: 'a1',
    thumbnail: {
      key: 'home/online-course-2.png',
      fallback: '/img/online-course-2.png'
    },
    recommendedLinks: [
      {
        url: '/courses/a1fd3de7-2606-4c51-9b6d-499b5903aadc',
        name: 'Recommended Course 3'
      },
      {
        url: '/courses/5dbb593d-c63d-4902-be9c-9de72686dc3a',
        name: 'Bonus Material for 2'
      }
    ],
    instructorIds: [
      'cd0bf417-d5ff-4ab7-8dd2-6e6682189f77',
      'f5b45574-ad41-4614-bd75-d15a885fe4ae'
    ],
    sections: [
      {
        id: '00e07d76-c558-47ac-b876-1871b8065b90',
        title: 'Case Studies of North American Developer Job Postings',
        description: null,
        orderIndex: 1,
        videos: [
          {
            id: '5d80b1ca-3753-4e82-bc7b-49309addaaf0',
            videoId: 'vidx-2-1-1',
            title: 'Session 1',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: 'c2c0aa68-3bbb-422f-a6b1-6a0c3d5599b2',
            videoId: 'vidx-2-1-2',
            title: 'Session 2',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: 'b11cc92c-21b9-4a85-93c5-580eab51d77d',
            videoId: 'vidx-2-1-3',
            title: 'Session 3',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: '27972dec-c724-40d7-9a0b-f63a7d6d5388',
            videoId: 'vidx-2-1-4',
            title: 'Session 4',
            description: null,
            category: 'INTERVIEW'
          }
        ]
      },
      {
        id: '8d03a5f9-5dc9-40d0-b293-8a48368f9a17',
        title: 'Analysis of North American Developer Job Postings',
        description: null,
        orderIndex: 2,
        videos: [
          {
            id: '1f7e624c-0574-42f5-83d8-c7841ea32f1e',
            videoId: 'vidx-2-2-1',
            title: 'Session 1',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: '01146a0f-7c32-400c-b7b5-62905761d5d6',
            videoId: 'vidx-2-2-2',
            title: 'Session 2',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: 'cea4668e-ff57-4951-915a-e5b5324be00d',
            videoId: 'vidx-2-2-3',
            title: 'Session 3',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: '4edacab4-6985-4db1-9531-bf6471227dbf',
            videoId: 'vidx-2-2-4',
            title: 'Session 4',
            description: null,
            category: 'INTERVIEW'
          }
        ]
      },
      {
        id: '4922cdff-f2cd-48a0-b99c-1ace7955ea0b',
        title: 'Actual Successful Resumes for North American Developer Jobs',
        description: null,
        orderIndex: 3,
        videos: [
          {
            id: '9bb3c39b-0c11-4d6c-8dda-56419d9da3fc',
            videoId: 'vidx-2-3-1',
            title: 'Session 1',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: '2a498fac-02bf-4723-b406-e5000aa3ee64',
            videoId: 'vidx-2-3-2',
            title: 'Session 2',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: '5256727f-2e59-49af-8e05-22156720a802',
            videoId: 'vidx-2-3-3',
            title: 'Session 3',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: 'ad4e9303-2841-49b6-a069-601bb0108a23',
            videoId: 'vidx-2-3-4',
            title: 'Session 4',
            description: null,
            category: 'INTERVIEW'
          }
        ]
      }
    ],
    reviews: [
      {
        rating: 4.5,
        content:
          'I was lost with interview prep, but this course gave me confidence. The mock interview questions were very similar to real ones.'
      },
      {
        rating: 5,
        content:
          'I was impressed by the instructor’s advice based on their real experience. Highly recommend this to anyone preparing for a career abroad.'
      },
      {
        rating: 5,
        content:
          'This was incredibly helpful for writing my resume. Especially the ATS tips—I haven’t heard them anywhere else!'
      }
    ]
  },
  {
    id: 'a1fd3de7-2606-4c51-9b6d-499b5903aadc',
    title: 'Resume + Interview Prep (All-in-One) - Volume 3',
    description:
      'Learn how recruiters evaluate resumes and interviews, based on real hiring examples from Canadian companies.',
    price: '2800',
    category: 'NETWORKING',
    targetAudienceTypes: ['IT', 'GOVERNMENT'],
    processTitle: 'Step by Step: From a Strong Developer Resume to Interviews',
    processContent:
      'To land a developer role in North America, strong coding skills aren’t enough.\n Understanding job postings and what companies are truly looking for is just as important. With AI-driven productivity on the rise, developer job openings in North America have decreased by nearly 35% over the past five years, making hiring more competitive than ever.\n\nIf North American job postings feel unfamiliar, this course guides you through how to read them effectively. Using real English resumes from Pacemaker developers hired by Canadian companies, you’ll learn how to analyze job postings and reflect those insights directly in your resume.',
    showOnMain: true,
    time: '7 Hours',
    videoLink: 'https://vimeo.com/123456789',
    visualTitle: 'Chosen by Professionals',
    visualTitle2: 'From Differentiated Resumes to Confident Interviews',
    orderKey: 'a2',
    thumbnail: {
      key: 'home/online-course-3.png',
      fallback: '/img/online-course-3.png'
    },
    recommendedLinks: [
      {
        url: '/courses/d904cf22-c38b-4afe-bad3-55e64ee9388f',
        name: 'Bonus Material for 3'
      }
    ],
    instructorIds: [
      'cd0bf417-d5ff-4ab7-8dd2-6e6682189f77',
      'f5b45574-ad41-4614-bd75-d15a885fe4ae'
    ],
    sections: [
      {
        id: '6464e773-64d4-4f48-9d04-5be3adae69fd',
        title: 'Case Studies of North American Developer Job Postings',
        description: null,
        orderIndex: 1,
        videos: [
          {
            id: '8e6030b1-094e-4a75-8e56-9667861e1c87',
            videoId: 'vidx-3-1-1',
            title: 'Session 1',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: '686c409a-a2cd-4e58-b8ea-9be01889118f',
            videoId: 'vidx-3-1-2',
            title: 'Session 2',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: '530acdbb-10bd-4abb-838d-070ad12c9e87',
            videoId: 'vidx-3-1-3',
            title: 'Session 3',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: 'ef70d6fe-20d7-4317-98be-5ce9e5b1c276',
            videoId: 'vidx-3-1-4',
            title: 'Session 4',
            description: null,
            category: 'INTERVIEW'
          }
        ]
      },
      {
        id: '34b4e2f7-f15e-400a-8b65-7eb2a7b7396b',
        title: 'Analysis of North American Developer Job Postings',
        description: null,
        orderIndex: 2,
        videos: [
          {
            id: 'b0bf006e-badb-49a9-9fea-0d140c6acd1e',
            videoId: 'vidx-3-2-1',
            title: 'Session 1',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: '67a6b569-cfcf-4cc7-b2bb-7f25170c1a4e',
            videoId: 'vidx-3-2-2',
            title: 'Session 2',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: '73892be0-6e55-452a-93b2-dcfc2d90c98e',
            videoId: 'vidx-3-2-3',
            title: 'Session 3',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: 'd2f7da8e-9b3b-4d21-8ee0-e051341fc43b',
            videoId: 'vidx-3-2-4',
            title: 'Session 4',
            description: null,
            category: 'INTERVIEW'
          }
        ]
      },
      {
        id: 'f9a04a6a-0d6d-45cf-b76d-7d952f127929',
        title: 'Actual Successful Resumes for North American Developer Jobs',
        description: null,
        orderIndex: 3,
        videos: [
          {
            id: '27eb7ee5-246c-45dd-ac9f-971406eae995',
            videoId: 'vidx-3-3-1',
            title: 'Session 1',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: '8e66876a-07ad-4704-bcac-a978284991ea',
            videoId: 'vidx-3-3-2',
            title: 'Session 2',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: '2cad8cb1-3276-4d0d-b213-d1c906a161b9',
            videoId: 'vidx-3-3-3',
            title: 'Session 3',
            description: null,
            category: 'INTERVIEW'
          },
          {
            id: '8c382cb8-7c5a-456d-bad5-53f3f145c92c',
            videoId: 'vidx-3-3-4',
            title: 'Session 4',
            description: null,
            category: 'INTERVIEW'
          }
        ]
      }
    ],
    reviews: [
      {
        rating: 5,
        content:
          'I was impressed by the instructor’s advice based on their real experience. Highly recommend this to anyone preparing for a career abroad.'
      },
      {
        rating: 4.5,
        content:
          'I was lost with interview prep, but this course gave me confidence. The mock interview questions were very similar to real ones.'
      },
      {
        rating: 5,
        content:
          'This was incredibly helpful for writing my resume. Especially the ATS tips—I haven’t heard them anywhere else!'
      }
    ]
  }
];

export const EBOOKS: SeedEbook[] = [
  {
    id: 'c4bdd781-ba41-4c88-ab9e-da3006a2984c',
    ebookId: 'ebook-1',
    title:
      'The 94% Success Formula: A Proven Approach to Job & Career Transitions',
    subTitle: 'Branding & Networking for Marketers',
    description:
      'Learn what truly matters in hiring criteria and how to build the right experience to strengthen your resume.',
    subDescription: null,
    price: 2800,
    category: 'MARKETING',
    isMain: true,
    orderKey: 'a0',
    time: null,
    visualTitle1: 'Branding & Networking',
    visualTitle2: 'for Marketers',
    tableOfContents: [
      {
        id: '1',
        title: 'Developer Job Posting Examples',
        content:
          'Review real North American job posting examples to understand current hiring trends.'
      },
      {
        id: '2',
        title: 'Analyzing Developer Job Postings',
        content:
          'Analyze resume strategies and key keywords based on actual North American job postings.'
      },
      {
        id: '3',
        title: 'Resume Examples from Hired Developers',
        content:
          'Learn how to analyze and leverage job postings through successful real-world resumes.'
      }
    ],
    recommendedLinks: null,
    targetAudienceTypes: ['NETWORKING'],
    thumbnail: {
      key: '630537c5-de75-47c0-87ba-0d830730e9cb.jpeg',
      fallback: '/img/ebook_image1.png'
    },
    file: {
      key: 'ebook-1'
    }
  },
  {
    id: 'ab9fe848-afb9-483e-a7df-0bcdd6c61592',
    ebookId: 'ebook-2',
    title: 'What Every Designer Should Know: Interviews That Shape Your Career',
    subTitle: 'Preparing for Design Interviews',
    description:
      'Identify your unique strengths and communicate your design thinking with confidence during interviews.',
    subDescription: null,
    price: 2800,
    category: 'DESIGN',
    isMain: true,
    orderKey: 'a1',
    time: null,
    visualTitle1: 'Preparing for',
    visualTitle2: 'Design Interviews',
    tableOfContents: [
      {
        id: '1',
        title: 'Developer Job Posting Examples',
        content:
          'Review real North American job posting examples to understand current hiring trends.'
      },
      {
        id: '2',
        title: 'Analyzing Developer Job Postings',
        content:
          'Analyze resume strategies and key keywords based on actual North American job postings.'
      },
      {
        id: '3',
        title: 'Resume Examples from Hired Developers',
        content:
          'Learn how to analyze and leverage job postings through successful real-world resumes.'
      }
    ],
    recommendedLinks: null,
    targetAudienceTypes: ['DESIGN'],
    thumbnail: {
      key: 'e0098cd6-403d-4e77-a577-982a84f347e9.png',
      fallback: '/img/ebook_image2.png'
    },
    file: {
      key: 'ebook-2'
    }
  },
  {
    id: '8fad9e9a-4e22-4583-b9b4-1a713413b521',
    ebookId: 'ebook-3',
    title: 'A Resume That Gets You Hired in the North American Public Sector',
    subTitle: 'Public Sector Resume',
    description:
      'Learn how to structure your resume to meet public sector hiring criteria and leave a strong, positive impression on recruiters.',
    subDescription: null,
    price: 2800,
    category: 'PUBLIC',
    isMain: true,
    orderKey: 'a2',
    time: null,
    visualTitle1: 'Public Sector',
    visualTitle2: 'Resume',
    tableOfContents: [
      {
        id: '1',
        title: 'Developer Job Posting Examples',
        content:
          'Review real North American job posting examples to understand current hiring trends.'
      },
      {
        id: '2',
        title: 'Analyzing Developer Job Postings',
        content:
          'Analyze resume strategies and key keywords based on actual North American job postings.'
      },
      {
        id: '3',
        title: 'Resume Examples from Hired Developers',
        content:
          'Learn how to analyze and leverage job postings through successful real-world resumes.'
      }
    ],
    recommendedLinks: null,
    targetAudienceTypes: ['GOVERNMENT'],
    thumbnail: {
      key: '101f331c-527d-4b32-bd1e-6d57093a6ae6.png',
      fallback: '/img/ebook_image3.png'
    },
    file: {
      key: 'ebooks/70ae8c6c-8159-464d-a02e-0dfe959a7af2.pdf'
    }
  },
  {
    id: 'fc07f204-e90b-44ac-9b2f-17e1351bad4f',
    ebookId: 'ebook-4',
    title: 'The 94% Success Formula: Resumes That Win Jobs and Interviews',
    subTitle: 'IT Resume & Interview Preparation',
    description:
      'Understand what hiring managers look for and learn how to build a resume and interview strategy aligned with North American IT hiring standards.',
    subDescription: null,
    price: 2800,
    category: 'IT',
    isMain: true,
    orderKey: 'a3',
    time: null,
    visualTitle1: 'IT Resume &',
    visualTitle2: 'Interview Preparation',
    tableOfContents: [
      {
        id: '1',
        title: 'Developer Job Posting Examples',
        content:
          'Review real North American job posting examples to understand current hiring trends.'
      },
      {
        id: '2',
        title: 'Analyzing Developer Job Postings',
        content:
          'Analyze resume strategies and key keywords based on actual North American job postings.'
      },
      {
        id: '3',
        title: 'Resume Examples from Hired Developers',
        content:
          'Learn how to analyze and leverage job postings through successful real-world resumes.'
      }
    ],
    recommendedLinks: null,
    targetAudienceTypes: ['IT'],
    thumbnail: {
      key: '546166d5-a9ec-4cf1-8a77-f70575c97f12.png',
      fallback: '/img/ebook_image4.png'
    },
    file: {
      key: 'b16eceb6-8fc2-485d-ae1c-aa58cef31e0a.pdf'
    }
  },
  {
    id: '6c6d513d-3bbf-4e19-8d63-c598c88fbbd7',
    ebookId: 'ebook-6',
    title:
      'The 94% success approach: communicate your value clearly in job searches and career moves.',
    subTitle: 'Resume & Networking for Service Roles',
    description:
      'Learn what truly matters in resumes and how to build relevant experience strategically.',
    subDescription: null,
    price: 2800,
    category: 'SERVICE',
    isMain: false,
    orderKey: 'a4',
    time: null,
    visualTitle1: 'Resume & Networking',
    visualTitle2: 'for Service Roles',
    tableOfContents: [
      {
        id: '1',
        title: 'Developer Job Posting Examples',
        content:
          'Review real North American job posting examples to understand current hiring trends.'
      },
      {
        id: '2',
        title: 'Analyzing Developer Job Postings',
        content:
          'Analyze resume strategies and key keywords based on actual North American job postings.'
      },
      {
        id: '3',
        title: 'Resume Examples from Hired Developers',
        content:
          'Learn how to analyze and leverage job postings through successful real-world resumes.'
      }
    ],
    recommendedLinks: null,
    targetAudienceTypes: ['SERVICE'],
    thumbnail: {
      key: '5c07e0b3-ebda-4471-bbf4-5bf4511e6c52.png',
      fallback: '/img/ebook_image5.png'
    },
    file: {
      key: 'Celpip_template.pdf'
    }
  },
  {
    id: 'd7b723c5-e1f6-4656-9a32-f91605262ace',
    ebookId: 'ebook-5',
    title:
      'A practical guide to Interviews for finance and accounting roles, learn once, use for life.',
    subTitle: 'Preparing for Accounting Interviews',
    description:
      'Learn how to identify your strengths and clues to present them in resumes and interviews.',
    subDescription: null,
    price: 2800,
    category: 'ACCOUNTING',
    isMain: false,
    orderKey: 'a5',
    time: null,
    visualTitle1: 'Preparing for',
    visualTitle2: 'Accounting Interviews',
    tableOfContents: [
      {
        id: '1',
        title: 'Developer Job Posting Examples',
        content:
          'Review real North American job posting examples to understand current hiring trends.'
      },
      {
        id: '2',
        title: 'Analyzing Developer Job Postings',
        content:
          'Analyze resume strategies and key keywords based on actual North American job postings.'
      },
      {
        id: '3',
        title: 'Resume Examples from Hired Developers',
        content:
          'Learn how to analyze and leverage job postings through successful real-world resumes.'
      }
    ],
    recommendedLinks: null,
    targetAudienceTypes: ['FINANCE'],
    thumbnail: {
      key: '4a8f42e2-bf43-421e-8b9d-461bd2c28791.jpg',
      fallback: '/img/ebook_image6.png'
    },
    file: {
      key: 'TEST_2025052603 - 254926 16:49:24'
    }
  }
];

export const WORKSHOPS: SeedWorkshop[] = [
  {
    id: 'c5c68cba-0f13-4ed7-96d8-d701dacf02f4',
    title: 'Mind Training for Success',
    description:
      'Join this workshop to gain valuable insights and boost your career.',
    startDate: '2026-03-16T19:00:00.000Z',
    endDate: '2026-03-16T21:00:00.000Z',
    price: 20,
    locationOrUrl: 'North York centre',
    category: 'NETWORKING',
    processContent: null,
    isMain: false,
    orderKey: 'a0',
    thumbnail: {
      key: 'home/workshop-1.png',
      fallback: '/img/workshop-1.png'
    }
  },
  {
    id: '9b1986f9-d774-4354-8325-d072e16398ed',
    title: 'UX Design Workshop',
    description:
      "Everyone has unique strengths and potential.\nIn this session, you'll gain powerful insights into navigating challenges in a global career environment, leveraging the power of networking, and discovering your own path forward.\nDon't miss this exclusive opportunity to learn directly from Sujin Ku, Career Coach at the University of Toronto.",
    startDate: '2026-03-20T19:00:00.000Z',
    endDate: '2026-03-20T21:00:00.000Z',
    price: 20,
    locationOrUrl: 'North York centre',
    category: 'NETWORKING',
    processContent: null,
    isMain: false,
    orderKey: 'a1',
    thumbnail: {
      key: 'home/workshop-4.jpg',
      fallback: '/img/workshop-4.png'
    }
  },
  {
    id: '8f0643c3-2c3a-4624-85b2-b3728318e7b0',
    title: "Let's Connect!",
    description:
      'Join this workshop to gain valuable insights and boost your career.',
    startDate: '2026-05-15T19:00:00.000Z',
    endDate: '2026-05-15T21:00:00.000Z',
    price: 20,
    locationOrUrl: 'North York centre',
    category: 'NETWORKING',
    processContent: null,
    isMain: false,
    orderKey: 'a2',
    thumbnail: {
      key: 'home/workshop-image.jpg',
      fallback: '/img/workshop-image.png'
    }
  },
  {
    id: 'd75382a5-943e-4d69-883f-99fc5bd51ce4',
    title: 'Resume Workshop for International Opportunities',
    description:
      'Join this workshop to gain valuable insights and boost your career.',
    startDate: '2026-11-05T19:00:00.000Z',
    endDate: '2026-11-05T21:00:00.000Z',
    price: 20,
    locationOrUrl: 'North York centre',
    category: 'NETWORKING',
    processContent: null,
    isMain: false,
    orderKey: 'a3',
    thumbnail: {
      key: 'home/workshop-3.jpg',
      fallback: '/img/workshop-3.png'
    }
  }
];
