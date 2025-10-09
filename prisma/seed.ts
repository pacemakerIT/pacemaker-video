import { PrismaClient } from '@prisma/client';
import courseData from '../public/json/video-detail-mock.json';

const prisma = new PrismaClient();

// UUID 생성 함수 (crypto.randomUUID 사용)
function generateUUID(): string {
  return crypto.randomUUID();
}

async function main() {
  // Instructors 생성
  for (const instructorData of courseData.instructors) {
    await prisma.instructor.upsert({
      where: { id: instructorData.id },
      update: {},
      create: {
        id: instructorData.id,
        name: instructorData.name,
        profileImage: instructorData.profileImage,
        description: instructorData.description,
        careers: instructorData.careers // JSON으로 저장
      }
    });
  }

  // Courses 생성
  for (const courseDataItem of courseData.courses) {
    await prisma.course.upsert({
      where: { id: courseDataItem.id },
      update: {},
      create: {
        id: courseDataItem.id,
        title: courseDataItem.title,
        subtitle: courseDataItem.subtitle,
        courseTitle: courseDataItem.courseTitle,
        description: courseDataItem.description,
        price: courseDataItem.price,
        rating: courseDataItem.rating,
        reviewCount: courseDataItem.reviewCount,
        category: courseDataItem.category,
        duration: courseDataItem.duration,
        level: courseDataItem.level,
        language: courseDataItem.language,
        backgroundImage: courseDataItem.backgroundImage,
        instructorId: courseDataItem.instructorId,
        createdAt: courseDataItem.createdAt,
        updatedAt: courseDataItem.updatedAt,
        sections: courseDataItem.sections, // JSON으로 저장
        reviews: courseDataItem.reviews // JSON으로 저장
      }
    });

    // 각 Course에 대한 Video 생성
    await prisma.video.upsert({
      where: { videoId: courseDataItem.id }, // videoId를 course의 id로 사용
      update: {},
      create: {
        videoId: courseDataItem.id,
        title: courseDataItem.title,
        description: courseDataItem.description,
        price: parseFloat(courseDataItem.price?.replace('$', '') || '0'),
        category: 'INTERVIEW', // 기본값
        thumbnail: courseDataItem.backgroundImage,
        courseId: courseDataItem.id // Course와 연결
      }
    });
  }

  // GlobalRelatedItems 생성 (UUID 생성)
  for (const itemData of courseData.globalRelatedItems) {
    const newId = generateUUID();
    await prisma.globalRelatedItem.upsert({
      where: { id: newId },
      update: {},
      create: {
        id: newId,
        title: itemData.title,
        content: itemData.content,
        price: itemData.price,
        category: itemData.category,
        type: itemData.type,
        thumbnail: itemData.thumbnail
      }
    });
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
