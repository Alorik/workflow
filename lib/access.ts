import { prisma } from "./prisma";

export async function canAccessProject(userId: string, projectId: string) {
  
  const member = await prisma.projectMember.findFirst({
    where:{
      userId: userId,
      projectId: projectId,
    },
  });
  console.log(projectId);
  console.log("hola");  console.log("hola");  console.log("hola");  console.log("hola");
  
}