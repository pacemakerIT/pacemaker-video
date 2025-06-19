// import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const clerkId = searchParams.get('clerkId');

//     if (!clerkId) {
//       return NextResponse.json(
//         { error: 'User ID is required' },
//         { status: 400 }
//       );
//     }

//     // Find user by clerk ID
//     const currentUser = await prisma.user.findFirst({
//       where: {
//         clerkId: clerkId
//       },
//       select: {
//         id: true
//       }
//     });

//     if (!currentUser?.id) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     // Get all purchased videos for this user with their actual video IDs
//     const purchasedOrderItems = await prisma.orderItem.findMany({
//       where: {
//         order: {
//           userId: currentUser.id,
//           status: 'COMPLETED'
//         }
//       },
//       select: {
//         // Replace 'videoId' with the correct field or relation name as defined in your Prisma schema
//         // For example, if the relation is 'video' and you want the 'id', use:
//         video: {
//           select: {
//             id: true
//           }
//         }
//       }
//     });

//     // Extract actual video IDs from the order items, filtering out any null videoIds
//     const purchasedVideoIds = purchasedOrderItems
//       .map((item) => item.videoId)
//       .filter((id): id is string => !!id);

//     return NextResponse.json({ purchasedVideoIds }, { status: 200 });
//   } catch (error) {
//     if (error instanceof Error) {
//       return NextResponse.json(
//         { error: `Failed to fetch purchased videos: ${error.message}` },
//         { status: 500 }
//       );
//     }
//     return NextResponse.json(
//       { error: 'Failed to fetch purchased videos' },
//       { status: 500 }
//     );
//   }
// }
