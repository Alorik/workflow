import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ message: "Email is required!" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

   if (!user) {
    return NextResponse.json({
      message: "If account exists, a reset link will be sent.",
    });
   }
  
  const token = uuidv4();
  const expireDate = new Date(Date.now() + 1000 * 60 * 10);

await prisma.user.update({
  where: { id: user.id },
  data: {
    resetToken: token,
    resetTokenExpiry: expireDate,
  },
});

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Workflow" <${process.env.EMAIL_USER}>`,
    to: email,
      subject: "Reset Password - Workflow App",
    html: `
      <p>You requested a password reset.</p>
      <a href="${resetUrl}" style="color:blue;">Click here to reset password</a>
      <p>Link expires in 10 minutes.</p>
    `,
  })

 return NextResponse.json({
    message: "If account exists, a reset link will be sent.",
  });
}